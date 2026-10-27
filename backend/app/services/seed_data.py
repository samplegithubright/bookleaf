import json
import logging
import os
from datetime import datetime, timedelta
from app.database import get_database
from app.services.auth_service import get_password_hash
from app.services.ai_service import ai_service

logger = logging.getLogger("bookleaf.seed")

async def seed_database_if_empty(force: bool = False):
    db = get_database()
    author_count = await db.authors.count_documents({})
    if author_count > 0 and not force:
        logger.info(f"Database already contains {author_count} authors. Skipping seed.")
        return

    logger.info("Starting database seed with bookleaf_sample_data.json...")
    
    # Path to sample json - check self-contained backend candidate locations
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "data", "bookleaf_sample_data.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "bookleaf_sample_data.json"),
        os.path.join(os.path.dirname(__file__), "bookleaf_sample_data.json"),
        os.path.abspath("bookleaf_sample_data.json"),
        os.path.abspath(os.path.join("backend", "bookleaf_sample_data.json")),
        os.path.abspath(os.path.join("backend", "app", "data", "bookleaf_sample_data.json")),
    ]
    json_path = None
    for cand in candidates:
        if os.path.exists(cand):
            json_path = cand
            break

    if not json_path:
        raise FileNotFoundError(f"Could not locate bookleaf_sample_data.json in any of: {candidates}")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Create Default Admin User
    admin_user = {
        "email": "admin@bookleaf.com",
        "hashed_password": get_password_hash("admin123"),
        "name": "BookLeaf Ops Admin",
        "role": "admin",
        "is_admin": True,
        "created_at": datetime.utcnow()
    }
    await db.users.update_one({"email": admin_user["email"]}, {"$set": admin_user}, upsert=True)
    logger.info("Admin user seeded: admin@bookleaf.com / admin123")

    authors = data.get("authors", [])
    all_books_list = []

    for author in authors:
        author_id = author["author_id"]
        email = author["email"]
        name = author["name"]
        
        # User record for author
        user_doc = {
            "email": email,
            "hashed_password": get_password_hash("password123"),
            "name": name,
            "role": "author",
            "author_id": author_id,
            "city": author.get("city"),
            "phone": author.get("phone"),
            "created_at": datetime.utcnow()
        }
        await db.users.update_one({"email": email}, {"$set": user_doc}, upsert=True)

        # Books
        books = author.pop("books", [])
        for book in books:
            book["author_id"] = author_id
            book["author_name"] = name
            await db.books.update_one({"book_id": book["book_id"]}, {"$set": book}, upsert=True)
            all_books_list.append(book)

        # Author profile
        await db.authors.update_one({"author_id": author_id}, {"$set": author}, upsert=True)

    logger.info(f"Seeded {len(authors)} authors and {len(all_books_list)} books.")

    # 2. Seed Realistic Initial Tickets for demonstration & immediate testing
    existing_tickets = await db.tickets.count_documents({})
    if existing_tickets == 0:
        logger.info("Seeding realistic sample tickets...")
        now = datetime.utcnow()

        sample_tickets = [
            {
                "ticket_number": "TKT-1001",
                "author_id": "AUTH001",
                "author_name": "Priya Sharma",
                "author_email": "priya.sharma@email.com",
                "book_id": "BK001",
                "book_title": "Whispers of the Ganges",
                "subject": "Haven't received royalty for Q3 yet",
                "description": "I published my book earlier and my pending royalty shows ₹3,570. The 45-day cycle for Q3 ended last week and I haven't seen the bank deposit yet. Could you please check?",
                "category": "Royalty & Payments",
                "ai_category": "Royalty & Payments",
                "priority": "High",
                "ai_priority": "High",
                "status": "In Progress",
                "assigned_to": "admin@bookleaf.com",
                "assigned_admin_name": "BookLeaf Ops Admin",
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(hours=5),
                "messages": [
                    {
                        "message_id": "msg_001",
                        "sender_role": "author",
                        "sender_name": "Priya Sharma",
                        "content": "I published my book earlier and my pending royalty shows ₹3,570. The 45-day cycle for Q3 ended last week and I haven't seen the bank deposit yet. Could you please check?",
                        "created_at": now - timedelta(days=2),
                        "is_internal_note": False
                    },
                    {
                        "message_id": "msg_002",
                        "sender_role": "admin",
                        "sender_name": "BookLeaf Ops Admin",
                        "content": "Dear Priya,\n\nThank you for reaching out to us. I completely understand how concerning it is to wait for your royalty payouts, especially after all the hard work that went into 'Whispers of the Ganges'.\n\nLooking at your account, you have accumulated ₹3,570 in pending royalties. We initiated the bank transfer batch on October 15th. I have escalated this directly to our accounts desk to pull the UTR number for your transfer. We will update you within 48 hours.\n\nWarm regards,\nBookLeaf Ops Team",
                        "created_at": now - timedelta(hours=5),
                        "is_internal_note": False
                    }
                ],
                "internal_notes": [
                    {
                        "note_id": "note_001",
                        "admin_name": "BookLeaf Ops Admin",
                        "content": "Checked with HDFC corporate banking. Batch #4910 was processed, waiting for UTR confirmation from bank manager.",
                        "created_at": now - timedelta(hours=6)
                    }
                ]
            },
            {
                "ticket_number": "TKT-1002",
                "author_id": "AUTH002",
                "author_name": "Rohit Kapoor",
                "author_email": "rohit.kapoor@email.com",
                "book_id": "BK003",
                "book_title": "Code & Karma",
                "subject": "ISBN mismatch on Amazon India product listing",
                "description": "My book Code & Karma has ISBN 978-93-5XXXX-03-5 printed on the physical copy, but on Amazon it is showing an old placeholder ISBN. Readers have mentioned this to me.",
                "category": "ISBN & Metadata Issues",
                "ai_category": "ISBN & Metadata Issues",
                "priority": "High",
                "ai_priority": "High",
                "status": "Open",
                "assigned_to": None,
                "assigned_admin_name": None,
                "created_at": now - timedelta(hours=18),
                "updated_at": now - timedelta(hours=18),
                "messages": [
                    {
                        "message_id": "msg_003",
                        "sender_role": "author",
                        "sender_name": "Rohit Kapoor",
                        "content": "My book Code & Karma has ISBN 978-93-5XXXX-03-5 printed on the physical copy, but on Amazon it is showing an old placeholder ISBN. Readers have mentioned this to me.",
                        "created_at": now - timedelta(hours=18),
                        "is_internal_note": False
                    }
                ],
                "internal_notes": []
            },
            {
                "ticket_number": "TKT-1003",
                "author_id": "AUTH009",
                "author_name": "Kavita Deshmukh",
                "author_email": "kavita.deshmukh@email.com",
                "book_id": "BK015",
                "book_title": "Raising Roots",
                "subject": "Typesetting timeline update request",
                "description": "Hello, my manuscript has been in Typesetting for over 2 weeks now. Could you please share an estimated date for the proof?",
                "category": "Book Status & Production Updates",
                "ai_category": "Book Status & Production Updates",
                "priority": "Medium",
                "ai_priority": "Medium",
                "status": "Open",
                "assigned_to": None,
                "assigned_admin_name": None,
                "created_at": now - timedelta(hours=8),
                "updated_at": now - timedelta(hours=8),
                "messages": [
                    {
                        "message_id": "msg_004",
                        "sender_role": "author",
                        "sender_name": "Kavita Deshmukh",
                        "content": "Hello, my manuscript has been in Typesetting for over 2 weeks now. Could you please share an estimated date for the proof?",
                        "created_at": now - timedelta(hours=8),
                        "is_internal_note": False
                    }
                ],
                "internal_notes": []
            },
            {
                "ticket_number": "TKT-1004",
                "author_id": "AUTH007",
                "author_name": "Sneha Kulkarni",
                "author_email": "sneha.kulkarni@email.com",
                "book_id": "BK013",
                "book_title": "Midnight in Mysore",
                "subject": "Cover design concept revisions",
                "description": "Hi team, I received the first draft of the cover design for Midnight in Mysore. The font looks great, but could we make the background silhouette a bit darker to match the thriller vibe?",
                "category": "Book Status & Production Updates",
                "ai_category": "Book Status & Production Updates",
                "priority": "Medium",
                "ai_priority": "Medium",
                "status": "In Progress",
                "assigned_to": "admin@bookleaf.com",
                "assigned_admin_name": "BookLeaf Ops Admin",
                "created_at": now - timedelta(days=1),
                "updated_at": now - timedelta(hours=12),
                "messages": [
                    {
                        "message_id": "msg_005",
                        "sender_role": "author",
                        "sender_name": "Sneha Kulkarni",
                        "content": "Hi team, I received the first draft of the cover design for Midnight in Mysore. The font looks great, but could we make the background silhouette a bit darker to match the thriller vibe?",
                        "created_at": now - timedelta(days=1),
                        "is_internal_note": False
                    }
                ],
                "internal_notes": [
                    {
                        "note_id": "note_002",
                        "admin_name": "BookLeaf Ops Admin",
                        "content": "Forwarded feedback to illustrator Rajiv. Second revision due by tomorrow evening.",
                        "created_at": now - timedelta(hours=14)
                    }
                ]
            }
        ]

        for tkt in sample_tickets:
            # Generate AI draft response for each ticket
            book_obj = await db.books.find_one({"book_id": tkt.get("book_id")})
            draft_info = await ai_service.generate_draft_response(
                author_name=tkt["author_name"],
                subject=tkt["subject"],
                description=tkt["description"],
                category=tkt["category"],
                priority=tkt["priority"],
                book_info=book_obj
            )
            tkt["ai_draft_response"] = draft_info["draft_response"]
            tkt["ai_reasoning"] = draft_info.get("reasoning", "")
            await db.tickets.insert_one(tkt)

        logger.info(f"Seeded {len(sample_tickets)} sample tickets.")
