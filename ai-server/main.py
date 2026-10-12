from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from routers import chat, image_recognition, trip_planner, knowledge

app = FastAPI(
    title="Shangla Tourist AI Server",
    description="AI-powered backend for Shangla Tourist Website",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/ai", tags=["Chatbot"])
app.include_router(image_recognition.router, prefix="/ai", tags=["Image Recognition"])
app.include_router(trip_planner.router, prefix="/ai", tags=["Trip Planner"])
app.include_router(knowledge.router, prefix="/ai", tags=["Knowledge Base"])

@app.get("/")
async def root():
    return {
        "status": "running",
        "message": "Shangla Tourist AI Server is running! 🏔️",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/ai/chat",
            "voice_chat": "/ai/chat/voice",
            "image_recognition": "/ai/recognize-place",
            "trip_planner": "/ai/plan-trip",
            "knowledge_ingest": "/ai/ingest-data",
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "AI Server is running"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)