export interface FacebookPixelConfig {
  pixel_id: string;
  track_page_view: boolean;
  track_view_content: boolean;
  track_lead: boolean;
  track_contact: boolean;
  advanced_matching: boolean;
  test_mode: boolean;
}

export interface SiteIntegration {
  id: string;
  integration_type: string;
  is_enabled: boolean;
  config: FacebookPixelConfig | Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CookieConsentSettings {
  id: string;
  banner_title: string;
  banner_message: string;
  accept_button_text: string;
  decline_button_text: string;
  manage_button_text: string;
  is_enabled: boolean;
  consent_expiry_days: number;
  created_at: string;
  updated_at: string;
}

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}
