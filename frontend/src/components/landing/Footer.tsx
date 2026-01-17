interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <span className="text-white font-bold text-xl">✚</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">MediBuddy</h1>
            </div>
            <p className="text-sm leading-relaxed text-start opacity-70">
              Revolutionizing personal healthcare through AI-driven insights, 
              multimodal diagnostics, and seamless specialist connections.
            </p>
            <div className="flex gap-4">
              {['𝕏', 'fb', 'in', 'ig'].map((social) => (
                <div key={social} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-start ml-20">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li onClick={() => onNavigate('drug-check')} className="hover:text-emerald-400 cursor-pointer transition-colors">Drug Interaction Checker</li>
              <li onClick={() => onNavigate('diagnostic')} className="hover:text-emerald-400 cursor-pointer transition-colors">AI Diagnostic Lab</li>
              <li onClick={() => onNavigate('chatbot')} className="hover:text-emerald-400 cursor-pointer transition-colors">Healing AI Assistant</li>
              <li onClick={() => onNavigate('appointments')} className="hover:text-emerald-400 cursor-pointer transition-colors">Specialist Booking</li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-start ml-20">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Resources</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Medical Library</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Emergency Protocol</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Patient Privacy Policy</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">API Documentation</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
            <h4 className="text-white font-bold mb-2 text-sm">Stay Updated</h4>
            <p className="text-xs opacity-60 mb-4">Get the latest health tech insights.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
              <span className="absolute right-2 top-2 bg-emerald-500 text-white px-3  rounded-4xl hover:bg-emerald-600 transition-all hover:cursor-pointer">
                →
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            © 2026 MediBuddy AI. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            <span className="hover:text-emerald-400 cursor-pointer">Terms</span>
            <span className="hover:text-emerald-400 cursor-pointer">Privacy</span>
            <span className="hover:text-emerald-400 cursor-pointer">Ethics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
