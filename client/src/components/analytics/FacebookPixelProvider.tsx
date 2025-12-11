import { createContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import type { FacebookPixelConfig, SiteIntegration } from '@/types/integrations';

interface FacebookPixelContextType {
  isLoaded: boolean;
  isEnabled: boolean;
  trackEvent: (event: string, params?: Record<string, unknown>) => void;
  trackPageView: () => void;
  trackViewContent: (params: { content_name?: string; content_category?: string; content_ids?: string[]; value?: number; currency?: string }) => void;
  trackLead: (params?: { content_name?: string; value?: number; currency?: string }) => void;
  trackContact: () => void;
}

export const FacebookPixelContext = createContext<FacebookPixelContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function FacebookPixelProvider({ children }: Props) {
  const [config, setConfig] = useState<FacebookPixelConfig | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { hasAnalyticsConsent } = useCookieConsent();
  const [location] = useLocation();
  const prevLocationRef = useRef(location);
  const initializedRef = useRef(false);

  useEffect(() => {
    async function loadConfig() {
      const { data } = await supabase
        .from('site_integrations')
        .select('*')
        .eq('integration_type', 'facebook_pixel')
        .maybeSingle();

      if (data) {
        const integration = data as SiteIntegration;
        setConfig(integration.config as FacebookPixelConfig);
        setIsEnabled(integration.is_enabled);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    if (!config || !isEnabled || !hasAnalyticsConsent || !config.pixel_id || initializedRef.current) {
      return;
    }

    const pixelId = config.pixel_id;
    if (!pixelId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);

    initializedRef.current = true;
    setIsLoaded(true);

    if (config.track_page_view) {
      window.fbq('track', 'PageView');
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, [config, isEnabled, hasAnalyticsConsent]);

  useEffect(() => {
    if (!isLoaded || !config?.track_page_view || location === prevLocationRef.current) {
      prevLocationRef.current = location;
      return;
    }
    prevLocationRef.current = location;
    window.fbq('track', 'PageView');
  }, [location, isLoaded, config]);

  const trackEvent = useCallback((event: string, params?: Record<string, unknown>) => {
    if (!isLoaded || !window.fbq) return;
    if (params) {
      window.fbq('track', event, params);
    } else {
      window.fbq('track', event);
    }
  }, [isLoaded]);

  const trackPageView = useCallback(() => {
    if (!isLoaded || !config?.track_page_view) return;
    trackEvent('PageView');
  }, [isLoaded, config, trackEvent]);

  const trackViewContent = useCallback((params: { content_name?: string; content_category?: string; content_ids?: string[]; value?: number; currency?: string }) => {
    if (!isLoaded || !config?.track_view_content) return;
    trackEvent('ViewContent', params);
  }, [isLoaded, config, trackEvent]);

  const trackLead = useCallback((params?: { content_name?: string; value?: number; currency?: string }) => {
    if (!isLoaded || !config?.track_lead) return;
    trackEvent('Lead', params);
  }, [isLoaded, config, trackEvent]);

  const trackContact = useCallback(() => {
    if (!isLoaded || !config?.track_contact) return;
    trackEvent('Contact');
  }, [isLoaded, config, trackEvent]);

  return (
    <FacebookPixelContext.Provider
      value={{
        isLoaded,
        isEnabled,
        trackEvent,
        trackPageView,
        trackViewContent,
        trackLead,
        trackContact,
      }}
    >
      {children}
    </FacebookPixelContext.Provider>
  );
}
