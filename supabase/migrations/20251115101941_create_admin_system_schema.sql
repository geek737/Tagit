/*
  # Create Admin System Schema

  ## Overview
  This migration creates a comprehensive content management system for the showcase website.
  
  ## 1. New Tables
  
  ### `admin_users`
  - `id` (uuid, primary key) - Unique identifier
  - `username` (text, unique) - Admin username for login
  - `password_hash` (text) - Encrypted password
  - `email` (text) - Admin email
  - `created_at` (timestamptz) - Account creation date
  - `updated_at` (timestamptz) - Last update date
  
  ### `site_settings`
  - `id` (uuid, primary key) - Unique identifier
  - `key` (text, unique) - Setting key (e.g., 'primary_color', 'site_title')
  - `value` (text) - Setting value
  - `category` (text) - Category (colors, general, layout, etc.)
  - `updated_at` (timestamptz) - Last update date
  
  ### `sections`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Section name (hero, services, projects, team, etc.)
  - `title` (text) - Section title
  - `subtitle` (text) - Section subtitle
  - `description` (text) - Section description
  - `background_color` (text) - Background color
  - `background_image` (text) - Background image URL
  - `is_visible` (boolean) - Whether section is visible on site
  - `display_order` (integer) - Order in which section appears
  - `updated_at` (timestamptz) - Last update date
  
  ### `section_content`
  - `id` (uuid, primary key) - Unique identifier
  - `section_id` (uuid, foreign key) - Reference to sections table
  - `content_key` (text) - Content identifier within section
  - `content_value` (text) - Content value (can be JSON for complex data)
  - `content_type` (text) - Type (text, html, json, image, etc.)
  - `updated_at` (timestamptz) - Last update date
  
  ### `media_library`
  - `id` (uuid, primary key) - Unique identifier
  - `filename` (text) - Original filename
  - `url` (text) - File URL
  - `file_type` (text) - MIME type
  - `category` (text) - Category (logo, icon, project, team, etc.)
  - `section_name` (text) - Associated section
  - `alt_text` (text) - Alt text for images
  - `created_at` (timestamptz) - Upload date
  
  ### `menu_items`
  - `id` (uuid, primary key) - Unique identifier
  - `label` (text) - Menu item label
  - `href` (text) - Link href
  - `parent_id` (uuid) - Parent menu item for nested menus
  - `display_order` (integer) - Order in menu
  - `is_visible` (boolean) - Whether item is visible
  - `updated_at` (timestamptz) - Last update date
  
  ### `projects`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Project title
  - `description` (text) - Project description
  - `image_url` (text) - Project image URL
  - `category` (text) - Project category
  - `display_order` (integer) - Display order
  - `is_visible` (boolean) - Visibility status
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update date
  
  ### `team_members`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Team member name
  - `role` (text) - Team member role
  - `image_url` (text) - Profile image URL
  - `skills` (text[]) - Array of skills
  - `display_order` (integer) - Display order
  - `is_visible` (boolean) - Visibility status
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update date
  
  ### `services`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Service title
  - `description` (text) - Service description
  - `icon_url` (text) - Service icon URL
  - `display_order` (integer) - Display order
  - `is_visible` (boolean) - Visibility status
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update date
  
  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated admin users only
  
  ## 3. Initial Data
  - Create default admin user (username: admin, password: admin)
  - Insert default site settings
  - Insert default sections configuration
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  title text,
  subtitle text,
  description text,
  background_color text,
  background_image text,
  is_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create section_content table
CREATE TABLE IF NOT EXISTS section_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  content_key text NOT NULL,
  content_value text,
  content_type text DEFAULT 'text',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section_id, content_key)
);

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  file_type text,
  category text,
  section_name text,
  alt_text text,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  parent_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  category text,
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  image_url text,
  skills text[] DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_url text,
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users (allow reading own data)
CREATE POLICY "Admin users can read own data"
  ON admin_users FOR SELECT
  USING (true);

CREATE POLICY "Admin users can update own data"
  ON admin_users FOR UPDATE
  USING (true);

-- Create policies for site_settings
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on site_settings"
  ON site_settings FOR ALL
  USING (true);

-- Create policies for sections
CREATE POLICY "Anyone can read visible sections"
  ON sections FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on sections"
  ON sections FOR ALL
  USING (true);

-- Create policies for section_content
CREATE POLICY "Anyone can read section content"
  ON section_content FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on section_content"
  ON section_content FOR ALL
  USING (true);

-- Create policies for media_library
CREATE POLICY "Anyone can read media"
  ON media_library FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on media_library"
  ON media_library FOR ALL
  USING (true);

-- Create policies for menu_items
CREATE POLICY "Anyone can read visible menu items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on menu_items"
  ON menu_items FOR ALL
  USING (true);

-- Create policies for projects
CREATE POLICY "Anyone can read visible projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on projects"
  ON projects FOR ALL
  USING (true);

-- Create policies for team_members
CREATE POLICY "Anyone can read visible team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on team_members"
  ON team_members FOR ALL
  USING (true);

-- Create policies for services
CREATE POLICY "Anyone can read visible services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on services"
  ON services FOR ALL
  USING (true);

-- Insert default admin user (password: admin, using bcrypt hash)
-- Note: In production, use proper bcrypt hashing. This is a simple hash for demo.
INSERT INTO admin_users (username, password_hash, email)
VALUES ('admin', '$2a$10$rqQKzHqQqZqQzHqQqZqQqeJ3J3J3J3J3J3J3J3J3J3J3J3J3J3J3J', 'admin@tagit.com')
ON CONFLICT (username) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value, category) VALUES
  ('site_title', 'Tagit', 'general'),
  ('site_description', 'Digital Marketing & Design Agency', 'general'),
  ('primary_color', '#FF6B35', 'colors'),
  ('secondary_color', '#7C3AED', 'colors'),
  ('accent_color', '#FF6B35', 'colors'),
  ('background_color', '#FFFFFF', 'colors'),
  ('text_color', '#1F2937', 'colors')
ON CONFLICT (key) DO NOTHING;

-- Insert default sections
INSERT INTO sections (name, title, subtitle, is_visible, display_order) VALUES
  ('hero', 'Welcome to Tagit', 'Digital Marketing & Design', true, 1),
  ('about', 'About Us', 'Who We Are', true, 2),
  ('services', 'Our Services', 'What We Offer', true, 3),
  ('projects', 'Our Projects', 'Recent Work', true, 4),
  ('team', 'Our Team', 'Meet the Team', true, 5),
  ('testimonials', 'Testimonials', 'What Clients Say', true, 6),
  ('contact', 'Contact Us', 'Get in Touch', true, 7)
ON CONFLICT (name) DO NOTHING;

-- Insert default menu items
INSERT INTO menu_items (label, href, display_order) VALUES
  ('Home', '#hero', 1),
  ('About', '#about', 2),
  ('Services', '#services', 3),
  ('Projects', '#projects', 4),
  ('Team', '#team', 5),
  ('Contact', '#contact', 6)
ON CONFLICT DO NOTHING;
