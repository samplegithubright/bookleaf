from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TicketMessage(BaseModel):
    message_id: str
    sender_role: str  # "author" or "admin" or "system"
    sender_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_internal_note: bool = False

class InternalNote(BaseModel):
    note_id: str
    admin_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TicketCreate(BaseModel):
    book_id: Optional[str] = "General / Account Level"
    book_title: Optional[str] = "General / Account Level"
    subject: str
    description: str
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[str] = None  # Open, In Progress, Resolved, Closed
    category: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None

class AdminReplyRequest(BaseModel):
    message: str
    new_status: Optional[str] = None

class AddInternalNoteRequest(BaseModel):
    content: str

class AIDraftRequest(BaseModel):
    custom_instructions: Optional[str] = None

class AIDraftResponse(BaseModel):
    draft_response: str
    suggested_category: str
    suggested_priority: str
    reasoning: str
    confidence: float
    is_fallback: bool = False

class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    author_id: str
    author_name: str
    author_email: str
    book_id: Optional[str] = None
    book_title: Optional[str] = None
    subject: str
    description: str
    status: str
    category: str
    ai_category: Optional[str] = None
    priority: str
    ai_priority: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_admin_name: Optional[str] = None
    attachment_name: Optional[str] = None
    ai_draft_response: Optional[str] = None
    ai_reasoning: Optional[str] = None
    messages: List[TicketMessage] = Field(default_factory=list)
    internal_notes: List[InternalNote] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
