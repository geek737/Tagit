import { ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  title: string;
  titleHighlight?: string; // Title Line 1 (ex: "Branding")
  titleRest?: string; // Title Line 2 (ex: "& Brand content")
  titleColor1?: string; // Color for Title Line 1
  titleColor2?: string; // Color for Title Line 2
  image?: string | null;
  breadcrumbLabel?: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>; // Multi-level breadcrumb
  gradientFrom?: string;
  gradientTo?: string;
}

export default function HeroBanner({ 
  title, 
  titleHighlight,
  titleRest,
  titleColor1 = '#FFFFFF',
  titleColor2 = '#FFFFFF',
  image, 
  breadcrumbLabel,
  breadcrumbItems,
  gradientFrom = '#FF6B35',
  gradientTo = '#4C1D95'
}: HeroBannerProps) {
  // Si titleHighlight et titleRest ne sont pas fournis, utiliser le titre complet
  const displayHighlight = titleHighlight || title.split(' ')[0];
  const displayRest = titleRest || title.split(' ').slice(1).join(' ');
  
  // Build breadcrumb items
  const breadcrumbs = breadcrumbItems || [
    { label: 'Accueil', href: '/' },
    ...(breadcrumbLabel ? [{ label: breadcrumbLabel }] : [{ label: title }])
  ];

  return (
    <section
      className="relative w-full min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex items-center overflow-hidden pt-20 md:pt-16 lg:pt-0"
      style={{ 
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientFrom} 35%, ${gradientTo} 100%)`
      }}
    >
      {/* Decorative curved shape */}
      <div 
        className="absolute top-0 right-0 w-[60%] h-full opacity-20 hidden md:block"
        style={{
          background: `radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating geometric decorations - hidden on mobile */}
      <div className="absolute top-[15%] right-[25%] w-3 h-3 bg-white/20 rounded-full animate-pulse hidden md:block" />
      <div className="absolute top-[30%] right-[15%] w-2 h-2 bg-white/30 rounded-full hidden md:block" />
      <div className="absolute bottom-[25%] right-[30%] w-4 h-4 border border-white/20 rounded-full hidden lg:block" />
      
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10 w-full py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            {/* Title with custom colors - Responsive font sizes */}
            <div className="animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
                <span style={{ color: titleColor1 }}>{displayHighlight}</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span style={{ color: titleColor2 }}>{displayRest}</span>
              </h1>
            </div>
            
            {/* Breadcrumb - Multi-level support */}
            <nav 
              className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm md:text-base animate-fade-in-up flex-wrap" 
              style={{ animationDelay: '0.2s' }}
            >
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <div className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-white">
                      <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-800" />
                    </div>
                  )}
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="text-white/80 hover:text-white transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-white/90 font-medium truncate max-w-[200px] md:max-w-none">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* Right Content - 3D Image (hidden on small mobile, shown on larger screens) */}
          {image && (
            <div 
              className="relative flex justify-center lg:justify-end animate-fade-in-up hidden sm:flex"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative">
                <div className="relative z-10">
                  <img
                    src={image}
                    alt={title}
                    className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[380px] h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 60" 
          fill="none" 
          className="w-full h-6 md:h-10"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C480,0 960,60 1440,30 L1440,60 L0,60 Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
