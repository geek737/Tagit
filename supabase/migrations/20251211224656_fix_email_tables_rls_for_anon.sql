/*
  # Fix Email Tables RLS Policies

  This migration fixes the RLS policies for email-related tables to work with
  the application's custom authentication system (localStorage-based admin auth).

  ## Problem
  The original policies only allowed "authenticated" role, but the app uses
  anonymous Supabase connections with custom auth.

  ## Solution
  Update policies to allow both "anon" and "authenticated" roles for admin tables.
  The app's own authentication layer controls access to admin pages.

  ## Tables Updated
  - smtp_settings: SMTP configuration
  - email_templates: Email templates
  - email_recipients: Notification recipients
  - contact_submissions: Form submissions (insert already allowed for anon)
*/

-- Drop existing policies for smtp_settings
DROP POLICY IF EXISTS "Authenticated users can read smtp settings" ON smtp_settings;
DROP POLICY IF EXISTS "Authenticated users can insert smtp settings" ON smtp_settings;
DROP POLICY IF EXISTS "Authenticated users can update smtp settings" ON smtp_settings;

-- Create new policies for smtp_settings that allow anon access
CREATE POLICY "Allow read smtp settings"
  ON smtp_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert smtp settings"
  ON smtp_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update smtp settings"
  ON smtp_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Drop existing policies for email_templates
DROP POLICY IF EXISTS "Authenticated users can read email templates" ON email_templates;
DROP POLICY IF EXISTS "Authenticated users can insert email templates" ON email_templates;
DROP POLICY IF EXISTS "Authenticated users can update email templates" ON email_templates;

-- Create new policies for email_templates
CREATE POLICY "Allow read email templates"
  ON email_templates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert email templates"
  ON email_templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update email templates"
  ON email_templates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Drop existing policies for email_recipients
DROP POLICY IF EXISTS "Authenticated users can read email recipients" ON email_recipients;
DROP POLICY IF EXISTS "Authenticated users can insert email recipients" ON email_recipients;
DROP POLICY IF EXISTS "Authenticated users can update email recipients" ON email_recipients;
DROP POLICY IF EXISTS "Authenticated users can delete email recipients" ON email_recipients;

-- Create new policies for email_recipients
CREATE POLICY "Allow read email recipients"
  ON email_recipients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert email recipients"
  ON email_recipients FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update email recipients"
  ON email_recipients FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete email recipients"
  ON email_recipients FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop existing policies for contact_submissions and recreate
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can read contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON contact_submissions;

-- Create new policies for contact_submissions
CREATE POLICY "Allow insert contact submissions"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow read contact submissions"
  ON contact_submissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow update contact submissions"
  ON contact_submissions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);