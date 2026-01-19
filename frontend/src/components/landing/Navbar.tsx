import { cn } from '../../libs/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { User } from 'firebase/auth';
// Ensure the path below is correct for your image file
import logoImg from '../../assets/logo_crop-removebg-preview.png';

interface NavbarProps {
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
  onEditProfile?: () => void;
}

export const Navbar = ({ user, onLogin, onLogout, onNavigate, activeSection, onEditProfile }: NavbarProps) => {
  
  // Scrolls smoothly to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handles clicking Home or the Logo
  const handleHomeClick = () => {
    if (activeSection === 'landing') {
      scrollToTop();
    } else {
      onNavigate('landing');
      // Timeout ensures the section exists before scrolling
      setTimeout(scrollToTop, 50);
    }
  };

  // Handles clicking Services (navigates home first if needed)
  const scrollToServices = () => {
    const action = () => {
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (activeSection !== 'landing') {
      onNavigate('landing');
      setTimeout(action, 100);
    } else {
      action();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Unified Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={handleHomeClick}
        >
          <div className="relative">
            {/* The Logo Image */}
            <img 
              src={logoImg} 
              alt="MediCare Logo" 
              className="w-10 h-10 object-contain transition-transform group-hover:scale-110" 
            />
            {/* Soft glow effect */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight text-slate-800 leading-none">
              Medi<span className="text-emerald-600">Care</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              AI Health Lab
            </span> 
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={handleHomeClick}
            className={cn(
              "text-sm font-medium transition-colors hover:text-emerald-600",
              activeSection === 'landing' ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            Home
          </button>
          
          <button
            onClick={scrollToServices}
            className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors"
          >
            Services
          </button>
          
          <button
            onClick={() => onNavigate('chatbot')}
            className={cn(
              "text-sm font-medium transition-colors hover:text-emerald-600",
              activeSection === 'chatbot' ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            AI Assistant
          </button>
          
          <button
            onClick={() => onNavigate('my-appointments')}
            className={cn(
              "text-sm font-medium transition-colors hover:text-emerald-600",
              activeSection === 'my-appointments' ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            My Appointments
          </button>
          
          {/* TEMPORARY: Admin-only button */}
          {user?.email === '0131ramram@gmail.com' && (
            <button
              onClick={() => onNavigate('add-doctor')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                activeSection === 'add-doctor' ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              Add Doctor
            </button>
          )}
        </nav>

        {/* Right - Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar 
                className="w-9 h-9 border-2 border-emerald-200 cursor-pointer hover:border-emerald-400 transition-colors" 
                onClick={onEditProfile}
                title="Click to edit profile"
              >
                <AvatarImage src={user?.photoURL ?? ''} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                  {user?.displayName?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={onLogout}
                className="px-4 py-1 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-500 transition-colors shadow-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};