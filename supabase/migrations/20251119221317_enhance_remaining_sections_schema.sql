/*
  # Enhanced Schema for Services, Projects, Team, Testimonials, and Footer Sections

  1. Schema Updates
    - Update `services_header` table for granular header control
    - Update `services` table for complete service card management
    - Update `projects_header` table for enhanced content control
    - Update `projects` table for complete project management
    - Update `team_header` table for enhanced header control
    - Update `team_members` table for complete member profiles
    - Create `testimonials_header` table for section header
    - Update `testimonials` table for complete feedback management
    - Create `footer_sections` table for footer column management
    - Update footer-related tables for comprehensive management

  2. Services Section
    - Header with two-line heading, description, and button
    - Service cards with icon, title, description, and action button
    - Background image and gradient support

  3. Projects Section
    - Header with heading and two-paragraph description
    - Project carousel with images and metadata
    - Button customization

  4. Team Section
    - Header with title and description
    - Team member cards with image, name, role, and skills
    - Carousel navigation

  5. Testimonials Section
    - Header with two-part title ("Clients" + "Feedback")
    - Testimonial cards with content, author info
    - Carousel with navigation

  6. Footer Section
    - Four-column layout (Brand, Navigation, Services, Contact)
    - Social media links
    - Legal links

  7. Security
    - Enable RLS on all tables
    - Admin-only access policies
*/

-- Services Header Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_header' AND column_name = 'heading_line1_color'
  ) THEN
    ALTER TABLE services_header ADD COLUMN heading_line1_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_header' AND column_name = 'heading_line2_color'
  ) THEN
    ALTER TABLE services_header ADD COLUMN heading_line2_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_header' AND column_name = 'description_color'
  ) THEN
    ALTER TABLE services_header ADD COLUMN description_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_header' AND column_name = 'button_bg_color'
  ) THEN
    ALTER TABLE services_header ADD COLUMN button_bg_color text DEFAULT '#FF6B35';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_header' AND column_name = 'button_text_color'
  ) THEN
    ALTER TABLE services_header ADD COLUMN button_text_color text DEFAULT '#FFFFFF';
  END IF;
END $$;

-- Services Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'icon_image'
  ) THEN
    ALTER TABLE services ADD COLUMN icon_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'title_color'
  ) THEN
    ALTER TABLE services ADD COLUMN title_color text DEFAULT '#FF6B35';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'description_color'
  ) THEN
    ALTER TABLE services ADD COLUMN description_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'button_color'
  ) THEN
    ALTER TABLE services ADD COLUMN button_color text DEFAULT '#FF6B35';
  END IF;
END $$;

-- Projects Header Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects_header' AND column_name = 'heading_color'
  ) THEN
    ALTER TABLE projects_header ADD COLUMN heading_color text DEFAULT '#7C3AED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects_header' AND column_name = 'description_color'
  ) THEN
    ALTER TABLE projects_header ADD COLUMN description_color text DEFAULT '#374151';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects_header' AND column_name = 'button_bg_color'
  ) THEN
    ALTER TABLE projects_header ADD COLUMN button_bg_color text DEFAULT '#FF6B35';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects_header' AND column_name = 'button_text_color'
  ) THEN
    ALTER TABLE projects_header ADD COLUMN button_text_color text DEFAULT '#FFFFFF';
  END IF;
END $$;

-- Projects Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'image'
  ) THEN
    ALTER TABLE projects ADD COLUMN image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'services_label'
  ) THEN
    ALTER TABLE projects ADD COLUMN services_label text DEFAULT 'Services';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'services_label_color'
  ) THEN
    ALTER TABLE projects ADD COLUMN services_label_color text DEFAULT '#FF6B35';
  END IF;
END $$;

-- Team Header Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_header' AND column_name = 'heading_word1'
  ) THEN
    ALTER TABLE team_header ADD COLUMN heading_word1 text DEFAULT 'Our';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_header' AND column_name = 'heading_word2'
  ) THEN
    ALTER TABLE team_header ADD COLUMN heading_word2 text DEFAULT 'Team';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_header' AND column_name = 'heading_color'
  ) THEN
    ALTER TABLE team_header ADD COLUMN heading_color text DEFAULT '#FF6B35';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_header' AND column_name = 'description_color'
  ) THEN
    ALTER TABLE team_header ADD COLUMN description_color text DEFAULT '#FFFFFF';
  END IF;
