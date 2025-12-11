/*
  # Site Integrations and Cookie Consent Schema

  1. New Tables
    - `site_integrations`
      - `id` (uuid, primary key)
      - `integration_type` (text) - Type of integration (facebook_pixel, google_analytics, etc.)
      - `is_enabled` (boolean) - Whether the integration is active
      - `config` (jsonb) - Configuration object containing integration-specific settings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cookie_consent_settings`
      - `id` (uuid, primary key)
      - `banner_title` (text) - Cookie banner title
      - `banner_message` (text) - Cookie banner message
      - `accept_button_text` (text)
      - `decline_button_text` (text)
      - `manage_button_text` (text)
      - `is_enabled` (boolean) - Whether cookie banner is shown
      - `consent_expiry_days` (integer) - Days until consent expires
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access for frontend to load configurations
    - Authenticated users can modify settings

  3. Notes
    - Facebook Pixel config stored in site_integrations.config as JSON:
      {
        "pixel_id": "string",
        "track_page_view": boolean,
        "track_view_content": boolean,
        "track_lead": boolean,
        "track_contact": boolean,
        "advanced_matching": boolean,
        "test_mode": boolean
      }
*/

-- Create site_integrations table
CREATE TABLE IF NOT EXISTS site_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cookie_consent_settings table
CREATE TABLE IF NOT EXISTS cookie_consent_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_title text DEFAULT 'Cookies',
  banner_message text DEFAULT 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
  accept_button_text text DEFAULT 'Accepter',
  decline_button_text text DEFAULT 'Refuser',
  manage_button_text text DEFAULT 'Gérer les préférences',
  is_enabled boolean DEFAULT true,
  consent_expiry_days integer DEFAULT 365,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_consent_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_integrations
CREATE POLICY "Public can read site integrations"
  ON site_integrations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert site integrations"
  ON site_integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site integrations"
  ON site_integrations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site integrations"
  ON site_integrations
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for cookie_consent_settings
CREATE POLICY "Public can read cookie consent settings"
  ON cookie_consent_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cookie consent settings"
  ON cookie_consent_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cookie consent settings"
  ON cookie_consent_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cookie consent settings"
  ON cookie_consent_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default Facebook Pixel configuration
INSERT INTO site_integrations (integration_type, is_enabled, config)
VALUES (
  'facebook_pixel',
  false,
  '{
    "pixel_id": "",
    "track_page_view": true,
    "track_view_content": true,
    "track_lead": true,
    "track_contact": true,
    "advanced_matching": false,
    "test_mode": false
  }'::jsonb
)
ON CONFLICT (integration_type) DO NOTHING;

-- Insert default cookie consent settings
INSERT INTO cookie_consent_settings (banner_title, banner_message, is_enabled)
SELECT 'Cookies', 'Nous utilisons des cookies pour améliorer votre expérience sur notre site et pour analyser le trafic.', true
WHERE NOT EXISTS (SELECT 1 FROM cookie_consent_settings LIMIT 1);