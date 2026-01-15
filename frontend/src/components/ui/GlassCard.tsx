export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl ${className}`}>
    {children}
  </div>
);