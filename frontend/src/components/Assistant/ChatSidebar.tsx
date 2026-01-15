import { History, Plus, MessageSquare } from 'lucide-react';

export const ChatSidebar = () => {
  const history = ["Morning Check-in", "Stomach Concern", "Medication Question"];

  return (
    <div className="flex flex-col h-full text-[#2D3A2D]">
      <button className="flex items-center justify-center gap-2 bg-[#7CA982] text-white p-3 rounded-2xl hover:bg-[#6B9671] transition-all mb-8 shadow-sm">
        <Plus size={18} />
        <span className="font-semibold text-sm">New Session</span>
      </button>

      <div className="flex items-center gap-2 mb-4 px-2 text-[#7CA982] font-bold text-xs uppercase tracking-widest">
        <History size={14} />
        <span>Recent Activity</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {history.map((title, i) => (
          <div key={i} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm">
            <MessageSquare size={16} className="text-[#7CA982]" />
            <span className="text-sm truncate font-medium text-gray-600 group-hover:text-[#2D3A2D]">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};