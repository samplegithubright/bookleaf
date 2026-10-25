from pydantic import BaseModel, Field
from typing import Optional, List

class BookBase(BaseModel):
    book_id: str
    author_id: str
    title: str
    isbn: Optional[str] = None
    genre: Optional[str] = None
    publication_date: Optional[str] = None
    status: str
    mrp: Optional[float] = None
    author_royalty_per_copy: Optional[float] = None
    total_copies_sold: int = 0
    total_royalty_earned: float = 0.0
    royalty_paid: float = 0.0
    royalty_pending: float = 0.0
    last_royalty_payout_date: Optional[str] = None
    print_partner: Optional[str] = None
    available_on: List[str] = Field(default_factory=list)

class BookResponse(BookBase):
    id: Optional[str] = None
