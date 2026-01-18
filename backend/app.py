from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
from fastapi.staticfiles import StaticFiles 
import logging
import os
import json
import firebase_admin
from firebase_admin import credentials
import sys
from pathlib import Path

# --- IMPORT SERVICES ---
from services.interaction_service import get_drug_analysis
from services.chat_service import get_chat_response
from services.calendar_service import calendar_service 
from services.diagnostic_service import run_diagnosis

app = FastAPI(title="MediBuddy & SafeDose API")

# Add the current directory to sys.path so Vercel can find the 'services' folder
sys.path.append(str(Path(__file__).parent))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cred_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if cred_json:
    # Convert the string back into a Python dictionary
    cred_dict = json.loads(cred_json)
    
    # Initialize Firebase using the dictionary instead of a file path
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
else:
    print("WARNING: Firebase credentials not found in environment variables!")

# Ensure static directory exists for storage
static_path = "static"
if not os.path.exists(static_path):
    os.makedirs(static_path)
    print(f"Created missing directory: {static_path}")


# Mount static files to serve images/reports
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",  # All Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Also add specific origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API MODELS ---

class AnalysisRequest(BaseModel):
    medication_list: List[str]

class ChatRequest(BaseModel):
    user_id: str
    query: str
    med_history: List[str]
    user_profile: Optional[Dict] = None  # Crucial: Fixes the 422 error

class Doctor(BaseModel):
    name: str
    location: str
    speciality: str
    education: str
    ratings: float

class Appointment(BaseModel):
    doctorId: int
    doctorName: str
    patientName: str
    patientEmail: str
    date: str
    time: str
    userId: Optional[str] = None
    location: Optional[str] = None
    whatsapp: Optional[str] = None
    googleCredentials: Optional[dict] = None

class CalendarTokenRequest(BaseModel):
    code: str
    userId: str

# --- IN-MEMORY DATABASE (MOCK) ---
doctors_db = []
appointments_db = []

# --- AI ASSISTANT ROUTES ---

@app.post("/api/chat")
async def chat_with_assistant(request: ChatRequest):
    """
    Main Chat Endpoint: Sends user query and profile context to Gemini.
    """
    try:
        result = await get_chat_response(
            user_id=request.user_id, 
            user_text=request.query, 
            med_history=request.med_history,
            user_profile=request.user_profile
        )
        return result
    except Exception as e:
        logger.error(f"Chat Error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"MediBuddy Service Error: {str(e)}"
        )

@app.post("/api/diagnose")
async def analyze_health_packet(
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    user_id: str = Form(...)
):
    """
    Multimodal Endpoint: Processes voice memos or symptoms images.
    """
    try:
        image_bytes = await image.read() if image else None
        audio_bytes = await audio.read() if audio else None

        result = await run_diagnosis(
            user_id=user_id,
            image_data=image_bytes,
            audio_data=audio_bytes,
            image_mime=image.content_type if image else None
        )
        return result
    except Exception as e:
        logger.error(f"Diagnostic Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process medical data")

# --- MEDICATION ANALYSIS ROUTES ---

@app.post("/api/analyze")
async def check_risk(request: AnalysisRequest):
    """
    SafeDose Interaction Checker: Analyzes drug-to-drug risks.
    """
    med_names = request.medication_list
    ai_result = await get_drug_analysis(med_names)
    
    structured_meds = [
        {"name": name, "normalized_name": name.lower().strip(), "category": "Medication"}
        for name in med_names
    ]

    return {
        "medication_count": len(med_names),
        "risk_level": ai_result.get("risk_level", "LOW"),
        "interaction_count": ai_result.get("interaction_count", 0),
        "details": ai_result.get("details", []),
        "medications": structured_meds 
    }

# --- APPOINTMENT & DOCTOR ROUTES ---

@app.get("/doctors")
async def get_doctors():
    return {"doctors": doctors_db}

@app.post("/doctors")
async def add_doctor(doctor: Doctor):
    doctor_dict = doctor.model_dump()
    doctor_dict["id"] = len(doctors_db) + 1
    doctors_db.append(doctor_dict)
    return {"message": "Doctor added successfully", "doctor": doctor_dict}

@app.post("/appointments")
async def book_appointment(appointment: Appointment):
    appointment_dict = appointment.model_dump()
    appointment_dict["id"] = len(appointments_db) + 1
    appointment_dict["createdAt"] = datetime.now().isoformat()
    
    calendar_result = None
    if appointment.googleCredentials:
        calendar_result = calendar_service.create_calendar_event(
            appointment.googleCredentials,
            appointment_dict
        )
        if calendar_result.get('success'):
            appointment_dict['calendarEventId'] = calendar_result.get('event_id')
            appointment_dict['calendarEventLink'] = calendar_result.get('event_link')
    
    appointments_db.append(appointment_dict)
    
    response = {"message": "Appointment booked successfully", "appointment": appointment_dict}
    if calendar_result:
        response['calendarResult'] = calendar_result
    return response

@app.get("/appointments/{user_id}")
async def get_user_appointments(user_id: str):
    user_appointments = [apt for apt in appointments_db if apt.get("userId") == user_id]
    return {"appointments": user_appointments}

# --- GOOGLE CALENDAR OAUTH ROUTES ---

@app.get("/api/calendar/auth-url")
async def get_calendar_auth_url(user_id: str):
    try:
        auth_url, state = calendar_service.get_authorization_url(state=user_id)
        return {"auth_url": auth_url, "state": state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calendar/token")
async def exchange_calendar_token(request: CalendarTokenRequest):
    try:
        token_data = calendar_service.exchange_code_for_token(request.code)
        return {"success": True, "credentials": token_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to exchange token: {str(e)}")

@app.get("/")
def home():
    return {"status": "MediBuddy & SafeDose Backend Running"}