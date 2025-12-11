/*
  # Email Logs Table for Email Management System

  This migration creates a comprehensive email logging system to track all emails
  sent from the website, enabling administrators to monitor, search, and manage
  email communications.

  ## New Tables
  - `email_logs`: Stores all email send attempts with full details
    - `id` (uuid, primary key): Unique identifier
    - `recipient_email` (text): Email address of recipient
    - `recipient_name` (text): Name of recipient
    - `sender_email` (text): Email address of sender
    - `sender_name` (text): Name of sender
    - `subject` (text): Email subject line
    - `body_html` (text): HTML content of email
    - `body_text` (text): Plain text content of email
    - `email_type` (text): Category of email (contact_notification, auto_response, test, etc.)
    - `status` (text): Delivery status (pending, sent, failed)
    - `error_message` (text): Error details if failed
    - `smtp_response` (text): SMTP server response
    - `related_submission_id` (uuid): Link to contact submission if applicable
    - `metadata` (jsonb): Additional data storage
    - `is_read` (boolean): Admin read status
    - `retry_count` (integer): Number of retry attempts
    - `sent_at` (timestamptz): Actual send timestamp
    - `created_at` (timestamptz): Record creation timestamp
    - `updated_at` (timestamptz): Last update timestamp

  ## Security
  - RLS enabled with policies for anon and authenticated access
  - Indexes for common query patterns

  ## Performance
  - Indexes on status, email_type, created_at, recipient_email for fast filtering
  - Composite index for date range queries
*/

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text DEFAULT '',
  sender_email text NOT NULL,
  sender_name text DEFAULT '',
  subject text NOT NULL,
  body_html text DEFAULT '',
  body_text text DEFAULT '',
  email_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text DEFAULT '',
  smtp_response text DEFAULT '',
  related_submission_id uuid REFERENCES contact_submissions(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  retry_count integer DEFAULT 0,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read email logs"
  ON email_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert email logs"
  ON email_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update email logs"
  ON email_logs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete email logs"
  ON email_logs FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_date_range ON email_logs(created_at, status);
CREATE INDEX IF NOT EXISTS idx_email_logs_subject ON email_logs USING gin(to_tsvector('simple', subject));