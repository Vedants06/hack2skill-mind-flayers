import React from 'react';
import { History, MessageSquare } from 'lucide-react';

export const ChatSidebar = () => {
  // Mock history - in the future, you can fetch these from a "sessions" collection in Firestore
  const history = ["Morning Check-in", "Stomach Concern", "Medication Question"];

  return (
    <div className="flex flex-col h-full text-[#2D3A2D]">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2 mb-4 px-2 text-[#7CA982] font-bold text-xs uppercase tracking-widest">
        <History size={14} />
        <span>Recent Activity</span>
      </div>

      {/* Scrollable History List */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {history.map((title, i) => (
          <div 
            key={i} 
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
          >
            <MessageSquare size={16} className="text-[#7CA982]" />
            <span className="text-sm truncate font-medium text-gray-600 group-hover:text-[#2D3A2D]">
              {title}
            </span>
          </div>
        ))}

        {history.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-gray-400 italic">No recent sessions</p>
          </div>
        )}
      </div>

      {/* Optional: Footer section for Sidebar */}
      <div className="mt-auto pt-4 border-t border-gray-100/50">
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
          <p className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Pro Tip</p>
          <p className="text-[10px] text-emerald-600 leading-tight">
            Use "New Session" to start a fresh clinical analysis.
          </p>
        </div>
      </div>
    </div>
  );
};