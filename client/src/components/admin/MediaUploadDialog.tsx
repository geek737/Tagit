import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { convertToBase64, compressImage, generateThumbnail } from '@/lib/mediaStorage';
import { supabase } from '@/lib/supabase';

interface MediaUploadDialogProps {
  onUploadComplete?: () => void;
  trigger?: React.ReactNode;
}

export default function MediaUploadDialog({ onUploadComplete, trigger }: MediaUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [category, setCategory] = useState('general');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = ['general', 'hero', 'about', 'service', 'project', 'team', 'icon', 'logo'];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.info('Compressing large image...');
      try {
        const compressed = await compressImage(selectedFile);
        setFile(compressed);
        const base64 = await convertToBase64(compressed);
        setPreview(base64);
      } catch (error) {
        toast.error('Failed to compress image');
      }
    } else {
      setFile(selectedFile);
      const base64 = await convertToBase64(selectedFile);
      setPreview(base64);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const base64Data = await convertToBase64(file);
      
      // Generate thumbnail for fast gallery loading
      let thumbnailData: string | null = null;
      try {
        thumbnailData = await generateThumbnail(file, 150, 0.6);
      } catch (thumbError) {
        console.warn('Failed to generate thumbnail, continuing without it:', thumbError);
      }

      const mediaData = {
        filename: file.name,
        url: base64Data,
        thumbnail: thumbnailData,
        file_type: file.type,
        category: category,
        section_name: category,
        alt_text: altText || file.name
      };

      // Try direct Supabase first, fall back to proxy for local development
      let error: any = null;
      
      try {
        const result = await supabase.from('media_library').insert(mediaData);
        error = result.error;
      } catch (corsError) {
        // If CORS error in development, use server proxy
        console.log('Using server proxy for upload...');
        const proxyResponse = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaData)
        });
        
        if (!proxyResponse.ok) {
          const errorData = await proxyResponse.json();
          error = { message: errorData.error || 'Upload failed' };
        }
      }

      if (error) throw error;

      toast.success('Media uploaded successfully');
      setOpen(false);
      resetForm();
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview('');
    setCategory('general');
    setAltText('');
  };

  const removeFile = () => {
    setFile(null);
    setPreview('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload an image or media file to your library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <span className="text-sm text-gray-600">Click to select an image</span>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </Label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-100 rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {file && (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="altText">Alt Text (Optional)</Label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Description for accessibility"
                />
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>File:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                <p><strong>Type:</strong> {file.type}</p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
