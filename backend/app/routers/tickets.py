import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.database import get_database
from app.services.auth_service import get_current_user, get_current_admin
from app.services.ai_service import ai_service
from app.services.websocket_manager import ws_manager
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketUpdate,
    AdminReplyRequest,
    AddInternalNoteRequest,
    AIDraftRequest,
    AIDraftResponse,
    TicketMessage,
    InternalNote
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])

def format_ticket(doc: dict, is_admin: bool = False) -> dict:
    doc["id"] = str(doc.get("_id"))
    # If not admin, sanitize internal notes and internal fields
    if not is_admin:
        doc["internal_notes"] = []
        doc["ai_draft_response"] = None
        doc["ai_reasoning"] = None
        # Filter internal note messages if any exist in messages
        doc["messages"] = [m for m in doc.get("messages", []) if not m.get("is_internal_note", False)]
    return doc

@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_in: TicketCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    author_id = current_user.get("author_id")
    if not author_id:
        author_doc = await db.authors.find_one({"email": current_user.get("email")})
        if author_doc:
            author_id = author_doc.get("author_id")
            
    if not author_id and current_user.get("role") == "admin":
        author_id = "AUTH_ADMIN"

    if not author_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current user is not linked to an author profile."
        )

    # Fetch referenced book info if provided
    book_info = None
    book_title = ticket_in.book_title or "General / Account Level"
    if ticket_in.book_id and ticket_in.book_id != "General / Account Level":
        book_info = await db.books.find_one({"book_id": ticket_in.book_id})
        if book_info:
            book_title = book_info.get("title", book_title)

    # 1. AI-Powered Auto-Classification & Priority Scoring
    cat, prio, reasoning = await ai_service.classify_and_score(
        subject=ticket_in.subject,
        description=ticket_in.description,
        book_info=book_info
    )

    # 2. Pre-generate AI Drafted Response based on Knowledge Base
    author_name = current_user.get("name", "Author")
    draft_result = await ai_service.generate_draft_response(
        author_name=author_name,
        subject=ticket_in.subject,
        description=ticket_in.description,
        category=cat,
        priority=prio,
        book_info=book_info
    )

    now = datetime.utcnow()
    # Generate unique ticket number
    count = await db.tickets.count_documents({})
    ticket_number = f"TKT-{1000 + count + 1}"

    first_msg = {
        "message_id": str(uuid.uuid4()),
        "sender_role": "author",
        "sender_name": author_name,
        "content": ticket_in.description,
        "created_at": now,
        "is_internal_note": False
    }

    ticket_doc = {
        "ticket_number": ticket_number,
        "author_id": author_id,
        "author_name": author_name,
        "author_email": current_user.get("email"),
        "book_id": ticket_in.book_id,
        "book_title": book_title,
        "subject": ticket_in.subject,
        "description": ticket_in.description,
        "status": "Open",
        "category": cat,
        "ai_category": cat,
        "priority": prio,
        "ai_priority": prio,
        "assigned_to": None,
        "assigned_admin_name": None,
        "attachment_name": ticket_in.attachment_name,
        "ai_draft_response": draft_result.get("draft_response"),
        "ai_reasoning": reasoning,
        "messages": [first_msg],
        "internal_notes": [],
        "created_at": now,
        "updated_at": now
    }

    res = await db.tickets.insert_one(ticket_doc)
    ticket_doc["_id"] = res.inserted_id

    # Real-time WebSocket broadcasts
    formatted_ticket = format_ticket(dict(ticket_doc), is_admin=True)
    await ws_manager.broadcast_to_admin({
        "event": "new_ticket",
        "ticket": formatted_ticket
    })
    await ws_manager.broadcast_to_author(author_id, {
        "event": "new_ticket",
        "ticket": format_ticket(dict(ticket_doc), is_admin=False)
    })

    is_admin = current_user.get("role") == "admin"
    return TicketResponse(**format_ticket(ticket_doc, is_admin=is_admin))

