import { useState, useEffect, useCallback } from 'react';
import type { CookieConsent } from '@/types/integrations';

const CONSENT_KEY = 'cookie_consent';
const CONSENT_VERSION = '1.0';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookieConsent;
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
        }
      } catch {
        localStorage.removeItem(CONSENT_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveConsent = useCallback((analytics: boolean, marketing: boolean) => {
    const newConsent: CookieConsent = {
      analytics,
      marketing,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent(true, true);
  }, [saveConsent]);

  const declineAll = useCallback(() => {
    saveConsent(false, false);
  }, [saveConsent]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent(null);
  }, []);

  const hasConsent = consent !== null;
  const hasAnalyticsConsent = consent?.analytics ?? false;
  const hasMarketingConsent = consent?.marketing ?? false;

  return {
    consent,
    isLoaded,
    hasConsent,
    hasAnalyticsConsent,
    hasMarketingConsent,
    saveConsent,
    acceptAll,
    declineAll,
    resetConsent,
  };
}
