-- Fix RLS policies for portfolio_projects table
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to portfolio_projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Allow authenticated users full access to portfolio_projects" ON portfolio_projects;

-- Policy for SELECT: Allow public to read visible projects
CREATE POLICY "portfolio_projects_select_policy"
  ON portfolio_projects
  FOR SELECT
  USING (is_visible = true);

-- Policy for ALL operations: Allow all operations (same pattern as other tables)
-- This allows authenticated users in the backoffice to manage projects
CREATE POLICY "portfolio_projects_all_operations"
  ON portfolio_projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

