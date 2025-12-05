import { supabase } from './supabase';

const BUCKET_NAME = 'media';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImage(file: File, folder: string = 'general'): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    await supabase.from('media_library').insert({
      filename: file.name,
      url: publicUrl,
      file_type: file.type,
      category: folder,
      section_name: folder
    });

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    await supabase
      .from('media_library')
      .delete()
      .eq('url', url);

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}

export async function getMediaLibrary(category?: string) {
  try {
    let query = supabase.from('media_library').select('*').order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load media library:', error);
    return [];
  }
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a small thumbnail (150x150px) from a file or base64 string
 * Returns a base64 string of the thumbnail (~5-20KB)
 */
export function generateThumbnail(source: File | string, size: number = 150, quality: number = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Calculate dimensions to maintain aspect ratio and fit within size
      let width = img.width;
      let height = img.height;
      
      // Scale down to fit within size x size while maintaining aspect ratio
      if (width > height) {
        if (width > size) {
          height = (height * size) / width;
          width = size;
        }
      } else {
        if (height > size) {
          width = (width * size) / height;
          height = size;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Use better image smoothing for thumbnails
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for smaller file size
      const thumbnailBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(thumbnailBase64);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    
    // Handle both File and base64 string sources
    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Check if a URL is a base64 data URL
 */
function isBase64Url(url: string): boolean {
  return url && url.startsWith('data:');
}

/**
 * Check if a URL is a local asset URL that can be fetched
 */
function isLocalAssetUrl(url: string): boolean {
  return url && (url.startsWith('/src/') || url.startsWith('src/') || url.startsWith('/assets/'));
}

/**
 * Generate thumbnails for existing media items that don't have one
 */
export async function generateMissingThumbnails(
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; skipped: number }> {
  let success = 0;
  let failed = 0;
  let skipped = 0;
  
  try {
    // Get all media items without thumbnails
    const { data: mediaItems, error } = await supabase
      .from('media_library')
      .select('id, url')
      .is('thumbnail', null)
      .not('url', 'is', null);
    
    if (error) throw error;
    if (!mediaItems || mediaItems.length === 0) {
      return { success: 0, failed: 0, skipped: 0 };
    }
    
    const total = mediaItems.length;
    
    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      onProgress?.(i + 1, total);
      
      try {
        // Only process base64 images
        if (!isBase64Url(item.url)) {
          // For local assets, try to fetch and convert to base64 first
          if (isLocalAssetUrl(item.url)) {
            try {
              const response = await fetch(item.url);
              if (!response.ok) {
                console.warn(`Skipping local asset ${item.id}: cannot fetch ${item.url}`);
                skipped++;
                continue;
              }
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              
              // Generate thumbnail from the fetched base64
              const thumbnail = await generateThumbnail(base64);
              
              // Update the media item with the thumbnail
              const { error: updateError } = await supabase
                .from('media_library')
                .update({ thumbnail })
                .eq('id', item.id);
              
              if (updateError) {
                console.error(`Failed to update thumbnail for ${item.id}:`, updateError);
                failed++;
              } else {
                success++;
              }
            } catch (fetchErr) {
              console.warn(`Skipping ${item.id}: failed to fetch local asset`, fetchErr);
              skipped++;
            }
          } else {
            console.warn(`Skipping ${item.id}: not a base64 or local asset URL`);
            skipped++;
          }
          continue;
        }
        
        // Generate thumbnail from the existing base64 URL
        const thumbnail = await generateThumbnail(item.url);
        
        // Update the media item with the thumbnail
        const { error: updateError } = await supabase
          .from('media_library')
          .update({ thumbnail })
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`Failed to update thumbnail for ${item.id}:`, updateError);
          failed++;
        } else {
          success++;
        }
      } catch (err) {
        console.error(`Failed to generate thumbnail for ${item.id}:`, err);
        failed++;
      }
    }
  } catch (error) {
    console.error('Failed to generate missing thumbnails:', error);
  }
  
  return { success, failed, skipped };
}