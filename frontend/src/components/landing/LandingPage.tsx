import { HeroSection } from './HeroSection';
import { ServicesSection } from './ServicesSection';
import { Footer } from './Footer';

interface LandingPageProps {
  onNavigate: (section: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection 
        onStartCheckup={() => onNavigate('diagnostic')} 
        onTalkToAI={() => onNavigate('chatbot')} 
      />
      <ServicesSection onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </main>
  );
};
