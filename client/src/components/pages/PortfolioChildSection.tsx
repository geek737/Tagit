import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  client_name: string | null;
  services_provided: string | null;
  main_image: string | null;
  secondary_images: string[];
  title_color: string;
  title_size: string;
  description_color: string;
  is_visible: boolean;
}

interface PortfolioChildPage {
  id: string;
  slug: string;
  title: string;
  service_display_order?: number | null;
  created_at?: string;
}

interface PortfolioChildSectionProps {
  pageId: string;
  currentSlug: string; // Slug de la page actuelle
  title?: string;
  titleColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  parentSlug?: string;
}

export default function PortfolioChildSection({
  pageId,
  currentSlug,
  title = 'Branding & Brand content',
  titleColor = '#FF6B35',
  subtitle,
  subtitleColor = '#1f2937',
  parentSlug = 'portfolio'
}: PortfolioChildSectionProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioChildPages, setPortfolioChildPages] = useState<PortfolioChildPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [loadingPages, setLoadingPages] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadProjects();
    loadPortfolioChildPages();
  }, [pageId, parentSlug]);
  
  // Update current page index when pages are loaded
  useEffect(() => {
    if (portfolioChildPages.length > 0 && currentSlug) {
      const index = portfolioChildPages.findIndex(page => page.slug === currentSlug);
      setCurrentPageIndex(index);
    }
  }, [portfolioChildPages, currentSlug]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Parse secondary_images from JSON
      const parsedData = (data || []).map(project => ({
        ...project,
        secondary_images: Array.isArray(project.secondary_images) 
          ? project.secondary_images 
          : JSON.parse(project.secondary_images || '[]')
      }));
      
      setProjects(parsedData);
    } catch (error) {
      console.error('Error loading portfolio projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitleSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'text-base md:text-lg';
      case 'md': return 'text-lg md:text-xl';
      case 'lg': return 'text-xl md:text-2xl';
      case 'xl': return 'text-2xl md:text-3xl';
      default: return 'text-lg md:text-xl';
    }
  };

  const loadPortfolioChildPages = async () => {
    try {
      setLoadingPages(true);
      const { data, error } = await supabase
        .from('pages')
        .select('id, slug, title, service_display_order, created_at')
        .eq('template_type', 'portfolio_child')
        .eq('portfolio_parent_slug', parentSlug)
        .eq('is_published', true);

      if (error) throw error;
      
      // Sort: first by display_order, then by title, then by created_at
      const sortedPages = (data || []).sort((a, b) => {
        // First sort by display_order (if available)
        const orderA = a.service_display_order ?? 9999;
        const orderB = b.service_display_order ?? 9999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Then by title
        if (a.title !== b.title) {
          return a.title.localeCompare(b.title);
        }
        // Finally by creation date
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      });
      
      setPortfolioChildPages(sortedPages);
    } catch (error) {
      console.error('Error loading portfolio child pages:', error);
    } finally {
      setLoadingPages(false);
    }
  };

  const navigateToPage = (direction: 'prev' | 'next') => {
    if (currentPageIndex === -1 || portfolioChildPages.length === 0) return;
    
    let targetIndex: number;
    if (direction === 'prev') {
      targetIndex = currentPageIndex - 1;
    } else {
      targetIndex = currentPageIndex + 1;
    }

    if (targetIndex >= 0 && targetIndex < portfolioChildPages.length) {
      const targetPage = portfolioChildPages[targetIndex];
      setLocation(`/${parentSlug}/${targetPage.slug}`);
    }
  };

  const goToAllProjects = () => {
    setLocation(`/${parentSlug}`);
  };

  if (loading) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="animate-pulse space-y-12">
            <div className="h-10 bg-gray-200 rounded w-64"></div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 aspect-video bg-gray-200 rounded-lg"></div>
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
          <p className="text-gray-500">Aucun projet à afficher pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Section Title */}
        <div className="mb-10 md:mb-14">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold"
            style={{ color: titleColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p 
              className="mt-2 text-base md:text-lg"
              style={{ color: subtitleColor }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Projects List - Stacked Vertically - Reduced spacing to fit on screen */}
        <div className="space-y-8 md:space-y-10 lg:space-y-12">
          {projects.map((project, index) => (
            <ProjectItem 
              key={project.id} 
              project={project}
              getTitleSizeClass={getTitleSizeClass}
              index={index}
            />
          ))}
        </div>

        {/* Navigation Buttons - Design from mockup */}
        <div className="mt-16 md:mt-20 flex items-center justify-center gap-6 md:gap-8">
          {/* Previous Portfolio Child Page */}
          <button
            onClick={() => navigateToPage('prev')}
            disabled={currentPageIndex <= 0 || loadingPages}
            className="flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              currentPageIndex > 0 && !loadingPages
                ? 'bg-accent text-white group-hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500'
            }`}>
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className={`text-base font-medium ${
              currentPageIndex > 0 && !loadingPages
                ? 'text-gray-900'
                : 'text-gray-400'
            }`}>
              Prev Project
            </span>
          </button>

          {/* All Projects - Link to parent portfolio page */}
          <button
            onClick={goToAllProjects}
            className="text-base font-medium text-gray-900 hover:text-accent transition-colors duration-300"
          >
            All Projects
          </button>

          {/* Next Portfolio Child Page */}
          <button
            onClick={() => navigateToPage('next')}
            disabled={currentPageIndex >= portfolioChildPages.length - 1 || currentPageIndex === -1 || loadingPages}
            className="flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className={`text-base font-medium ${
              currentPageIndex < portfolioChildPages.length - 1 && currentPageIndex !== -1 && !loadingPages
                ? 'text-gray-900'
                : 'text-gray-400'
            }`}>
              Next Project
            </span>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              currentPageIndex < portfolioChildPages.length - 1 && currentPageIndex !== -1 && !loadingPages
                ? 'bg-accent text-white group-hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500'
            }`}>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

