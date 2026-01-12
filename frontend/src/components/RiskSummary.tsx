import React from 'react';

const RiskSummary = ({ history }: { history: any[] }) => {
  const total = history.length;
  if (total === 0) return null;

  const highRiskCount = history.filter(h => h.analysis.risk_level === 'HIGH').length;
  const mediumRiskCount = history.filter(h => h.analysis.risk_level === 'MEDIUM').length;
  const lowRiskCount = total - (highRiskCount + mediumRiskCount);

  // Calculate percentages
  const highPct = (highRiskCount / total) * 100;
  const medPct = (mediumRiskCount / total) * 100;
  const lowPct = (lowRiskCount / total) * 100;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Safety Overview</h3>
          <p className="text-sm text-slate-500">Distribution of interaction risks across {total} reports</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-600">{Math.round(lowPct)}%</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safe Checks</p>
        </div>
      </div>

      {/* The Chart Bar */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <div style={{ width: `${highPct}%` }} className="h-full bg-red-500 transition-all duration-1000" />
        <div style={{ width: `${medPct}%` }} className="h-full bg-amber-400 transition-all duration-1000" />
        <div style={{ width: `${lowPct}%` }} className="h-full bg-emerald-500 transition-all duration-1000" />
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs font-bold text-slate-600">{highRiskCount} High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-xs font-bold text-slate-600">{mediumRiskCount} Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-600">{lowRiskCount} Low/No Risk</span>
        </div>
      </div>
    </div>
  );
};

export default RiskSummary;