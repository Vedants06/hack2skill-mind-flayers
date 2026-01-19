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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('');
  
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

        {/* ... Search and Filter JSX remains same ... */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default BookAppointment;