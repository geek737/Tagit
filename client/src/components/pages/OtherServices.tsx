import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ServicePage {
  id: string;
  title: string;
  slug: string;
  service_icon: string | null;
  service_short_description: string | null;
  service_title_color: string | null;
  service_description_color: string | null;
  service_button_color: string | null;
  service_display_order: number;
}

interface OtherServicesProps {
  title?: string;
  currentPageSlug?: string; // Pour exclure la page actuelle de la liste
}

export default function OtherServices({ 
  title = 'Autres services',
  currentPageSlug 
}: OtherServicesProps) {
  const [services, setServices] = useState<ServicePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const itemsPerPage = 3;

  useEffect(() => {
    loadServicePages();
  }, [currentPageSlug]);

  const loadServicePages = async () => {
    try {
      let query = supabase
        .from('pages')
        .select('id, title, slug, service_icon, service_short_description, service_title_color, service_description_color, service_button_color, service_display_order')
        .eq('template_type', 'service')
        .eq('is_published', true)
        .order('service_display_order', { ascending: true });
      
      // Exclure la page actuelle
      if (currentPageSlug) {
        query = query.neq('slug', currentPageSlug);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading service pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const visibleServices = services.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (isAnimating || page < 0 || page >= totalPages) return;
    setIsAnimating(true);
    setCurrentPage(page);
    setTimeout(() => setIsAnimating(false), 400);
  };

  if (loading) {
    return (
      <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="animate-pulse space-y-10">
            <div className="h-10 bg-gray-200 rounded-lg w-56"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-6 space-y-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) return null;

  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 animate-fade-in-up">
            {title}
          </h2>
          
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
        
        {/* Services Grid */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 transition-all duration-400 ${
            isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {visibleServices.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              index={index}
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
                    ? 'w-8 bg-gray-800'
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

// Composant carte de service - affiche les pages de type "service"
function ServiceCard({ service, index }: { service: ServicePage; index: number }) {
  const titleColor = service.service_title_color || '#FF6B35';
  const descriptionColor = service.service_description_color || '#6b7280';
  const buttonColor = service.service_button_color || '#FF6B35';

  return (
    <div 
      className="group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 transition-all duration-400 h-full flex flex-col">
        {/* Icon Container - Sans cercle de fond */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            {service.service_icon ? (
              <img
                src={service.service_icon}
                alt={service.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-accent">
                  {service.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Title */}
        <h3
          className="text-lg md:text-xl font-bold text-center mb-3 transition-colors duration-300"
          style={{ color: titleColor }}
        >
          {service.title}
        </h3>
        
        {/* Description */}
        <p
          className="text-sm md:text-base leading-relaxed text-center mb-6 flex-grow line-clamp-4"
          style={{ color: descriptionColor }}
        >
          {service.service_short_description || 'Découvrez notre service et comment nous pouvons vous aider.'}
        </p>
        
        {/* Read More Button - Link to service page */}
        <div className="flex justify-center mt-auto">
          <a 
            href={`/${service.slug}`}
            className="group/btn inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300"
            style={{ color: buttonColor }}
          >
            <span className="uppercase tracking-wide">Read More</span>
            <div 
              className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 group-hover/btn:translate-x-1"
              style={{ backgroundColor: buttonColor }}
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
