# MediCare

MediCare is a full stack healthcare assistant that combines a React frontend and a FastAPI backend. It supports AI chat, multimodal diagnosis from image and voice input, medication interaction analysis, appointment booking, and optional Google Calendar sync.

## 1. What This Project Includes

1. AI assistant chat with user profile context.
2. Diagnostic flow for reports, images, and voice notes.
3. Medication interaction risk analysis.
4. Doctor and appointment management endpoints.
5. Optional Google Calendar event creation for appointments.
6. Firebase authentication and Firestore backed user data flows.

## 2. Repository Layout

1. [frontend](frontend) contains the React app built with Vite and TypeScript.
2. [backend](backend) contains the FastAPI service and AI integrations.
3. [backend/services](backend/services) contains core service logic for chat, diagnosis, medication analysis, calendar integration, and voice utilities.
4. [frontend/src/components](frontend/src/components) contains UI components for onboarding, appointments, medication, assistant, and landing pages.
5. [frontend/src/pages](frontend/src/pages) contains top level pages for auth, assistant, and diagnosis flows.

## 3. Tech Used

1. Frontend: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Firebase JS SDK.
2. Backend: FastAPI, Uvicorn, Pydantic, Python dotenv.
3. AI: Google Gemini via google genai SDK and Groq for transcription and LLM responses in diagnosis flow.
4. Data and auth: Firebase Authentication and Firestore.
5. Integrations: Google Calendar API and Google Text to Speech.
6. Deployment: Vercel for frontend and backend.

## 4. Prerequisites

1. Node.js 20 or newer.
2. Python 3.10 or newer.
3. A Firebase project with web app config and admin credentials.
4. A Gemini API key.
5. A Groq API key.
6. Optional Google OAuth client for Calendar integration.

## 5. Environment Variables

Create one env file for frontend and one env file for backend.

### 5.1 Frontend env

Create [frontend/.env](frontend/.env) with:

```env
VITE_API_URL=http://localhost:8000
VITE_API_KEY=your_firebase_web_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

### 5.2 Backend env

Create [backend/.env](backend/.env) with:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
BACKEND_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/calendar-callback.html
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

Notes:

1. `GOOGLE_APPLICATION_CREDENTIALS_JSON` is expected as a JSON string in environment variables.
2. In local fallback mode, backend services can also use the JSON file at [backend/hackwins-mind-flayers-firebase-adminsdk-fbsvc-ccc4812dec.json](backend/hackwins-mind-flayers-firebase-adminsdk-fbsvc-ccc4812dec.json).
3. Calendar service runs in mock mode if Google OAuth values are not configured.

## 6. Install Dependencies

### 6.1 Frontend

```powershell
cd frontend
npm install
```

### 6.2 Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## 7. Run Locally

Open two terminals.

### 7.1 Start backend

```powershell
cd backend
.\.venv\Scripts\activate
uvicorn app:app --reload --port 8000
```

### 7.2 Start frontend

```powershell
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## 8. API Endpoints

All backend routes are defined in [backend/app.py](backend/app.py).

1. `GET /`
	Returns backend status.

2. `POST /api/chat`
	Input includes `user_id`, `query`, `med_history`, and optional `user_profile`.
	Returns model response text and role.

3. `POST /api/diagnose`
	Multipart form with optional `image`, optional `audio`, and required `user_id`.
	Returns transcription, diagnostic analysis, and optional generated audio url.

4. `POST /api/analyze`
	Input includes `medication_list`.
	Returns risk level, interaction count, details, and normalized medication list.

5. `GET /doctors`
	Returns in memory doctor list.

6. `POST /doctors`
	Adds a doctor record to in memory store.

7. `POST /appointments`
	Books an appointment and optionally creates a Google Calendar event if credentials are provided.

8. `GET /appointments/{user_id}`
	Returns appointments for a user id from in memory store.

9. `GET /api/calendar/auth-url?user_id=...`
	Returns OAuth authorization url and state.

10. `POST /api/calendar/token`
	 Exchanges auth code for token credentials.

## 9. Frontend Scripts

Scripts in [frontend/package.json](frontend/package.json):

1. `npm run dev` starts Vite development server.
2. `npm run build` runs TypeScript build and Vite production build.
3. `npm run lint` runs ESLint.
4. `npm run preview` previews the production build locally.

## 10. Deployment Notes

1. Backend Vercel config is in [backend/vercel.json](backend/vercel.json) and serves [backend/app.py](backend/app.py).
2. Frontend Vercel config is in [frontend/vercel.json](frontend/vercel.json).
3. Add all required frontend and backend environment variables in Vercel project settings.
4. Ensure backend CORS and frontend `VITE_API_URL` point to deployed URLs.

## 11. Data and Runtime Behavior

1. Chat messages are written to Firestore under `chats/{user_id}/messages`.
2. Diagnosis history is written to Firestore under `user_summary/{user_id}/history`.
3. Doctor and appointment data in [backend/app.py](backend/app.py) are currently in memory and reset when the server restarts.
4. Generated diagnosis audio files are saved in [backend/static](backend/static) and served via `/static`.

## 12. Troubleshooting

1. If frontend cannot call backend, check `VITE_API_URL` in [frontend/src/config.ts](frontend/src/config.ts).
2. If Firebase fails on backend startup, verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` formatting.
3. If diagnosis audio url is empty, verify `BACKEND_URL` in backend env.
4. If calendar auth returns mock values, set valid Google OAuth env values.
5. If `npm install` fails in frontend, confirm Node.js version and remove stale lock or cache only inside [frontend](frontend).

## 13. Current Root Policy

1. Root level Node manifests were removed to keep root clean.
2. Node dependency management is now scoped to [frontend/package.json](frontend/package.json).
3. Root `node_modules` is ignored and should not be committed.

## 14. Security Notes

1. Do not commit `.env` files.
2. Do not commit Firebase admin keys in production workflows.
3. Rotate API keys if they were ever exposed.
