// src/sections/ServiceCards.tsx
export const ServiceCards = ({ onNavigate }: any) => (
  <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
    <div onClick={() => onNavigate('drug-check')} className="bg-white p-10 rounded-3xl border hover:shadow-xl cursor-pointer transition-all">
      <span className="text-3xl">💊</span>
      <h3 className="font-bold text-xl mt-4">Drug Checker</h3>
    </div>
    <div onClick={() => onNavigate('chatbot')} className="bg-white p-10 rounded-3xl border border-teal-500/30 hover:shadow-xl cursor-pointer transition-all">
      <span className="text-3xl">💬</span>
      <h3 className="font-bold text-xl mt-4 text-teal-700">Medical Chatbot</h3>
    </div>
    <div onClick={() => onNavigate('appointments')} className="bg-white p-10 rounded-3xl border hover:shadow-xl cursor-pointer transition-all">
      <span className="text-3xl">📅</span>
      <h3 className="font-bold text-xl mt-4">Book Appointment</h3>
    </div>
  </section>
);