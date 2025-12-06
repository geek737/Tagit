import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { supabase } from "@/lib/supabase";
import { SectionLoader } from "@/components/ui/GlobalLoader";

interface TestimonialHeader {
  heading_part1: string;
  heading_part1_color: string;
  heading_part2: string;
  heading_part2_color: string;
  background_color: string;
}

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  content_color: string;
  author_name_color: string;
  author_role_color: string;
  quote_icon_color: string;
  display_order: number;
  is_visible: boolean;
}

const defaultHeader: TestimonialHeader = {
  heading_part1: 'Clients',
  heading_part1_color: '#9333ea',
  heading_part2: 'Feedback',
  heading_part2_color: '#1f2937',
  background_color: '#f9fafb'
};

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    content: "Travailler avec tagit a été un vrai plaisir. Leur équipe est à l'écoute, créative et très réactive. Grâce à leurs stratégies digitales, j'ai vu une nette augmentation de l'engagement sur mes réseaux sociaux et une croissance réelle de mes ventes. Je recommande vivement !",
    author_name: "ATOINI ZAKARIAE",
    author_role: "Designer, Infographiste",
    content_color: '#374151',
    author_name_color: '#FF6B35',
    author_role_color: '#6B7280',
    quote_icon_color: '#FF6B35',
    display_order: 0,
    is_visible: true
  }
];

const TestimonialsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [header, setHeader] = useState<TestimonialHeader>(defaultHeader);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, testimonialsRes] = await Promise.all([
        supabase.from('testimonials_header').select('*').single(),
        supabase.from('testimonials').select('*').eq('is_visible', true).order('display_order', { ascending: true })
      ]);

      if (headerRes.data) {
        setHeader(headerRes.data);
      }
      if (testimonialsRes.data && testimonialsRes.data.length > 0) {
        setTestimonials(testimonialsRes.data);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateScrollButtons = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollButtons();

    api.on("select", updateScrollButtons);
    api.on("reInit", updateScrollButtons);

    return () => {
      api.off("select", updateScrollButtons);
      api.off("reInit", updateScrollButtons);
    };
  }, [api]);

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  if (loading) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <SectionLoader text="Chargement..." />
      </section>
    );
  }

  return (
    <section
      id="testimonials"
      className="w-full min-h-screen relative overflow-hidden flex items-center"
      style={{ backgroundColor: header.background_color }}
    >
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        style={{ zIndex: 0 }}
      >
        <defs>
          <pattern id="network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="3" fill={header.heading_part1_color} opacity="0.5" />
            <circle cx="150" cy="80" r="3" fill={header.heading_part1_color} opacity="0.5" />
            <circle cx="100" cy="150" r="3" fill={header.heading_part1_color} opacity="0.5" />
            <circle cx="180" cy="150" r="3" fill={header.heading_part1_color} opacity="0.5" />
            <line x1="50" y1="50" x2="150" y2="80" stroke={header.heading_part1_color} strokeWidth="1" opacity="0.3" />
            <line x1="150" y1="80" x2="100" y2="150" stroke={header.heading_part1_color} strokeWidth="1" opacity="0.3" />
            <line x1="100" y1="150" x2="180" y2="150" stroke={header.heading_part1_color} strokeWidth="1" opacity="0.3" />
            <line x1="50" y1="50" x2="100" y2="150" stroke={header.heading_part1_color} strokeWidth="1" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-pattern)" />
      </svg>

      <div className="container mx-auto px-4 lg:px-8 relative z-10" style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
            <span style={{ color: header.heading_part1_color }}>{header.heading_part1}</span>{" "}
            <span style={{ color: header.heading_part2_color }}>{header.heading_part2}</span>
          </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {canScrollPrev && (
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-accent hover:bg-accent/90 text-white rounded-full p-4 lg:p-5 transition-colors shadow-lg"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="px-12 lg:px-20">
            <Carousel className="w-full" setApi={setApi}>
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id}>
                    <div className="flex flex-col items-center text-center py-12">
                      <div className="mb-8">
                        <svg className="w-16 h-16" fill={testimonial.quote_icon_color} viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      <p 
                        className="text-lg md:text-xl lg:text-2xl max-w-3xl mb-12 leading-relaxed"
                        style={{ color: testimonial.content_color }}
                      >
                        {testimonial.content}
                      </p>
                      <div>
                        <p 
                          className="font-bold text-xl uppercase"
                          style={{ color: testimonial.author_name_color }}
                        >
                          {testimonial.author_name}
                        </p>
                        <p 
                          className="mt-2"
                          style={{ color: testimonial.author_role_color }}
                        >
                          {testimonial.author_role}
                        </p>
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-accent hover:bg-accent/90 text-white rounded-full p-4 lg:p-5 transition-colors shadow-lg"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
