import { Brain, Mic, Eye, AudioLines, Zap, Users, Star } from 'lucide-react';

interface HeroSectionProps {
  onStartCheckup: () => void;
  onTalkToAI: () => void;
}

export const HeroSection = ({ onStartCheckup, onTalkToAI }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Mint Green Radial Gradient Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-emerald-100/50 to-white"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 20%, hsl(152 60% 92%), hsl(152 40% 96%) 60%, white 100%)'
        }}
      />
      
      {/* Decorative Dots */}
      <div className="absolute top-20 left-20 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
      <div className="absolute top-40 right-32 w-2 h-2 rounded-full bg-emerald-300" />
      <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-amber-400" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Your Health, Our{' '}
            <span className="text-amber-500 italic font-serif">Innovation</span>.{' '}
            <br className="hidden sm:block" />
            At Home.
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Instant AI-powered complete health analysis, personalized insights, 
            and seamless specialist connections, all from your phone.
          </p>
        </div>

        {/* Floating Elements & Central Visual */}
        <div className="relative h-[400px] md:h-[450px] flex items-center justify-center">
          {/* Left Floating Elements */}
          <div className="absolute left-4 md:left-12 top-8 animate-float">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">4.9</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </div>

          <div className="absolute left-0 md:left-8 top-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 md:w-28 md:h-28 shadow-lg border border-white/50 flex flex-col items-center justify-center">
              <Eye className="w-6 h-6 text-emerald-600 mb-1" />
              <p className="text-[10px] font-bold text-foreground">Llama 4</p>
              <p className="text-[10px] text-muted-foreground">Vision</p>
            </div>
          </div>

          {/* Right Floating Elements */}
          <div className="absolute right-4 md:right-12 top-4 animate-float" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50">
              <p className="text-xs text-muted-foreground mb-1">Tests Available</p>
              <p className="text-2xl font-bold text-foreground">30</p>
            </div>
          </div>

          <div className="absolute right-0 md:right-8 top-1/3 animate-float" style={{ animationDelay: '0.7s' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 md:w-28 md:h-28 shadow-lg border border-white/50 flex flex-col items-center justify-center">
              <AudioLines className="w-6 h-6 text-emerald-600 mb-1" />
              <p className="text-[10px] font-bold text-foreground">Whisper</p>
              <p className="text-[10px] text-muted-foreground">Voice AI</p>
            </div>
          </div>

          <div className="absolute right-4 md:right-16 bottom-12 animate-float" style={{ animationDelay: '0.9s' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">50+</p>
                <p className="text-xs text-muted-foreground">Specialists</p>
              </div>
            </div>
          </div>

          {/* Center - Main Visual */}
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200/50 flex items-center justify-center shadow-xl">
              {/* Inner Circle with Brain & Mic */}
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-white shadow-lg flex flex-col items-center justify-center relative">
                <Brain className="w-16 h-16 md:w-20 md:h-20 text-rose-300 mb-2" />
                <div className="absolute -bottom-2 -right-2 w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-xl flex items-center justify-center shadow-md border-4 border-white">
                  <Mic className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
                </div>
                {/* Checkmark */}
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            </div>

            {/* Data Points Badge */}
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg border border-white/50">
              <p className="text-xl font-bold text-foreground">10k+</p>
              <p className="text-[10px] text-muted-foreground">Data Points<br/>Analyzed</p>
            </div>
          </div>

          {/* Bottom Left - Real-time Badge */}
          <div className="absolute left-8 md:left-20 bottom-8 animate-float" style={{ animationDelay: '1.1s' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 md:w-28 md:h-28 shadow-lg border border-white/50 flex flex-col items-center justify-center">
              <Zap className="w-6 h-6 text-amber-500 mb-1" />
              <p className="text-[10px] font-bold text-foreground">Real-time</p>
              <p className="text-[10px] text-muted-foreground">Diagnostics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-8 mx-4 md:mx-8 lg:mx-16 xl:mx-24">
  <div 
    className={`
      bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950
      rounded-2xl md:rounded-3xl lg:rounded-[2.5rem]
      px-6 md:px-10 lg:px-14 py-5 md:py-6
      flex flex-col md:flex-row items-center justify-around
      gap-6 md:gap-10 lg:gap-16
      shadow-2xl shadow-emerald-950/50
      border border-emerald-700/20
      backdrop-blur-sm
      relative overflow-hidden
      group/bar
    `}
  >
    {/* Optional very subtle animated background */}
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(52,211,153,0.12)_0%,transparent_50%)] animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(45,212,191,0.08)_0%,transparent_50%)] animate-pulse-slow delay-3000" />
    </div>

    {/* Left - Contact with pulsing status */}
    <div className="flex items-center gap-5 md:gap-8 text-emerald-50/95 text-sm md:text-base font-light tracking-wide relative z-10">
      <div className="flex items-center gap-3 group/status">
        <span className={`
          relative inline-flex
          w-3 h-3 rounded-full bg-emerald-400 
          shadow-lg shadow-emerald-400/50
          group-hover/status:scale-125
          transition-transform duration-400
        `}>
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </span>
        <span className="font-medium">+1 800 MEDI-CARE</span>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <span className="text-base opacity-90">✉</span>
        <span className="hover:text-white transition-colors">support@medicare.ai</span>
      </div>
    </div>

    {/* Center - Hero CTA with creative lift + shine */}
    <button
      onClick={onStartCheckup}
      className={`
        relative px-10 md:px-14 lg:px-20 py-4.5 md:py-5
        bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500
        hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-400
        text-white font-semibold text-base md:text-lg tracking-wide
        rounded-full
        shadow-xl shadow-emerald-700/50
        transition-all duration-500
        hover:shadow-2xl hover:shadow-emerald-600/60
        active:scale-98
        overflow-hidden
        group
        z-10
      `}
    >
      <span className="relative z-10">Start Your Free Check-up</span>

      {/* Shine sweep effect */}
      <span className={`
        absolute inset-0 
        bg-gradient-to-r from-transparent via-white/25 to-transparent
        -translate-x-[150%] group-hover:translate-x-[150%]
        transition-transform duration-1000 ease-out
      `} />

      {/* Very subtle inner glow */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>

    {/* Right - AI Chat with subtle hover lift */}
    <button
      onClick={onTalkToAI}
      className={`
        group flex items-center gap-3
        text-emerald-100 hover:text-white
        font-medium text-sm md:text-base
        transition-all duration-400
        relative z-10
        hover:-translate-y-0.5
      `}
    >
      <div className={`
        w-10 h-10 rounded-full 
        bg-gradient-to-br from-emerald-700 to-emerald-800
        flex items-center justify-center
        shadow-md shadow-emerald-900/40
        group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-600/50
        transition-all duration-400
      `}>
        <span className="text-xl"></span>
      </div>
      <span className="group-hover:translate-x-1 transition-transform duration-300">
        Your Health is Our Priority
      </span>
    </button>
  </div>
</div>
    </section>
  );
};
