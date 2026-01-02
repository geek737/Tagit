import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  text?: string | null;
  textLine2?: string | null;
  textColor?: string | null;
  backgroundImage?: string | null; // Image de fond
  showButton?: boolean;
  buttonText?: string;
  buttonLink?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function CTASection({
  text = 'Contactez-nous dès maintenant',
  textLine2 = 'et commençons à construire votre identité unique',
  textColor = '#FFFFFF',
  backgroundImage,
  showButton = true,
  buttonText = 'Démarrer un projet',
  buttonLink = '#contact',
  gradientFrom = '#3B1E6D',
  gradientTo = '#1E3A5F',
}: CTASectionProps) {
  if (!text) return null;

  // Handle link click - navigate to home page first for hash links if not on home
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (buttonLink?.startsWith('#')) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '') {
        e.preventDefault();
        window.location.href = '/' + buttonLink;
      }
    }
  };

  const hasBackgroundImage = !!backgroundImage;

  return (
    <section
      className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden"
      style={hasBackgroundImage ? {} : { 
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
      }}
    >
      {/* Background Image */}
      {hasBackgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {/* Overlay gradient on image */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${gradientFrom}dd 0%, ${gradientTo}cc 100%)`
            }}
          />
        </>
      )}
      
      {/* Main Content - Centered */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Text in italic style */}
          <div className="space-y-1 animate-fade-in-up">
            <p
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium leading-tight italic"
              style={{ color: textColor || '#FFFFFF' }}
            >
              {text}
            </p>
            {textLine2 && (
              <p
                className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium leading-tight italic"
                style={{ color: textColor || '#FFFFFF' }}
              >
                {textLine2}
              </p>
            )}
          </div>
          
          {/* CTA Button - Optional */}
          {showButton && (
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <a 
                href={buttonLink}
                onClick={handleLinkClick}
                className="group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-white bg-accent hover:bg-orange-600 transition-all duration-300 hover:shadow-xl hover:shadow-accent/40 transform hover:scale-105"
              >
                <span className="text-base md:text-lg">{buttonText}</span>
                <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
