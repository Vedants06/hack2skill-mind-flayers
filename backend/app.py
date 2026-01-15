from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

# --- IMPORT SERVICES ---
from services.interaction_service import get_drug_analysis
from services.chat_service import get_chat_response 

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MediBuddy & SafeDose API")

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
    appointments_db.append(appointment_dict)
    return {"message": "Appointment booked successfully", "appointment": appointment_dict}

@app.get("/appointments/{user_id}")
async def get_user_appointments(user_id: str):
    user_appointments = [apt for apt in appointments_db if apt.get("userId") == user_id]
    return {"appointments": user_appointments}

@app.get("/")
def home():
    return {"status": "MediBuddy & SafeDose Backend Running"}