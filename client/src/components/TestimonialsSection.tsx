import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const testimonials = [
    {
      id: 1,
      quote: "Travailler avec tagit a été un vrai plaisir. Leur équipe est à l'écoute, créative et très réactive. Grâce à leurs stratégies digitales, j'ai vu une nette augmentation de l'engagement sur mes réseaux sociaux et une croissance réelle de mes ventes. Je recommande vivement !",
      author: "ATOINI ZAKARIAE",
      role: "Designer, Infographiste",
    },
    {
      id: 2,
      quote: "L'équipe de tagit a transformé notre présence en ligne. Leur professionnalisme et leur créativité ont dépassé nos attentes. Les résultats parlent d'eux-mêmes !",
      author: "SARAH BENNANI",
      role: "Directrice Marketing",
    },
    {
      id: 3,
      quote: "Une collaboration exceptionnelle ! tagit a su comprendre nos besoins et proposer des solutions innovantes. Notre site web est maintenant moderne et performant.",
      author: "MEHDI ALAMI",
      role: "Entrepreneur",
    },
  ];

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

  return (
    <section
      id="testimonials"
      className="w-full min-h-screen relative overflow-hidden flex items-center bg-gray-50"
    >
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        style={{ zIndex: 0 }}
      >
        <defs>
          <pattern id="network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="3" fill="#9333ea" opacity="0.5" />
            <circle cx="150" cy="80" r="3" fill="#9333ea" opacity="0.5" />
            <circle cx="100" cy="150" r="3" fill="#9333ea" opacity="0.5" />
            <circle cx="180" cy="150" r="3" fill="#9333ea" opacity="0.5" />
            <line x1="50" y1="50" x2="150" y2="80" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
            <line x1="150" y1="80" x2="100" y2="150" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
            <line x1="100" y1="150" x2="180" y2="150" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
            <line x1="50" y1="50" x2="100" y2="150" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-pattern)" />
      </svg>

      <div className="container mx-auto px-4 lg:px-8 relative z-10" style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
            <span className="text-purple-600">Clients</span>{" "}
            <span className="text-gray-800">Feedback</span>
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
                        <svg className="w-16 h-16 text-accent" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 text-lg md:text-xl lg:text-2xl max-w-3xl mb-12 leading-relaxed">
                        {testimonial.quote}
                      </p>
                      <div>
                        <p className="text-accent font-bold text-xl uppercase">
                          {testimonial.author}
                        </p>
                        <p className="text-gray-600 mt-2">{testimonial.role}</p>
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
