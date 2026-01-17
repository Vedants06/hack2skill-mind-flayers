import { cn } from '../../libs/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

interface NavbarProps {
  user?: {
    displayName?: string;
    photoURL?: string;
  } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
}

export const Navbar = ({ user, onLogin, onLogout, onNavigate, activeSection }: NavbarProps) => {
  
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
      // Small timeout to allow the landing page to render before scrolling
      setTimeout(scrollToTop, 10);
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
        
        {/* Logo - Now scrolls to top or navigates home */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={handleHomeClick}
        >
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <span className="text-white font-bold text-lg">✚</span>
          </div>
          <span className="text-xl font-bold text-foreground">MediBuddy</span>
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
        </nav>

        {/* Right - Auth */}
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-emerald-200">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={onLogout}
                className="px-5 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md"
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