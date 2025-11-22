-- Create Contact Header Table
CREATE TABLE IF NOT EXISTS contact_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT DEFAULT 'Contact',
  heading_line2 TEXT DEFAULT 'Us',
  heading_line1_color TEXT DEFAULT '#FFFFFF',
  heading_line2_color TEXT DEFAULT '#FF6B35',
  description TEXT DEFAULT 'Ready to make your brand shine? Let''s talk about your project and discover together how we can help you.',
  description_color TEXT DEFAULT '#FFFFFF',
  background_color TEXT DEFAULT '#2D1B4E',
  background_gradient TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Contact Info Table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'email',
  label TEXT NOT NULL DEFAULT 'Email',
  value TEXT NOT NULL,
  icon TEXT DEFAULT 'Mail',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_header
CREATE POLICY "Allow public read contact_header" ON contact_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations contact_header" ON contact_header FOR ALL USING (true);

-- Create policies for contact_info
CREATE POLICY "Allow public read contact_info" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Allow all operations contact_info" ON contact_info FOR ALL USING (true);

-- Insert default contact header
INSERT INTO contact_header (heading_line1, heading_line2, description) VALUES
('Contact', 'Us', 'Ready to make your brand shine? Let''s talk about your project and discover together how we can help you.')
ON CONFLICT DO NOTHING;

-- Insert default contact info
INSERT INTO contact_info (type, label, value, icon, display_order, is_visible) VALUES
('email', 'Email', 'contact@tagit.ma', 'Mail', 0, true),
('phone', 'Phone', '+212 6 00 00 00 00', 'Phone', 1, true),
('location', 'Location', 'Morocco', 'MapPin', 2, true)
ON CONFLICT DO NOTHING;

