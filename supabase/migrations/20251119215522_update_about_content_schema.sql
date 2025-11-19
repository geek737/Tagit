/*
  # Update About Content Schema

  1. Schema Changes
    - Update `about_content` table to match EnhancedAboutEditor structure
    - Add new columns for granular color control
    - Add robot image fields
    - Maintain backward compatibility with existing data
  
  2. New Columns
    - `heading_line1_color` - Color for first heading line
    - `heading_line2_part1` - Bold part of second heading line
    - `heading_line2_part2` - Normal weight part of second heading line
    - `heading_color` - Color for second heading line
    - `subtitle` - Main subtitle text
    - `subtitle_highlight` - Highlighted part of subtitle
    - `subtitle_color` - Subtitle main color
    - `subtitle_highlight_color` - Subtitle highlight color
    - `paragraph1` - First paragraph content
    - `paragraph2` - Second paragraph content
    - `robot_image` - Base64 or URL for robot image
    - `robot_alt_text` - Alt text for robot image
  
  3. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Heading line 1 color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'heading_line1_color'
  ) THEN
    ALTER TABLE about_content ADD COLUMN heading_line1_color text DEFAULT '#7C3AED';
  END IF;

  -- Heading line 2 parts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'heading_line2_part1'
  ) THEN
    ALTER TABLE about_content ADD COLUMN heading_line2_part1 text DEFAULT 'Our ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'heading_line2_part2'
  ) THEN
    ALTER TABLE about_content ADD COLUMN heading_line2_part2 text DEFAULT 'World';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'heading_color'
  ) THEN
    ALTER TABLE about_content ADD COLUMN heading_color text DEFAULT '#7C3AED';
  END IF;

  -- Subtitle fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE about_content ADD COLUMN subtitle text DEFAULT 'Digital Agency - ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'subtitle_highlight'
  ) THEN
    ALTER TABLE about_content ADD COLUMN subtitle_highlight text DEFAULT 'Web';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'subtitle_color'
  ) THEN
    ALTER TABLE about_content ADD COLUMN subtitle_color text DEFAULT '#000000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'subtitle_highlight_color'
  ) THEN
    ALTER TABLE about_content ADD COLUMN subtitle_highlight_color text DEFAULT '#FF6B35';
  END IF;

  -- Paragraph fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'paragraph1'
  ) THEN
    ALTER TABLE about_content ADD COLUMN paragraph1 text DEFAULT 'We design digital experiences that make brands shine. Guided by strategy, driven by creativity and powered by digital, we create content and stories that inspire, dare and leave a lasting impression, while generating real impact.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'paragraph2'
  ) THEN
    ALTER TABLE about_content ADD COLUMN paragraph2 text DEFAULT 'We would love to collaborate with you, imagine together projects that make a difference and give your brand the visibility and impact it deserves.';
  END IF;

  -- Robot image fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'robot_image'
  ) THEN
    ALTER TABLE about_content ADD COLUMN robot_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_content' AND column_name = 'robot_alt_text'
  ) THEN
    ALTER TABLE about_content ADD COLUMN robot_alt_text text DEFAULT 'Robot 3D orange et violet représentant l''innovation de l''agence tagit';
  END IF;
END $$;

-- Update existing row if it exists, otherwise insert default
INSERT INTO about_content (
  heading_line1,
  heading_line1_color,
  heading_line2_part1,
  heading_line2_part2,
  heading_color,
  subtitle,
  subtitle_highlight,
  subtitle_color,
  subtitle_highlight_color,
  paragraph1,
  paragraph2,
  robot_alt_text,
  background_color,
  text_color
)
SELECT
  'Step inside',
  '#7C3AED',
  'Our ',
  'World',
  '#7C3AED',
  'Digital Agency - ',
  'Web',
  '#000000',
  '#FF6B35',
  'We design digital experiences that make brands shine. Guided by strategy, driven by creativity and powered by digital, we create content and stories that inspire, dare and leave a lasting impression, while generating real impact.',
  'We would love to collaborate with you, imagine together projects that make a difference and give your brand the visibility and impact it deserves.',
  'Robot 3D orange et violet représentant l''innovation de l''agence tagit',
  '#FFFFFF',
  '#000000'
WHERE NOT EXISTS (SELECT 1 FROM about_content LIMIT 1);
