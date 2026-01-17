import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_with_groq(model_name: str, audio_file_path: str):
    """
    Converts audio files to text using Groq's Whisper-large-v3.
    """
    try:
        with open(audio_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(audio_file_path, file.read()),
                model=model_name,
                response_format="text",
            )
            return transcription
    except Exception as e:
        print(f"Transcription Error: {str(e)}")
        return "Could not transcribe audio."