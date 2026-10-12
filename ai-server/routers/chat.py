from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import uuid

from services.rag_service import rag_service
from services.llm_service import llm_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None
    conversation_history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    reply: str
    language: str
    session_id: str
    sources_used: int = 0

# In-memory session store (use Redis in production)
sessions = {}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = request.session_id or str(uuid.uuid4())

    # Get or create session history
    if session_id not in sessions:
        sessions[session_id] = []

    # Retrieve relevant context from knowledge base
    context = rag_service.retrieve(
        query=request.message,
        k=5,
        language=request.language
    )

    # Generate response
    reply = llm_service.generate_response(
        user_message=request.message,
        context=context,
        language=request.language,
        conversation_history=sessions[session_id]
    )

    # Update session history
    sessions[session_id].append({"role": "user", "content": request.message})
    sessions[session_id].append({"role": "assistant", "content": reply})

    # Keep only last 20 messages
    if len(sessions[session_id]) > 20:
        sessions[session_id] = sessions[session_id][-20:]

    return ChatResponse(
        reply=reply,
        language=request.language,
        session_id=session_id,
        sources_used=len(context)
    )

@router.post("/chat/voice")
async def voice_chat(
    audio: UploadFile = File(...),
    language: str = "en",
    session_id: Optional[str] = None
):
    """
    Process voice input — converts speech to text then processes as chat.
    Requires: pip install openai-whisper OR use OpenAI Whisper API
    """
    try:
        import openai
        import tempfile
        import os

        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Save uploaded audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Transcribe with Whisper
        with open(tmp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ur" if language == "ur" else "en"
            )
        os.unlink(tmp_path)

        transcribed_text = transcript.text

        # Process as regular chat
        context = rag_service.retrieve(transcribed_text, k=5, language=language)
        reply = llm_service.generate_response(
            user_message=transcribed_text,
            context=context,
            language=language
        )

        return {
            "transcription": transcribed_text,
            "reply": reply,
            "language": language,
            "session_id": session_id or str(uuid.uuid4())
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Voice processing unavailable: {str(e)}"
        )