// Individual Project Component
function ProjectItem({ 
  project, 
  getTitleSizeClass,
  index
}: { 
  project: PortfolioProject;
  getTitleSizeClass: (size: string) => string;
  index: number;
}) {
  return (
    <article 
      id={`project-${project.id}`}
      className="scroll-mt-24 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
        {/* Left Column - Text Content */}
        <div className="space-y-3 md:space-y-4 order-2 lg:order-1">
          {/* Project Title */}
          <h3 
            className={`font-bold ${getTitleSizeClass(project.title_size)}`}
            style={{ color: project.title_color }}
          >
            PROJET : {project.title}
          </h3>
          
          {/* Project Description - No spacing between lines */}
          {project.description && (
            <div 
              className="max-w-none"
              style={{ color: project.description_color }}
            >
              {project.description.split('\n').map((paragraph, i) => (
                <p key={i} className="text-sm md:text-base leading-tight mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Images & Info */}
        <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
          {/* Main Image */}
          {project.main_image && (
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={project.main_image}
                alt={project.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Secondary Images Grid (2 columns) */}
          {project.secondary_images && project.secondary_images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {project.secondary_images.map((image, imgIndex) => (
                <div 
                  key={imgIndex} 
                  className="rounded-lg overflow-hidden shadow-md aspect-square"
                >
                  <img
                    src={image}
                    alt={`${project.title} - Image ${imgIndex + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Client & Services Info */}
          {(project.client_name || project.services_provided) && (
            <div className="bg-gray-50 rounded-lg p-4 md:p-5 space-y-3">
              {project.client_name && (
                <div>
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wide mb-1">
                    Client
                  </h4>
                  <p className="text-gray-800 font-medium">
                    {project.client_name}
                  </p>
                </div>
              )}
              
              {project.services_provided && (
                <div>
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wide mb-1">
                    Services
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {project.services_provided}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Separator - Reduced spacing */}
      <div className="mt-6 md:mt-8 border-b border-gray-200" />
    </article>
  );
}

