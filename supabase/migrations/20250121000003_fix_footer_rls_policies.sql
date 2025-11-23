-- Ensure public read policies exist for footer tables
-- Drop existing policies if they exist and recreate them

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read footer_sections" ON footer_sections;
DROP POLICY IF EXISTS "Allow public read footer_settings" ON footer_settings;
DROP POLICY IF EXISTS "Admin full access to footer_sections" ON footer_sections;
DROP POLICY IF EXISTS "Admin full access to footer_settings" ON footer_settings;

-- Create public read policies (for anonymous users)
CREATE POLICY "Allow public read footer_sections" 
  ON footer_sections 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read footer_settings" 
  ON footer_settings 
  FOR SELECT 
  USING (true);

-- Create admin policies (for authenticated users)
CREATE POLICY "Admin full access to footer_sections"
  ON footer_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to footer_settings"
  ON footer_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

