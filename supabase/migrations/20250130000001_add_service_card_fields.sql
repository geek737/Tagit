/*
  # Service Card Fields for "Autres Services" Section
  
  This migration adds fields to customize how each service page appears 
  in the "Autres Services" section on other pages.
*/

-- Add service card display fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS service_icon TEXT; -- Icon image URL
ALTER TABLE pages ADD COLUMN IF NOT EXISTS service_short_description TEXT; -- Short description for card
ALTER TABLE pages ADD COLUMN IF NOT EXISTS service_title_color TEXT DEFAULT '#FF6B35';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS service_description_color TEXT DEFAULT '#6b7280';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS service_button_color TEXT DEFAULT '#FF6B35';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS service_display_order INTEGER DEFAULT 0;

-- Update existing pages with sensible defaults
UPDATE pages SET
  service_title_color = COALESCE(service_title_color, '#FF6B35'),
  service_description_color = COALESCE(service_description_color, '#6b7280'),
  service_button_color = COALESCE(service_button_color, '#FF6B35'),
  service_display_order = COALESCE(service_display_order, 0)
WHERE template_type = 'service';

