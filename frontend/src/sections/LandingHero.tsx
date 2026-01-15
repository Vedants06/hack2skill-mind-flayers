import React from 'react';

export const LandingHero = ({ user, onStart, onSignIn }: any) => (
  <section className="max-w-[1400px] mx-auto px-8 md:px-16 py-8">
    <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="px-8 md:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-yellow-400 text-xl">👋</span>
                <p className="text-teal-200 font-semibold text-base">Your #1 Care Partner</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
                Modern <span className="text-yellow-400 italic font-serif">Healthcare</span>
              </h1>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2">
                <span className="text-yellow-400 italic font-serif">Solutions</span> <span className="text-white">That Puts</span>
              </h1>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                You First.
              </h1>
              <p className="text-teal-200 text-base leading-relaxed max-w-xl">
                From routine checkups to specialized treatment, we combine modern technology with a human touch to keep your loved ones healthy.
              </p>
            </div>
            <button 
              onClick={() => !user ? onSignIn() : onStart()}
              className="bg-gray-900 text-white font-bold px-8 py-3.5 rounded-lg text-base transition-all shadow-lg hover:bg-gray-800 inline-flex items-center gap-3 group"
            >
              Book appointment
              <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="relative">
            <div className="relative bg-teal-700/40 backdrop-blur-sm rounded-[2.5rem] p-8 border-2 border-teal-600/30">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full opacity-70"></div>
              <div className="absolute bottom-8 -left-4 w-40 h-40 bg-teal-500 rounded-full opacity-40"></div>
              <div className="relative bg-teal-700/50 backdrop-blur-md rounded-[2rem] p-12 flex items-center justify-center min-h-[350px]">
                <div className="text-center">
                  <div className="text-7xl mb-4">👨‍⚕️👩‍⚕️</div>
                  <p className="text-white font-semibold text-xl">Healthcare Professionals</p>
                  <p className="text-teal-200 text-sm mt-2">Ready to care for you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-8 md:px-16 pb-12">
        <div className="text-center mb-8">
          <p className="text-teal-200 font-semibold text-base">Trusted By All Over The World</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
          <div className="text-teal-300 font-semibold text-lg">🏥 HealthCare</div>
          <div className="text-teal-300 font-semibold text-lg">⚕️ MediLife</div>
          <div className="text-teal-300 font-semibold text-lg">🩺 SmartMeds</div>
        </div>
      </div>
    </div>
  </section>
);