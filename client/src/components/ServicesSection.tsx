import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import iconBranding from "@/assets/icon-branding.png";
import iconMarketing from "@/assets/icon-marketing.png";
import iconSocialMedia from "@/assets/icon-social-media.png";
import iconContent from "@/assets/icon-content.png";
import iconWebsite from "@/assets/icon-website.png";
import iconDesign from "@/assets/icon-design.png";
import servicesBackground from "@/assets/services-background.png";

const services = [
  {
    icon: iconBranding,
    title: "Branding & Brand content",
    description: "Faites de votre marque une identité inoubliable.\nDonnez-lui une voix, un style et une histoire\nqui marquent les esprits.",
  },
  {
    icon: iconMarketing,
    title: "Digital marketing",
    description: "Donnez de la puissance à vos actions digitales.\nCampagnes ciblées, résultats\nmesurables, impact garanti.",
  },
  {
    icon: iconSocialMedia,
    title: "Social Media Management",
    description: "Transformez vos réseaux en véritables\nmoteurs de croissance.\nStratégie, contenu, engagement,\non s'occupe de tout.",
  },
  {
    icon: iconContent,
    title: "Creaton de contenu",
    description: "Captez l'attention, inspirez, engagez.\nDu visuel à la vidéo, chaque création\nraconte votre histoire",
  },
  {
    icon: iconWebsite,
    title: "Web Design & UI/UX",
    description: "Offrez à vos visiteurs une\nexpérience fluide et mémorable.\nDesign moderne, navigation\nintuitive, identité forte.",
  },
  {
    icon: iconDesign,
    title: "Design Visuel",
    description: "Des créations qui donnent sens à vos\nidées et cohérence à votre image.\nChaque détail est pensé pour refléter\nvotre univers et renforcer votre présence.",
  },
];

const ServicesSection = () => {
  return (
    <section 
      className="w-full min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-violet-900 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(126, 34, 206) 50%, rgb(109, 40, 217) 100%)`,
      }}
    >
      {/* Background image for desktop only */}
      <div 
        className="absolute inset-0 hidden md:block bg-cover bg-center"
        style={{
          backgroundImage: `url(${servicesBackground})`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16 lg:py-20 relative z-10">
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start lg:items-center">
          {/* Left content */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8 w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Smart ideas
              <br />
              Real growth
            </h2>

            <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed">
              Grâce à notre approche axée sur les résultats,
              <br className="hidden md:inline" />
              le digital devient bien plus qu'un simple outil :
              <br className="hidden md:inline" />
              un moteur puissant de croissance.
            </p>

            <Button 
              variant="hero" 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white font-semibold rounded-full"
              data-testid="button-see-work"
            >
              See Our Work
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* Right content - Services Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center space-y-2 md:space-y-3"
                data-testid={`service-card-${index}`}
              >
                {/* Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-accent font-bold text-xs md:text-sm lg:text-base leading-tight">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-white text-[10px] md:text-xs leading-relaxed whitespace-pre-line hidden md:block">
                  {service.description}
                </p>

                {/* Arrow button */}
                <button 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors flex-shrink-0"
                  data-testid={`button-service-${index}`}
                >
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
