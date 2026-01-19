import React, { useState, useEffect } from 'react';
import DoctorCard from './DoctorCard';
import { db, collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, getDocs, where } from '../firebase/firebase';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import API_BASE_URL from '../config.ts';

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  
  // Google Calendar integration
  const { credentials, isAuthorized, authMessage, isLoading: calendarLoading, authorizeCalendar, revokeAuthorization } = useGoogleCalendar(user?.uid);
  
  const [bookingData, setBookingData] = useState({
    patientName: user?.displayName || '',
    patientEmail: user?.email || '',
    whatsapp: '',
    date: '',
    time: ''
  });

  const [storedWhatsapp, setStoredWhatsapp] = useState<string | null>(null);
  
  // FIXED: Removed 'loadingWhatsapp' state as it was declared but never read (TS6133)
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
    }
    // Logic for loading state removed here as well
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
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(false);
    setShowBookingForm(true);
    setBookingMessage({ type: '', text: '' });
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
      // FIXED: Defined a clearer structure for appointmentData
      const appointmentData = {
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
        location: selectedDoctor.location,
        googleCredentials: (isAuthorized && credentials) ? credentials : null
      };
      
      await addDoc(collection(db, 'appointments'), appointmentData);
      
      if (isAuthorized && credentials) {
        try {
          appointmentData.googleCredentials = credentials;
          const calendarResponse = await fetch(`${API_BASE_URL}/appointments`, {
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
      
      setStoredWhatsapp(bookingData.whatsapp);
      setBookingData({ ...bookingData, date: '', time: '' });
      
      // Show success popup instead of auto-closing
      setShowBookingForm(false);
      setShowSuccessPopup(true);
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
    const matchesLocation = filterLocation === '' || doctor.location === filterLocation;
    return matchesSearch && matchesFilter && matchesLocation;
  });

  const specialities = [...new Set(doctors.map(d => d.speciality))];
  const locations = [...new Set(doctors.map(d => d.location))];

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

        {/* Google Calendar Integration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-slate-800">Google Calendar Integration</h3>
                <p className="text-sm text-slate-600">
                  {isAuthorized ? 'Connected - Your appointments will be added to Google Calendar' : 'Connect to sync appointments with your Google Calendar'}
                </p>
              </div>
            </div>
            {isAuthorized ? (
              <button
                onClick={revokeAuthorization}
                disabled={calendarLoading}
                className="px-6 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={authorizeCalendar}
                disabled={calendarLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
                Connect Google Calendar
              </button>
            )}
          </div>
          {authMessage && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              authMessage.includes('success') || authMessage.includes('authorized') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-amber-50 text-amber-700'
            }`}>
              {authMessage}
            </div>
          )}
        </div>

        {/* ... Search and Filter JSX remains same ... */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Doctors</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, speciality, or location..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Speciality</label>
              <select
                value={filterSpeciality}
                onChange={(e) => setFilterSpeciality(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Specialities</option>
                {specialities.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Location</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Locations</option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-slate-600 text-lg">No doctors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={handleBookAppointment}
                onDelete={handleDeleteDoctor}
                userEmail={user?.email}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      {showConfirmation && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Appointment</h2>
              <p className="text-slate-600 mb-6">Do you want to book an appointment with <span className="font-semibold text-emerald-600">{selectedDoctor.name}</span>?</p>
              
              <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">{selectedDoctor.speciality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-sm text-slate-600">{selectedDoctor.location}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedDoctor(null);
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... Booking Modal JSX remains same ... */}
      {showBookingForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Book Appointment</h2>
              <button onClick={() => setShowBookingForm(false)} className="text-slate-400">×</button>
            </div>
            {/* Modal Form content here */}
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {/* Form Inputs (patientName, email, whatsapp, date, time) */}
              <input type="text" name="patientName" value={bookingData.patientName} onChange={handleInputChange} required className="w-full p-3 border rounded-lg" placeholder="Patient Name" />
              <input type="email" name="patientEmail" value={bookingData.patientEmail} onChange={handleInputChange} required className="w-full p-3 border rounded-lg" placeholder="Email" />
              <input type="tel" name="whatsapp" value={bookingData.whatsapp} onChange={handleInputChange} required className="w-full p-3 border rounded-lg" placeholder="WhatsApp Number" />
              <input type="date" name="date" value={bookingData.date} onChange={handleInputChange} required className="w-full p-3 border rounded-lg" />
              <input type="time" name="time" value={bookingData.time} onChange={handleInputChange} required className="w-full p-3 border rounded-lg" />
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBookingForm(false)} className="flex-1 bg-slate-200 p-3 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-3 rounded-lg">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Confirmation Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
              <p className="text-slate-600 mb-6">{bookingMessage.text}</p>
              
              {selectedDoctor && (
                <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedDoctor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{selectedDoctor.name}</p>
                      <p className="text-sm text-slate-600">{selectedDoctor.speciality}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{bookingData.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{bookingData.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{selectedDoctor.location}</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-500 mb-6">You will receive a confirmation via WhatsApp and email shortly.</p>

              <button 
                onClick={() => {
                  setShowSuccessPopup(false);
                  setSelectedDoctor(null);
                  setBookingMessage({ type: '', text: '' });
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;