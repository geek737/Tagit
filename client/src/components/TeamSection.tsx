import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  image: string;
  name_color: string;
  role_color: string;
  skills_color: string;
}

interface TeamHeader {
  heading_word1: string;
  heading_word2: string;
  description: string;
  background_color: string;
  background_gradient: string;
  heading_color: string;
  description_color: string;
}

const TeamSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [header, setHeader] = useState<TeamHeader | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateScrollButtons = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrent(api.selectedScrollSnap());
    };

    updateScrollButtons();
    api.on("select", updateScrollButtons);
    api.on("reInit", updateScrollButtons);

    return () => {
      api.off("select", updateScrollButtons);
      api.off("reInit", updateScrollButtons);
    };
  }, [api]);

  const loadContent = async () => {
    try {
      const [headerRes, membersRes] = await Promise.all([
        supabase.from('team_header').select('*').eq('is_active', true).single(),
        supabase.from('team_members').select('*').eq('is_visible', true).order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (membersRes.data) setMembers(membersRes.data);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  if (loading) {
    return (
      <section id="team" className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </section>
    );
  }

  const defaultHeader = {
    heading_word1: 'Our',
    heading_word2: 'Team',
    description: 'Une équipe passionnée, créative et engagée. Chacun de nos membres apporte son expertise unique pour transformer les idées en projets concrets et performants.',
    background_color: '#7C3AED',
    background_gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    heading_color: '#FF6B35',
    description_color: '#FFFFFF'
  };

  const displayHeader = header || defaultHeader;
  const displayMembers = members.length > 0 ? members : [];

  return (
    <section
      id="team"
      className="w-full min-h-screen relative overflow-hidden flex items-center py-16 lg:py-0"
      style={{
        background: displayHeader.background_gradient || displayHeader.background_color
      }}
    >
      <div className="container mx-auto px-4 lg:px-8" style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>
        <div className="flex flex-col gap-8 lg:gap-12 justify-center">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
              <span style={{ color: displayHeader.heading_color }}>
                {displayHeader.heading_word1}
              </span>{" "}
              <span style={{ color: displayHeader.heading_color }}>
                {displayHeader.heading_word2}
              </span>
            </h2>
            <p
              className="text-sm md:text-base lg:text-lg font-medium max-w-4xl mx-auto"
              style={{ color: displayHeader.description_color }}
            >
              {displayHeader.description}
            </p>
          </div>

          {displayMembers.length > 0 ? (
            <div className="relative flex items-center w-full">
              {canScrollPrev && (
                <button
                  onClick={scrollPrev}
                  className="absolute left-0 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 lg:p-5 transition-colors backdrop-blur-sm"
                  aria-label="Previous team member"
                >
                  <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div className="w-full px-10 md:px-12 lg:px-20">
                <Carousel className="w-full" setApi={setApi}>
                  <CarouselContent>
                    {displayMembers.map((member) => (
                      <CarouselItem key={member.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                        <div className="px-2 md:px-4">
                          <div className="relative overflow-hidden rounded-lg bg-transparent p-4 md:p-6 flex flex-col">
                            <div className="flex items-center justify-center mb-4">
                              {member.image && (
                                <img
                                  src={member.image}
                                  alt={member.name}
                                  className="w-full h-auto max-h-[250px] object-contain rounded-xl"
                                />
                              )}
                            </div>
                            <div className="text-center">
                              <h3
                                className="text-lg lg:text-xl font-bold mb-2 uppercase"
                                style={{ color: member.name_color }}
                              >
                                {member.name}
                              </h3>
                              <p className="text-sm mb-2" style={{ color: member.role_color }}>
                                {member.role}
                              </p>
                              {member.skills.length > 0 && (
                                <div className="space-y-1">
                                  {member.skills.map((skill, index) => (
                                    <p key={index} className="text-xs" style={{ color: member.skills_color }}>
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

              {canScrollNext && (
                <button
                  onClick={scrollNext}
                  className="absolute right-0 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 lg:p-5 transition-colors backdrop-blur-sm"
                  aria-label="Next team member"
                >
                  <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="w-full p-8 text-center text-white">
              No team members available
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
