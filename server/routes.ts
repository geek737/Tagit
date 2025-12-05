import type { Express } from "express";
import { IStorage } from "./storage";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client server-side
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseServer = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export function registerRoutes(app: Express, storage: IStorage) {
  // Proxy endpoint for media upload to avoid CORS issues in development
  app.post('/api/media/upload', async (req, res) => {
    if (!supabaseServer) {
      return res.status(500).json({ error: 'Supabase not configured on server' });
    }

    try {
      const { filename, url, file_type, category, section_name, alt_text } = req.body;

      const { data, error } = await supabaseServer.from('media_library').insert({
        filename,
        url,
        file_type,
        category,
        section_name,
        alt_text
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
