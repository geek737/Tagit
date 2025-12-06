import type { Express } from "express";
import { IStorage } from "./storage";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client server-side
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseServer = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Security constants for file upload validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];
const MAX_BASE64_SIZE = 15 * 1024 * 1024; // ~15MB base64 (represents ~10MB file)
const MAX_FILENAME_LENGTH = 255;

// Validate upload data server-side
function validateUploadData(data: any): { valid: boolean; error?: string } {
  const { filename, url, file_type } = data;

  // Check required fields
  if (!filename || !url || !file_type) {
    return { valid: false, error: 'Missing required fields: filename, url, file_type' };
  }

  // Validate filename
  if (typeof filename !== 'string' || filename.length > MAX_FILENAME_LENGTH) {
    return { valid: false, error: `Filename too long (max ${MAX_FILENAME_LENGTH} chars)` };
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'Invalid filename: path traversal detected' };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file_type)) {
    return { valid: false, error: `Invalid file type: ${file_type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` };
  }

  // Validate base64 URL format
  if (typeof url !== 'string' || !url.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image data format' };
  }

  // Check base64 size
  if (url.length > MAX_BASE64_SIZE) {
    return { valid: false, error: 'File too large' };
  }

  // Validate that MIME type in data URL matches declared file_type
  const dataUrlMime = url.split(';')[0].replace('data:', '');
  // Normalize jpeg/jpg
  const normalizedDeclared = file_type === 'image/jpg' ? 'image/jpeg' : file_type;
  const normalizedDataUrl = dataUrlMime === 'image/jpg' ? 'image/jpeg' : dataUrlMime;
  
  if (normalizedDeclared !== normalizedDataUrl) {
    return { valid: false, error: `MIME type mismatch: declared ${file_type}, actual ${dataUrlMime}` };
  }

  return { valid: true };
}

export function registerRoutes(app: Express, storage: IStorage) {
  // Proxy endpoint for media upload to avoid CORS issues in development
  app.post('/api/media/upload', async (req, res) => {
    if (!supabaseServer) {
      return res.status(500).json({ error: 'Supabase not configured on server' });
    }

    try {
      // Validate upload data
      const validation = validateUploadData(req.body);
      if (!validation.valid) {
        console.warn('Upload validation failed:', validation.error);
        return res.status(400).json({ error: validation.error });
      }

      const { filename, url, thumbnail, file_type, category, section_name, alt_text } = req.body;

      // Sanitize category and section_name
      const safeCategory = typeof category === 'string' ? category.slice(0, 50) : 'general';
      const safeSectionName = typeof section_name === 'string' ? section_name.slice(0, 50) : 'general';
      const safeAltText = typeof alt_text === 'string' ? alt_text.slice(0, 500) : filename;

      const { data, error } = await supabaseServer.from('media_library').insert({
        filename: filename.slice(0, MAX_FILENAME_LENGTH),
        url,
        thumbnail: thumbnail || null,
        file_type,
        category: safeCategory,
        section_name: safeSectionName,
        alt_text: safeAltText
      }).select().single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Upload proxy error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  });
}
