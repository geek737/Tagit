-- Add layout_columns to footer_settings
ALTER TABLE footer_settings 
ADD COLUMN IF NOT EXISTS layout_columns INTEGER DEFAULT 4;

-- Update existing footer_settings to have 4 columns
UPDATE footer_settings 
SET layout_columns = 4 
WHERE layout_columns IS NULL;

-- Add public read policy for footer_sections and footer_settings
CREATE POLICY IF NOT EXISTS "Allow public read footer_sections" 
  ON footer_sections FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read footer_settings" 
  ON footer_settings FOR SELECT 
  USING (true);

