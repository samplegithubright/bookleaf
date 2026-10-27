from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.database import get_database
from app.services.auth_service import (
    verify_password,
    create_access_token,
    get_current_user
)
from app.schemas.auth import Token, UserResponse, UserLogin

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    db = get_database()
    email_query = login_data.email.lower().strip()
    if email_query == "admin":
        email_query = "admin@bookleaf.com"
        
    user = await db.users.find_one({"email": email_query})
    if not user or not verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(
        data={
            "sub": user["email"],
            "role": user.get("role", "author"),
            "author_id": user.get("author_id")
        }
    )
    
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.get("role", "author"),
        author_id=user.get("author_id"),
        email=user["email"],
        name=user.get("name", "User")
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.get("_id", "")),
        email=current_user["email"],
        name=current_user.get("name", ""),
        role=current_user.get("role", "author"),
        author_id=current_user.get("author_id"),
        city=current_user.get("city"),
        phone=current_user.get("phone")
    )
