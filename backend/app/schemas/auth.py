from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="John Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str = Field(..., min_length=6, example="secret123")
    role: Optional[UserRole] = Field(default=UserRole.CUSTOMER, example=UserRole.CUSTOMER)
    organization_id: Optional[int] = Field(default=None, example=1)

class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str = Field(..., example="secret123")

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    organization_id: Optional[int] = None
    organization_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
