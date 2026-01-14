#uvicorn app:app --reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# Enable CORS for your React/Vite app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Your Hackathon Database Logic ---
DRUG_DATABASE = {
    "warfarin": {"category": "Anticoagulant", "brands": ["coumadin"]},
    "ibuprofen": {"category": "NSAID", "brands": ["advil", "motrin"]},
    "lisinopril": {"category": "ACE Inhibitor", "brands": ["prinivil", "zestril"]},
    "metformin": {"category": "Diabetes", "brands": ["glucophage"]},
}

INTERACTIONS = {
    ("warfarin", "ibuprofen"): {
        "severity": "HIGH",
        "description": "Increased bleeding risk. Ibuprofen can enhance the effect of Warfarin.",
        "advice": "Monitor for bleeding, consult your doctor immediately."
    },
    ("lisinopril", "ibuprofen"): {
        "severity": "MODERATE",
        "description": "Potential kidney strain and reduced blood pressure control.",
        "advice": "Monitor kidney function and blood pressure."
    }
}

def normalize_drug_name(name: str) -> str:
    name_clean = name.lower().strip()
    if name_clean in DRUG_DATABASE:
        return name_clean
    for generic, info in DRUG_DATABASE.items():
        if name_clean in info["brands"]:
            return generic
    return name_clean

# --- API Models ---
class MedicationEntry(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

@app.post("/check-risk")
async def check_risk(medications: List[MedicationEntry]):
    structured_meds = []
    for m in medications:
        norm = normalize_drug_name(m.name)
        structured_meds.append({
            **m.dict(),
            "normalized_name": norm,
            "is_recognized": norm in DRUG_DATABASE,
            "category": DRUG_DATABASE[norm]["category"] if norm in DRUG_DATABASE else "Unknown"
        })

    # Check for interactions
    found_interactions = []
    for i in range(len(structured_meds)):
        for j in range(i + 1, len(structured_meds)):
            d1 = structured_meds[i]["normalized_name"]
            d2 = structured_meds[j]["normalized_name"]
            
            # Check both directions in the dictionary
            interaction = INTERACTIONS.get((d1, d2)) or INTERACTIONS.get((d2, d1))
            if interaction:
                found_interactions.append({
                    "drug1": structured_meds[i]["name"],
                    "drug2": structured_meds[j]["name"],
                    **interaction
                })

    risk_level = "LOW"
    if any(i["severity"] == "HIGH" for i in found_interactions): risk_level = "HIGH"
    elif any(i["severity"] == "MODERATE" for i in found_interactions): risk_level = "MODERATE"

    return {
        "medications": structured_meds,
        "interactions": found_interactions,
        "risk_level": risk_level,
        "medication_count": len(structured_meds),
        "interaction_count": len(found_interactions)
    }

# --- Doctor and Appointment Management ---

# In-memory storage for doctors and appointments (replace with a real DB in production)
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
    doctor_dict = doctor.dict()
    doctor_dict["id"] = len(doctors_db) + 1
    doctors_db.append(doctor_dict)
    return {"message": "Doctor added successfully", "doctor": doctor_dict}

@app.get("/doctors")
async def get_doctors():
    return {"doctors": doctors_db}

@app.post("/appointments")
async def book_appointment(appointment: Appointment):
    appointment_dict = appointment.dict()
    appointment_dict["id"] = len(appointments_db) + 1
    appointment_dict["createdAt"] = datetime.now().isoformat()
    appointments_db.append(appointment_dict)
    return {"message": "Appointment booked successfully", "appointment": appointment_dict}

@app.get("/appointments/{user_id}")
async def get_user_appointments(user_id: str):
    user_appointments = [apt for apt in appointments_db if apt.get("userId") == user_id]
    return {"appointments": user_appointments}