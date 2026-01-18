import { motion } from 'framer-motion';

export const MessageBubble = ({ role, text }: { role: string; text: string }) => {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`p-6 rounded-[2.2rem] max-w-[85%] shadow-lg ${
        isUser 
        ? 'bg-[#7CA982] text-white rounded-tr-none' 
        : 'bg-white/90 backdrop-blur-md text-slate-800 rounded-tl-none border border-white shadow-emerald-900/5'
      }`}>
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
};