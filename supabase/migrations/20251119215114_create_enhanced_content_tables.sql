/*
  # Enhanced Content Management Tables

  1. New Tables
    - `hero_content` - Hero section with all editable fields
    - `about_content` - About section configuration
    - `services_header` - Services section header
    - `projects_header` - Projects section header
    - `team_header` - Team section header
  
  2. Security
    - Enable RLS on all tables
    - Allow public read access
    - Allow all operations for admin
*/

-- Hero Section Content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT NOT NULL DEFAULT 'Digital marketing,',
  heading_line1_color TEXT DEFAULT '#FF6B35',
  heading_line2 TEXT NOT NULL DEFAULT 'Branding, Content',
  heading_line2_color TEXT DEFAULT '#FFFFFF',
  subheading TEXT NOT NULL DEFAULT 'Every brand has a story to tell.',
  description TEXT NOT NULL DEFAULT 'Ours is to help yours shine with ideas that make an impact, a strategy that inspires, and results that last.',
  background_color TEXT DEFAULT '#2D1B4E',
  background_image TEXT,
  hero_image TEXT,
  button1_text TEXT DEFAULT 'What we offer',
  button1_url TEXT DEFAULT '#services',
  button1_bg_color TEXT DEFAULT '#FF6B35',
  button1_text_color TEXT DEFAULT '#FFFFFF',
  button2_text TEXT DEFAULT 'About Us',
  button2_url TEXT DEFAULT '#about',
  button2_style TEXT DEFAULT 'outline',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- About Section Content
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT NOT NULL DEFAULT 'Step inside',
  heading_line2 TEXT NOT NULL DEFAULT 'Our World',
  subheading TEXT NOT NULL DEFAULT 'Digital Agency - Web',
  subheading_accent TEXT DEFAULT 'Web',
  description_p1 TEXT NOT NULL DEFAULT 'We design digital experiences that make brands shine.',
  description_p2 TEXT NOT NULL DEFAULT 'We would love to collaborate with you.',
  left_image TEXT,
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#2D1B4E',
  accent_color TEXT DEFAULT '#FF6B35',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services Section Header
CREATE TABLE IF NOT EXISTS services_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT DEFAULT 'Smart ideas',
  heading_line2 TEXT DEFAULT 'Real growth',
  description TEXT DEFAULT 'Thanks to our results-driven approach, digital becomes much more than just a tool: a powerful growth engine.',
  button_text TEXT DEFAULT 'See Our Work',
  button_url TEXT DEFAULT '#contact',
  background_image TEXT,
  background_color TEXT DEFAULT '#7C3AED',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects Section Header
CREATE TABLE IF NOT EXISTS projects_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT DEFAULT 'Our bold projects',
  description_p1 TEXT DEFAULT 'chaque projet est une aventure audacieuse. Nous ne nous contentons pas de suivre les tendances : nous les créons.',
  description_p2 TEXT DEFAULT 'Avec nos projets audacieux, le digital devient bien plus qu''un outil : il devient un véritable moteur de croissance et d''opportunités.',
  button_text TEXT DEFAULT 'view projects',
  button_url TEXT DEFAULT '/projects',
  background_color TEXT DEFAULT '#F3F4F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Section Header
CREATE TABLE IF NOT EXISTS team_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT DEFAULT 'Our Team',
  description TEXT DEFAULT 'Une équipe passionnée, créative et engagée.',
  background_color TEXT DEFAULT '#7C3AED',
  background_gradient TEXT DEFAULT 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_header ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read hero_content" ON hero_content;
DROP POLICY IF EXISTS "Allow all operations hero_content" ON hero_content;
DROP POLICY IF EXISTS "Allow public read about_content" ON about_content;
DROP POLICY IF EXISTS "Allow all operations about_content" ON about_content;
DROP POLICY IF EXISTS "Allow public read services_header" ON services_header;
DROP POLICY IF EXISTS "Allow all operations services_header" ON services_header;
DROP POLICY IF EXISTS "Allow public read projects_header" ON projects_header;
DROP POLICY IF EXISTS "Allow all operations projects_header" ON projects_header;
DROP POLICY IF EXISTS "Allow public read team_header" ON team_header;
DROP POLICY IF EXISTS "Allow all operations team_header" ON team_header;

-- Create policies
CREATE POLICY "Allow public read hero_content" ON hero_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations hero_content" ON hero_content FOR ALL USING (true);

CREATE POLICY "Allow public read about_content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations about_content" ON about_content FOR ALL USING (true);

CREATE POLICY "Allow public read services_header" ON services_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations services_header" ON services_header FOR ALL USING (true);

CREATE POLICY "Allow public read projects_header" ON projects_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations projects_header" ON projects_header FOR ALL USING (true);

CREATE POLICY "Allow public read team_header" ON team_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations team_header" ON team_header FOR ALL USING (true);

-- Insert default data
INSERT INTO hero_content (heading_line1, heading_line2, subheading, description) VALUES
('Digital marketing,', 'Branding, Content', 'Every brand has a story to tell.', 'Ours is to help yours shine with ideas that make an impact, a strategy that inspires, and results that last.')
ON CONFLICT DO NOTHING;

INSERT INTO about_content (heading_line1, heading_line2, subheading, description_p1, description_p2) VALUES
('Step inside', 'Our World', 'Digital Agency - Web', 
'We design digital experiences that make brands shine. Guided by strategy, driven by creativity and powered by digital, we create content and stories that inspire, dare and leave a lasting impression, while generating real impact.',
'We would love to collaborate with you, imagine together projects that make a difference and give your brand the visibility and impact it deserves.')
ON CONFLICT DO NOTHING;

INSERT INTO services_header (heading_line1, heading_line2, description) VALUES
('Smart ideas', 'Real growth', 'Thanks to our results-driven approach, digital becomes much more than just a tool: a powerful growth engine.')
ON CONFLICT DO NOTHING;

INSERT INTO projects_header (heading, description_p1, description_p2) VALUES
('Our bold projects',
'chaque projet est une aventure audacieuse. Nous ne nous contentons pas de suivre les tendances : nous les créons. Nos projets allient créativité, innovation et stratégie pour transformer les idées en résultats concrets. Chaque initiative est pensée pour repousser les limites, surprendre, et générer une réelle valeur pour nos clients.',
'Avec nos projets audacieux, le digital devient bien plus qu''un outil : il devient un véritable moteur de croissance et d''opportunités.')
ON CONFLICT DO NOTHING;

INSERT INTO team_header (heading, description) VALUES
('Our Team',
'Une équipe passionnée, créative et engagée. Chacun de nos membres apporte son expertise unique pour transformer les idées en projets concrets et performants. Ensemble, nous unissons nos compétences pour offrir des solutions innovantes, orientées résultats, et accompagner nos clients vers le succès.')
ON CONFLICT DO NOTHING;
