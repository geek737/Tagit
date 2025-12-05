-- Create portfolio_projects table for individual project items within a portfolio child page
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Project Info
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Client & Services Info
  client_name TEXT,
  services_provided TEXT,
  
  -- Main Image (right side)
  main_image TEXT,
  
  -- Secondary Images (2-column grid below main image)
  secondary_images JSONB DEFAULT '[]'::jsonb,
  
  -- Typography Customization
  title_color TEXT DEFAULT '#1f2937',
  title_size TEXT DEFAULT 'lg', -- sm, md, lg, xl
  description_color TEXT DEFAULT '#374151',
  
  -- Metadata
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_page_id ON portfolio_projects(page_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_display_order ON portfolio_projects(display_order);

-- Enable RLS
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to portfolio_projects"
  ON portfolio_projects FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Allow authenticated users full access to portfolio_projects"
  ON portfolio_projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add portfolio_child specific fields to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_child_title TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_child_title_color TEXT DEFAULT '#FF6B35';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_child_subtitle TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_child_subtitle_color TEXT DEFAULT '#1f2937';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS portfolio_parent_slug TEXT; -- Link to parent portfolio page

-- Add comments
COMMENT ON TABLE portfolio_projects IS 'Individual projects displayed on portfolio child pages';
COMMENT ON COLUMN portfolio_projects.secondary_images IS 'JSON array of image URLs for the 2-column grid';
COMMENT ON COLUMN portfolio_projects.title_size IS 'Size options: sm, md, lg, xl';

