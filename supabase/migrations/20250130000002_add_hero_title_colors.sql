/*
  # Add Hero Title Colors
  
  Adds customizable colors for hero title lines 1 and 2
*/

-- Add hero title color fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_title_color_1 TEXT DEFAULT '#FFFFFF';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_title_color_2 TEXT DEFAULT '#FFFFFF';

-- Update existing pages with defaults
UPDATE pages SET
  hero_title_color_1 = COALESCE(hero_title_color_1, '#FFFFFF'),
  hero_title_color_2 = COALESCE(hero_title_color_2, '#FFFFFF')
WHERE id IS NOT NULL;

