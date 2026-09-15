from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import User
from app.models.enums import UserRole
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse
)
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token
)
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def build_user_response(user: User) -> UserResponse:
    org_name = user.organization.name if user.organization else None
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        organization_id=user.organization_id,
        organization_name=org_name,
        created_at=user.created_at
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # Public registration forces default role to customer unless customer is requested
    assigned_role = payload.role if payload.role == UserRole.CUSTOMER else UserRole.CUSTOMER

    new_user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        role=assigned_role,
        organization_id=payload.organization_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role.value, "org_id": new_user.organization_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_response(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login_user(
    payload: UserLoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value, "org_id": user.organization_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_response(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return build_user_response(current_user)
