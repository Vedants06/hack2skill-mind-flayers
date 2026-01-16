# Quick Google Calendar Setup Guide

## The Error You're Seeing

If you see `flowName=GeneralOAuthFlow` error, it means Google OAuth credentials are not properly configured.

## Quick Fix (5 minutes)

### Step 1: Get Your Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Calendar API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google Calendar API"
   - Click Enable

### Step 2: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. **If prompted**, configure OAuth consent screen first:

   - Choose "External" (for testing)
   - App name: `MediBuddy`
   - User support email: Your email
   - Add scope: `https://www.googleapis.com/auth/calendar`
   - Add your email as test user
   - Click Save

4. Now create OAuth client ID:

   - Application type: **Web application**
   - Name: `MediBuddy Calendar`
   - Authorized JavaScript origins: `http://localhost:5175`
   - Authorized redirect URIs: `http://localhost:5175`
   - Click Create

5. **Copy** your Client ID and Client Secret

### Step 3: Add to .env File

Create or edit `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here

# Add these lines:
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789jkl
GOOGLE_REDIRECT_URI=http://localhost:5175
```

### Step 4: Restart Backend

```bash
cd backend
# Stop the current backend (Ctrl+C)
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Test

1. Go to your app at http://localhost:5175
2. Navigate to "Book Appointment"
3. Click "Connect Google Calendar"
4. You should see Google's login screen (not an error)

## Common Issues

### "redirect_uri_mismatch"

- Make sure redirect URI in Google Console is **exactly**: `http://localhost:5175`
- No trailing slash, no path, just the base URL

### "Access blocked: This app's request is invalid"

- Add your email as a test user in OAuth consent screen
- Make sure app is in "Testing" mode (not published)

### "401 Unauthorized"

- Check your .env file has correct CLIENT_ID and CLIENT_SECRET
- Restart your backend server after adding credentials

### Still not working?

- Check backend terminal for error messages
- Make sure port 5175 is the correct frontend port (check your Vite output)
- Try clearing browser cache and localStorage

## Alternative: Skip Google Calendar (Optional)

If you don't need Google Calendar integration right now:

1. Just don't click "Connect Google Calendar" button
2. Appointments will still be saved in Firebase
3. You can add Google Calendar later

The app works fine without it - Calendar integration is an optional feature!
