import { useState } from 'react';

export const useChatLogic = (user: any, medHistory: any[]) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.displayName?.split(' ')[0]}! ✨ I'm your healing companion. I've reviewed your health records—how can I support you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // HERE: You will call your Gemini/OpenAI API
    // We pass the medHistory as context to the AI
    console.log("AI is analyzing history:", medHistory);

    // Placeholder Response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm listening with care. Based on your history, I recommend staying hydrated and resting. Would you like me to check any specific symptoms?" 
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return { messages, input, setInput, sendMessage, isLoading };
};