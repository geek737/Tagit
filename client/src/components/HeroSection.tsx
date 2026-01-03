import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface HeroContent {
  heading_line1: string;
  heading_line1_color: string;
  heading_line2: string;
  heading_line2_color: string;
  subheading: string;
  description: string;
  background_color: string;
  background_image: string | null;
  hero_image: string | null;
  button1_text: string;
  button1_url: string;
  button1_bg_color: string;
  button1_text_color: string;
  button2_text: string;
  button2_url: string;
}

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading hero content:', error);
        // Use default content if database fails
        setContent(getDefaultContent());
      } else if (data) {
        setContent(data);
      } else {
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error('Error:', error);
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (): HeroContent => ({
    heading_line1: 'Digital marketing,',
    heading_line1_color: '#FF6B35',
    heading_line2: 'Branding, Content',
    heading_line2_color: '#FFFFFF',
    subheading: 'Every brand has a story to tell.',
    description: 'Ours is to help yours shine with ideas that make an impact, a strategy that inspires, and results that last.',
    background_color: '#2D1B4E',
    background_image: null,
    hero_image: null,
    button1_text: 'What we offer',
    button1_url: '#services',
    button1_bg_color: '#FF6B35',
    button1_text_color: '#FFFFFF',
    button2_text: 'About Us',
    button2_url: '#about'
  });

  if (loading) {
    return (
      <section id="main-content" className="w-full px-4 md:px-8 lg:px-16 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-300 rounded w-96"></div>
              <div className="h-12 bg-gray-300 rounded w-80"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!content) return null;

  return (
    <section
      id="main-content"
      className="w-full px-4 md:px-8 lg:px-16 py-8 md:py-12 lg:py-16"
      style={{ backgroundColor: content.background_color }}
    >
      {content.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.background_image})` }}
        />
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-center lg:justify-start min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-120px)]">
          <div className="flex flex-col gap-8 md:gap-12 lg:gap-16 w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span style={{ color: content.heading_line1_color }}>
                {content.heading_line1}
              </span>
              <br />
              <span style={{ color: content.heading_line2_color }}>
                {content.heading_line2}
              </span>
            </h1>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
                {content.subheading}
              </h2>
              <p className="text-foreground/90 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                {content.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                className="hero-button group relative inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full sm:w-auto"
                data-testid="button-what-we-offer"
                onClick={() => document.getElementById(content.button1_url.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  '--button-bg-color': content.button1_bg_color || '#FF6B35',
                } as React.CSSProperties}
              >
                <span>{content.button1_text}</span>
                <div className="hero-button-icon flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300">
                  <ChevronRight className="w-6 h-6 text-white stroke-[3]" />
                </div>
              </button>
              <button
                className="hero-button group relative inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full sm:w-auto"
                data-testid="button-see-our-work"
                onClick={() => document.getElementById(content.button2_url.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  '--button-bg-color': content.button1_bg_color || '#FF6B35',
                } as React.CSSProperties}
              >
                <span>{content.button2_text}</span>
                <div className="hero-button-icon flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300">
                  <ChevronRight className="w-6 h-6 text-white stroke-[3]" />
                </div>
              </button>
            </div>
          </div>

          {content.hero_image && (
            <div className="hidden lg:block flex-1">
              <img
                src={content.hero_image}
                alt="Hero"
                className="w-full h-auto max-w-lg object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
