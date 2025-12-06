/*
  # Update Portfolio Child Slugs to Full Route Format
  
  ## Description
  This migration updates existing portfolio_child pages to use the full route format
  in their slug field. Previously, the slug was just the child portion, but now it
  includes the parent slug prefix for uniqueness.
  
  ## Example
  Before: slug = 'social-media-management', portfolio_parent_slug = 'portfolio'
  After:  slug = 'portfolio/social-media-management', portfolio_parent_slug = 'portfolio'
  
  This allows pages of different types to have the same base slug name since the
  full route is unique:
  - /portfolio/social-media-management (portfolio_child)
  - /social-media-management (service)
*/

-- Update portfolio_child pages to use full route in slug
UPDATE pages
SET slug = portfolio_parent_slug || '/' || slug
WHERE template_type = 'portfolio_child'
  AND portfolio_parent_slug IS NOT NULL
  AND slug NOT LIKE portfolio_parent_slug || '/%';

-- Also ensure the original unique constraint still exists for backward compatibility
-- The constraint pages_slug_key ensures each full route is unique
-- If it was dropped, recreate it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pages_slug_key' 
    AND conrelid = 'pages'::regclass
  ) THEN
    ALTER TABLE pages ADD CONSTRAINT pages_slug_key UNIQUE (slug);
  END IF;
END $$;

