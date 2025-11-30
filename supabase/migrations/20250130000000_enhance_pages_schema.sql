/*
  # Enhanced Pages Schema for Modern Page Templates
  
  This migration adds new fields to support the modernized page components:
  - Hero banner with gradient colors and bicolor title
  - Text section with customizable button and background
  - CTA section with background image and optional button
*/

-- Add new hero banner fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_title_highlight TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_title_rest TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_gradient_from TEXT DEFAULT '#FF6B35';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_gradient_to TEXT DEFAULT '#4C1D95';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_breadcrumb_label TEXT;

-- Add new text section fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS text_section_title TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS text_background_color TEXT DEFAULT '#f5f5f5';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS text_button_text TEXT DEFAULT 'See Our Work';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS text_button_link TEXT DEFAULT '#portfolio';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS text_show_button BOOLEAN DEFAULT true;

-- Add new CTA section fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_background_image TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_text_line2 TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_show_button BOOLEAN DEFAULT true;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_button_text TEXT DEFAULT 'Démarrer un projet';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_button_link TEXT DEFAULT '#contact';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_gradient_from TEXT DEFAULT '#3B1E6D';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_gradient_to TEXT DEFAULT '#1E3A5F';

-- Remove old cta_image column if exists (now replaced by cta_background_image)
-- ALTER TABLE pages DROP COLUMN IF EXISTS cta_image;

-- Update existing pages with sensible defaults
UPDATE pages SET
  hero_gradient_from = COALESCE(hero_gradient_from, '#FF6B35'),
  hero_gradient_to = COALESCE(hero_gradient_to, '#4C1D95'),
  text_background_color = COALESCE(text_background_color, '#f5f5f5'),
  text_button_text = COALESCE(text_button_text, 'See Our Work'),
  text_button_link = COALESCE(text_button_link, '#portfolio'),
  text_show_button = COALESCE(text_show_button, true),
  cta_show_button = COALESCE(cta_show_button, true),
  cta_button_text = COALESCE(cta_button_text, 'Démarrer un projet'),
  cta_button_link = COALESCE(cta_button_link, '#contact'),
  cta_gradient_from = COALESCE(cta_gradient_from, '#3B1E6D'),
  cta_gradient_to = COALESCE(cta_gradient_to, '#1E3A5F')
WHERE id IS NOT NULL;
