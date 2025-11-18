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
