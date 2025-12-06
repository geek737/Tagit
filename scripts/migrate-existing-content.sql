/*
  Migration Script: Import Existing Website Content

  This script populates the database with all existing content from the website,
  including services, projects, team members, and testimonials.
*/

-- Insert Services (based on existing website icons and content)
INSERT INTO services (title, description, icon_url, display_order, is_visible) VALUES
  ('Web Design', 'Creating beautiful and functional websites tailored to your brand', '/client/src/assets/icon-website.png', 1, true),
  ('Branding', 'Developing unique brand identities that resonate with your audience', '/client/src/assets/icon-branding.png', 2, true),
  ('Content Creation', 'Crafting compelling content that engages and converts', '/client/src/assets/icon-content.png', 3, true),
  ('Graphic Design', 'Designing stunning visuals that capture attention', '/client/src/assets/icon-design.png', 4, true),
  ('Digital Marketing', 'Strategic marketing campaigns that drive results', '/client/src/assets/icon-marketing.png', 5, true),
  ('Social Media', 'Managing your social presence and growing your community', '/client/src/assets/icon-social-media.png', 6, true)
ON CONFLICT DO NOTHING;

-- Insert Projects (based on existing website project images)
INSERT INTO projects (title, description, image_url, category, display_order, is_visible) VALUES
  ('Moujda Project', 'A comprehensive branding and web design project showcasing modern aesthetics', '/client/src/assets/project-moujda.png', 'Branding & Web Design', 1, true),
  ('Blendimmo', 'Real estate platform with seamless user experience and modern design', '/client/src/assets/project-blendimmo.png', 'Web Development', 2, true),
  ('Promotional Campaign', 'Creative promotional materials and digital marketing campaign', '/client/src/assets/project-promotion.png', 'Marketing & Design', 3, true)
ON CONFLICT DO NOTHING;

-- Insert Team Members (placeholders - you'll need to update with actual team info)
INSERT INTO team_members (name, role, image_url, skills, display_order, is_visible) VALUES
  ('Creative Director', 'Lead Designer', '/client/src/assets/image.png', ARRAY['UI/UX', 'Branding', 'Strategy'], 1, true),
  ('Marketing Specialist', 'Digital Marketing', '/client/src/assets/image copy.png', ARRAY['SEO', 'Social Media', 'Analytics'], 2, true),
  ('Web Developer', 'Full Stack Developer', '/client/src/assets/image copy copy.png', ARRAY['React', 'Node.js', 'TypeScript'], 3, true)
ON CONFLICT DO NOTHING;

-- Insert Sample Testimonials
INSERT INTO testimonials (author_name, author_role, author_company, content, rating, display_order, is_visible) VALUES
  ('Sarah Johnson', 'CEO', 'TechStart Inc', 'Working with Tagit was an amazing experience. They transformed our brand identity and delivered beyond expectations.', 5, 1, true),
  ('Michael Chen', 'Marketing Director', 'Growth Co', 'Their attention to detail and creative approach helped us achieve a 200% increase in engagement. Highly recommended!', 5, 2, true),
  ('Emma Williams', 'Founder', 'Creative Studio', 'Professional, creative, and results-driven. The team at Tagit truly understands modern design and marketing.', 5, 3, true)
ON CONFLICT DO NOTHING;

-- Import all existing images to media library
INSERT INTO media_library (filename, url, file_type, category, section_name, alt_text) VALUES
  ('logo-tagit.png', '/client/src/assets/logo-tagit.png', 'image/png', 'logo', 'header', 'Tagit Logo'),
  ('hero-handshake-3d.png', '/client/src/assets/hero-handshake-3d.png', 'image/png', 'hero', 'hero', 'Hero Handshake 3D'),
  ('icon-website.png', '/client/src/assets/icon-website.png', 'image/png', 'icon', 'services', 'Website Icon'),
  ('icon-branding.png', '/client/src/assets/icon-branding.png', 'image/png', 'icon', 'services', 'Branding Icon'),
  ('icon-content.png', '/client/src/assets/icon-content.png', 'image/png', 'icon', 'services', 'Content Icon'),
  ('icon-design.png', '/client/src/assets/icon-design.png', 'image/png', 'icon', 'services', 'Design Icon'),
  ('icon-marketing.png', '/client/src/assets/icon-marketing.png', 'image/png', 'icon', 'services', 'Marketing Icon'),
  ('icon-social-media.png', '/client/src/assets/icon-social-media.png', 'image/png', 'icon', 'services', 'Social Media Icon'),
  ('project-moujda.png', '/client/src/assets/project-moujda.png', 'image/png', 'project', 'projects', 'Moujda Project'),
  ('project-blendimmo.png', '/client/src/assets/project-blendimmo.png', 'image/png', 'project', 'projects', 'Blendimmo Project'),
  ('project-promotion.png', '/client/src/assets/project-promotion.png', 'image/png', 'project', 'projects', 'Promotion Project'),
  ('image.png', '/client/src/assets/image.png', 'image/png', 'team', 'team', 'Team Member 1'),
  ('image-copy.png', '/client/src/assets/image copy.png', 'image/png', 'team', 'team', 'Team Member 2'),
  ('image-copy-2.png', '/client/src/assets/image copy copy.png', 'image/png', 'team', 'team', 'Team Member 3'),
  ('robot-3d-orange.png', '/client/src/assets/robot-3d-orange.png', 'image/png', 'general', 'about', 'Robot 3D Orange'),
  ('services-background.png', '/client/src/assets/services-background.png', 'image/png', 'background', 'services', 'Services Background')
ON CONFLICT DO NOTHING;

-- Update sections with background images where applicable
UPDATE sections SET background_image = '/client/src/assets/services-background.png' WHERE name = 'services';

-- Verify data insertion
SELECT 'Services Count: ' || COUNT(*)::text FROM services;
SELECT 'Projects Count: ' || COUNT(*)::text FROM projects;
SELECT 'Team Members Count: ' || COUNT(*)::text FROM team_members;
SELECT 'Testimonials Count: ' || COUNT(*)::text FROM testimonials;
SELECT 'Media Library Count: ' || COUNT(*)::text FROM media_library;
