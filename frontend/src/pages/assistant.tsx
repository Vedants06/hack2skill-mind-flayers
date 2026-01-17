import { useState, useEffect, useRef } from 'react';
import {  AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Send, Pill, Activity, Heart, Sparkles, Plus
} from 'lucide-react';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { ChatSidebar } from '../components/Assistant/ChatSidebar';
import { MessageBubble } from '../components/Assistant/MessageBubble';
import { MoodOrb } from '../components/Assistant/MoodOrb';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function AssistantPage({ user, medHistory, userProfile }: any) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const activeMeds = medHistory && medHistory.length > 0
    ? medHistory.flatMap((report: any) => report.medications || [])
    : [];

  // 1. REAL-TIME HISTORY SYNC
  useEffect(() => {
    if (!user?.uid) return;

    // Path: chats > {userId} > messages
    const q = query(
      collection(db, 'chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatHistory = snapshot.docs.map(doc => ({
        role: doc.data().role,
        parts: [{ text: doc.data().text }]
      })) as Message[];

      if (chatHistory.length === 0) {
        setMessages([{
          role: 'model',
          parts: [{ text: `Hello ${user?.displayName?.split(' ')[0] || 'there'}. I've reviewed your clinical profile—how are you feeling today?` }]
        }]);
      } else {
        setMessages(chatHistory);
      }
    }, (error) => {
      console.error("Firestore Sync Error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.displayName]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 2. NEW SESSION LOGIC (Clears Firestore collection)
  const handleNewSession = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const messagesRef = collection(db, 'chats', user.uid, 'messages');
      const snapshot = await getDocs(messagesRef);

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      // onSnapshot will trigger automatically and reset the UI
    } catch (error) {
      console.error("Error clearing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. HANDLE SEND
  const handleSend = async () => {
    if (!input.trim() || isLoading || !user?.uid) return;

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          query: currentInput,
          med_history: activeMeds.map((m: any) => typeof m === 'object' ? m.name : m),
          user_profile: userProfile // Sending onboarding data to Gemini
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || "Server failed to process chat");
      }

    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMessage = error.message || "Unknown Error";
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: `Error: ${errorMessage}. Check if your backend is running.` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#f0f7f3] flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <MoodOrb />
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-[1600px] grid grid-cols-12 gap-8 h-[90vh]">

        {/* SIDEBAR: Pass handleNewSession here */}
        <aside className="col-span-3 hidden lg:flex bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-8 flex-col shadow-2xl shadow-emerald-900/5">
          {/* THIS IS YOUR SINGLE PRIMARY BUTTON */}
          <button
            onClick={handleNewSession}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 w-full p-4 bg-[#7CA982] hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-lg mb-8 font-bold uppercase tracking-wider text-xs disabled:opacity-50"
          >
            <Plus size={18} />
            New Session
          </button>

          {/* Sidebar now only handles navigation/history links */}
          <ChatSidebar />
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="col-span-12 lg:col-span-6 bg-white/50 backdrop-blur-3xl border border-white/80 rounded-[3rem] shadow-2xl shadow-emerald-900/10 flex flex-col overflow-hidden relative">
          <header className="p-7 border-b border-white/20 flex items-center justify-between bg-white/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7CA982] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
                <Stethoscope size={28} />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-800">Health Companion</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Context Synchronized</p>
                </div>
              </div>
            </div>
            <Sparkles className="text-emerald-400" size={24} />
          </header>

          <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} text={msg.parts[0].text} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-2 p-4">
                <span className="w-2 h-2 bg-[#7CA982] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#7CA982] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-[#7CA982] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          <footer className="p-7 bg-white/30 border-t border-white/20 backdrop-blur-2xl">
            <div className="flex gap-4 bg-white/90 rounded-[2rem] p-2 pl-7 items-center shadow-2xl border border-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Share how you're feeling..."
                className="bg-transparent flex-1 outline-none text-base p-2 text-slate-800"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#7CA982] text-white p-4 rounded-full hover:scale-105 transition-all shadow-xl disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </div>
          </footer>
        </main>

        {/* RIGHT ASIDE: Clinical Profile & Metrics */}
        <aside className="col-span-3 hidden lg:flex bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-8 flex-col shadow-2xl shadow-emerald-900/5 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <Pill className="text-emerald-600" size={22} />
            <span className="font-bold text-slate-800 text-xs uppercase tracking-widest">Clinical Profile</span>
          </div>

          {/* User Metrics from Onboarding */}
          {userProfile && (
            <div className="bg-white/80 p-5 rounded-[2rem] border border-white shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vital Stats</span>
              </div>
              <p className="text-sm text-slate-700 font-medium">
                {userProfile.age}y • {userProfile.gender} • {userProfile.height}cm • {userProfile.weight}kg
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {userProfile.conditions?.map((c: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-bold rounded-lg border border-red-100 uppercase">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Medications</span>
            {activeMeds.map((med: any, i: number) => (
              <div key={i} className="bg-white/80 p-5 rounded-[2rem] border border-white shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-sm text-slate-800">{typeof med === 'object' ? med.name : med}</p>
                  <Activity size={14} className="text-emerald-400" />
                </div>
                {med.dosage && (
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-emerald-50 rounded text-[9px] font-bold text-emerald-600 uppercase">{med.dosage}</span>
                    <span className="px-2 py-1 bg-slate-50 rounded text-[9px] font-bold text-slate-400 uppercase">{med.frequency}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-emerald-600/5 rounded-[2rem] border border-emerald-500/10 relative">
            <Heart className="absolute -right-4 -bottom-4 text-emerald-500/10" size={100} />
            <p className="text-[10px] uppercase font-bold text-emerald-800 mb-2">Safety Note</p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">This AI uses your history for context. Consult a doctor for diagnosis.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}