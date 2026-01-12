#uvicorn app:app --reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

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