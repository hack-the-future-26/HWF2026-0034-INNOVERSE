import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def configure_cors(app: FastAPI) -> None:
    cors_origins_raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )
    origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
    if not origins:
        origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if "*" in origins else origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
