/*
  # Add Google Maps Integration to Contact Section

  1. New Columns in `contact_header`
    - `map_enabled` (boolean) - Toggle to show/hide the map
    - `map_latitude` (decimal) - Latitude coordinate for map center
    - `map_longitude` (decimal) - Longitude coordinate for map center
    - `map_zoom` (integer) - Zoom level (1-20)
    - `map_address` (text) - Display address text
    - `map_style` (text) - Map style (roadmap, satellite, hybrid, terrain)
    - `map_height` (text) - Height of the map container
    - `map_marker_title` (text) - Title shown on map marker hover

  2. Security
    - Existing RLS policies on contact_header will apply
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_enabled'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_latitude'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_latitude decimal(10, 7) DEFAULT 33.5731;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_longitude'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_longitude decimal(10, 7) DEFAULT -7.5898;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_zoom'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_zoom integer DEFAULT 15;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_address'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_address text DEFAULT 'Casablanca, Morocco';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_style'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_style text DEFAULT 'roadmap';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_height'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_height text DEFAULT '300px';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_marker_title'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_marker_title text DEFAULT 'Our Location';
  END IF;
END $$;