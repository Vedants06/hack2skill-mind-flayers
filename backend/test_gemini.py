#!/usr/bin/env python3
"""Test script to debug Gemini API calls"""

import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Check API key
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key exists: {bool(api_key)}")
print(f"API Key (first 20 chars): {api_key[:20] if api_key else 'NONE'}...")

# Initialize client
client = genai.Client(api_key=api_key)

# Test 1: Simple text prompt (like interaction_service)
print("\n=== Test 1: Simple text prompt ===")
try:
    config = types.GenerateContentConfig(
        response_mime_type='application/json',
        temperature=0.7,
        safety_settings=[
            types.SafetySetting(category='HARM_CATEGORY_DANGEROUS_CONTENT', threshold='BLOCK_NONE'),
        ]
    )
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello, respond with JSON: {\"hello\": \"world\"}",
        config=config
    )
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 2: Try with system instruction
print("\n=== Test 2: With system instruction ===")
try:
    config = types.GenerateContentConfig(
        system_instruction="You are a helpful assistant. Always respond in JSON.",
        response_mime_type='application/json',
        temperature=0.7,
        safety_settings=[
            types.SafetySetting(category='HARM_CATEGORY_DANGEROUS_CONTENT', threshold='BLOCK_NONE'),
        ]
    )
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello",
        config=config
    )
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 3: Fallback to 1.5-flash
print("\n=== Test 3: Fallback to gemini-1.5-flash ===")
try:
    config = types.GenerateContentConfig(
        system_instruction="You are a helpful assistant.",
        temperature=0.7,
    )
    
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Hello",
        config=config
    )
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n=== Tests complete ===")
