import React from 'react';
import MedicationForm from '../components/MedicationForm';
import RiskDisplay from '../components/RiskDisplay';

interface DrugCheckProps {
  activeTab: 'new' | 'history';
  setActiveTab: (tab: 'new' | 'history') => void;
  analysisResult: any;
  setAnalysisResult: (data: any) => void;
  historyCount: number;
}

export const DrugCheckSection = ({ 
  activeTab, 
  setActiveTab, 
  analysisResult, 
  setAnalysisResult, 
  historyCount 
}: DrugCheckProps) => {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
      <div className="flex gap-8 mb-10 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('new')}
          className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'new' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span>➕</span> New Analysis
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-sm font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span>📂</span> History ({historyCount})
        </button>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <MedicationForm onAnalysisComplete={(data: any) => setAnalysisResult(data)} />
          </div>
          <div className="lg:col-span-7">
            {analysisResult ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Analysis Result</h2>
                  <button onClick={() => setAnalysisResult(null)} className="text-xs font-bold text-teal-600 underline">Reset Form</button>
                </div>
                <RiskDisplay data={analysisResult} />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🧪</div>
                <h2 className="text-xl font-bold text-gray-800">Awaiting Data</h2>
                <p className="text-gray-600 mt-2">Add medications to check for interactions.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
};