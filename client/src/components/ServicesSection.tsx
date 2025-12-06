import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { SectionLoader } from "@/components/ui/GlobalLoader";

interface Service {
  id: string;
  title: string;
  description: string;
  icon_image: string;
  title_color: string;
  description_color: string;
  button_color: string;
  link_url: string;
  display_order: number;
}

interface ServicesHeader {
  heading_line1: string;
  heading_line2: string;
  description: string;
  button_text: string;
  button_url: string;
  background_image: string;
  background_color: string;
  heading_line1_color: string;
  heading_line2_color: string;
  description_color: string;
  button_bg_color: string;
  button_text_color: string;
}

const ServicesSection = () => {
  const [header, setHeader] = useState<ServicesHeader | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, servicesRes] = await Promise.all([
        supabase.from('services_header').select('*').eq('is_active', true).single(),
        supabase.from('services').select('*').eq('is_visible', true).order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="services" className="w-full min-h-screen flex items-center justify-center bg-accent">
        <SectionLoader text="Chargement des services..." />
      </section>
    );
  }

  const defaultHeader = {
    heading_line1: 'Smart ideas',
    heading_line2: 'Real growth',
    description: 'Thanks to our results-driven approach, digital becomes much more than just a tool: a powerful growth engine.',
    button_text: 'See Our Work',
    button_url: '#contact',
    background_image: '',
    background_color: '#7C3AED',
    heading_line1_color: '#FFFFFF',
    heading_line2_color: '#FFFFFF',
    description_color: '#FFFFFF',
    button_bg_color: '#FF6B35',
    button_text_color: '#FFFFFF'
  };

  const displayHeader = header || defaultHeader;

  return (
    <section
      id="services"
      className="w-full min-h-screen relative overflow-hidden flex items-center"
      style={{ backgroundColor: displayHeader.background_color }}
    >
      <div className="absolute inset-0 bg-gradient-bg lg:bg-none" />
      {displayHeader.background_image && (
        <div
          className="absolute inset-0 hidden lg:block bg-cover bg-center"
          style={{ backgroundImage: `url(${displayHeader.background_image})` }}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16 lg:py-20 relative z-10">
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start lg:items-center">
          <div className="space-y-4 md:space-y-6 lg:space-y-8 w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span style={{ color: displayHeader.heading_line1_color }}>
                {displayHeader.heading_line1}
              </span>
              <br />
              <span style={{ color: displayHeader.heading_line2_color }}>
                {displayHeader.heading_line2}
              </span>
            </h2>

            <p className="text-sm md:text-base lg:text-lg leading-relaxed" style={{ color: displayHeader.description_color }}>
              {displayHeader.description}
            </p>

            <Button
              variant="hero"
              size="lg"
              className="rounded-full focus:ring-2 focus:ring-white focus:ring-offset-2"
              style={{
                backgroundColor: displayHeader.button_bg_color,
                color: displayHeader.button_text_color
              }}
              data-testid="button-see-work"
              onClick={() => document.getElementById(displayHeader.button_url.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })}
            >
              {displayHeader.button_text}
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full">
            {services.map((service, index) => (
              <article
                key={service.id}
                className="flex flex-col items-center text-center h-full"
                data-testid={`service-card-${index}`}
              >
                <div className="flex flex-col items-center h-full space-y-2 md:space-y-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
                    {service.icon_image && (
                      <img
                        src={service.icon_image}
                        alt={`Icon ${service.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <h3
                    className="font-bold text-xs md:text-sm lg:text-base leading-tight min-h-[2.5rem] md:min-h-[3rem] flex items-center"
                    style={{ color: service.title_color }}
                  >
                    {service.title}
                  </h3>

                  <p
                    className="text-[10px] md:text-xs leading-relaxed hidden md:block flex-grow"
                    style={{ color: service.description_color }}
                  >
                    {service.description}
                  </p>

                  {service.link_url ? (
                    <a
                      href={service.link_url}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all duration-300 flex-shrink-0 focus:ring-2 focus:ring-white focus:ring-offset-2 mt-auto"
                      style={{ backgroundColor: service.button_color }}
                      data-testid={`button-service-${index}`}
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </a>
                  ) : (
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0 focus:ring-2 focus:ring-white focus:ring-offset-2 mt-auto cursor-default"
                      style={{ backgroundColor: service.button_color }}
                      data-testid={`button-service-${index}`}
                      aria-label={`${service.title}`}
                      disabled
                    >
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </button>
                  )}
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
