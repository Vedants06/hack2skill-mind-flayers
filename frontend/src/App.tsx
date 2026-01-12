import React, { useState, useEffect } from 'react';
import MedicationForm from './components/MedicationForm';
import RiskDisplay from './components/RiskDisplay';
import HistoryItem from './components/HistoryItem';
import RiskSummary from './components/RiskSummary';
import { useAuth } from './firebase/useAuth';
import { db, collection, query, where, onSnapshot, orderBy } from './firebase/firebase';
import './App.css';

const App: React.FC = () => {
  const auth = useAuth() as any;
  const user = auth?.user;
  const signInWithGoogle = auth?.signInWithGoogle;

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

  // Sign In Screen
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100">
          <div className="bg-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">MediGuard AI</h1>
          <p className="text-slate-500 mt-3 mb-8 leading-relaxed">
            Securely analyze your medication interactions with our AI-powered safety engine.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white font-bold text-xl">🏥</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">MediGuard AI</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active User</p>
            <p className="text-sm font-bold text-slate-700">{user.displayName}</p>
          </div>
          <button
            onClick={() => auth.logout()}
            className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Navigation Tabs */}
        <div className="flex gap-8 mb-10 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'new' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span>➕</span> New Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
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
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Analysis Result</h2>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Reset Form
                    </button>
                  </div>
                  <RiskDisplay data={analysisResult} />
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl opacity-50">🧪</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-700">Awaiting Data</h2>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                    Add your current medications in the form to check for drug-drug interactions.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Your Medical Archive</h2>
              <p className="text-slate-500 text-sm">Review and manage your past interaction safety checks.</p>
            </div>

            {/* ADD THE SUMMARY CHART HERE */}
            {history.length > 0 && <RiskSummary history={history} />}

            {history.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="text-6xl mb-4 text-slate-200">📂</div>
                <h3 className="text-lg font-bold text-slate-700">No Reports Found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Once you perform a check, your history will be safely stored here.</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-8 bg-emerald-50 text-emerald-700 font-bold py-2 px-6 rounded-xl hover:bg-emerald-100 transition-all"
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
    </div>
  );
};

export default App;