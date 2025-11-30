-- Migration: Add link_url column to services table
-- This allows each service card to have a custom URL when clicking the arrow button

-- Add link_url column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS link_url TEXT DEFAULT '';

-- Update existing services with empty link_url
UPDATE services SET link_url = '' WHERE link_url IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN services.link_url IS 'URL to navigate to when clicking the service card arrow button';

