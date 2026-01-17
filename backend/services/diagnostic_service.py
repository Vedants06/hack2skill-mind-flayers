import os
import base64
import io
import pymupdf
from datetime import datetime
from PIL import Image
from groq import Groq
import firebase_admin
from firebase_admin import credentials, firestore
from services.user_voice import transcribe_with_groq
from services.assistant_voice import text_to_speech_with_gtts_old
from dotenv import load_dotenv
import json
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
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def run_diagnosis(user_id: str, image_data: bytes, audio_data: bytes, image_mime: str):
    # --- STEP 1: VOICE TRANSCRIPTION ---
    user_query = "The user provided a document for analysis."
    if audio_data:
        temp_audio = f"temp_{user_id}_input.mp3"
        with open(temp_audio, "wb") as f: f.write(audio_data)
        try:
            user_query = transcribe_with_groq("whisper-large-v3", temp_audio)
        finally:
            if os.path.exists(temp_audio): os.remove(temp_audio)

    # --- STEP 2: MULTIMODAL ANALYSIS ---
    try:
        # 1. INITIALIZE MESSAGES FIRST (Fixes the NameError)
        messages = [
            {
                "role": "system", 
                "content": "You are a professional AI Diagnostic Assistant. Analyze the image or document provided. Provide a differential analysis and suggest specialists. Use one compassionate paragraph. No markdown."
            }
        ]

        user_content = [{"type": "text", "text": user_query}]

        if image_data:
            # --- PDF TO IMAGE CONVERSION ---
            if "pdf" in image_mime.lower():
                doc = pymupdf.open(stream=image_data, filetype="pdf")
                page = doc[0]
                pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                doc.close()
            else:
                img = Image.open(io.BytesIO(image_data))

            # --- IMAGE OPTIMIZATION ---
            if img.mode != "RGB": img = img.convert("RGB")
            if img.width > 1200:
                img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)

            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=85)
            base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            user_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
            })

        # 2. APPEND THE CONSTRUCTED USER CONTENT
        messages.append({"role": "user", "content": user_content})

        # 3. CALL GROQ
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct", 
            messages=messages,
            temperature=0.3,
            max_tokens=600
        )
        ai_text = completion.choices[0].message.content

        # --- STEP 3: VOICE GENERATION ---
        os.makedirs("static", exist_ok=True)
        filename = f"response_{user_id}_{int(datetime.now().timestamp())}.mp3"
        output_audio_path = os.path.join("static", filename)
        
        text_to_speech_with_gtts_old(ai_text, output_audio_path)
        audio_url = f"http://localhost:8000/static/{filename}"

        # --- STEP 4: SAVE TO FIREBASE ---
        summary_preview = ai_text[:60].strip() + "..." 

        history_data = {
            "userId": user_id,
            "timestamp": datetime.now(),
            "userQuery": user_query,
            "aiAnalysis": ai_text,
            "summary": summary_preview, # New field
            "audioUrl": audio_url,
            "fileType": image_mime
        }
        db.collection("user_summary").document(user_id).collection("history").add(history_data)

    except Exception as e:
        print(f"Detailed Backend Error: {str(e)}")
        ai_text = f"Analysis error: {str(e)}"
        audio_url = None

    return {
        "transcription": user_query,
        "analysis": ai_text,
        "audio_url": audio_url
    }