@router.get("/my-tickets", response_model=List[TicketResponse])
async def get_my_tickets(current_user: dict = Depends(get_current_user)):
    db = get_database()
    author_id = current_user.get("author_id")
    role = current_user.get("role")

    if role == "admin":
        cursor = db.tickets.find({}).sort("created_at", -1).limit(50)
        tickets = []
        async for doc in cursor:
            tickets.append(TicketResponse(**format_ticket(doc, is_admin=True)))
        return tickets

    if not author_id:
        author_doc = await db.authors.find_one({"email": current_user.get("email")})
        if author_doc:
            author_id = author_doc.get("author_id")

    if not author_id:
        raise HTTPException(status_code=400, detail="User not linked to an author profile")
        
    cursor = db.tickets.find({"author_id": author_id}).sort("created_at", -1)
    tickets = []
    async for doc in cursor:
        tickets.append(TicketResponse(**format_ticket(doc, is_admin=False)))
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket_by_id(ticket_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    from bson import ObjectId
    query = {"ticket_number": ticket_id}
    if ObjectId.is_valid(ticket_id):
        query = {"$or": [{"_id": ObjectId(ticket_id)}, {"ticket_number": ticket_id}]}
        
    ticket = await db.tickets.find_one(query)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    is_admin = current_user.get("role") == "admin"
    if not is_admin and ticket.get("author_id") != current_user.get("author_id"):
        raise HTTPException(status_code=403, detail="Unauthorized access to this ticket")

    return TicketResponse(**format_ticket(ticket, is_admin=is_admin))

@router.post("/{ticket_id}/reply", response_model=TicketResponse)
async def reply_to_ticket(
    ticket_id: str,
    reply: AdminReplyRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    from bson import ObjectId
    query = {"ticket_number": ticket_id}
    if ObjectId.is_valid(ticket_id):
        query = {"$or": [{"_id": ObjectId(ticket_id)}, {"ticket_number": ticket_id}]}

    ticket = await db.tickets.find_one(query)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    role = current_user.get("role")
    is_admin = role == "admin"
    if not is_admin and ticket.get("author_id") != current_user.get("author_id"):
        raise HTTPException(status_code=403, detail="Unauthorized to reply to this ticket")

    now = datetime.utcnow()
    sender_name = current_user.get("name", "Support Representative" if is_admin else "Author")
    new_msg = {
        "message_id": str(uuid.uuid4()),
        "sender_role": role,
        "sender_name": sender_name,
        "content": reply.message,
        "created_at": now,
        "is_internal_note": False
    }

    update_fields = {
        "updated_at": now
    }
    
    # If admin provided new status, update it; otherwise if admin replies to Open ticket, move to In Progress
    if reply.new_status:
        update_fields["status"] = reply.new_status
    elif is_admin and ticket.get("status") == "Open":
        update_fields["status"] = "In Progress"

    # If admin replies and ticket not yet assigned, assign to this admin
    if is_admin and not ticket.get("assigned_to"):
        update_fields["assigned_to"] = current_user.get("email")
        update_fields["assigned_admin_name"] = sender_name

    await db.tickets.update_one(
        {"_id": ticket["_id"]},
        {
            "$push": {"messages": new_msg},
            "$set": update_fields
        }
    )

    updated_ticket = await db.tickets.find_one({"_id": ticket["_id"]})
    ticket_id_str = str(updated_ticket["_id"])
    author_id = updated_ticket.get("author_id")

    # Broadcast real-time update to all subscribers
    ticket_payload_admin = format_ticket(dict(updated_ticket), is_admin=True)
    ticket_payload_author = format_ticket(dict(updated_ticket), is_admin=False)

    await ws_manager.broadcast_to_ticket(ticket_id_str, {
        "event": "ticket_updated",
        "ticket": ticket_payload_admin if is_admin else ticket_payload_author,
        "new_message": new_msg
    })
    await ws_manager.broadcast_to_author(author_id, {
        "event": "ticket_updated",
        "ticket": ticket_payload_author
    })
    await ws_manager.broadcast_to_admin({
        "event": "ticket_updated",
        "ticket": ticket_payload_admin
    })

    return TicketResponse(**format_ticket(updated_ticket, is_admin=is_admin))

@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket_management(
    ticket_id: str,
    update_data: TicketUpdate,
    admin_user: dict = Depends(get_current_admin)
):
    """Admin overrides: category, priority, status, assignment"""
    db = get_database()
    from bson import ObjectId
    query = {"ticket_number": ticket_id}
    if ObjectId.is_valid(ticket_id):
        query = {"$or": [{"_id": ObjectId(ticket_id)}, {"ticket_number": ticket_id}]}

    ticket = await db.tickets.find_one(query)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.utcnow()
    set_fields = {"updated_at": now}

    if update_data.status:
        set_fields["status"] = update_data.status
    if update_data.category:
        set_fields["category"] = update_data.category
    if update_data.priority:
        set_fields["priority"] = update_data.priority
    if update_data.assigned_to is not None:
        set_fields["assigned_to"] = update_data.assigned_to
        if update_data.assigned_to == admin_user.get("email"):
            set_fields["assigned_admin_name"] = admin_user.get("name")
        elif update_data.assigned_to == "":
            set_fields["assigned_to"] = None
            set_fields["assigned_admin_name"] = None
        else:
            set_fields["assigned_admin_name"] = update_data.assigned_to

    await db.tickets.update_one({"_id": ticket["_id"]}, {"$set": set_fields})
    updated_ticket = await db.tickets.find_one({"_id": ticket["_id"]})

    # Realtime notification
    ticket_id_str = str(updated_ticket["_id"])
    author_id = updated_ticket.get("author_id")
    await ws_manager.broadcast_to_ticket(ticket_id_str, {
        "event": "ticket_management_updated",
        "ticket": format_ticket(dict(updated_ticket), is_admin=True)
    })
    await ws_manager.broadcast_to_author(author_id, {
        "event": "ticket_status_changed",
        "ticket": format_ticket(dict(updated_ticket), is_admin=False)
    })
    await ws_manager.broadcast_to_admin({
        "event": "ticket_updated",
        "ticket": format_ticket(dict(updated_ticket), is_admin=True)
    })

    return TicketResponse(**format_ticket(updated_ticket, is_admin=True))

@router.post("/{ticket_id}/internal-notes", response_model=TicketResponse)
async def add_internal_note(
    ticket_id: str,
    note_req: AddInternalNoteRequest,
    admin_user: dict = Depends(get_current_admin)
):
    """Add operations internal note (never shown to author)"""
    db = get_database()
    from bson import ObjectId
    query = {"ticket_number": ticket_id}
    if ObjectId.is_valid(ticket_id):
        query = {"$or": [{"_id": ObjectId(ticket_id)}, {"ticket_number": ticket_id}]}

    ticket = await db.tickets.find_one(query)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    new_note = {
        "note_id": str(uuid.uuid4()),
        "admin_name": admin_user.get("name", "Admin"),
        "content": note_req.content,
        "created_at": datetime.utcnow()
    }

    await db.tickets.update_one(
        {"_id": ticket["_id"]},
        {
            "$push": {"internal_notes": new_note},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    updated_ticket = await db.tickets.find_one({"_id": ticket["_id"]})
    await ws_manager.broadcast_to_admin({
        "event": "internal_note_added",
        "ticket": format_ticket(dict(updated_ticket), is_admin=True),
        "note": new_note
    })

    return TicketResponse(**format_ticket(updated_ticket, is_admin=True))

@router.post("/{ticket_id}/generate-ai-draft", response_model=AIDraftResponse)
async def regenerate_ai_draft(
    ticket_id: str,
    draft_req: AIDraftRequest,
    admin_user: dict = Depends(get_current_admin)
):
    """Regenerate or customize AI draft response for a ticket"""
    db = get_database()
    from bson import ObjectId
    query = {"ticket_number": ticket_id}
    if ObjectId.is_valid(ticket_id):
        query = {"$or": [{"_id": ObjectId(ticket_id)}, {"ticket_number": ticket_id}]}

    ticket = await db.tickets.find_one(query)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    book_info = None
    if ticket.get("book_id"):
        book_info = await db.books.find_one({"book_id": ticket["book_id"]})

    draft_info = await ai_service.generate_draft_response(
        author_name=ticket.get("author_name", "Author"),
        subject=ticket.get("subject", ""),
        description=ticket.get("description", ""),
        category=ticket.get("category", "General Inquiry"),
        priority=ticket.get("priority", "Medium"),
        book_info=book_info,
        custom_instructions=draft_req.custom_instructions
    )

    # Save new draft to ticket
    await db.tickets.update_one(
        {"_id": ticket["_id"]},
        {"$set": {"ai_draft_response": draft_info["draft_response"]}}
    )

    return AIDraftResponse(**draft_info)

@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """File attachment endpoint (supports photo uploads for quality defects, contracts, etc.)"""
    filename = file.filename
    # Return mock/live attachment url
    return {
        "filename": filename,
        "content_type": file.content_type,
        "url": f"/attachments/{filename}",
        "message": "File uploaded successfully"
    }
