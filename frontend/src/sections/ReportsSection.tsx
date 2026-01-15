import React from 'react';
import HistoryItem from '../components/HistoryItem';
import RiskSummary from '../components/RiskSummary';

interface ReportsProps {
  history: any[];
  onStartNew: () => void;
}

export const ReportsSection = ({ history, onStartNew }: ReportsProps) => {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {history.length > 0 && <RiskSummary history={history} />}

        {history.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="text-6xl mb-4 text-gray-300">📊</div>
            <h3 className="text-lg font-bold text-gray-800">No Reports Available</h3>
            <button
              onClick={onStartNew}
              className="mt-8 bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-all"
            >
              Start Drug Check →
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {history.map((report) => (
              <HistoryItem key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};