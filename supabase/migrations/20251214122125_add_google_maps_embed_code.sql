/*
  # Add Google Maps Embed Code Field

  1. Changes to `contact_header`
    - `map_embed_code` (text) - Stores the full Google Maps embed iframe code

  2. Purpose
    - Allows administrators to paste the embed code directly from Google Maps
    - More user-friendly than entering coordinates manually
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_header' AND column_name = 'map_embed_code'
  ) THEN
    ALTER TABLE contact_header ADD COLUMN map_embed_code text DEFAULT '';
  END IF;
END $$;