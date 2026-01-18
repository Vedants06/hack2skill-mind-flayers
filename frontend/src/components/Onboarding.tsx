import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { GlassCard } from './ui/GlassCard';
import { Loader2, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
  initialData?: any; // New optional prop for edit mode
}

const steps = [
  { id: 'basics', title: 'Basic Details' },
  { id: 'metrics', title: 'Body Metrics' },
  { id: 'history', title: 'Medical History' }
];

export const Onboarding: React.FC<OnboardingProps> = ({ userId, onComplete, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    conditions: [] as string[]
  });
  
  // Pre-fill data if editing, or reset if no data (for new user)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        age: initialData.age || '',
        gender: initialData.gender || '',
        height: initialData.height || '',
        weight: initialData.weight || '',
        conditions: initialData.conditions || []
      });
    } else {
      // Reset form when no initial data (new user case)
      setFormData({
        age: '',
        gender: '',
        height: '',
        weight: '',
        conditions: []
      });
      // Also reset step to beginning
      setCurrentStep(0);
    }
    setShowValidationError(false);
  }, [initialData, userId]); // Added userId dependency to trigger reset on user switch

  const [newCondition, setNewCondition] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);

  const isStepValid = () => {
    if (currentStep === 0) {
      return formData.age && formData.gender;
    }
    if (currentStep === 1) {
      return formData.height && formData.weight;
    }
    return true; // Step 2 (medical history) is optional
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setShowValidationError(true);
      return;
    }
    
    setShowValidationError(false);
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', userId), {
        ...formData,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const stepVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar */}
        <div className="bg-sky-50 p-6 border-b border-sky-100">
          <div className="flex justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300
                    ${idx <= currentStep ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'}
                  `}
                >
                  {idx < currentStep ? <Check size={16} /> : idx + 1}
                </div>
                <span className={`text-xs ${idx === currentStep ? 'text-sky-600 font-medium' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-sky-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            {currentStep === 0 && "Let's get to know you"}
            {currentStep === 1 && "Your body metrics"}
            {currentStep === 2 && "Medical background"}
          </h2>
          <p className="text-slate-500 mb-6">
            {currentStep === 0 && "This helps us personalize your health insights."}
            {currentStep === 1 && "Start tracking your vitals for better analysis."}
            {currentStep === 2 && "Any existing conditions we should be aware of?"}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-slate-800 mb-3 tracking-wide">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/50 text-lg"
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-slate-800 mb-3 tracking-wide">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female', 'Other'].map(gender => (
                        <button
                          key={gender}
                          onClick={() => setFormData({ ...formData, gender })}
                          className={`py-3 px-4 rounded-xl border-2 transition-all
                            ${formData.gender === gender 
                              ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-md' 
                              : 'border-slate-200 bg-white hover:border-slate-500 text-slate-600'
                            }
                          `}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Height <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.height}
                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white/50"
                        placeholder="e.g. 175"
                      />
                      <span className="flex items-center px-3 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        cm
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Weight <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white/50"
                        placeholder="e.g. 70"
                      />
                      <span className="flex items-center px-3 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        kg
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Past Medical Conditions</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={e => setNewCondition(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addCondition()}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white/50"
                        placeholder="e.g. Type 2 Diabetes"
                      />
                      <button 
                        onClick={addCondition}
                        className="px-4 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.conditions.map((condition, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg text-sm flex items-center gap-2"
                        >
                          {condition}
                          <button 
                            onClick={() => removeCondition(idx)}
                            className="hover:text-sky-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {formData.conditions.length === 0 && (
                        <p className="text-sm text-slate-400 italic">No conditions added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          {showValidationError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              Please fill in all required fields before proceeding
            </div>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep(curr => curr - 1);
                  setShowValidationError(false);
                }
              }}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors
                ${currentStep === 0 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              Back
            </button>
            <button
            onClick={handleNext}
            disabled={loading || !isStepValid()}
            className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-all shadow-md shadow-sky-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : currentStep === steps.length - 1 ? (
              'Complete Profile'
            ) : (
              <>
                Next Step <ChevronRight size={16} />
              </>
            )}
          </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
