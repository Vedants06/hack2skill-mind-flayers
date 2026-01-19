import os
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarService:
    def __init__(self):
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        
        # Check if credentials are properly configured
        self.is_configured = (
            client_id and 
            client_secret and 
            client_id != "client_id" and 
            client_secret != "client_secret"
        )
        
        self.client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173")]
            }
        }
    
    def get_authorization_url(self, state: str = None):
        """Generate Google OAuth authorization URL"""
        if not self.is_configured:
            # Return a fake URL for development purposes when credentials are missing
            # This allows the frontend to simulate the flow
            print("WARNING: Google Calendar credentials missing. Using MOCK mode.")
            return "https://medicare-vision.vercel.app/calendar-callback.html?code=MOCK_CODE&state=" + (state or "mock_state"), state or "mock_state"
        
        flow = Flow.from_client_config(
            self.client_config,
            scopes=SCOPES,
            redirect_uri=self.client_config["web"]["redirect_uris"][0]
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state or 'state_parameter'
        )
        
        return authorization_url, state
    
    def exchange_code_for_token(self, code: str):
        """Exchange authorization code for access token"""
        if not self.is_configured or code == "MOCK_CODE":
             # Return mock credentials
             return {
                'token': "mock_token",
                'refresh_token': "mock_refresh_token",
                'token_uri': "https://oauth2.googleapis.com/token",
                'client_id': "mock_client_id",
                'client_secret': "mock_client_secret",
                'scopes': SCOPES
            }

        flow = Flow.from_client_config(
            self.client_config,
            scopes=SCOPES,
            redirect_uri=self.client_config["web"]["redirect_uris"][0]
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Ensure we have client_id and client_secret (sometimes not in credentials object)
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id or self.client_config["web"]["client_id"],
            'client_secret': credentials.client_secret or self.client_config["web"]["client_secret"],
            'scopes': credentials.scopes
        }
    
    def _get_or_create_medibuddy_calendar(self, service):
        """Finds or creates a dedicated MediBuddy calendar"""
        try:
            # List all calendars
            page_token = None
            while True:
                calendar_list = service.calendarList().list(pageToken=page_token).execute()
                for calendar_list_entry in calendar_list.get('items', []):
                    # Check for 'MediBuddy' or 'MediBuddy App'
                    if calendar_list_entry.get('summary') in ['MediBuddy', 'MediBuddy App']:
                        print(f"Found existing MediBuddy calendar: {calendar_list_entry.get('id')}")
                        return calendar_list_entry.get('id')
                page_token = calendar_list.get('nextPageToken')
                if not page_token:
                    break
            
            # If not found, create new calendar
            print("Creating new MediBuddy App calendar...")
            calendar = {
                'summary': 'MediBuddy App',
                'timeZone': 'Asia/Kolkata' # Default timezone
            }
            created_calendar = service.calendars().insert(body=calendar).execute()
            print(f"Created new calendar with ID: {created_calendar.get('id')}")
            return created_calendar.get('id')
            
        except Exception as e:
            print(f"Error finding/creating calendar: {str(e)}. Falling back to primary.")
            import traceback
            traceback.print_exc()
            return 'primary'

    def create_calendar_event(self, credentials_dict: dict, appointment_data: dict):
        """Create a Google Calendar event"""
        print(f"Creating calendar event for: {appointment_data.get('patientName')}")
        
        if credentials_dict.get('token') == "mock_token":
             print("MOCK TOKEN DETECTED - returning fake success")
             return {
                'success': True,
                'event_id': "mock_event_id_12345",
                'event_link': "https://calendar.google.com/calendar/r/eventedit?text=Mock+Appointment",
                'message': 'Calendar event created successfully (MOCK MODE)'
            }

        try:
            # Fallback to env vars if missing in dict
            client_id = credentials_dict.get('client_id') or self.client_config["web"]["client_id"]
            client_secret = credentials_dict.get('client_secret') or self.client_config["web"]["client_secret"]

            credentials = Credentials(
                token=credentials_dict.get('token'),
                refresh_token=credentials_dict.get('refresh_token'),
                token_uri=credentials_dict.get('token_uri'),
                client_id=client_id,
                client_secret=client_secret,
                scopes=credentials_dict.get('scopes')
            )
            
            service = build('calendar', 'v3', credentials=credentials)
            
            # Get or create dedicated calendar
            calendar_id = self._get_or_create_medibuddy_calendar(service)
            
            # Parse appointment date and time
            appointment_date = appointment_data.get('date')  # Format: YYYY-MM-DD


            appointment_time = appointment_data.get('time')  # Format: HH:MM
            
            # Combine date and time
            start_datetime = datetime.strptime(f"{appointment_date} {appointment_time}", "%Y-%m-%d %H:%M")
            end_datetime = start_datetime + timedelta(hours=1)  # Default 1 hour duration
            
            event = {
                'summary': f"Doctor Appointment - {appointment_data.get('doctorName')}",
                'location': appointment_data.get('location', 'Medical Clinic'),
                'description': f"Appointment with Dr. {appointment_data.get('doctorName')}\n"
                              f"Patient: {appointment_data.get('patientName')}\n"
                              f"Email: {appointment_data.get('patientEmail')}\n"
                              f"WhatsApp: {appointment_data.get('whatsapp', 'N/A')}",
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'Asia/Kolkata',  # Change based on your timezone
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'Asia/Kolkata',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 60},  # 1 hour before
                    ],
                },
                'colorId': '11',  # Red color for medical appointments
            }
            
            event_result = service.events().insert(calendarId=calendar_id, body=event).execute()
            
            return {
                'success': True,
                'event_id': event_result.get('id'),
                'event_link': event_result.get('htmlLink'),
                'message': 'Calendar event created successfully'
            }
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error),
                'message': 'Failed to create calendar event'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'An error occurred while creating calendar event'
            }
    
    def delete_calendar_event(self, credentials_dict: dict, event_id: str):
        """Delete a Google Calendar event"""
        try:
            credentials = Credentials(
                token=credentials_dict.get('token'),
                refresh_token=credentials_dict.get('refresh_token'),
                token_uri=credentials_dict.get('token_uri'),
                client_id=credentials_dict.get('client_id'),
                client_secret=credentials_dict.get('client_secret'),
                scopes=credentials_dict.get('scopes')
            )
            
            service = build('calendar', 'v3', credentials=credentials)
            service.events().delete(calendarId='primary', eventId=event_id).execute()
            
            return {'success': True, 'message': 'Calendar event deleted successfully'}
            
        except HttpError as error:
            return {'success': False, 'error': str(error)}

calendar_service = GoogleCalendarService()
