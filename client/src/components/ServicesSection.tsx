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
    description: "Make your brand an unforgettable identity. Give it a voice, a style, and a story that leaves a mark.",
  },
  {
    icon: iconMarketing,
    title: "Digital marketing",
    description: "Power up your digital actions. Targeted campaigns, measurable results, guaranteed impact.",
  },
  {
    icon: iconSocialMedia,
    title: "Social Media Management",
    description: "Transform your networks into real growth engines. Strategy, content, engagement - we handle it all.",
  },
  {
    icon: iconContent,
    title: "Content Creation",
    description: "Capture attention, inspire, engage. From visuals to videos, each creation tells your story.",
  },
  {
    icon: iconWebsite,
    title: "Web Design & UI/UX",
    description: "Offer your visitors a smooth and memorable experience. Modern design, intuitive navigation, strong identity.",
  },
  {
    icon: iconDesign,
    title: "Visual Design",
    description: "Creations that give meaning to your ideas and coherence to your image. Every detail reflects your universe.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="w-full min-h-screen relative overflow-hidden flex items-center"
    >
      <div className="absolute inset-0 bg-gradient-bg lg:bg-none" />
      <div
        className="absolute inset-0 hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage: `url(${servicesBackground})`,
        }}
        role="presentation"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16 lg:py-20 relative z-10">
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start lg:items-center">
          <div className="space-y-4 md:space-y-6 lg:space-y-8 w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Smart ideas
              <br />
              Real growth
            </h2>

            <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed">
              Thanks to our results-driven approach,
              <br className="hidden md:inline" />
              digital becomes much more than just a tool:
              <br className="hidden md:inline" />
              a powerful growth engine.
            </p>

            <Button
              variant="hero"
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-semibold rounded-full focus:ring-2 focus:ring-white focus:ring-offset-2"
              data-testid="button-see-work"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See Our Work
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full">
            {services.map((service, index) => (
              <article
                key={index}
                className="flex flex-col items-center text-center h-full"
                data-testid={`service-card-${index}`}
              >
                <div className="flex flex-col items-center h-full space-y-2 md:space-y-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={service.icon}
                      alt={`Icon ${service.title}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="text-accent font-bold text-xs md:text-sm lg:text-base leading-tight min-h-[2.5rem] md:min-h-[3rem] flex items-center">
                    {service.title}
                  </h3>

                  <p className="text-white text-[10px] md:text-xs leading-relaxed hidden md:block flex-grow">
                    {service.description}
                  </p>

                  <button
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors flex-shrink-0 focus:ring-2 focus:ring-white focus:ring-offset-2 mt-auto"
                    data-testid={`button-service-${index}`}
                    aria-label={`Learn more about ${service.title}`}
                  >
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
