import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HeroBanner from './HeroBanner';
import TextSection from './TextSection';
import OtherServices from './OtherServices';
import CTASection from './CTASection';

interface Page {
  id: string;
  title: string;
  slug: string;
  template_type: string;
  
  // Hero Banner
  hero_title: string | null;
  hero_title_highlight: string | null;
  hero_title_rest: string | null;
  hero_title_color_1: string | null;
  hero_title_color_2: string | null;
  hero_image: string | null;
  hero_background_color: string | null;
  hero_gradient_from: string | null;
  hero_gradient_to: string | null;
  hero_breadcrumb_label: string | null;
  
  // Text Section
  text_content: string | null;
  text_content_color: string | null;
  text_background_color: string | null;
  text_section_title: string | null;
  text_button_text: string | null;
  text_button_link: string | null;
  text_show_button: boolean | null;
  
  // CTA Section
  cta_background_type: string | null;
  cta_background_value: string | null;
  cta_text: string | null;
  cta_text_line2: string | null;
  cta_text_color: string | null;
  cta_text_position: string | null;
  cta_background_image: string | null;
  cta_show_button: boolean | null;
  cta_button_text: string | null;
  cta_button_link: string | null;
  cta_gradient_from: string | null;
  cta_gradient_to: string | null;
  
  // SEO fields
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

interface PageTemplateProps {
  slug: string;
}

// Helper function to update meta tags
function updateMetaTags(page: Page) {
  // Update page title
  const pageTitle = page.seo_title || page.title;
  document.title = `${pageTitle} | Tagit`;
  
  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  const description = page.seo_description || page.text_content?.substring(0, 160) || `${page.title} - Tagit Agency`;
  metaDescription.setAttribute('content', description);
  
  // Update or create meta keywords
  if (page.seo_keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', page.seo_keywords);
  }
  
  // Open Graph tags
  updateOGTag('og:title', pageTitle);
  updateOGTag('og:description', description);
  updateOGTag('og:type', 'website');
  updateOGTag('og:url', window.location.href);
  if (page.hero_image) {
    updateOGTag('og:image', page.hero_image);
  }
  
  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', pageTitle);
  updateMetaTag('twitter:description', description);
  if (page.hero_image) {
    updateMetaTag('twitter:image', page.hero_image);
  }
  
  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', window.location.href);
}

function updateOGTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function updateMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function PageTemplate({ slug }: PageTemplateProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadPage();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Update SEO when page data changes
  useEffect(() => {
    if (page) {
      updateMetaTags(page);
    }
    
    // Cleanup: Reset title on unmount
    return () => {
      document.title = 'Tagit - Agence Digitale';
    };
  }, [page]);

  const loadPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setLocation('/');
          return;
        }
        throw error;
      }

      setPage(data);
    } catch (error) {
      console.error('Error loading page:', error);
      setLocation('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6">
          {/* Animated Logo/Loader */}
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin"></div>
              <div className="absolute inset-2 md:inset-3 rounded-full border-4 border-transparent border-t-orange-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-base md:text-lg font-medium text-gray-700 animate-pulse">Chargement...</p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <main className="animate-fade-in">
      <Header />
      
      <HeroBanner
        title={page.hero_title || page.title}
        titleHighlight={page.hero_title_highlight || undefined}
        titleRest={page.hero_title_rest || undefined}
        titleColor1={page.hero_title_color_1 || '#FFFFFF'}
        titleColor2={page.hero_title_color_2 || '#FFFFFF'}
        image={page.hero_image}
        breadcrumbLabel={page.hero_breadcrumb_label || undefined}
        gradientFrom={page.hero_gradient_from || '#FF6B35'}
        gradientTo={page.hero_gradient_to || '#4C1D95'}
      />

      <TextSection
        title={page.text_section_title || page.hero_title || page.title}
        content={page.text_content || ''}
        textColor={page.text_content_color}
        backgroundColor={page.text_background_color || '#f5f5f5'}
        buttonText={page.text_button_text || 'See Our Work'}
        buttonLink={page.text_button_link || '#portfolio'}
        showButton={page.text_show_button !== false}
      />

      {/* Autres Services - Exclure la page actuelle */}
      {page.template_type === 'service' && (
        <OtherServices currentPageSlug={page.slug} />
      )}

      <CTASection
        text={page.cta_text}
        textLine2={page.cta_text_line2 || undefined}
        textColor={page.cta_text_color}
        backgroundImage={page.cta_background_image || undefined}
        showButton={page.cta_show_button !== false}
        buttonText={page.cta_button_text || 'Démarrer un projet'}
        buttonLink={page.cta_button_link || '#contact'}
        gradientFrom={page.cta_gradient_from || '#3B1E6D'}
        gradientTo={page.cta_gradient_to || '#1E3A5F'}
      />

      <Footer />
      <ScrollToTop />
    </main>
  );
}
