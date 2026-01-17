import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Mic, Upload, Activity,
  FileText, RefreshCw, X, Play, Square, History, Calendar, ChevronRight,
  Brain, Waves, Eye, Zap, CheckCircle2, Sparkles
} from 'lucide-react';
// Firebase logic preserved
import { db } from '../firebase/firebase'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface DiagnosticPageProps {
  user?: {
    uid?: string;
    displayName?: string;
    photoURL?: string;
  } | null;
}

export default function DiagnosticPage({ user }: DiagnosticPageProps) {
  // Input States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Processing States
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // History State (Real data from Firebase)
  const [history, setHistory] = useState<any[]>([]);

  // Refs
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  // --- 1. FETCH REAL HISTORY FROM FIRESTORE ---
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "user_summary", user.uid, "history"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
    });

    return () => unsubscribe();
  }, [user]);

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  // --- IMAGE HANDLING ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- BACKEND SUBMISSION ---
  const handleProcess = async () => {
    if (!image && !audioBlob) {
      alert("Please provide either a medical image or a voice recording.");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      if (image) formData.append('image', image);
      if (audioBlob) formData.append('audio', audioBlob, 'recording.mp3');
      formData.append('user_id', user?.uid || 'guest_user');

      const response = await fetch('http://127.0.0.1:8000/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to connect to AI Service');
      }

      const result = await response.json();
      
      const newAnalysis = {
        transcription: result.transcription || "Analysis complete",
        analysis: result.analysis,
        audio_url: result.audio_url 
      };

      setAnalysis(newAnalysis);
      if (newAnalysis.audio_url) playAudio(newAnalysis.audio_url);

    } catch (err: any) {
      console.error("Diagnosis Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. IMPROVED AUDIO PLAYER ---
  const playAudio = (url: string) => {
    if (audioPlayer.current) {
      audioPlayer.current.pause();
      if (isPlaying && audioPlayer.current.src.includes(url)) {
        setIsPlaying(false);
        return;
      }
    }

    const audio = new Audio(`${url}?t=${Date.now()}`);
    audioPlayer.current = audio;
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
  };

  const resetInputs = () => {
    setImage(null);
    setImagePreview(null);
    setAudioBlob(null);
    setAnalysis(null);
    if (audioPlayer.current) audioPlayer.current.pause();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
      {/* RESTORED Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-emerald-400 opacity-60 animate-pulse" />
        <div className="absolute top-40 right-20 w-2 h-2 rounded-full bg-teal-400 opacity-40" />
        <div className="absolute bottom-40 left-1/4 w-4 h-4 rounded-full bg-amber-300 opacity-30" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-emerald-300 opacity-50" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
        {/* HEADER */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Stethoscope size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Diagnostic Lab</h1>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Powered by Llama 4 Vision & Whisper</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                <Eye size={14} className="text-emerald-600" />
                <span className="text-xs font-semibold text-gray-700">Vision AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                <Waves size={14} className="text-teal-600" />
                <span className="text-xs font-semibold text-gray-700">Whisper AI</span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* COLUMN 1: INPUTS */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-3 space-y-6"
          >
            {/* Voice Recording Card - RESTORED HOVER & STYLES */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Mic size={12} className="text-teal-600" />
                  </div>
                  Voice Symptoms
                </h3>
                {audioBlob && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Recorded
                  </span>
                )}
              </div>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-10 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-2 border-red-200' 
                    : audioBlob 
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-200'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-500 animate-pulse' : audioBlob ? 'bg-emerald-500' : 'bg-gray-300'
                }`}>
                  {isRecording ? <Square size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  {isRecording ? 'Recording... Click to stop' : audioBlob ? 'Voice Captured ✓' : 'Tap to Record'}
                </span>
                {isRecording && (
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-red-400 rounded-full"
                        animate={{ height: [8, 24, 8] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </button>
            </div>

            {/* Image Upload Card - RESTORED STYLES */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Upload size={12} className="text-purple-600" />
                  </div>
                  Medical File
                </h3>
                {image && (
                  <button onClick={() => { setImage(null); setImagePreview(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all overflow-hidden group">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleImageChange} />
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
                      <span className="text-white text-xs font-semibold bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        Click to change
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Upload size={20} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Upload Medical Image</span>
                    <span className="text-[10px] text-gray-400">X-rays, MRI, CT scans</span>
                  </div>
                )}
              </label>
            </div>

            {/* Process Button - RESTORED HOVER */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcess}
              disabled={isLoading || (!image && !audioBlob)}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:bg-emerald-800 hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Run AI Diagnosis
                </>
              )}
            </motion.button>

            {(image || audioBlob) && !isLoading && (
              <button
                onClick={resetInputs}
                className="w-full py-3 rounded-xl text-gray-500 font-medium text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                Clear & Start Over
              </button>
            )}
          </motion.div>

          {/* COLUMN 2: ACTIVE ANALYSIS - RESTORED ALL DECORATIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-6"
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-[2rem] p-8 min-h-[600px] text-white flex flex-col relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
              <Activity className="absolute -right-10 -top-10 text-emerald-500/5 w-64 h-64" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-emerald-400 text-[15px] font-bold uppercase tracking-[0.25em] mb-1">Diagnostic Dashboard</h2>
                  <p className="text-gray-500 text-xs">Real-time AI analysis</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full"
                      animate={isPlaying || isLoading ? { height: [4, 20, 4] } : { height: 4 }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08 }}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                      <Brain className="absolute inset-0 m-auto w-10 h-10 text-emerald-400" />
                    </div>
                    <p className="mt-6 text-emerald-400 font-semibold">Processing with AI...</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10 flex-1">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center"><Mic size={12} className="text-teal-400" /></div>
                        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Transcribed Symptoms</p>
                      </div>
                      <p className="text-gray-300 italic text-sm leading-relaxed">"{analysis.transcription}"</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center"><Zap size={12} className="text-amber-400" /></div>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">AI Findings</p>
                      </div>
                      <p className="text-lg leading-relaxed font-light text-gray-100">{analysis.analysis}</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => playAudio(analysis.audio_url)}
                        className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        {isPlaying ? "Stop Audio" : "Play AI Voice"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[1.5rem] m-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <FileText size={32} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-2">No Analysis Yet</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* COLUMN 3: HISTORY SIDEBAR - RESTORED HOVER & SCROLLBAR */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-3 space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <History size={12} className="text-emerald-600" />
                </div>
                Past Consultations
              </h3>
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{history.length} records</span>
            </div>

            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-100">
                  <History size={20} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No history found</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => {
                      setAnalysis({
                        transcription: item.userQuery || item.summary,
                        analysis: item.aiAnalysis,
                        audio_url: item.audioUrl
                      });
                      if (item.audioUrl) playAudio(item.audioUrl);
                    }}
                    className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border-l-4 border-l-emerald-500 border border-gray-100 hover:shadow-lg cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
                        <Calendar size={10} />
                        {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleDateString() : 'Recent'}
                      </div>
                      <span className="text-[9px] px-2 py-1 rounded-full font-bold bg-teal-50 text-teal-600">
                        {item.fileType?.includes('image') ? 'IMAGE' : 'AUDIO'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {item.summary || "Analysis Report"}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-semibold text-emerald-600">View Details</span>
                      <ChevronRight size={12} className="text-emerald-600" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}