import React, { useState, useEffect } from 'react';
import DoctorCard from './DoctorCard';
import { db, collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, getDocs, where } from '../firebase/firebase';

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
      await addDoc(collection(db, 'appointments'), {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientName: bookingData.patientName,
        patientEmail: bookingData.patientEmail,
        whatsapp: bookingData.whatsapp,
        date: bookingData.date,
        time: bookingData.time,
        userId: user?.uid || null,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      setBookingMessage({ 
        type: 'success', 
        text: 'Appointment booked successfully!' 
      });
      
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
