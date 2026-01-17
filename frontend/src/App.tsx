import React, { useState, useEffect } from 'react';
import { useAuth } from './firebase/useAuth';
import { db, collection, query, where, onSnapshot, orderBy, doc, getDoc } from './firebase/firebase';

// UI Components
import MedicationForm from './components/MedicationForm';
import RiskDisplay from './components/RiskDisplay';
import HistoryItem from './components/HistoryItem';
import RiskSummary from './components/RiskSummary';
import BookAppointment from './components/BookAppointment';
import MyAppointments from './components/MyAppointments';

// Pages
import DiagnosticPage from './pages/DiagnosticPage';
import AssistantPage from './pages/assistant';
import { AuthPage } from './pages/AuthPage';

// Landing UI Components
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { ServicesSection } from './components/landing/ServicesSection';
import { Footer } from './components/landing/Footer';
import { Onboarding } from './components/Onboarding';
import './App.css';

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();

  // State Management
  const [activeSection, setActiveSection] = useState<string>('landing');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // NEW: Auto-redirect after successful login
  useEffect(() => {
    if (user && activeSection === 'auth') {
      setActiveSection('landing'); // Redirect to landing or 'diagnostic'
    }
  }, [user, activeSection]);

  // Real-time Firebase History & Profile logic
  useEffect(() => {
    if (!user) {
      setShowOnboarding(false);
      setHistory([]);
      return;
    }

    const checkProfile = async () => {
      try {
        const userDocFn = await getDoc(doc(db, 'users', user.uid));
        if (userDocFn.exists()) {
          const data = userDocFn.data();
          setProfileData(data);
          setShowOnboarding(!data.profileCompleted);
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
      console.error("Firebase History Error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing MediBuddy...</p>
      </div>
    </div>
  );

  // AUTH GATE: Prevent empty screen by ensuring AuthPage shows if user is null and in a restricted section
  const isToolSection = ['diagnostic', 'chatbot', 'drug-check', 'appointments', 'my-appointments'].includes(activeSection);
  
  return (
    <div className="min-h-screen bg-white font-sans">
      {activeSection !== 'auth' && (
      <Navbar 
        user={user}
        onLogin={() => handleNavigate('auth')}
        onLogout={logout}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />
    )}

    {/* 2. Adjust padding: Remove pt-16 if Navbar is hidden to avoid a gap */}
    <div className={activeSection !== 'auth' ? "pt-0" : ""}>
        
        {/* LOGIN / SIGNUP PAGE - Show if specifically on 'auth' OR trying to access tools while logged out */}
        {((activeSection === 'auth' || isToolSection) && !user) && <AuthPage />}

        {/* LANDING PAGE */}
        {activeSection === 'landing' && (
          <main className="animate-in fade-in duration-500">
            <HeroSection 
              onStartCheckup={() => handleNavigate('diagnostic')}
              onTalkToAI={() => handleNavigate('chatbot')}
            />
            <ServicesSection onNavigate={handleNavigate} />
            <Footer onNavigate={handleNavigate} />
          </main>
        )}

        {/* DIAGNOSTIC LAB */}
        {activeSection === 'diagnostic' && user && (
          <div className="min-h-[calc(100vh-80px)] bg-slate-50">
            <DiagnosticPage user={user} />
          </div>
        )}

        {/* CHATBOT / AI ASSISTANT */}
        {activeSection === 'chatbot' && user && (
          <div className="h-[calc(100vh-80px)] relative">
            <AssistantPage user={user} medHistory={history} userProfile={profileData} />
          </div>
        )}

        {/* DRUG CHECK SECTION */}
        {activeSection === 'drug-check' && user && (
          <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20 min-h-screen">
            <div className="flex gap-8 mb-10 border-b border-gray-200">
              <button onClick={() => setActiveTab('new')} className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'new' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>➕ New Analysis</button>
              <button onClick={() => setActiveTab('history')} className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>📂 History ({history.length})</button>
            </div>

            {activeTab === 'new' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5">
                  <MedicationForm onAnalysisComplete={(data: any) => setAnalysisResult(data)} />
                </div>
                <div className="lg:col-span-7">
                  {analysisResult ? <RiskDisplay data={analysisResult} /> : <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 text-slate-400">Awaiting data...</div>}
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
        {activeSection === 'appointments' && user && <BookAppointment user={user} />}
        {activeSection === 'my-appointments' && user && <MyAppointments user={user} />}

        {/* ONBOARDING OVERLAY */}
        {(showOnboarding || editingProfile) && user && (
          <Onboarding 
            userId={user.uid} 
            onComplete={() => {
              setShowOnboarding(false);
              setEditingProfile(false);
              getDoc(doc(db, 'users', user.uid)).then(d => {
                if (d.exists()) setProfileData(d.data());
              });
            }}
            initialData={editingProfile ? profileData : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default App;