import { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-tagit.png";
import { supabase } from "@/lib/supabase";

interface FooterSection {
  id: string;
  section_key: string;
  section_title: string;
  content: any;
  display_order: number;
  is_visible: boolean;
}

interface FooterSettings {
  id: string;
  background_color: string;
  text_color: string;
  link_color: string;
  link_hover_color: string;
  copyright_text: string;
  legal_links: Array<{ label: string; href: string }>;
  layout_columns: number;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const [sectionsRes, settingsRes] = await Promise.all([
        supabase
          .from('footer_sections')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('footer_settings')
          .select('*')
          .eq('is_active', true)
          .maybeSingle()
      ]);

      if (sectionsRes.data && sectionsRes.data.length > 0) {
        setSections(sectionsRes.data);
      } else {
        setSections([]);
      }

      if (settingsRes.data) {
        setSettings(settingsRes.data);
      } else {
        setSettings(null);
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'mail':
      case 'email':
        return Mail;
      case 'phone':
        return Phone;
      case 'map-pin':
      case 'mappin':
      case 'location':
        return MapPin;
      default:
        return Mail;
    }
  };

  const getGridCols = (columns: number) => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  if (loading) {
  return (
    <footer className="bg-primary text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
          <div className="text-center">Loading...</div>
        </div>
      </footer>
    );
  }

  // Use DB settings if available, otherwise use static fallback
  const displaySettings = settings ? {
    background_color: settings.background_color || '#7C3AED',
    text_color: settings.text_color || '#FFFFFF',
    link_color: settings.link_color || '#FFFFFF',
    link_hover_color: settings.link_hover_color || '#FF6B35',
    copyright_text: settings.copyright_text || `${currentYear} tagit. All rights reserved.`,
    legal_links: settings.legal_links || [
      { label: 'Legal Notice', href: '#legal' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms', href: '#terms' }
    ],
    layout_columns: settings.layout_columns || 4
  } : {
    background_color: '#7C3AED',
    text_color: '#FFFFFF',
    link_color: '#FFFFFF',
    link_hover_color: '#FF6B35',
    copyright_text: `${currentYear} tagit. All rights reserved.`,
    legal_links: [
      { label: 'Legal Notice', href: '#legal' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms', href: '#terms' }
    ],
    layout_columns: 4
  };

  const gridCols = getGridCols(displaySettings.layout_columns || 4);

  // Determine if we should use DB data or static fallback
  const useDbData = sections.length > 0;

  // Handle smooth scroll for anchor links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer
      className="border-t border-border"
      style={{
        backgroundColor: displaySettings.background_color,
        color: displaySettings.text_color
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className={`grid ${gridCols} gap-8 md:gap-12`}>
          {useDbData ? (
            // Display dynamic data from DB
            sections.map((section) => {
              if (section.section_key === 'brand') {
                return (
                  <div key={section.id} className="space-y-4">
                    <img src={logo} alt="tagit Logo" className="h-10 w-auto" />
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: displaySettings.text_color + 'CC' }}
                    >
                      {section.content?.tagline || 'Your digital marketing agency in Morocco. We transform your ideas into digital success.'}
                    </p>
                  </div>
                );
              }

              if (section.section_key === 'navigation' || section.section_key === 'services') {
                return (
                  <div key={section.id}>
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: displaySettings.link_hover_color }}
                    >
                      {section.section_title}
                    </h3>
                    <ul className="space-y-2">
                      {section.content?.links?.map((link: any, index: number) => (
                        <li key={index}>
                          <a
                            href={link.href || '#'}
                            onClick={(e) => handleLinkClick(e, link.href || '#')}
                            className="text-sm transition-colors"
                            style={{
                              color: displaySettings.text_color + 'CC',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = displaySettings.link_hover_color;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = displaySettings.text_color + 'CC';
                            }}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (section.section_key === 'contact') {
                return (
                  <div key={section.id}>
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: displaySettings.link_hover_color }}
                    >
                      {section.section_title}
                    </h3>
                    <ul className="space-y-3">
                      {section.content?.items?.map((item: any, index: number) => {
                        const IconComponent = getIcon(item.icon);
                        const href = item.type === 'email'
                          ? `mailto:${item.value}`
                          : item.type === 'phone'
                          ? `tel:${item.value.replace(/\s/g, '')}`
                          : undefined;

                        return (
                          <li key={index} className="flex items-start gap-2 text-sm" style={{ color: displaySettings.text_color + 'CC' }}>
                            <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {href ? (
                              <a
                                href={href}
                                className="transition-colors"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = displaySettings.link_hover_color;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = displaySettings.text_color + 'CC';
                                }}
                              >
                                {item.value}
                              </a>
                            ) : (
                              <span>{item.value}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }

              if (section.section_key === 'text') {
                return (
                  <div key={section.id}>
                    {section.section_title && (
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: displaySettings.link_hover_color }}
                      >
                        {section.section_title}
                      </h3>
                    )}
                    <p
                      className="text-sm whitespace-pre-line"
                      style={{ color: displaySettings.text_color + 'CC' }}
                    >
                      {section.content?.text || ''}
                    </p>
                  </div>
                );
              }

              if (section.section_key === 'social') {
                return (
                  <div key={section.id}>
                    {section.section_title && (
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: displaySettings.link_hover_color }}
                      >
                        {section.section_title}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {section.content?.links?.map((link: any, index: number) => (
                        <li key={index}>
                          <a
                            href={link.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm transition-colors"
                            style={{
                              color: displaySettings.text_color + 'CC',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = displaySettings.link_hover_color;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = displaySettings.text_color + 'CC';
                            }}
                          >
                            {link.platform || link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (section.section_key === 'custom' || section.section_key.startsWith('custom-')) {
                return (
                  <div
                    key={section.id}
                    dangerouslySetInnerHTML={{ __html: section.content?.html || '' }}
                    style={{ color: displaySettings.text_color }}
                    className="text-sm"
                  />
                );
              }

              // Generic section fallback
              return (
                <div key={section.id}>
                  {section.section_title && (
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: displaySettings.link_hover_color }}
                    >
                      {section.section_title}
                    </h3>
                  )}
                  <div
                    className="text-sm"
                    style={{ color: displaySettings.text_color + 'CC' }}
                  >
                    {JSON.stringify(section.content)}
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback to static content (DB is empty or error)
            <>
          <div className="space-y-4">
            <img src={logo} alt="tagit Logo" className="h-10 w-auto" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              Your digital marketing agency in Morocco. We transform your ideas into digital success.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#main-content"
                      onClick={(e) => handleLinkClick(e, '#main-content')}
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                      onClick={(e) => handleLinkClick(e, '#about')}
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#services"
                      onClick={(e) => handleLinkClick(e, '#services')}
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                      onClick={(e) => handleLinkClick(e, '#contact')}
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Services</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>Digital Marketing</li>
              <li>Branding & Brand Content</li>
              <li>Social Media Management</li>
              <li>Content Creation</li>
              <li>Web Design & UI/UX</li>
              <li>Visual Design</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-foreground/80">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <a href="mailto:contact@tagit.ma" className="hover:text-accent transition-colors">
                  contact@tagit.ma
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/80">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <a href="tel:+212600000000" className="hover:text-accent transition-colors">
                  +212 6 00 00 00 00
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Morocco</span>
              </li>
            </ul>
          </div>
            </>
          )}
        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: displaySettings.text_color + '33' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: displaySettings.text_color + '99' }}>
              {displaySettings.copyright_text || `${currentYear} tagit. All rights reserved.`}
            </p>
            <div className="flex gap-6 text-sm" style={{ color: displaySettings.text_color + '99' }}>
              {displaySettings.legal_links?.map((link, index) => (
                <a
                  key={index}
                  href={link.href || '#'}
                  onClick={(e) => handleLinkClick(e, link.href || '#')}
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = displaySettings.link_hover_color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = displaySettings.text_color + '99';
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
