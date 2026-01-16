import React, { useState, useEffect } from 'react';
import MedicationForm from './components/MedicationForm';
import RiskDisplay from './components/RiskDisplay';
import HistoryItem from './components/HistoryItem';
import RiskSummary from './components/RiskSummary';
import BookAppointment from './components/BookAppointment';
import AddDoctor from './components/AddDoctor';
import MyAppointments from './components/MyAppointments';
// This is the only new import needed
import AssistantPage from './pages/assistant';
import { Onboarding } from './components/Onboarding';
import { useAuth } from './firebase/useAuth';
import { db, collection, query, where, onSnapshot, orderBy, doc, getDoc } from './firebase/firebase';
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setShowOnboarding(false);
      return;
    }

    // Check if user profile exists
    const checkProfile = async () => {
      try {
        const userDocFn = await getDoc(doc(db, 'users', user.uid));
        if (userDocFn.exists()) {
          const data = userDocFn.data();
          setProfileData(data);
          if (!data.profileCompleted) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        } else {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };
    
    checkProfile();

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
      console.error("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  if (auth?.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading medical profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white/40 backdrop-blur-md px-8 md:px-16 py-6 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('landing')}>
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg border-2 border-teal-700">
              <span className="text-teal-700 font-bold text-xl">✚</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">MediBuddy</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div 
                className="hidden md:flex items-center gap-3 mr-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setEditingProfile(true)}
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border-2 border-teal-200">
                  {user.displayName?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Patient Profile</p>
                  <p className="text-sm font-bold text-gray-900 leading-none">{user.displayName}</p>
                </div>
              </div>
              <button onClick={() => setActiveSection('chatbot')} className="bg-teal-50 text-teal-700 font-bold px-4 py-2.5 rounded-lg hover:bg-teal-100 transition-all border border-teal-200">AI Assistant</button>
              {/* Inside your Nav bar, next to Logout */}
              {user && user.email === "0131ramram@gmail.com" && (
                <button
                  onClick={() => setActiveSection('add-doctor')}
                  className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 transition-all shadow-md flex items-center gap-2"
                > Add Doctor
                </button>
              )}
              <button onClick={() => setActiveSection('my-appointments')} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all">My Appointments</button>
              <button onClick={logout} className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Logout</button>
            </>
          ) : (
            <button onClick={signInWithGoogle} className="bg-gray-900 text-white font-semibold px-8 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95">Sign In with Google</button>
          )}
        </div>
      </nav>

      {/* LANDING SECTION */}
      {activeSection === 'landing' && (
        <main className="min-h-screen">
          <section className="max-w-[1400px] mx-auto px-8 md:px-16 py-8">
            <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="px-8 md:px-16 py-16 md:py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-white">
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-yellow-400 text-xl">👋</span>
                        <p className="text-teal-200 font-semibold text-base uppercase tracking-[0.2em]">Your #1 Care Partner</p>
                      </div>
                      <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                        Modern <span className="text-yellow-400 italic font-serif">Healthcare</span> Solutions That Puts You First.
                      </h1>
                      <p className="text-teal-200 text-lg md:text-xl leading-relaxed max-w-xl font-medium opacity-90">
                        From routine checkups to specialized treatment, we combine modern technology with a human touch.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button onClick={() => user ? setActiveSection('appointments') : signInWithGoogle()} className="bg-yellow-400 text-teal-600 font-bold px-10 py-5 rounded-2xl text-lg transition-all shadow-xl shadow-yellow-400/20 hover:bg-yellow-300 hover:scale-105 active:scale-95 flex items-center gap-3 group">
                        Book appointment <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                      <button onClick={() => user ? setActiveSection('drug-check') : signInWithGoogle()} className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-bold px-10 py-5 rounded-2xl text-lg hover:bg-white/20 transition-all">Start Health Check</button>
                    </div>
                  </div>
                  <div className="hidden lg:block relative animate-in zoom-in duration-1000">
                    <div className="bg-teal-700/30 backdrop-blur-xl rounded-[3rem] p-12 border-2 border-white/10 relative overflow-hidden group">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/30 transition-all duration-700"></div>
                      <div className="relative z-10 text-center py-10">
                        <div className="text-9xl mb-8 drop-shadow-2xl">👨‍⚕️</div>
                        <h3 className="text-3xl font-bold mb-4">24/7 AI Assistance</h3>
                        <p className="text-teal-200 text-lg">Our experts and AI are always here for you.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SERVICE CARDS */}
          <section className="max-w-7xl mx-auto px-8 md:px-16 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Card 1 */}
              <div onClick={() => user ? setActiveSection('drug-check') : signInWithGoogle()} className="group bg-white p-12 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <span className="text-8xl">💊</span>
                </div>
                <div className="relative z-10">
                  <div className="bg-teal-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 transition-colors duration-500">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-500">💊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Drug Checker</h3>
                  <p className="text-gray-500 leading-relaxed text-lg mb-8">AI-powered medication interaction analysis for your safety.</p>
                  <span className="text-teal-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest text-sm">Analyze Now <span>→</span></span>
                </div>
              </div>

              {/* Card 2 - THE CHATBOT CARD */}
              <div onClick={() => user ? setActiveSection('chatbot') : signInWithGoogle()} className="group bg-teal-900 p-12 rounded-[2.5rem] border border-teal-800 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                  <span className="text-8xl text-white">💬</span>
                </div>
                <div className="relative z-10 text-white">
                  <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-400 transition-colors duration-500">
                    <span className="text-4xl">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Healing AI Chat</h3>
                  <p className="text-teal-200 leading-relaxed text-lg mb-8">Personalized healthcare guidance from our caring AI assistant.</p>
                  <span className="text-yellow-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest text-sm">Chat Now <span>→</span></span>
                </div>
              </div>

              {/* Card 3 */}
              <div onClick={() => user ? setActiveSection('appointments') : signInWithGoogle()} className="group bg-white p-12 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <span className="text-8xl">📅</span>
                </div>
                <div className="relative z-10">
                  <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-500">📅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Appointment</h3>
                  <p className="text-gray-500 leading-relaxed text-lg mb-8">Schedule visits with specialists in just a few clicks.</p>
                  <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest text-sm">Book Now <span>→</span></span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* CHATBOT SECTION - THE NEW PAGE INTEGRATED */}
      {activeSection === 'chatbot' && (
        <div className="h-[calc(100vh-100px)] relative">
          <AssistantPage user={user} medHistory={history} />
        </div>
      )}

      {/* DRUG CHECK SECTION */}
      {activeSection === 'drug-check' && (
        <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          <div className="flex gap-8 mb-10 border-b border-gray-200">
            <button onClick={() => setActiveTab('new')} className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'new' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>➕ New Analysis</button>
            <button onClick={() => setActiveTab('history')} className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>📂 History ({history.length})</button>
          </div>

          {activeTab === 'new' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <MedicationForm onAnalysisComplete={(data: any) => setAnalysisResult(data)} />
              </div>
              <div className="lg:col-span-7">
                {analysisResult ? <RiskDisplay data={analysisResult} /> : <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">Awaiting data...</div>}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {history.length > 0 && <RiskSummary history={history} />}
              <div className="space-y-4 mt-8">
                {history.map((report) => <HistoryItem key={report.id} report={report} />)}
              </div>
            </div>
          )}
        </main>
      )}

      {/* APPOINTMENT SECTIONS */}
      {activeSection === 'appointments' && <BookAppointment user={user} />}
      {activeSection === 'my-appointments' && <MyAppointments user={user} />}
      {(showOnboarding || editingProfile) && user && (
        <Onboarding 
          userId={user.uid} 
          onComplete={() => {
            setShowOnboarding(false);
            setEditingProfile(false);
            // Refresh profile data
            getDoc(doc(db, 'users', user.uid)).then(doc => {
              if (doc.exists()) setProfileData(doc.data());
            });
          }}
          initialData={editingProfile ? profileData : undefined}
        />
      )}
    </div>
  );
};

export default App;