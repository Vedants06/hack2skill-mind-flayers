import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from '../firebase/firebase';

interface Appointment {
  id: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

interface MyAppointmentsProps {
  user: any;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
      setLoading(false);
      console.log('Appointments updated:', appointmentsData.length);
    }, (error) => {
      console.error('Error fetching appointments:', error);
      // If index error, try without ordering
      const simpleQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', user.uid)
      );
      const simpleUnsub = onSnapshot(simpleQuery, (snapshot) => {
        const appointmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];
        // Sort manually
        appointmentsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAppointments(appointmentsData);
        setLoading(false);
      });
      return () => simpleUnsub();
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    setCanceling(true);
    
    try {
      console.log('Deleting appointment:', appointmentId);
      await deleteDoc(doc(db, 'appointments', appointmentId));
      console.log('Appointment deleted successfully');
      setAppointmentToCancel(null);
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">My Appointments</h1>
          <p className="text-slate-600">View and manage your scheduled appointments</p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Appointments Yet</h3>
            <p className="text-slate-600 mb-6">You haven't booked any appointments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-slate-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {appointment.doctorName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{appointment.doctorName}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-500">
                      Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => setAppointmentToCancel(appointment.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {appointmentToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-center text-slate-600 mb-6">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setAppointmentToCancel(null)}
                  disabled={canceling}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-teal-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={() => handleCancelAppointment(appointmentToCancel)}
                  disabled={canceling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {canceling ? 'Canceling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
