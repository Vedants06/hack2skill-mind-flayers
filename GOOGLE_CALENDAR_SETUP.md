# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for automatic appointment scheduling.

## Prerequisites

- A Google Cloud Console account
- Your application running on localhost (backend on port 8000, frontend on port 3000)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name/ID

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:

   - User Type: **External** (for testing) or **Internal** (for organization use)
   - Fill in required fields:
     - App name: Your app name (e.g., "MediBuddy")
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `https://www.googleapis.com/auth/calendar`
   - Add test users (your email addresses for testing)
   - Save and continue

4. Back on the Credentials page, click **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Configure the OAuth client:
   - **Name**: MediBuddy Calendar Integration
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/calendar-callback.html`
7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

## Step 4: Configure Backend Environment Variables

1. Copy `.env.example` to `.env` in the `backend` folder:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/calendar-callback.html
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Step 5: Install Required Python Packages

```bash
cd backend
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

Or install from requirements.txt:

```bash
pip install -r requirements.txt
```

## Step 6: Start the Application

1. Start the backend:

   ```bash
   cd backend
   python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## How to Use

1. **Sign in** to your application
2. Navigate to **Book Appointment**
3. Select a doctor and fill in the appointment details
4. Before confirming, click **Connect Google Calendar**
5. A popup will open asking you to authorize the app
6. Sign in with your Google account and grant calendar permissions
7. Once authorized, you'll see a "Connected" status
8. Now when you book appointments, they will automatically be added to your Google Calendar!

## Features

- ✅ Automatic calendar event creation
- ✅ 1-hour appointment duration by default
- ✅ Reminders: 1 day before (email) and 1 hour before (popup)
- ✅ Color-coded events (red for medical appointments)
- ✅ Includes doctor details, patient info, and location
- ✅ Persistent authorization (credentials stored in browser)

## Troubleshooting

### "Access blocked: This app's request is invalid"

- Make sure your redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/calendar-callback.html`
- Check that you've added your email as a test user in the OAuth consent screen

### "Calendar event not created"

- Verify your backend is running on port 8000
- Check backend logs for errors
- Ensure your `.env` file has the correct credentials
- Test the authorization by clicking "Connect Google Calendar" again

### "401 Unauthorized" errors

- Your OAuth credentials may have expired
- Click "Disconnect" and then "Connect Google Calendar" again to re-authorize

## Security Notes

- OAuth credentials are stored in the browser's localStorage
- Never commit your `.env` file to version control
- In production, use HTTPS and update redirect URIs accordingly
- Consider implementing token refresh logic for long-term use

## API Endpoints

The following endpoints are available:

- `GET /api/calendar/auth-url?user_id={userId}` - Get OAuth authorization URL
- `POST /api/calendar/token` - Exchange authorization code for access token
- `POST /appointments` - Create appointment (includes calendar integration if credentials provided)

## Next Steps

- Implement appointment cancellation with calendar event deletion
- Add appointment editing with calendar event updates
- Implement automatic token refresh
- Add support for multiple calendar providers
