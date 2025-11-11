import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import projectPromotion from "@/assets/project-promotion.png";
import projectPromotionCopy from "@/assets/project-promotion copy.png";
import projectBlendimmo from "@/assets/project-blendimmo.png";
import projectMoujda from "@/assets/project-moujda.png";

const ProjectsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const projects = [
    {
      id: 1,
      image: projectPromotion,
      title: "Promotion de l'Égalité de Genre",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 2,
      image: projectPromotionCopy,
      title: "Promotion de l'Égalité de Genre",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 3,
      image: projectBlendimmo,
      title: "Blendimmo",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 4,
      image: projectMoujda,
      title: "Moujda",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      id="projects"
      className="w-full h-screen max-h-screen relative overflow-hidden flex items-center bg-gray-100"
    >
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 h-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center h-full">
          <div className="order-2 lg:order-1 flex items-center max-h-full lg:flex-1">
            <Carousel className="w-full" setApi={setApi}>
              <CarouselContent>
                {projects.map((project) => (
                  <CarouselItem key={project.id}>
                    <div className="relative overflow-hidden rounded-lg bg-white p-4 lg:p-6">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-auto max-h-[40vh] lg:max-h-[50vh] object-contain"
                      />
                      <div className="mt-4">
                        <h3 className="text-lg lg:text-xl font-bold text-accent mb-2">Services</h3>
                        <p className="text-gray-700 text-xs lg:text-sm">{project.description}</p>
                      </div>
                      <div className="flex justify-center gap-2 mt-4">
                        {projects.map((_, index) => (
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
          </div>

          <div className="order-1 lg:order-2 flex flex-col justify-center max-h-full overflow-y-auto lg:flex-1">
            <div className="flex flex-col gap-8 lg:gap-12 items-start lg:items-end">
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-left lg:text-right w-full">
                <span className="text-primary">Our bold</span>
                <br />
                <span className="text-primary">projects</span>
              </h2>

              <div className="space-y-3 text-gray-700 text-sm md:text-base lg:text-lg font-medium text-left w-full">
                <p>
                  chaque projet est une aventure audacieuse. Nous ne nous contentons pas de suivre les tendances : nous les créons. Nos projets allient créativité, innovation et stratégie pour transformer les idées en résultats concrets. Chaque initiative est pensée pour repousser les limites, surprendre, et générer une réelle valeur pour nos clients.
                </p>

                <p>
                  Avec nos projets audacieux, le digital devient bien plus qu'un outil : il devient un véritable moteur de croissance et d'opportunités.
                </p>
              </div>

              <button className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-full font-semibold text-base inline-flex items-center gap-2 transition-colors w-fit">
                view projects
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
