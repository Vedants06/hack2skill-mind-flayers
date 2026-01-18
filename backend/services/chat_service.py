import os
import json
import datetime
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from google import genai
from google.genai import types
from firebase_admin import credentials, initialize_app, _apps

load_dotenv()


# Get credentials from environment variable
cred_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if cred_json:
    # Use the JSON string instead of a filename
    cred_dict = json.loads(cred_json)
    if not _apps:
        cred = credentials.Certificate(cred_dict)
        initialize_app(cred)
else:
    # Fallback for local development if you still have the file locally
    cred = credentials.Certificate("hackwins-mind-flayers-firebase-adminsdk-fbsvc-ccc4812dec.json")
    if not _apps:
        initialize_app(cred)

db = firestore.client()

# 2. Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_chat_response(user_id: str, user_text: str, med_history: list[str], user_profile: dict = None):
    """
    Complete logic for MediBuddy Chat:
    - Saves user input to Firestore
    - Pulls context history
    - Handles Gemini API with robust error catching
    - Saves model response back to Firestore for real-time UI updates
    """
    
    # --- FIREBASE: Save User Message ---
    # We save this first so it appears in the UI immediately via the onSnapshot listener
    chat_ref = db.collection("chats").document(user_id).collection("messages")
    chat_ref.add({
        "role": "user",
        "text": user_text,
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    })

    # --- FIREBASE: Fetch History for Context ---
    # We limit to 7 to avoid "429 Quota Exhausted" errors on the free tier
    docs = chat_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(7).stream()
    
    messages_for_gemini = []
    for doc in reversed(list(docs)):
        msg_data = doc.to_dict()
        clean_role = "model" if msg_data.get("role") in ["model", "assistant"] else "user"
        messages_for_gemini.append({
            "role": clean_role,
            "parts": [{"text": msg_data.get("text", "")}]
        })

    # --- CONTEXT BUILDING ---
    profile_summary = "No profile provided."
    if user_profile:
        conditions = ", ".join(user_profile.get('conditions', [])) if user_profile.get('conditions') else "None"
        profile_summary = (
            f"User is {user_profile.get('age', 'N/A')}y/o {user_profile.get('gender', 'N/A')}. "
            f"Conditions: {conditions}. Metrics: {user_profile.get('height')}cm, {user_profile.get('weight')}kg."
        )

    med_context = ", ".join(med_history) if med_history else "No medications listed."
    
    # --- SYSTEM PROMPT ---
    system_prompt = f"""
    You are MediCare AI assistant, a bubbly, compassionate health companion. ✨
    
    USER CONTEXT: {profile_summary}
    MEDICATIONS: {med_context}

    TONE: Warm, supportive, and bubbly. Use emojis.
    
    RULES:
    1. Personalize advice based on the USER CONTEXT and MEDICATIONS.
    2. Keep responses between 2-4 sentences.
    3. You MUST respond in JSON format: {{"response_text": "your_message_here"}}
    """

    ai_text = ""

    try:
        # PRIMARY ATTEMPT: Gemini 1.5 Flash with JSON Mode
        # Using "gemini-1.5-flash" directly as the SDK handles the "models/" prefix
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=messages_for_gemini,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
                response_mime_type='application/json',
            )
        )

        if response and response.text:
            try:
                parsed_data = json.loads(response.text)
                ai_text = parsed_data.get("response_text", response.text)
            except json.JSONDecodeError:
                ai_text = response.text
        else:
            ai_text = "I'm processing that... could you tell me a bit more? ✨"

    except Exception as e:
        # Error logging for the 404/429 issues
        print(f"DEBUG: Primary API Error: {str(e)}")
        
        # SECONDARY ATTEMPT: Fallback to Basic Text (No JSON mode)
        try:
            fallback_response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[{"role": "user", "parts": [{"text": user_text}]}],
                config=types.GenerateContentConfig(system_instruction=system_prompt)
            )
            ai_text = fallback_response.text if fallback_response.text else "I'm having a little trouble connecting. ✨"
        except Exception as e2:
            print(f"DEBUG: Fallback Error: {str(e2)}")
            ai_text = "I'm offline for a quick second, but I'm still here for you! Try again shortly. ✨"

    # --- FIREBASE: Save AI Response ---
    # This write triggers the frontend onSnapshot to display the message
    chat_ref.add({
        "role": "model",
        "text": ai_text,
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    })

    return {"text": ai_text, "role": "model"}