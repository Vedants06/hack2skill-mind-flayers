import React, { useState, useEffect } from 'react';
import { useAuth } from './firebase/useAuth';
import { db, collection, query, where, onSnapshot, orderBy } from './firebase/firebase';

// UI Components
import MedicationForm from './components/MedicationForm';
import RiskDisplay from './components/RiskDisplay';
import HistoryItem from './components/HistoryItem';
import RiskSummary from './components/RiskSummary';
import BookAppointment from './components/BookAppointment';
import AddDoctor from './components/AddDoctor';
import MyAppointments from './components/MyAppointments';

// Pages
import DiagnosticPage from './pages/DiagnosticPage';
import AssistantPage from './pages/assistant';

// Landing UI Components
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { ServicesSection } from './components/landing/ServicesSection';
import { Footer } from './components/landing/Footer';

import { Onboarding } from './components/Onboarding';

import './App.css';

const App: React.FC = () => {
  // Auth Logic from your original code
  const auth = useAuth() as any;
  const user = auth?.user;
  const signInWithGoogle = auth?.signInWithGoogle;
  const logout = auth?.logout;

  // State Management
  const [activeSection, setActiveSection] = useState<string>('landing');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Real-time Firebase History logic from your original code
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

  // Combined Navigation Handler
  const handleNavigate = (section: string) => {
    // If trying to access a tool without being logged in, trigger login
    if (section !== 'landing' && !user) {
      signInWithGoogle();
      return;
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Screen
  if (auth?.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading medical profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Navbar (Integrated logic) */}
      <Navbar 
        user={user}
        onLogin={signInWithGoogle}
        onLogout={logout}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* 2. Dynamic Content */}
      <div > {/* Add padding top to prevent content hiding behind fixed Navbar */}
        
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
        {activeSection === 'diagnostic' && (
          <div className="min-h-[calc(100vh-80px)] bg-slate-50">
            <DiagnosticPage user={user} />
          </div>
        )}

        {/* CHATBOT / AI ASSISTANT */}
        {activeSection === 'chatbot' && (
          <div className="h-[calc(100vh-80px)] relative">
            <AssistantPage user={user} medHistory={history} />
          </div>
        )}

        {/* DRUG CHECK SECTION */}
        {activeSection === 'drug-check' && (
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
    </div>
  );
};

export default App;