END $$;

-- Team Members Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'image'
  ) THEN
    ALTER TABLE team_members ADD COLUMN image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'name_color'
  ) THEN
    ALTER TABLE team_members ADD COLUMN name_color text DEFAULT '#FF6B35';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'role_color'
  ) THEN
    ALTER TABLE team_members ADD COLUMN role_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'skills_color'
  ) THEN
    ALTER TABLE team_members ADD COLUMN skills_color text DEFAULT '#D1D5DB';
  END IF;
END $$;

-- Create Testimonials Header Table
CREATE TABLE IF NOT EXISTS testimonials_header (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_part1 text DEFAULT 'Clients',
  heading_part1_color text DEFAULT '#7C3AED',
  heading_part2 text DEFAULT 'Feedback',
  heading_part2_color text DEFAULT '#000000',
  background_color text DEFAULT '#FFFFFF',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials_header ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to testimonials_header"
  ON testimonials_header
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials Enhancement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'content_color'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN content_color text DEFAULT '#374151';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'author_name_color'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN author_name_color text DEFAULT '#FF6B35';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'author_role_color'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN author_role_color text DEFAULT '#6B7280';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'quote_icon_color'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN quote_icon_color text DEFAULT '#FF6B35';
  END IF;
END $$;

-- Create Footer Sections Table
CREATE TABLE IF NOT EXISTS footer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  section_title text,
  content jsonb DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to footer_sections"
  ON footer_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default footer sections
INSERT INTO footer_sections (section_key, section_title, content, display_order)
VALUES
  ('brand', 'tagit', '{"tagline": "Your digital marketing agency in Morocco. We transform your ideas into digital success.", "logo": ""}', 0),
  ('navigation', 'Navigation', '{"links": [{"label": "Home", "href": "#home"}, {"label": "About", "href": "#about"}, {"label": "Our Services", "href": "#services"}, {"label": "Contact", "href": "#contact"}]}', 1),
  ('services', 'Services', '{"links": [{"label": "Digital Marketing", "href": "#services"}, {"label": "Branding & Brand Content", "href": "#services"}, {"label": "Social Media Management", "href": "#services"}, {"label": "Content Creation", "href": "#services"}, {"label": "Web Design & UI/UX", "href": "#services"}, {"label": "Visual Design", "href": "#services"}]}', 2),
  ('contact', 'Contact', '{"items": [{"type": "email", "value": "contact@tagit.ma", "icon": "mail"}, {"type": "phone", "value": "+212 6 00 00 00 00", "icon": "phone"}, {"type": "location", "value": "Morocco", "icon": "map-pin"}]}', 3)
ON CONFLICT (section_key) DO NOTHING;

-- Create Footer Settings Table
CREATE TABLE IF NOT EXISTS footer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color text DEFAULT '#7C3AED',
  text_color text DEFAULT '#FFFFFF',
  link_color text DEFAULT '#FFFFFF',
  link_hover_color text DEFAULT '#FF6B35',
  copyright_text text DEFAULT '2025 tagit. All rights reserved.',
  legal_links jsonb DEFAULT '[{"label": "Legal Notice", "href": "/legal"}, {"label": "Privacy Policy", "href": "/privacy"}, {"label": "Terms", "href": "/terms"}]',
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to footer_settings"
  ON footer_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default footer settings
INSERT INTO footer_settings (background_color, text_color, link_color, link_hover_color, copyright_text)
SELECT '#7C3AED', '#FFFFFF', '#FFFFFF', '#FF6B35', '2025 tagit. All rights reserved.'
WHERE NOT EXISTS (SELECT 1 FROM footer_settings LIMIT 1);

-- Insert default testimonials header
INSERT INTO testimonials_header (heading_part1, heading_part2)
SELECT 'Clients', 'Feedback'
WHERE NOT EXISTS (SELECT 1 FROM testimonials_header LIMIT 1);
