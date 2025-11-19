import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  services_label: string;
  services_label_color: string;
}

interface ProjectsHeader {
  heading: string;
  description_p1: string;
  description_p2: string;
  button_text: string;
  button_url: string;
  background_color: string;
  heading_color: string;
  description_color: string;
  button_bg_color: string;
  button_text_color: string;
}

const ProjectsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [header, setHeader] = useState<ProjectsHeader | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const loadContent = async () => {
    try {
      const [headerRes, projectsRes] = await Promise.all([
        supabase.from('projects_header').select('*').eq('is_active', true).single(),
        supabase.from('projects').select('*').eq('is_visible', true).order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="projects" className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </section>
    );
  }

  const defaultHeader = {
    heading: 'Our bold projects',
    description_p1: 'chaque projet est une aventure audacieuse. Nous ne nous contentons pas de suivre les tendances : nous les créons. Nos projets allient créativité, innovation et stratégie pour transformer les idées en résultats concrets.',
    description_p2: 'Avec nos projets audacieux, le digital devient bien plus qu\'un outil : il devient un véritable moteur de croissance et d\'opportunités.',
    button_text: 'view projects',
    button_url: '/projects',
    background_color: '#F3F4F6',
    heading_color: '#7C3AED',
    description_color: '#374151',
    button_bg_color: '#FF6B35',
    button_text_color: '#FFFFFF'
  };

  const displayHeader = header || defaultHeader;
  const displayProjects = projects.length > 0 ? projects : [];

  return (
    <section
      id="projects"
      className="w-full min-h-screen relative overflow-hidden flex items-center py-16 lg:py-0"
      style={{ backgroundColor: displayHeader.background_color }}
    >
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch">
          <div className="order-2 lg:order-1 flex items-center lg:flex-1">
            {displayProjects.length > 0 ? (
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {displayProjects.map((project) => (
                    <CarouselItem key={project.id}>
                      <div className="relative overflow-hidden rounded-lg bg-white p-4 lg:p-6">
                        {project.image && (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-auto max-h-[40vh] lg:max-h-[60vh] object-contain"
                          />
                        )}
                        <div className="mt-4">
                          <h3
                            className="text-lg lg:text-xl font-bold mb-2"
                            style={{ color: project.services_label_color }}
                          >
                            {project.services_label}
                          </h3>
                          <p className="text-gray-700 text-xs lg:text-sm">{project.description}</p>
                        </div>
                        <div className="flex justify-center gap-2 mt-4">
                          {displayProjects.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => api?.scrollTo(index)}
                              className={`h-1 rounded-full transition-all ${
                                index === current
                                  ? "w-8 bg-accent"
                                  : "w-6 bg-gray-300"
                              }`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="w-full p-8 text-center text-gray-500">
                No projects available
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2 flex flex-col justify-center lg:flex-1">
            <div className="flex flex-col gap-8 lg:gap-12 items-start lg:items-end">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-left lg:text-right w-full"
                style={{ color: displayHeader.heading_color }}
              >
                {displayHeader.heading}
              </h2>

              <div className="space-y-3 text-left w-full" style={{ color: displayHeader.description_color }}>
                <p className="text-sm md:text-base lg:text-lg font-medium">
                  {displayHeader.description_p1}
                </p>
                <p className="text-sm md:text-base lg:text-lg font-medium">
                  {displayHeader.description_p2}
                </p>
              </div>

              <button
                className="px-5 py-2.5 rounded-full font-semibold text-base inline-flex items-center gap-2 transition-colors w-fit"
                style={{
                  backgroundColor: displayHeader.button_bg_color,
                  color: displayHeader.button_text_color
                }}
              >
                {displayHeader.button_text}
                <span className="bg-primary rounded-full p-1.5 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
