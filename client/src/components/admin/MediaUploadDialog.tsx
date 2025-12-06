import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { convertToBase64, compressImage, generateThumbnail } from '@/lib/mediaStorage';
import { supabase } from '@/lib/supabase';

// Security constants
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20; // Maximum files per upload batch

interface FileWithPreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface MediaUploadDialogProps {
  onUploadComplete?: () => void;
  trigger?: React.ReactNode;
}

// Validate file security
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Type non autorisé: ${file.type}. Utilisez JPEG, PNG, GIF, WebP ou SVG.` };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB` };
  }
  
  // Check file extension matches MIME type (basic check)
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg']
  };
  
  if (extension && validExtensions[file.type] && !validExtensions[file.type].includes(extension)) {
    return { valid: false, error: `Extension .${extension} ne correspond pas au type ${file.type}` };
  }
  
  return { valid: true };
};

export default function MediaUploadDialog({ onUploadComplete, trigger }: MediaUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [category, setCategory] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const categories = ['general', 'hero', 'about', 'service', 'project', 'team', 'icon', 'logo'];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Check max files limit
    if (selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} fichiers par upload`);
      return;
    }

    const newFiles: FileWithPreview[] = [];
    
    for (const selectedFile of selectedFiles) {
      // Validate each file
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        toast.error(`${selectedFile.name}: ${validation.error}`);
        continue;
      }

      try {
        let processedFile = selectedFile;
        
        // Compress if large (> 2MB for better quality)
        if (selectedFile.size > 2 * 1024 * 1024 && !selectedFile.type.includes('svg')) {
          const compressed = await compressImage(selectedFile);
          processedFile = compressed;
        }
        
        const base64 = await convertToBase64(processedFile);
        newFiles.push({
          file: processedFile,
          preview: base64,
          status: 'pending'
        });
      } catch (error) {
        toast.error(`Erreur lors du traitement de ${selectedFile.name}`);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('Sélectionnez au moins un fichier');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: pendingFiles.length });
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      if (fileItem.status !== 'pending') continue;

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const } : f
      ));
      setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

      try {
        const base64Data = fileItem.preview; // Already converted
        
        // Generate thumbnail for fast gallery loading
        let thumbnailData: string | null = null;
        try {
          thumbnailData = await generateThumbnail(fileItem.file, 150, 0.6);
        } catch (thumbError) {
          console.warn('Failed to generate thumbnail:', thumbError);
        }

        const mediaData = {
          filename: fileItem.file.name,
          url: base64Data,
          thumbnail: thumbnailData,
          file_type: fileItem.file.type,
          category: category,
          section_name: category,
          alt_text: fileItem.file.name
        };

        // Try direct Supabase first, fall back to proxy for local development
        let error: any = null;
        
        try {
          const result = await supabase.from('media_library').insert(mediaData);
          error = result.error;
        } catch (corsError) {
          // If CORS error in development, use server proxy
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

        // Update status to success
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' as const } : f
        ));
        successCount++;
      } catch (error: any) {
        console.error('Upload error:', error);
        // Update status to error
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' as const, error: error.message } : f
        ));
        errorCount++;
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} fichier(s) uploadé(s) avec succès`);
      onUploadComplete?.();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} fichier(s) en erreur`);
    }
    
    // Close and reset if all successful
    if (errorCount === 0) {
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1000);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setCategory('general');
    setUploadProgress({ current: 0, total: 0 });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !uploading) {
        resetForm();
      }
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Upload Media</DialogTitle>
          <DialogDescription className="text-gray-600">
            Uploadez une ou plusieurs images (max {MAX_FILES} fichiers, 10MB chacun)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Drop zone */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors">
            <Label htmlFor="file-upload" className="cursor-pointer block">
              <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <span className="text-sm text-gray-600 block">
                Cliquez ou glissez-déposez vos images
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                JPEG, PNG, GIF, WebP, SVG • Max 10MB par fichier
              </span>
              <Input
                id="file-upload"
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                disabled={uploading}
              />
            </Label>
          </div>

          {/* Files preview grid */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {files.length} fichier(s) sélectionné(s)
                </span>
                {!uploading && pendingCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    Tout supprimer
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                {files.map((fileItem, index) => (
                  <div key={index} className="relative group">
                    <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      fileItem.status === 'success' ? 'border-green-500' :
                      fileItem.status === 'error' ? 'border-red-500' :
                      fileItem.status === 'uploading' ? 'border-accent' :
                      'border-gray-200'
                    }`}>
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Status overlay */}
                      {fileItem.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                      {fileItem.status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      {fileItem.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    {fileItem.status === 'pending' && !uploading && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    
                    {/* File name tooltip */}
                    <p className="text-xs text-gray-500 truncate mt-1 text-center" title={fileItem.file.name}>
                      {fileItem.file.name.length > 15 ? fileItem.file.name.substring(0, 12) + '...' : fileItem.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category selector */}
          {files.length > 0 && pendingCount > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">Catégorie (pour tous les fichiers)</Label>
              <Select value={category} onValueChange={setCategory} disabled={uploading}>
                <SelectTrigger id="category" className="text-gray-900">
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
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-accent animate-spin" />
                <span className="text-sm text-gray-700">
                  Upload en cours... {uploadProgress.current}/{uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
            className="text-gray-700"
          >
            {successCount > 0 && pendingCount === 0 ? 'Fermer' : 'Annuler'}
          </Button>
          {pendingCount > 0 && (
            <Button
              onClick={handleUpload}
              disabled={uploading || pendingCount === 0}
              className="bg-accent hover:bg-accent/90"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader {pendingCount} fichier(s)
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
