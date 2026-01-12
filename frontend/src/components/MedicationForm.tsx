import React, { useState } from 'react';
import { db, collection, addDoc } from '../firebase/firebase';
import { useAuth } from '../firebase/useAuth';

interface MedicationFormProps {
  onAnalysisComplete: (data: any) => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onAnalysisComplete }) => {
  const auth = useAuth() as any;
  const user = auth?.user;

  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [loading, setLoading] = useState(false);

  // 1. Handle Input Changes
  const handleInputChange = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    (newMeds[index] as any)[field] = value;
    setMedications(newMeds);
  };

  // 2. Add/Remove Medication Rows
  const addRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeRow = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  // 3. Submit to Backend and Save to Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in first.");
    
    setLoading(true);
    try {
      // Step A: Get Analysis from FastAPI
      const response = await fetch('http://localhost:8000/check-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medications)
      });
      
      if (!response.ok) throw new Error("Backend server error");
      const result = await response.json();

      // Step B: Update the UI in App.tsx
      onAnalysisComplete(result);

      // Step C: Save to Firebase for the History Page
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,        // Vital for the history filter
        userName: user.displayName,
        medications: medications,
        analysis: result,        // Save the whole result so history loads instantly
        createdAt: new Date()
      });

    } catch (err) {
      console.error(err);
      alert("Error: Ensure your FastAPI server is running on localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600 text-sm">01</span>
          Add Medications
        </h2>
        <p className="text-sm text-slate-500 mt-1">List the drugs you are currently taking.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {medications.map((med, index) => (
          <div key={index} className="group relative p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all hover:border-emerald-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drug Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lisinopril"
                  className="w-full bg-white border text-gray-400 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={med.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage</label>
                <input
                  type="text"
                  placeholder="10mg"
                  className="w-full bg-white border text-gray-400 border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                  value={med.dosage}
                  onChange={(e) => handleInputChange(index, 'dosage', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                <input
                  type="text"
                  placeholder="Once Daily"
                  className="w-full bg-white border text-gray-400 border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                  value={med.frequency}
                  onChange={(e) => handleInputChange(index, 'frequency', e.target.value)}
                />
              </div>
            </div>

            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="absolute -top-2 -right-2 bg-white text-red-400 border border-red-100 rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-medium hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
        >
          + Add another medication
        </button>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Data...
              </>
            ) : (
              "Run Safety Check"
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-4 italic">
            * This tool uses a hackathon database for demonstration and is not medical advice.
          </p>
        </div>
      </form>
    </div>
  );
};

export default MedicationForm;