from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi import UploadFile, File, Form
from fastapi.staticfiles import StaticFiles 
from typing import Optional
import logging
import os

# --- IMPORT SERVICES ---
from services.interaction_service import get_drug_analysis
from services.chat_service import get_chat_response
from services.calendar_service import calendar_service 

from services.diagnostic_service import run_diagnosis

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

static_path = "static"
if not os.path.exists(static_path):
    os.makedirs(static_path)
    print(f"Created missing directory: {static_path}")

app = FastAPI(title="MediBuddy & SafeDose API")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API MODELS ---

class AnalysisRequest(BaseModel):
    medication_list: List[str]

class ChatMessage(BaseModel):
    role: str
    parts: List[dict]

class ChatRequest(BaseModel):
    user_id: str
    query: str
    med_history: List[str]

# --- AI ASSISTANT ROUTE ---

@app.post("/api/diagnose")
async def analyze_health_packet(
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    user_id: str = Form(...)
):
    # 1. Read files into bytes
    image_bytes = await image.read() if image else None
    audio_bytes = await audio.read() if audio else None

    # 2. Process via the new service
    result = await run_diagnosis(
        user_id=user_id,
        image_data=image_bytes,
        audio_data=audio_bytes,
        image_mime=image.content_type if image else None
    )
    
    return result

@app.post("/api/chat")
async def chat_with_assistant(request: ChatRequest):
    try:
        # We pass request.med_history directly because it's already a List[str]
        result = await get_chat_response(
            user_id=request.user_id, 
            user_text=request.query, 
            med_history=request.med_history 
        )
        return result
    except Exception as e:
        logger.error(f"Chat Error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"MediBuddy Service Error: {str(e)}"
        )
    

@app.post("/api/analyze")
async def check_risk(request: AnalysisRequest):
    """
    Main Hybrid Endpoint: 
    Takes a list of strings, gets AI analysis, and returns structured data.
    """
    # 1. Get names from the request object
    med_names = request.medication_list
    
    # 2. Get the Deep AI Analysis (Gemini/NIH context)
    ai_result = await get_drug_analysis(med_names)
    
    # 3. Create a simplified medications list for the UI chips
    # Since we only have names here, we map them to a basic structure
    structured_meds = []
    for name in med_names:
        structured_meds.append({
            "name": name,
            "normalized_name": name.lower().strip(),
            "category": "Medication" # You can expand your DRUG_DATABASE logic here if needed
        })

    # 4. Return the format the frontend (MedicalForm.tsx) expects
    return {
        "medication_count": len(med_names),
        "risk_level": ai_result.get("risk_level", "LOW"),
        "interaction_count": ai_result.get("interaction_count", 0),
        "details": ai_result.get("details", []),
        "medications": structured_meds 
    }
# --- DOCTOR & APPOINTMENT DATA ---

doctors_db = []
appointments_db = []

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

@app.post("/doctors")
async def add_doctor(doctor: Doctor):
    doctor_dict = doctor.model_dump()
    doctor_dict["id"] = len(doctors_db) + 1
    doctors_db.append(doctor_dict)
    return {"message": "Doctor added successfully", "doctor": doctor_dict}

@app.get("/doctors")
async def get_doctors():
    return {"doctors": doctors_db}

@app.post("/appointments")
async def book_appointment(appointment: Appointment):
    appointment_dict = appointment.model_dump()
    appointment_dict["id"] = len(appointments_db) + 1
    appointment_dict["createdAt"] = datetime.now().isoformat()
    
    # Add to Google Calendar if credentials are provided
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
    
    response = {
        "message": "Appointment booked successfully",
        "appointment": appointment_dict
    }
    
    if calendar_result:
        response['calendarResult'] = calendar_result
    
    return response

@app.get("/appointments/{user_id}")
async def get_user_appointments(user_id: str):
    user_appointments = [apt for apt in appointments_db if apt.get("userId") == user_id]
    return {"appointments": user_appointments}

@app.get("/")
def home():
    return {"status": "MediBuddy & SafeDose Backend Running"}

# --- GOOGLE CALENDAR ROUTES ---

@app.get("/api/calendar/auth-url")
async def get_calendar_auth_url(user_id: str):
    """Generate Google OAuth URL for calendar access"""
    try:
        # Check if calendar service is configured or mock mode allowed
        # if not calendar_service.is_configured:
        #    raise HTTPException(...)
        
        auth_url, state = calendar_service.get_authorization_url(state=user_id)
        logger.info(f"Generated auth URL for user {user_id}")
        return {"auth_url": auth_url, "state": state}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating auth URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class CalendarTokenRequest(BaseModel):
    code: str
    userId: str

@app.post("/api/calendar/token")
async def exchange_calendar_token(request: CalendarTokenRequest):
    """Exchange authorization code for access token"""
    try:
        logger.info(f"Exchanging token for user {request.userId}")
        token_data = calendar_service.exchange_code_for_token(request.code)
        return {"success": True, "credentials": token_data}
    except Exception as e:
        logger.error(f"Error exchanging token: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to exchange token: {str(e)}")