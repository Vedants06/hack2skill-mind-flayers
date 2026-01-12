import React from 'react';
import RiskDisplay from './RiskDisplay';
import { db } from '../firebase/firebase';
import { doc, deleteDoc } from 'firebase/firestore'; // Fixed import

const HistoryItem: React.FC<{ report: any }> = ({ report }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the accordion from opening when clicking delete
    
    if (window.confirm("Delete this medical report?")) {
      try {
        await deleteDoc(doc(db, 'reports', report.id));
      } catch (err) {
        console.error("Error deleting document: ", err);
        alert("Delete failed. Check your Firebase permissions.");
      }
    }
  };

  // Safety check to prevent "Black Screen" crash if data is missing
  if (!report?.analysis) return null;

  const dateStr = report.createdAt?.seconds 
    ? new Date(report.createdAt.seconds * 1000).toLocaleDateString()
    : "Recently added";

  const riskLevel = report.analysis.risk_level || 'LOW';

  return (
    <details className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-emerald-200 mb-4">
      <summary className="flex justify-between items-center p-5 cursor-pointer list-none">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
            ${riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {riskLevel[0]}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Report: {dateStr}</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tight">
              {report.medications?.length || 0} Meds • {report.analysis.interaction_count || 0} Interactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Visible Delete Button */}
          <button 
            onClick={handleDelete}
            className="flex items-center justify-center p-2 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
            title="Delete record"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
          <span className="text-slate-300 group-open:rotate-180 transition-transform">▼</span>
        </div>
      </summary>
      
      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Medication Profile</h4>
            <div className="flex flex-wrap gap-2">
                {report.medications?.map((m: any, i: number) => (
                    <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
                        {m.name} <span className="text-slate-400 ml-1 text-xs">{m.dosage}</span>
                    </span>
                ))}
            </div>
        </div>
        <RiskDisplay data={report.analysis} />
      </div>
    </details>
  );
};

export default HistoryItem;