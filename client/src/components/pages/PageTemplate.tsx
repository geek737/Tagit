import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import GlobalLoader from '@/components/ui/GlobalLoader';
import ErrorPage from '@/components/ErrorPage';
import HeroBanner from './HeroBanner';
import TextSection from './TextSection';
import OtherServices from './OtherServices';
import CTASection from './CTASection';
import PortfolioSection from './PortfolioSection';
import PortfolioChildSection from './PortfolioChildSection';

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
  
  // Portfolio fields
  portfolio_title_line1: string | null;
  portfolio_title_line2: string | null;
  portfolio_title_line1_color: string | null;
  portfolio_title_line2_color: string | null;
  portfolio_items_per_page: number | null;
  
  // Portfolio Child fields
  portfolio_child_title: string | null;
  portfolio_child_title_color: string | null;
  portfolio_child_subtitle: string | null;
  portfolio_child_subtitle_color: string | null;
  portfolio_parent_slug: string | null;
}

interface PageTemplateProps {
  slug: string;
  parentSlug?: string; // For portfolio child pages
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

export default function PageTemplate({ slug, parentSlug }: PageTemplateProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadPage();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, parentSlug]);

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
    setNotFound(false);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading page:', error);
        setNotFound(true);
        return;
      }

      if (!data) {
        console.log('Page not found for slug:', slug);
        setNotFound(true);
        return;
      }

      if (parentSlug && data.template_type === 'portfolio_child' && data.portfolio_parent_slug !== parentSlug) {
        const correctParentSlug = data.portfolio_parent_slug || 'portfolio';
        const childSlug = slug.split('/').pop() || slug;
        setLocation(`/${correctParentSlug}/${childSlug}`);
        return;
      }

      setPage(data);
    } catch (error) {
      console.error('Error loading page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <GlobalLoader isLoading={true} text="Chargement de la page..." fullScreen />;
  }

  if (notFound || !page) {
    return <ErrorPage type={404} />;
  }

  // Build breadcrumb based on page type
  const getBreadcrumbItems = () => {
    if (page.template_type === 'portfolio_child') {
      // For portfolio child: Accueil > Portfolio > nom du page child
      // Use parentSlug from route if available, otherwise from page data
      const parentSlugValue = parentSlug || page.portfolio_parent_slug || 'portfolio';
      
      // Get parent page title for breadcrumb
      const parentTitle = 'Portfolio'; // Default, could be fetched from parent page if needed
      
      return [
        { label: 'Accueil', href: '/' },
        { label: parentTitle, href: `/${parentSlugValue}` },
        { label: page.hero_breadcrumb_label || page.title }
      ];
    }
    // For other pages, use simple breadcrumb
    if (page.hero_breadcrumb_label) {
      return [
        { label: 'Accueil', href: '/' },
        { label: page.hero_breadcrumb_label }
      ];
    }
    return undefined; // Will use default breadcrumbLabel
  };

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
        breadcrumbItems={getBreadcrumbItems()}
        gradientFrom={page.hero_gradient_from || '#FF6B35'}
        gradientTo={page.hero_gradient_to || '#4C1D95'}
      />

      {/* Content Section - Only for service pages */}
      {page.template_type === 'service' && (
        <TextSection
          title={page.text_section_title || page.hero_title || page.title}
          content={page.text_content || ''}
          textColor={page.text_content_color}
          backgroundColor={page.text_background_color || '#f5f5f5'}
          buttonText={page.text_button_text || 'See Our Work'}
          buttonLink={page.text_button_link || '#portfolio'}
          showButton={page.text_show_button !== false}
        />
      )}

      {/* Portfolio Section - Only for portfolio pages */}
      {page.template_type === 'portfolio' && (
        <PortfolioSection
          titleLine1={page.portfolio_title_line1 || 'Our bold'}
          titleLine2={page.portfolio_title_line2 || 'projects'}
          titleLine1Color={page.portfolio_title_line1_color || '#7C3AED'}
          titleLine2Color={page.portfolio_title_line2_color || '#7C3AED'}
          itemsPerPage={page.portfolio_items_per_page || 4}
          parentSlug={page.slug}
        />
      )}

      {/* Portfolio Child Section - Only for portfolio child pages */}
      {page.template_type === 'portfolio_child' && (
        <PortfolioChildSection
          pageId={page.id}
          currentSlug={page.slug}
          title={page.portfolio_child_title || page.title}
          titleColor={page.portfolio_child_title_color || '#FF6B35'}
          subtitle={page.portfolio_child_subtitle || undefined}
          subtitleColor={page.portfolio_child_subtitle_color || '#1f2937'}
          parentSlug={page.portfolio_parent_slug || 'portfolio'}
        />
      )}

      {/* Autres Services - Only for service pages */}
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
