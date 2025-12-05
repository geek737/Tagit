-- Add thumbnail column to media_library for faster gallery loading
-- Thumbnails are small Base64 images (150x150px, ~10-20KB) for quick preview

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_library' AND column_name = 'thumbnail'
  ) THEN
    ALTER TABLE media_library ADD COLUMN thumbnail TEXT;
  END IF;
END $$;

-- Add comment explaining the column purpose
COMMENT ON COLUMN media_library.thumbnail IS 'Small Base64 thumbnail (150x150px) for fast gallery loading. Original image remains in url column.';

