from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import get_database
from app.services.auth_service import get_current_user, get_current_admin
from app.schemas.author import AuthorResponse
from app.schemas.book import BookResponse

router = APIRouter(prefix="/authors", tags=["Authors"])

@router.get("/me", response_model=AuthorResponse)
async def get_current_author_profile(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "author" or not current_user.get("author_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not an author account")
    
    db = get_database()
    author_id = current_user["author_id"]
    author = await db.authors.find_one({"author_id": author_id})
    if not author:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author profile not found")
        
    cursor = db.books.find({"author_id": author_id})
    books = []
    total_earned = 0.0
    total_pending = 0.0
    async for b in cursor:
        b["id"] = str(b.get("_id"))
        books.append(BookResponse(**b))
        total_earned += float(b.get("total_royalty_earned") or 0.0)
        total_pending += float(b.get("royalty_pending") or 0.0)

    author["id"] = str(author.get("_id"))
    author["books"] = books
    author["total_books"] = len(books)
    author["total_earnings"] = total_earned
    author["total_pending_royalty"] = total_pending
    return AuthorResponse(**author)

@router.get("", response_model=List[AuthorResponse])
async def list_all_authors(admin_user: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.authors.find({})
    authors = []
    async for a in cursor:
        author_id = a.get("author_id")
        books_cursor = db.books.find({"author_id": author_id})
        books = []
        total_earned = 0.0
        total_pending = 0.0
        async for b in books_cursor:
            b["id"] = str(b.get("_id"))
            books.append(BookResponse(**b))
            total_earned += float(b.get("total_royalty_earned") or 0.0)
            total_pending += float(b.get("royalty_pending") or 0.0)
            
        a["id"] = str(a.get("_id"))
        a["books"] = books
        a["total_books"] = len(books)
        a["total_earnings"] = total_earned
        a["total_pending_royalty"] = total_pending
        authors.append(AuthorResponse(**a))
    return authors

@router.get("/{author_id}", response_model=AuthorResponse)
async def get_author_by_id(author_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin" and current_user.get("author_id") != author_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        
    db = get_database()
    author = await db.authors.find_one({"author_id": author_id})
    if not author:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author not found")
        
    books_cursor = db.books.find({"author_id": author_id})
    books = []
    total_earned = 0.0
    total_pending = 0.0
    async for b in books_cursor:
        b["id"] = str(b.get("_id"))
        books.append(BookResponse(**b))
        total_earned += float(b.get("total_royalty_earned") or 0.0)
        total_pending += float(b.get("royalty_pending") or 0.0)

    author["id"] = str(author.get("_id"))
    author["books"] = books
    author["total_books"] = len(books)
    author["total_earnings"] = total_earned
    author["total_pending_royalty"] = total_pending
    return AuthorResponse(**author)
