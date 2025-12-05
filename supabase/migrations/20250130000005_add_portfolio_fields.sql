-- Add portfolio-specific fields to pages table
-- Used for pages with template_type = 'portfolio'

-- Portfolio Section Settings
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_title_line1 TEXT DEFAULT 'Our bold';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_title_line2 TEXT DEFAULT 'projects';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_title_line1_color TEXT DEFAULT '#FF6B35';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_title_line2_color TEXT DEFAULT '#7C3AED';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_items_per_page INTEGER DEFAULT 4;

-- Update existing pages default values
UPDATE pages SET 
  portfolio_title_line1 = 'Our bold',
  portfolio_title_line2 = 'projects',
  portfolio_title_line1_color = '#FF6B35',
  portfolio_title_line2_color = '#7C3AED',
  portfolio_items_per_page = 4
WHERE portfolio_title_line1 IS NULL;

-- Add comment
COMMENT ON COLUMN pages.portfolio_title_line1 IS 'First line of portfolio section title';
COMMENT ON COLUMN pages.portfolio_title_line2 IS 'Second line of portfolio section title';
COMMENT ON COLUMN pages.portfolio_title_line1_color IS 'Color for first line of portfolio title';
COMMENT ON COLUMN pages.portfolio_title_line2_color IS 'Color for second line of portfolio title';
COMMENT ON COLUMN pages.portfolio_items_per_page IS 'Number of items per page in portfolio carousel';

