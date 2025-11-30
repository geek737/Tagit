/*
  # Add SEO Fields for Pages
  
  Adds SEO meta fields for better search engine optimization
*/

-- Add SEO fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

