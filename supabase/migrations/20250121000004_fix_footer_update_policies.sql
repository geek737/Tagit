-- Fix RLS policies to allow UPDATE for anonymous users (backoffice uses anonymous key)
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admin full access to footer_sections" ON footer_sections;
DROP POLICY IF EXISTS "Admin full access to footer_settings" ON footer_settings;

-- Create policies that allow ALL operations (including UPDATE) for both authenticated and anonymous users
-- This is needed because the backoffice uses the anonymous Supabase key

-- For footer_sections: Allow all operations for everyone (public read already exists)
CREATE POLICY "Allow all operations footer_sections"
  ON footer_sections
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- For footer_settings: Allow all operations for everyone (public read already exists)
CREATE POLICY "Allow all operations footer_settings"
  ON footer_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

