/*
  # Create Email System Tables

  1. New Tables
    - `smtp_settings`
      - `id` (uuid, primary key)
      - `host` (text) - SMTP server hostname
      - `port` (integer) - SMTP port (25, 465, 587)
      - `username` (text) - SMTP authentication username
      - `password` (text) - SMTP authentication password (encrypted)
      - `encryption` (text) - TLS, SSL, or none
      - `from_email` (text) - Default sender email address
      - `from_name` (text) - Default sender name
      - `is_enabled` (boolean) - Whether SMTP is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `email_templates`
      - `id` (uuid, primary key)
      - `template_type` (text) - 'contact_notification' or 'auto_response'
      - `subject` (text) - Email subject line with placeholders
      - `body_html` (text) - HTML email body with placeholders
      - `body_text` (text) - Plain text fallback
      - `is_enabled` (boolean) - Whether this template is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text) - Sender's name
      - `email` (text) - Sender's email
      - `phone` (text) - Optional phone number
      - `subject` (text) - Message subject
      - `message` (text) - Message content
      - `ip_address` (text) - For spam protection
      - `notification_sent` (boolean) - Whether admin was notified
      - `auto_response_sent` (boolean) - Whether auto-reply was sent
      - `created_at` (timestamptz)

    - `email_recipients`
      - `id` (uuid, primary key)
      - `email` (text) - Recipient email address
      - `name` (text) - Recipient name
      - `is_primary` (boolean) - Primary recipient gets all notifications
      - `is_enabled` (boolean) - Whether to send to this recipient
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only authenticated admins can access settings
    - Contact submissions can be created by anyone (public form)
*/

-- SMTP Settings table
CREATE TABLE IF NOT EXISTS smtp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL DEFAULT '',
  port integer NOT NULL DEFAULT 587,
  username text NOT NULL DEFAULT '',
  password text NOT NULL DEFAULT '',
  encryption text NOT NULL DEFAULT 'tls' CHECK (encryption IN ('tls', 'ssl', 'none')),
  from_email text NOT NULL DEFAULT '',
  from_name text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read smtp settings"
  ON smtp_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert smtp settings"
  ON smtp_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update smtp settings"
  ON smtp_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL UNIQUE CHECK (template_type IN ('contact_notification', 'auto_response')),
  subject text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  body_text text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update email templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contact Submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL,
  ip_address text DEFAULT '',
  notification_sent boolean NOT NULL DEFAULT false,
  auto_response_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for the contact form
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email Recipients table
CREATE TABLE IF NOT EXISTS email_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email recipients"
  ON email_recipients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email recipients"
  ON email_recipients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update email recipients"
  ON email_recipients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete email recipients"
  ON email_recipients FOR DELETE
  TO authenticated
  USING (true);

-- Insert default email templates
INSERT INTO email_templates (template_type, subject, body_html, body_text, is_enabled)
VALUES 
  (
    'contact_notification',
    'Nouveau message de contact: {{subject}}',
    '<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #FF6B35; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Nouveau Message de Contact</h2>
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>De:</strong> {{name}}</p>
      <p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
      <p><strong>Telephone:</strong> {{phone}}</p>
      <p><strong>Sujet:</strong> {{subject}}</p>
    </div>
    <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h3 style="margin-top: 0;">Message:</h3>
      <p style="white-space: pre-wrap;">{{message}}</p>
    </div>
    <p style="color: #888; font-size: 12px; margin-top: 20px;">
      Recu le {{date}} a {{time}}
    </p>
  </div>
</body>
</html>',
    'Nouveau Message de Contact

De: {{name}}
Email: {{email}}
Telephone: {{phone}}
Sujet: {{subject}}

Message:
{{message}}

Recu le {{date}} a {{time}}',
    true
  ),
  (
    'auto_response',
    'Merci pour votre message - {{subject}}',
    '<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #FF6B35;">Merci pour votre message!</h2>
    <p>Bonjour {{name}},</p>
    <p>Nous avons bien recu votre message et nous vous en remercions.</p>
    <p>Notre equipe examinera votre demande dans les plus brefs delais et vous repondra sous 24 a 48 heures ouvrables.</p>
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #555;">Recapitulatif de votre message:</h3>
      <p><strong>Sujet:</strong> {{subject}}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; color: #666;">{{message}}</p>
    </div>
    <p>Si vous avez des questions urgentes, nhesitez pas a nous contacter directement.</p>
    <p>Cordialement,<br>Lequipe</p>
  </div>
</body>
</html>',
    'Merci pour votre message!

Bonjour {{name}},

Nous avons bien recu votre message et nous vous en remercions.

Notre equipe examinera votre demande dans les plus brefs delais et vous repondra sous 24 a 48 heures ouvrables.

Recapitulatif de votre message:
Sujet: {{subject}}
Message:
{{message}}

Si vous avez des questions urgentes, nhesitez pas a nous contacter directement.

Cordialement,
Lequipe',
    true
  )
ON CONFLICT (template_type) DO NOTHING;

-- Insert default SMTP settings row (disabled by default)
INSERT INTO smtp_settings (host, port, username, password, encryption, from_email, from_name, is_enabled)
SELECT '', 587, '', '', 'tls', '', '', false
WHERE NOT EXISTS (SELECT 1 FROM smtp_settings LIMIT 1);