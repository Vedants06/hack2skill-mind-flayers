import React from 'react';

interface RiskDisplayProps {
  data: {
    risk_level: string;
    interaction_count: number;
    details: Array<{
      risk_level: string;
      clinical_info: string;
      simple_explanation: string;
    }>;
  };
}

const RiskDisplay: React.FC<RiskDisplayProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* 1. Summary Header Card */}
      <div className={`p-6 rounded-2xl border-2 shadow-sm ${
        data.risk_level === 'HIGH' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Overall Analysis</p>
            <h2 className={`text-2xl font-black ${data.risk_level === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}`}>
              {data.risk_level} RISK
            </h2>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black text-slate-700">{data.interaction_count}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase">Interactions</p>
          </div>
        </div>
      </div>

      {/* 2. Detailed Interaction Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Detailed Findings</h3>
        
        {data.details && data.details.length > 0 ? (
          data.details.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-hover hover:border-emerald-200">
              {/* Header Label */}
              <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                   item.risk_level === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                 }`}>
                   {item.risk_level} SEVERITY
                 </span>
                 <span className="text-[10px] font-bold text-slate-300">Verified by NIH RxNav</span>
              </div>

              <div className="p-5">
                {/* AI Explanation (The "Hybrid" feature) */}
                <div className="flex gap-3">
                  <span className="text-xl">💡</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    {item.simple_explanation}
                  </p>
                </div>

                {/* Technical Source Info */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    <b className="text-slate-500 uppercase not-italic mr-1">Clinical Detail:</b> 
                    {item.clinical_info}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-slate-600 font-bold mt-2">No clinical interactions detected.</p>
            <p className="text-slate-400 text-sm">Always consult a doctor before starting new medications.</p>
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <b>DISCLAIMER:</b> This analysis is powered by the NIH RxNav database and AI processing. It is intended for educational purposes only. Never change your medication regimen without consulting a licensed healthcare professional.
        </p>
      </div>
    </div>
  );
};

export default RiskDisplay;