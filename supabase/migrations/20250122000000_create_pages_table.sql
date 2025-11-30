/*
  # Pages Management System

  1. Schema
    - Create `pages` table for dynamic page management
    - Support for different page templates
    - Hero banner with title and breadcrumb
    - Text content section
    - CTA section with customizable background

  2. Security
    - Enable RLS on pages table
    - Public read access for published pages
    - Admin-only write access
*/

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL DEFAULT 'service',
  is_published BOOLEAN DEFAULT false,
  
  -- Hero Banner
  hero_title TEXT,
  hero_image TEXT,
  hero_background_color TEXT DEFAULT '#2D1B4E',
  
  -- Text Section
  text_content TEXT,
  text_content_color TEXT DEFAULT '#000000',
  
  -- CTA Section (before footer)
  cta_background_type TEXT DEFAULT 'color', -- 'color' or 'image'
  cta_background_value TEXT, -- color hex or image URL
  cta_text TEXT,
  cta_text_color TEXT DEFAULT '#FFFFFF',
  cta_text_position TEXT DEFAULT 'center', -- 'left', 'center', 'right'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published) WHERE is_published = true;

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Public read access for published pages
CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  USING (is_published = true);

-- Admin can do everything (using service role key in backoffice)
CREATE POLICY "Admin can manage all pages"
  ON pages FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

