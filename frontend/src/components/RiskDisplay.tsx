import React from 'react';

interface RiskDisplayProps {
  data: {
    medications: any[];
    interactions: any[];
    risk_level: string;
    medication_count: number;
    interaction_count: number;
  };
}

const RiskDisplay: React.FC<RiskDisplayProps> = ({ data }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-500 text-white border-red-600';
      case 'MODERATE': return 'bg-orange-500 text-white border-orange-600';
      default: return 'bg-emerald-500 text-white border-emerald-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Summary Header Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{data.medication_count}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medications</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className={`text-2xl font-bold ${data.interaction_count > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
            {data.interaction_count}
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactions</p>
        </div>
        <div className={`p-4 rounded-xl border shadow-sm text-center ${data.risk_level === 'HIGH' ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <p className={`text-2xl font-bold ${data.risk_level === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}`}>
            {data.risk_level}
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Risk Level</p>
        </div>
      </div>

      {/* 2. Interaction Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
            ⚠️ Safety Alerts
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {data.interactions.length > 0 ? (
            data.interactions.map((risk, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
                <div className={`w-1 h-12 rounded-full ${risk.severity === 'HIGH' ? 'bg-red-500' : 'bg-orange-500'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800">{risk.drug1} + {risk.drug2}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getSeverityStyles(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                  <p className="text-xs text-emerald-700 font-semibold mt-2 italic">Advice: {risk.advice}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-emerald-500 font-medium">✅ No harmful interactions detected.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskDisplay;