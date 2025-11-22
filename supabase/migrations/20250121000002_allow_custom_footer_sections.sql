-- Remove UNIQUE constraint from section_key to allow multiple custom sections
-- But keep it for existing predefined sections
ALTER TABLE footer_sections DROP CONSTRAINT IF EXISTS footer_sections_section_key_key;

-- Add a unique constraint on (section_key, id) to prevent exact duplicates
-- But allow multiple sections with similar keys (e.g., custom-1, custom-2)
-- Actually, we don't need this - we just removed the unique constraint
-- Multiple sections can have the same section_key if needed, but we'll use unique keys in the app


