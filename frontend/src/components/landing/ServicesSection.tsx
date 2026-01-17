import { Pill, FlaskConical, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '../../libs/utils';

interface ServicesSectionProps {
  onNavigate: (section: string) => void;
}

const services = [
  {
    id: 'drug-check',
    title: 'Drug Checker',
    description: 'Real-time drug interaction analysis for individual users.',
    icon: Pill,
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    linkColor: 'text-purple-600',
    linkText: 'Analyze Now',
    borderColor: 'border-purple-100',
  },
  {
    id: 'diagnostic',
    title: 'AI Diagnostic Lab',
    description: 'Image & voice symptoms coverage for a personalized diagnosis.',
    icon: FlaskConical,
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    linkColor: 'text-emerald-600',
    linkText: 'To Know More',
    borderColor: 'border-emerald-100',
  },
  {
    id: 'chatbot',
    title: 'Healing AI Assistant',
    description: 'Instant answers & health guidance, sort & care.',
    icon: MessageSquare,
    bgColor: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    linkColor: 'text-sky-600',
    linkText: 'Start Scan plus',
    borderColor: 'border-sky-100',
  },
  {
    id: 'appointments',
    title: 'Specialist Booking',
    description: 'Find & book live consultations with health specialists.',
    icon: Calendar,
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    linkColor: 'text-amber-600',
    linkText: 'Book Now',
    borderColor: 'border-amber-100',
  },
];

export const ServicesSection = ({ onNavigate }: ServicesSectionProps) => {
  return (
    <section id="services-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text- mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg">
            Tailored plans for your health journey.
          </p>
          
          {/* Happy Users Badge */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-700">J</div>
              <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-xs font-bold text-purple-700">M</div>
              <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-700">S</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">10M</span>
              <span className="text-sm text-muted-foreground ml-1">Happy Users</span>
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => onNavigate(service.id)}
                className={cn(
                  "group rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border",
                  service.bgColor,
                  service.borderColor
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110",
                  service.iconBg
                )}>
                  <Icon className={cn("w-7 h-7", service.iconColor)} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text- text-start mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground text-start leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Link */}
                <span className={cn(
                  "text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all",
                  service.linkColor
                )}>
                  {service.linkText} <span>→</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
