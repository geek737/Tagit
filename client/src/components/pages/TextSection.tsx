import { ChevronRight } from 'lucide-react';

interface TextSectionProps {
  title?: string;
  content: string;
  textColor?: string | null;
  backgroundColor?: string | null;
  buttonText?: string;
  buttonLink?: string;
  showButton?: boolean;
}

export default function TextSection({ 
  title,
  content, 
  textColor = '#374151',
  backgroundColor = '#f5f5f5',
  buttonText = 'See Our Work',
  buttonLink = '#portfolio',
  showButton = true
}: TextSectionProps) {
  if (!content) return null;

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

  const paragraphs = content.split('\n').filter(p => p.trim());

  return (
    <section 
      className="relative w-full py-10 md:py-12 lg:py-14 overflow-hidden"
      style={{ backgroundColor: backgroundColor || '#f5f5f5' }}
    >
      {/* Network Pattern Decoration - Right Side (hidden on mobile) */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none hidden md:block">
        <svg 
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] opacity-30" 
          viewBox="0 0 500 500"
        >
          {/* Network lines */}
          <g stroke="#9333ea" strokeWidth="1" fill="none" opacity="0.4">
            <line x1="250" y1="50" x2="400" y2="120" />
            <line x1="400" y1="120" x2="450" y2="250" />
            <line x1="450" y1="250" x2="400" y2="380" />
            <line x1="400" y1="380" x2="250" y2="450" />
            <line x1="250" y1="50" x2="300" y2="150" />
            <line x1="300" y1="150" x2="400" y2="120" />
            <line x1="300" y1="150" x2="350" y2="280" />
            <line x1="350" y1="280" x2="400" y2="380" />
            <line x1="350" y1="280" x2="450" y2="250" />
            <line x1="300" y1="150" x2="380" y2="200" />
            <line x1="380" y1="200" x2="450" y2="250" />
            <line x1="380" y1="200" x2="400" y2="120" />
            <line x1="350" y1="280" x2="320" y2="350" />
            <line x1="320" y1="350" x2="400" y2="380" />
            <line x1="320" y1="350" x2="250" y2="450" />
            <line x1="480" y1="180" x2="450" y2="250" />
            <line x1="480" y1="180" x2="400" y2="120" />
            <line x1="420" y1="320" x2="450" y2="250" />
            <line x1="420" y1="320" x2="400" y2="380" />
          </g>
          {/* Network nodes */}
          <g fill="#9333ea" opacity="0.5">
            <circle cx="250" cy="50" r="3" />
            <circle cx="400" cy="120" r="5" />
            <circle cx="450" cy="250" r="4" />
            <circle cx="400" cy="380" r="5" />
            <circle cx="250" cy="450" r="3" />
            <circle cx="300" cy="150" r="4" />
            <circle cx="350" cy="280" r="4" />
            <circle cx="380" cy="200" r="3" />
            <circle cx="320" cy="350" r="3" />
            <circle cx="480" cy="180" r="2" />
            <circle cx="420" cy="320" r="3" />
          </g>
        </svg>
        
        {/* Floating dots */}
        <div className="absolute top-[15%] right-[10%] w-1.5 h-1.5 bg-purple-400/30 rounded-full" />
        <div className="absolute top-[45%] right-[5%] w-2 h-2 bg-purple-400/20 rounded-full" />
        <div className="absolute bottom-[25%] right-[15%] w-1.5 h-1.5 bg-purple-500/30 rounded-full" />
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        {/* Section Title */}
        {title && (
          <h2 
            className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6"
            style={{ color: '#1f2937' }}
          >
            {title}
          </h2>
        )}
        
        {/* Content Paragraphs - Reduced spacing */}
        <div className="space-y-3 md:space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className="text-sm md:text-base leading-relaxed"
              style={{ color: textColor || '#374151' }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Action Button */}
        {showButton && (
          <div className="mt-6 md:mt-8">
            <a 
              href={buttonLink}
              onClick={handleLinkClick}
              className="group inline-flex items-center gap-2 text-gray-800 font-medium hover:text-accent transition-colors duration-300"
            >
              <span className="text-sm md:text-base">{buttonText}</span>
              <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent text-white shadow-md shadow-accent/30">
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
