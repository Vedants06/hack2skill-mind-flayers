import React, { useState, useEffect } from 'react';
import DoctorCard from './DoctorCard';
import { db, collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, getDocs, where } from '../firebase/firebase';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';


interface Doctor {
  id: string;
  name: string;
  location: string;
  speciality: string;
  education: string;
  ratings: number;
}

interface BookAppointmentProps {
  user: any;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ user }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('');
  
  // Google Calendar integration
  const { credentials, isAuthorized, isLoading: calendarLoading, authMessage, authorizeCalendar, revokeAuthorization } = useGoogleCalendar(user?.uid);
  
  const [bookingData, setBookingData] = useState({
    patientName: user?.displayName || '',
    patientEmail: user?.email || '',
    whatsapp: '',
    date: '',
    time: ''
  });

  const [storedWhatsapp, setStoredWhatsapp] = useState<string | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(true);
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDoctors();
    if (user) {
      fetchUserWhatsapp();
    }
  }, [user]);

  const fetchUserWhatsapp = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'appointments'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const lastAppointment = snapshot.docs[0].data();
        if (lastAppointment.whatsapp) {
          setStoredWhatsapp(lastAppointment.whatsapp);
          setBookingData(prev => ({
            ...prev,
            whatsapp: lastAppointment.whatsapp
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user WhatsApp:', error);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const fetchDoctors = () => {
    const q = query(collection(db, 'doctors'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    });

    return unsubscribe;
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
    setBookingMessage({ type: '', text: '' });
    // Reset or reload whatsapp
    if (storedWhatsapp) {
      setBookingData(prev => ({ ...prev, whatsapp: storedWhatsapp }));
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'doctors', doctorId));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to delete doctor. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;

    try {
      const appointmentData: any = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientName: bookingData.patientName,
        patientEmail: bookingData.patientEmail,
        whatsapp: bookingData.whatsapp,
        date: bookingData.date,
        time: bookingData.time,
        userId: user?.uid || null,
        createdAt: new Date().toISOString(),
        status: 'pending',
        location: selectedDoctor.location
      };
      
      // Add to Firebase
      await addDoc(collection(db, 'appointments'), appointmentData);
      
      // Add to Google Calendar if authorized
      if (isAuthorized && credentials) {
        try {
          appointmentData.googleCredentials = credentials;
          const calendarResponse = await fetch('http://localhost:8000/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
          });
          
          const calendarResult = await calendarResponse.json();
          
          if (calendarResult.calendarResult?.success) {
            setBookingMessage({ 
              type: 'success', 
              text: 'Appointment booked and added to your Google Calendar!' 
            });
          } else {
            setBookingMessage({ 
              type: 'success', 
              text: 'Appointment booked successfully!' 
            });
          }
        } catch (calError) {
          console.error('Calendar error:', calError);
          setBookingMessage({ 
            type: 'success', 
            text: 'Appointment booked (Calendar sync failed)' 
          });
        }
      } else {
        setBookingMessage({ 
          type: 'success', 
          text: 'Appointment booked successfully!' 
        });
      }
      
      // Update stored whatsapp for next time
      setStoredWhatsapp(bookingData.whatsapp);
      
      setBookingData({
        ...bookingData,
        date: '',
        time: ''
      });
      
      // Close form after 3 seconds
      setTimeout(() => {
        setShowBookingForm(false);
        setBookingMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setBookingMessage({ 
        type: 'error', 
        text: 'Error booking appointment. Please try again.' 
      });
      console.error('Error:', error);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpeciality === '' || doctor.speciality === filterSpeciality;
    return matchesSearch && matchesFilter;
  });

  const specialities = [...new Set(doctors.map(d => d.speciality))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Book an Appointment</h1>
          <p className="text-slate-600">Find and book appointments with our qualified doctors</p>
        </div>

        {/* Google Calendar Auth Message */}
        {authMessage && (
          <div className="mb-6 bg-emerald-100 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{authMessage}</span>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Doctors
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, speciality, or location..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Speciality
              </label>
              <select
                value={filterSpeciality}
                onChange={(e) => setFilterSpeciality(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Specialities</option>
                {specialities.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 text-lg">No doctors found matching your criteria</p>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={handleBookAppointment}
                onDelete={handleDeleteDoctor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Book Appointment</h2>
                <p className="text-emerald-600 font-medium mt-1">{selectedDoctor.name}</p>
                <p className="text-slate-600 text-sm">{selectedDoctor.speciality}</p>
              </div>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {bookingMessage.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                bookingMessage.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {bookingMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={bookingData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="patientEmail"
                  value={bookingData.patientEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp Number {storedWhatsapp ? '(Confirm or Update)' : '*'}
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={bookingData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {storedWhatsapp 
                    ? 'Please confirm your WhatsApp number or update if changed' 
                    : 'This will be used for appointment notifications'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Appointment Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    style={{colorScheme: 'light'}}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Appointment Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    style={{colorScheme: 'light'}}
                  />
                </div>
              </div>

              {/* Google Calendar Integration */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Add to Google Calendar
                  </label>
                  {isAuthorized && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Connected
                    </span>
                  )}
                </div>
                {!isAuthorized ? (
                  <button
                    type="button"
                    onClick={authorizeCalendar}
                    disabled={calendarLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-300 hover:border-emerald-500 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    {calendarLoading ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm py-2 px-3 rounded-lg flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Connected to Google Calendar</span>
                    </div>
                    <button
                      type="button"
                      onClick={revokeAuthorization}
                      className="px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
