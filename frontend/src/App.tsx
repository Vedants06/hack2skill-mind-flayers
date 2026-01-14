import React, { useState, useEffect } from 'react';
import MedicationForm from './components/MedicationForm';
import RiskDisplay from './components/RiskDisplay';
import HistoryItem from './components/HistoryItem';
import RiskSummary from './components/RiskSummary';
import BookAppointment from './components/BookAppointment';
import AddDoctor from './components/AddDoctor';
import MyAppointments from './components/MyAppointments';
import { useAuth } from './firebase/useAuth';
import { db, collection, query, where, onSnapshot, orderBy } from './firebase/firebase';
import './App.css';

const App: React.FC = () => {
  const auth = useAuth() as any;
  const user = auth?.user;
  const signInWithGoogle = auth?.signInWithGoogle;
  const logout = auth?.logout;

  const [activeSection, setActiveSection] = useState<'landing' | 'drug-check' | 'chatbot' | 'reports' | 'appointments' | 'add-doctor' | 'my-appointments'>('landing');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Real-time listener for previous reports (History)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(records);
    }, (error) => {
      console.error("Firebase Error: Likely missing index.", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Loading state for Firebase Auth
  if (auth?.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading medical profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Navigation Header */}
      <nav className="bg-white/40 backdrop-blur-md px-8 md:px-16 py-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg border-2 border-teal-700">
              <span className="text-teal-700 font-bold text-xl">✚</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
              MediBuddy
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center">
                <p className="text-lg font-semibold text-gray-900">Hello, {user.displayName}</p>
              </div>
              <button
                onClick={() => setActiveSection('my-appointments')}
                className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                My Appointments
              </button>
              <button
                onClick={() => setActiveSection('add-doctor')}
                className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                title="Admin: Add Doctor"
              >
                + Doctor
              </button>
              <button
                onClick={() => {
                  logout();
                  setActiveSection('landing');
                }}
                className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              Sign In
            </button>
          )}
          <button className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2">
            Contact Us
            <span className="text-white text-sm">→</span>
          </button>
        </div>
      </nav>

      {/* Landing Page */}
      {activeSection === 'landing' && (
        <main className="min-h-screen">
          {/* Hero Section - Teal Background */}
          <section className="max-w-[1400px] mx-auto px-8 md:px-16 py-8">
            <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="px-8 md:px-16 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  {/* Left Content */}
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-yellow-400 text-xl">👋</span>
                        <p className="text-teal-200 font-semibold text-base">Your #1 Care Partner</p>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
                        Modern <span className="text-yellow-400 italic font-serif">Healthcare</span>
                      </h1>
                      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2">
                        <span className="text-yellow-400 italic font-serif">Solutions</span> <span className="text-white">That Puts</span>
                      </h1>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                        You First.
                      </h1>
                      <p className="text-teal-200 text-base leading-relaxed max-w-xl">
                        From routine checkups to specialized treatment, we combine modern technology with a human touch to keep your loved ones healthy.
                      </p>
                    </div>
                    <button 
                      onClick={() => !user ? signInWithGoogle() : setActiveSection('appointments')}
                      className="bg-gray-900 text-white font-bold px-8 py-3.5 rounded-lg text-base transition-all shadow-lg hover:bg-gray-800 inline-flex items-center gap-3 group"
                    >
                      Book appointment
                      <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>

                  {/* Right Content - Doctor Image Placeholder */}
                  <div className="relative">
                    <div className="relative bg-teal-700/40 backdrop-blur-sm rounded-[2.5rem] p-8 border-2 border-teal-600/30">
                      {/* Decorative circles */}
                      <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full opacity-70"></div>
                      <div className="absolute bottom-8 -left-4 w-40 h-40 bg-teal-500 rounded-full opacity-40"></div>
                      <div className="absolute top-1/3 -right-6 w-20 h-20 bg-yellow-600 rounded-full opacity-60"></div>
                      
                      {/* Image placeholder */}
                      <div className="relative bg-teal-700/50 backdrop-blur-md rounded-[2rem] p-12 flex items-center justify-center min-h-[350px]">
                        <div className="text-center">
                          <div className="text-7xl mb-4">👨‍⚕️👩‍⚕️</div>
                          <p className="text-white font-semibold text-xl">Healthcare Professionals</p>
                          <p className="text-teal-200 text-sm mt-2">Ready to care for you</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trusted By Section - Inside teal section */}
              <div className="px-8 md:px-16 pb-12">
                <div className="text-center mb-8">
                  <p className="text-teal-200 font-semibold text-base">Trusted By All Over The World</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
                  <div className="text-teal-300 font-semibold text-lg">🏥 HealthCare</div>
                  <div className="text-teal-300 font-semibold text-lg">⚕️ MediLife</div>
                  <div className="text-teal-300 font-semibold text-lg">💊 Innovations</div>
                  <div className="text-teal-300 font-semibold text-lg">🩺 SmartMeds</div>
                  <div className="text-teal-300 font-semibold text-lg">💉 WellCare</div>
                  <div className="text-teal-300 font-semibold text-lg">🏥 HealthPlus</div>
                </div>
              </div>
            </div>
          </section>

          {/* Three Feature Sections */}
          <section className="max-w-7xl mx-auto px-8 md:px-16 py-20">
            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-3">Our Services</h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Comprehensive healthcare solutions powered by AI technology
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Appointment Booking Card */}
              <div 
                onClick={() => user ? setActiveSection('appointments') : signInWithGoogle()}
                className="group bg-white p-10 rounded-3xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Appointment</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Schedule appointments with our qualified doctors. Choose your preferred date, time, and specialist.
                </p>
                <button className="text-emerald-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Book Now <span>→</span>
                </button>
              </div>

              {/* Drug Crosschecking Card */}
              <div 
                onClick={() => user ? setActiveSection('drug-check') : signInWithGoogle()}
                className="group bg-white p-10 rounded-3xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Drug Crosschecking</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  AI-powered medication interaction analysis to ensure your prescriptions are safe when taken together.
                </p>
                <button className="text-teal-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Get Started <span>→</span>
                </button>
              </div>

              {/* Medical Chatbot Card */}
              <div 
                onClick={() => user ? setActiveSection('chatbot') : signInWithGoogle()}
                className="group bg-white p-10 rounded-3xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Medical Chatbot</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get instant answers to your health questions from our intelligent AI assistant available 24/7.
                </p>
                <button className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Chat Now <span>→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="max-w-7xl mx-auto px-8 md:px-16 py-20">
            <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-3xl p-16 text-center text-white shadow-2xl">
              <h2 className="text-4xl font-extrabold mb-4">Ready to Get Started?</h2>
              <p className="text-teal-100 mb-10 text-lg max-w-2xl mx-auto">
                Join thousands of patients who trust our AI-powered healthcare platform for their medical needs.
              </p>
              {!user && (
                <button 
                  onClick={signInWithGoogle}
                  className="bg-white text-teal-600 font-bold px-10 py-4 rounded-xl text-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
                >

                  Sign Up with Google <span>→</span>
                </button>
              )}
            </div>
          </section>
        </main>
      )}

      {/* Drug Crosschecking Section */}
      {activeSection === 'drug-check' && (
        <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          <div className="mb-8">
            <button 
              onClick={() => setActiveSection('landing')}
              className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all mb-4"
            >
              <span>←</span> Back to Home
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Drug Interaction Checker</h1>
            <p className="text-gray-600">Analyze potential interactions between your medications</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-8 mb-10 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('new')}
              className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'new' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span>➕</span> New Analysis
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span>📂</span> History ({history.length})
            </button>
          </div>

          {/* View Selection */}
          {activeTab === 'new' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Input Form Column */}
              <div className="lg:col-span-5">
                <MedicationForm onAnalysisComplete={(data: any) => setAnalysisResult(data)} />
              </div>

              {/* Results Display Column */}
              <div className="lg:col-span-7">
                {analysisResult ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-center">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Analysis Result</h2>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                      >
                        Reset Form
                      </button>
                    </div>
                    <RiskDisplay data={analysisResult} />
                  </div>
                ) : (
                <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-300 shadow-sm">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl opacity-50">🧪</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Awaiting Data</h2>
                  <p className="text-gray-600 max-w-xs mx-auto mt-2 leading-relaxed">
                      Add your current medications in the form to check for drug-drug interactions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Your Medical Archive</h2>
                <p className="text-gray-600 text-sm">Review and manage your past interaction safety checks.</p>
              </div>

              {/* ADD THE SUMMARY CHART HERE */}
              {history.length > 0 && <RiskSummary history={history} />}

              {history.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                  <div className="text-6xl mb-4 text-gray-300">📂</div>
                  <h3 className="text-lg font-bold text-gray-800">No Reports Found</h3>
                  <p className="text-gray-600 max-w-xs mx-auto">Once you perform a check, your history will be safely stored here.</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-8 bg-teal-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-teal-700 transition-all"
                  >
                    Start New Analysis →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((report) => (
                    <HistoryItem key={report.id} report={report} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Chatbot Section */}
      {activeSection === 'chatbot' && (
        <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          <div className="mb-8">
            <button 
              onClick={() => setActiveSection('landing')}
              className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all mb-4"
            >
              <span>←</span> Back to Home
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Medical Chatbot</h1>
            <p className="text-gray-600">Ask our AI assistant your health questions</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-teal-700 to-teal-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">MediBot Assistant</h3>
                    <p className="text-teal-100 text-sm">Online - Ready to help</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 p-6 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-teal-100 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                      🤖
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 max-w-md">
                      <p className="text-gray-800">Hello! I'm your medical assistant. How can I help you today?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Type your medical question here..." 
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 placeholder-gray-400"
                  />
                  <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 This chatbot provides general health information. Always consult with healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Reports Section */}
      {activeSection === 'reports' && (
        <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          <div className="mb-8">
            <button 
              onClick={() => setActiveSection('landing')}
              className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all mb-4"
            >
              <span>←</span> Back to Home
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Medical Reports & History</h1>
            <p className="text-gray-600">Comprehensive view of your health records</p>
          </div>

          <div className="max-w-6xl mx-auto">
            {history.length > 0 && <RiskSummary history={history} />}

            {history.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <div className="text-6xl mb-4 text-gray-300">📊</div>
                <h3 className="text-lg font-bold text-gray-800">No Reports Available</h3>
                <p className="text-gray-600 max-w-xs mx-auto">
                  Your medical reports will appear here once you complete medication analyses.
                </p>
                <button
                  onClick={() => setActiveSection('drug-check')}
                  className="mt-8 bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-all"
                >
                  Start Drug Check →
                </button>
              </div>
            ) : (
              <div className="space-y-4 mt-8">
                {history.map((report) => (
                  <HistoryItem key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Appointments Section */}
      {activeSection === 'appointments' && (
        <div>
          <div className="bg-white shadow-sm border-b border-gray-200 px-8 md:px-16 py-4">
            <button 
              onClick={() => setActiveSection('landing')}
              className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              <span>←</span> Back to Home
            </button>
          </div>
          <BookAppointment user={user} />
        </div>
      )}

      {/* Add Doctor Section (Admin/Temp Page) */}
      {activeSection === 'add-doctor' && (
        <div>
          <div className="bg-white shadow-sm border-b border-gray-200 px-8 md:px-16 py-4">
            <button 
              onClick={() => setActiveSection('landing')}
              className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              <span>←</span> Back to Home
            </button>
          </div>
          <AddDoctor />
        </div>
      )}

      {/* My Appointments Section */}
      {activeSection === 'my-appointments' && (
        <div>
          <div className="bg-white shadow-sm border-b border-gray-200 px-8 md:px-16 py-4">
            <button 
              onClick={() => setActiveSection('landing')}
              className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              <span>←</span> Back to Home
            </button>
          </div>
          <MyAppointments user={user} />
        </div>
      )}
    </div>
  );
};

export default App;
