/*
  # Fix Pages Slug Unique Constraint
  
  ## Problem
  The current constraint `slug UNIQUE` prevents creating pages with the same slug
  even when they have different routes:
  - /portfolio/social-media-management (portfolio_child)
  - /social-media-management (service)
  
  These are different routes but share the same slug value.
  
  ## Solution
  Replace the simple UNIQUE constraint on slug with a composite unique constraint
  that considers the portfolio_parent_slug. This allows:
  - Same slug for different parent slugs (portfolio_child pages under different parents)
  - Same slug for non-child pages vs child pages
  - Still prevents duplicate slugs within the same "namespace"
*/

-- Step 1: Drop the existing unique constraint on slug
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_key;

-- Step 2: Create a unique index that considers the parent slug
-- Using COALESCE to treat NULL as empty string for uniqueness comparison
-- This ensures:
--   - (slug='test', parent=NULL) and (slug='test', parent='portfolio') are DIFFERENT ✓
--   - (slug='test', parent=NULL) and (slug='test', parent=NULL) are SAME (conflict) ✓
--   - (slug='test', parent='portfolio') and (slug='test', parent='portfolio') are SAME (conflict) ✓
CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_parent_unique 
ON pages (slug, COALESCE(portfolio_parent_slug, ''));

-- Step 3: Add a comment explaining the constraint
COMMENT ON INDEX pages_slug_parent_unique IS 
'Unique constraint on slug + parent_slug combination. 
Allows same slug for different page types (service vs portfolio_child) 
since they have different effective routes.';

