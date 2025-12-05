-- Migration to update existing portfolio_child pages for new routing structure
-- This ensures existing pages work with the new /:parentSlug/:childSlug routing

-- Step 1: Update pages where slug contains a slash (already has parent prefix)
-- Example: "portfolio/branding" -> extract "branding" as slug, set parent to "portfolio"
UPDATE pages
SET 
  slug = SPLIT_PART(slug, '/', 2),  -- Extract child part after slash
  portfolio_parent_slug = COALESCE(portfolio_parent_slug, SPLIT_PART(slug, '/', 1))  -- Extract parent part before slash
WHERE 
  template_type = 'portfolio_child'
  AND slug LIKE '%/%'
  AND portfolio_parent_slug IS NULL;

-- Step 2: Set default parent slug for portfolio_child pages that don't have one
UPDATE pages
SET 
  portfolio_parent_slug = 'portfolio'
WHERE 
  template_type = 'portfolio_child'
  AND (portfolio_parent_slug IS NULL OR portfolio_parent_slug = '');

-- Step 3: Clean up any slugs that might have been incorrectly formatted
-- Remove any leading slashes or trailing slashes
UPDATE pages
SET 
  slug = TRIM(BOTH '/' FROM slug)
WHERE 
  template_type = 'portfolio_child'
  AND (slug LIKE '/%' OR slug LIKE '%/');

-- Step 4: Ensure portfolio_parent_slug doesn't have slashes
UPDATE pages
SET 
  portfolio_parent_slug = TRIM(BOTH '/' FROM portfolio_parent_slug)
WHERE 
  template_type = 'portfolio_child'
  AND portfolio_parent_slug LIKE '%/%';

-- Step 5: Log migration results (for debugging)
DO $$
DECLARE
  updated_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM pages
  WHERE template_type = 'portfolio_child';
  
  SELECT COUNT(*) INTO updated_count
  FROM pages
  WHERE template_type = 'portfolio_child'
    AND portfolio_parent_slug IS NOT NULL
    AND portfolio_parent_slug != '';
  
  RAISE NOTICE 'Portfolio child pages migration complete: % out of % pages have parent slug configured', updated_count, total_count;
END $$;

-- Add index for faster lookups by parent slug
CREATE INDEX IF NOT EXISTS idx_pages_portfolio_parent_slug 
ON pages(portfolio_parent_slug) 
WHERE template_type = 'portfolio_child';

-- Add comment
COMMENT ON COLUMN pages.portfolio_parent_slug IS 'Parent portfolio page slug for routing. Used in URL structure: /{parent_slug}/{child_slug}';

