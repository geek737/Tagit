import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PortfolioChildPage {
  id: string;
  title: string;
  slug: string;
  hero_image: string | null;
  portfolio_parent_slug: string | null;
  service_display_order: number | null;
  first_project_image: string | null; // Image principale du premier projet
}

interface PortfolioSectionProps {
  titleLine1?: string;
  titleLine2?: string;
  titleLine1Color?: string;
  titleLine2Color?: string;
  itemsPerPage?: number;
  parentSlug?: string;
}

export default function PortfolioSection({
  titleLine1 = 'Our bold',
  titleLine2 = 'projects',
  titleLine1Color = '#7C3AED',
  titleLine2Color = '#7C3AED',
  itemsPerPage = 4,
  parentSlug = 'portfolio'
}: PortfolioSectionProps) {
  const [items, setItems] = useState<PortfolioChildPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadPortfolioChildPages();
  }, [parentSlug]);

  const loadPortfolioChildPages = async () => {
    try {
      // Load portfolio child pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('id, title, slug, hero_image, portfolio_parent_slug, service_display_order')
        .eq('template_type', 'portfolio_child')
        .eq('is_published', true)
        .eq('portfolio_parent_slug', parentSlug)
        .order('service_display_order', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true });

      if (pagesError) throw pagesError;
      
      if (!pagesData || pagesData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Load first project image for each page
      const itemsWithImages = await Promise.all(
        pagesData.map(async (page) => {
          // Get the first visible project for this page
          const { data: projectData, error: projectError } = await supabase
            .from('portfolio_projects')
            .select('main_image')
            .eq('page_id', page.id)
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .limit(1);

          // Get first project image if available
          const firstProjectImage = projectData && projectData.length > 0 
            ? projectData[0].main_image 
            : null;

          return {
            ...page,
            first_project_image: firstProjectImage
          };
        })
      );

      setItems(itemsWithImages);
    } catch (error) {
      console.error('Error loading portfolio child pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const visibleItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (isAnimating || page < 0 || page >= totalPages) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(page);
      // Wait for DOM update, then remove animation lock
      requestAnimationFrame(() => {
        setTimeout(() => setIsAnimating(false), 100);
      });
    }, 400);
  };

  if (loading) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="animate-pulse space-y-10">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[4/3]"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Network decoration - Top right */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none hidden lg:block">
        <svg 
          className="absolute top-[15%] right-0 w-[350px] h-[350px] opacity-30" 
          viewBox="0 0 500 500"
        >
          <g stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.6">
            <line x1="50" y1="100" x2="200" y2="50" />
            <line x1="200" y1="50" x2="350" y2="100" />
            <line x1="350" y1="100" x2="450" y2="200" />
            <line x1="200" y1="50" x2="250" y2="150" />
            <line x1="250" y1="150" x2="350" y2="100" />
            <line x1="250" y1="150" x2="300" y2="280" />
            <line x1="300" y1="280" x2="450" y2="200" />
            <line x1="100" y1="200" x2="250" y2="150" />
            <line x1="100" y1="200" x2="200" y2="350" />
            <line x1="200" y1="350" x2="300" y2="280" />
            <line x1="150" y1="250" x2="300" y2="280" />
            <line x1="400" y1="150" x2="450" y2="200" />
          </g>
          <g fill="#7C3AED" opacity="0.7">
            <circle cx="50" cy="100" r="5" />
            <circle cx="200" cy="50" r="6" />
            <circle cx="350" cy="100" r="5" />
            <circle cx="450" cy="200" r="4" />
            <circle cx="250" cy="150" r="6" />
            <circle cx="300" cy="280" r="5" />
            <circle cx="100" cy="200" r="4" />
            <circle cx="200" cy="350" r="5" />
            <circle cx="150" cy="250" r="3" />
            <circle cx="400" cy="150" r="4" />
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="space-y-1">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ color: titleLine1Color }}
            >
              {titleLine1}
            </h2>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ color: titleLine2Color }}
            >
              {titleLine2}
            </h2>
          </div>
          
          {/* Navigation Arrows - Desktop */}
          {totalPages > 1 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentPage > 0
                    ? 'border-gray-300 hover:border-accent hover:bg-accent hover:text-white text-gray-500'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentPage < totalPages - 1
                    ? 'border-gray-300 hover:border-accent hover:bg-accent hover:text-white text-gray-500'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Page suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Portfolio Grid - 2x2 Layout (as per mockup) */}
        <div 
          className={`grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 transition-all duration-500 ease-in-out ${
            isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {visibleItems.map((item, index) => (
            <PortfolioCard 
              key={`${item.id}-${currentPage}`} 
              item={item}
              index={index}
              parentSlug={parentSlug}
              isAnimating={isAnimating}
            />
          ))}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10 md:mt-14">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentPage === index
                    ? 'w-8 bg-accent'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller à la page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Portfolio Card Component - Modern design matching mockup exactly
function PortfolioCard({ 
  item,
  index,
  parentSlug,
  isAnimating
}: { 
  item: PortfolioChildPage;
  index: number;
  parentSlug: string;
  isAnimating: boolean;
}) {
  return (
    <a
      href={`/${item.slug}`}
      className={`group relative block cursor-pointer ${
        isAnimating ? '' : 'animate-fade-in-up'
      }`}
      style={!isAnimating ? { 
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'both'
      } : undefined}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-500">
        {item.first_project_image ? (
          <>
            <img
              src={item.first_project_image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : item.hero_image ? (
          <>
            <img
              src={item.hero_image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-300">{item.title.charAt(0)}</span>
          </div>
        )}
      </div>
      
      {/* Content - Below image (as per mockup) */}
      <div className="pt-4 md:pt-5">
        {/* Title - Bold black text */}
        <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-accent transition-colors duration-300">
          {item.title}
        </h3>
        
        {/* See Our Work link - Matching mockup design */}
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-medium text-gray-800 group-hover:text-accent transition-colors duration-300">
            See Our Work
          </span>
          <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent text-white group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-300 shadow-md shadow-accent/30">
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
