# app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import our new fresh service
from services.interaction_service import get_drug_analysis

app = FastAPI(title="SafeDose API - Hackathon Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Models ---
# This model now matches your frontend payload exactly
class AnalysisRequest(BaseModel):
    medication_list: List[str]

# --- API Routes ---

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

@app.get("/")
def home():
    return {"status": "SafeDose Backend Running"}