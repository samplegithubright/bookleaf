from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import get_database
from app.services.auth_service import get_current_user
from app.schemas.book import BookResponse

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/my-books", response_model=List[BookResponse])
async def get_my_books(current_user: dict = Depends(get_current_user)):
    db = get_database()
    role = current_user.get("role")
    author_id = current_user.get("author_id")
    
    if role != "author" or not author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authors can view their published books via this endpoint."
        )
        
    cursor = db.books.find({"author_id": author_id})
    books = []
    async for doc in cursor:
        doc["id"] = str(doc.get("_id"))
        books.append(BookResponse(**doc))
    return books

@router.get("/by-author/{author_id}", response_model=List[BookResponse])
async def get_books_by_author(author_id: str, current_user: dict = Depends(get_current_user)):
    # Role-based access control: authors can only view their own; admin can view all
    if current_user.get("role") != "admin" and current_user.get("author_id") != author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access books for this author."
        )
    
    db = get_database()
    cursor = db.books.find({"author_id": author_id})
    books = []
    async for doc in cursor:
        doc["id"] = str(doc.get("_id"))
        books.append(BookResponse(**doc))
    return books

@router.get("/{book_id}", response_model=BookResponse)
async def get_book_details(book_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    book = await db.books.find_one({"book_id": book_id})
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        
    if current_user.get("role") != "admin" and current_user.get("author_id") != book.get("author_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this book record."
        )
        
    book["id"] = str(book.get("_id"))
    return BookResponse(**book)
