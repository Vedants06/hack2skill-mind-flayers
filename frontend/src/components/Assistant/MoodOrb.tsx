export const MoodOrb = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Primary Sage Orb */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#7CA982]/10 rounded-full blur-[100px] animate-float" />
      
      {/* Secondary Mint Orb */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#C1E1C1]/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-5s' }} />
      
      {/* Subtle Accent Orb */}
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#F7F9F7] rounded-full blur-[80px] animate-pulse" />
    </div>
  );
};