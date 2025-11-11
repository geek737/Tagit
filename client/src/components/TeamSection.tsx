import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import robotImage from "@/assets/robot-3d-orange.png";

const TeamSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const teamMembers = [
    {
      id: 1,
      name: "ATOINI ZAKARIAE",
      role: "Designer, Infographiste",
      skills: ["Animateur infographiste", "Rédacteur de contenu"],
      image: robotImage,
    },
    {
      id: 2,
      name: "ATOINI ZAKARIAE",
      role: "Designer, Infographiste",
      skills: ["Animateur infographiste", "Rédacteur de contenu"],
      image: robotImage,
    },
    {
      id: 3,
      name: "ATOINI ZAKARIAE",
      role: "Designer, Infographiste",
      skills: ["Animateur infographiste", "Rédacteur de contenu"],
      image: robotImage,
    },
    {
      id: 4,
      name: "R-TAG01",
      role: "DIGITAL ASSISTANT",
      skills: [],
      image: robotImage,
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

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  return (
    <section
      id="team"
      className="w-full h-screen max-h-screen relative overflow-hidden flex items-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"
    >
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6 h-full">
        <div className="flex flex-col gap-8 lg:gap-12 h-full justify-center">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
              <span className="text-accent">Our</span>{" "}
              <span className="text-accent">Team</span>
            </h2>
            <p className="text-white text-sm md:text-base lg:text-lg font-medium max-w-4xl mx-auto">
              Une équipe passionnée, créative et engagée. Chacun de nos membres apporte son
              expertise unique pour transformer les idées en projets concrets et performants.
              Ensemble, nous unissons nos compétences pour offrir des solutions innovantes,
              orientées résultats, et accompagner nos clients vers le succès.
            </p>
          </div>

          <div className="relative flex-1 flex items-center">
            <button
              onClick={scrollPrev}
              className="absolute left-0 z-10 bg-accent hover:bg-accent/90 text-white rounded-full p-3 lg:p-4 transition-colors"
              aria-label="Previous team member"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 px-12 lg:px-20">
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {teamMembers.map((member) => (
                    <CarouselItem key={member.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-2">
                        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black p-6 h-full flex flex-col">
                          <div className="flex-1 flex items-center justify-center mb-4">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-auto max-h-[250px] object-contain"
                            />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg lg:text-xl font-bold text-accent mb-2 uppercase">
                              {member.name}
                            </h3>
                            <p className="text-white text-sm mb-2">{member.role}</p>
                            {member.skills.length > 0 && (
                              <div className="space-y-1">
                                {member.skills.map((skill, index) => (
                                  <p key={index} className="text-gray-300 text-xs">
                                    {skill}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <button
              onClick={scrollNext}
              className="absolute right-0 z-10 bg-accent hover:bg-accent/90 text-white rounded-full p-3 lg:p-4 transition-colors"
              aria-label="Next team member"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center gap-2">
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-1 rounded-full transition-all ${
                  index === current
                    ? "w-8 bg-accent"
                    : "w-6 bg-white/50"
                }`}
                aria-label={`Go to team member ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
