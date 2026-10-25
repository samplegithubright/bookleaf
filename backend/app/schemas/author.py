from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from app.schemas.book import BookResponse

class AuthorBase(BaseModel):
    author_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    joined_date: Optional[str] = None

class AuthorResponse(AuthorBase):
    id: Optional[str] = None
    total_books: int = 0
    total_earnings: float = 0.0
    total_pending_royalty: float = 0.0
    books: List[BookResponse] = Field(default_factory=list)
