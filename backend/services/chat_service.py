from google import genai
from google.genai import types
import os
import json
import datetime
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

# 1. Initialize Firebase (Check if already initialized to prevent errors)
if not firebase_admin._apps:
    # Use the path to your JSON key file
    cred = credentials.Certificate("hackwins-mind-flayers-firebase-adminsdk-fbsvc-ccc4812dec.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Initialize the Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_chat_response(user_id: str, user_text: str, med_history: list[str]):
    """
    user_id: Unique ID for the user (to fetch their specific history)
    user_text: The latest message from the user
    med_history: List of medications for context
    """
    
    # --- FIREBASE: Save User Message ---
    chat_ref = db.collection("chats").document(user_id).collection("messages")
    chat_ref.add({
        "role": "user",
        "text": user_text,
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    })

    # --- FIREBASE: Fetch Last 10 Messages for Context ---
    # --- FIREBASE: Fetch Last 10 Messages for Context ---
    docs = chat_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10).stream()
    
    messages_for_gemini = []
    for doc in reversed(list(docs)):
        msg_data = doc.to_dict()
        # Ensure roles are ONLY 'user' or 'model'
        clean_role = "model" if msg_data["role"] in ["model", "assistant"] else "user"
        messages_for_gemini.append({
            "role": clean_role,
            "parts": [{"text": msg_data["text"]}]
        })

    # --- GEMINI: Setup Prompt ---
    # --- GEMINI: Setup Balanced Prompt ---
    med_context = ", ".join(med_history) if med_history else "No medications listed"
    
    system_prompt = f"""
    You are MediBuddy, a compassionate and knowledgeable health companion. ✨
    USER MEDICATIONS: {med_context}.

    TONE: Bubbly, warm, and supportive. Use emojis occasionally!
    
    GUIDELINES:
    1. Answer the user's specific questions directly using their clinical context.
    2. If they ask about their meds, list them and explain their general purpose simply.
    3. DO NOT repeat the "consult a doctor" disclaimer in every message. 
    4. ONLY suggest a doctor/988 if the user describes:
       - Severe pain (chest pain, breathing issues).
       - Suicidal thoughts or self-harm.
       - Dangerous medication side effects.
    5. Keep responses concise (2-4 sentences).

    FORMAT: Respond in JSON with a "response_text" field.
    """

    try:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.8,
            response_mime_type='application/json',
        )

        # Generate Content using the fetched history
        response = client.models.generate_content(
            model="gemini-3-flash-preview", 
            contents=messages_for_gemini, # Use history instead of just user_text
            config=config
        )

        # --- CRASH PROTECTION & PARSING ---
        if not response or not hasattr(response, 'text') or not response.text:
            ai_text = "I'm here for you! Please check with your doctor about those symptoms, but I'm sending you positive vibes! ✨"
        else:
            data = json.loads(response.text)
            ai_text = data.get("response_text", response.text)

        # --- FIREBASE: Save AI Response ---
        chat_ref.add({
            "role": "model",
            "text": ai_text,
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })

        return {"text": ai_text, "role": "model"}

    except Exception as e:
        print(f"DEBUG: Chat API Error: {str(e)}")
        # Fallback to legacy if the 20-request limit is hit
        return await _try_chat_legacy(user_text, system_prompt)

async def _try_chat_legacy(full_prompt, system_prompt):
    try:
        config = types.GenerateContentConfig(system_instruction=system_prompt)
        response = client.models.generate_content(
            model="gemini-1.5-flash", 
            contents=full_prompt,
            config=config
        )
        # Add safety check to legacy as well
        if response and hasattr(response, 'text') and response.text:
            try:
                data = json.loads(response.text)
                return {"text": data.get("response_text", response.text), "role": "model"}
            except:
                return {"text": response.text, "role": "model"}
    except:
        pass
    return {"text": "I'm having a little brain fog! Can we try that again? ✨", "role": "model"}