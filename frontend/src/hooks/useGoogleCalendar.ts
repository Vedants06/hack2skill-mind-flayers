import { useState, useEffect } from 'react';

interface GoogleCredentials {
  token: string;
  refresh_token: string;
  token_uri: string;
  client_id: string;
  client_secret: string;
  scopes: string[];
}

export const useGoogleCalendar = (userId: string | null) => {
  const [credentials, setCredentials] = useState<GoogleCredentials | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string>('');

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const storedUserId = sessionStorage.getItem('calendarAuthUserId');
    
    if (code && storedUserId) {
      // Exchange code for token
      const exchangeToken = async () => {
        setIsLoading(true);
        setAuthMessage('Connecting to Google Calendar...');
        try {
          const tokenResponse = await fetch('http://localhost:8000/api/calendar/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, userId: storedUserId })
          });

          const tokenData = await tokenResponse.json();
          
          if (tokenData.success) {
            setCredentials(tokenData.credentials);
            setIsAuthorized(true);
            
            // Store credentials in localStorage
            localStorage.setItem(
              `googleCalendar_${storedUserId}`,
              JSON.stringify(tokenData.credentials)
            );
            
            setAuthMessage('✓ Google Calendar connected successfully!');
            
            // Clear message after 3 seconds
            setTimeout(() => setAuthMessage(''), 3000);
          } else {
            setAuthMessage('Failed to connect Google Calendar');
          }
          
          // Clean up session storage and URL
          sessionStorage.removeItem('calendarAuthUserId');
          const returnUrl = sessionStorage.getItem('calendarAuthReturnUrl') || '/';
          sessionStorage.removeItem('calendarAuthReturnUrl');
          
          // Remove code from URL and redirect back
          window.history.replaceState({}, document.title, returnUrl);
          
        } catch (error) {
          console.error('Failed to exchange token:', error);
          setAuthMessage('Failed to connect Google Calendar');
        } finally {
          setIsLoading(false);
        }
      };
      
      exchangeToken();
    } else {
      // Load credentials from localStorage on mount
      const storedCreds = localStorage.getItem(`googleCalendar_${userId}`);
      if (storedCreds) {
        try {
          const parsedCreds = JSON.parse(storedCreds);
          setCredentials(parsedCreds);
          setIsAuthorized(true);
        } catch (e) {
          console.error('Failed to parse stored credentials', e);
        }
      }
    }
  }, [userId]);

  const authorizeCalendar = async () => {
    if (!userId) {
      alert('Please sign in to authorize Google Calendar');
      return;
    }

    setIsLoading(true);
    try {
      // Get authorization URL from backend
      const response = await fetch(
        `http://localhost:8000/api/calendar/auth-url?user_id=${userId}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to get authorization URL'}`);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();

      // Store the current page to return to after auth
      sessionStorage.setItem('calendarAuthReturnUrl', window.location.pathname);
      sessionStorage.setItem('calendarAuthUserId', userId);

      // Redirect to Google OAuth (instead of popup to avoid COOP issues)
      window.location.href = data.auth_url;

    } catch (error) {
      console.error('Error authorizing Google Calendar:', error);
      alert('Failed to authorize Google Calendar. Please check your backend configuration.');
      setIsLoading(false);
    }
  };

  const revokeAuthorization = () => {
    if (userId) {
      localStorage.removeItem(`googleCalendar_${userId}`);
      setCredentials(null);
      setIsAuthorized(false);
    }
  };

  return {
    credentials,
    isAuthorized,
    isLoading,
    authMessage,
    authorizeCalendar,
    revokeAuthorization
  };
};
