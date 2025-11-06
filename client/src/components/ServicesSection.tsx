import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import iconBranding from "@/assets/icon-branding.png";
import iconMarketing from "@/assets/icon-marketing.png";
import iconSocialMedia from "@/assets/icon-social-media.png";
import iconContent from "@/assets/icon-content.png";
import iconWebsite from "@/assets/icon-website.png";
import iconDesign from "@/assets/icon-design.png";

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
    <section className="w-full h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-violet-900 relative overflow-hidden">
      {/* Background overlay pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16 h-full flex items-center relative z-10">
        <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6 lg:space-y-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Smart ideas
              <br />
              Real growth
            </h2>

            <p className="text-white text-base md:text-lg leading-relaxed max-w-lg">
              Grâce à notre approche axée sur les résultats,
              <br />
              le digital devient bien plus qu'un simple outil :
              <br />
              un moteur puissant de croissance.
            </p>

            <Button variant="hero" size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold rounded-full">
              See Our Work
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* Right content - Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden">
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-accent font-bold text-base">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-white text-xs leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>

                {/* Arrow button */}
                <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
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
