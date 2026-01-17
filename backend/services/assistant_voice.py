from gtts import gTTS
import os

def text_to_speech_with_gtts_old(text: str, output_path: str):
    """
    Converts the AI response text into a natural-sounding MP3 file.
    """
    try:
        # Create gTTS object (English language)
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save the audio file
        tts.save(output_path)
        return True
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        return False