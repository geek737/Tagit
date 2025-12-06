import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Trash2, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import MediaUploadDialog from '@/components/admin/MediaUploadDialog';
import { generateMissingThumbnails } from '@/lib/mediaStorage';
import { SectionLoader } from '@/components/ui/GlobalLoader';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  thumbnail: string | null;
  file_type: string;
  category: string;
  section_name: string;
  alt_text: string;
  created_at: string;
}

export default function Media() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    loadMedia();
  }, []);

  // Fonction pour normaliser les URLs (supprimer /client si présent)
  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    // Si l'URL commence par /client/src, remplacer par /src
    if (url.startsWith('/client/src/')) {
      return url.replace('/client/src/', '/src/');
    }
    // Si l'URL commence par client/src, remplacer par src
    if (url.startsWith('client/src/')) {
      return url.replace('client/src/', 'src/');
    }
    return url;
  };

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Normaliser les URLs lors du chargement
      const normalizedData = (data || []).map(item => ({
        ...item,
        url: normalizeUrl(item.url)
      }));
      
      setMedia(normalizedData);
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMedia(prev => prev.filter(item => item.id !== id));
      toast.success('Media deleted successfully');
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const categories = ['all', 'logo', 'icon', 'project', 'team', 'service', 'hero', 'other'];

  const filteredMedia = filterCategory === 'all'
    ? media
    : media.filter(item => item.category === filterCategory);

  // Count media without thumbnails
  const mediaWithoutThumbnails = media.filter(item => !item.thumbnail).length;

  const handleGenerateThumbnails = async () => {
    setGeneratingThumbnails(true);
    setThumbnailProgress({ current: 0, total: 0 });
    
    try {
      const result = await generateMissingThumbnails((current, total) => {
        setThumbnailProgress({ current, total });
      });
      
      // Build result message
      const messages: string[] = [];
      if (result.success > 0) messages.push(`${result.success} généré(s)`);
      if (result.skipped > 0) messages.push(`${result.skipped} ignoré(s)`);
      if (result.failed > 0) messages.push(`${result.failed} échoué(s)`);
      
      if (result.success > 0) {
        toast.success(`Thumbnails: ${messages.join(', ')}`);
        loadMedia(); // Reload to show new thumbnails
      } else if (result.skipped > 0 && result.failed === 0) {
        toast.info(`Thumbnails: ${messages.join(', ')} (images locales non supportées)`);
      } else if (result.failed > 0) {
        toast.error(`Thumbnails: ${messages.join(', ')}`);
      } else {
        toast.info('Toutes les images ont déjà des thumbnails');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération des thumbnails');
    } finally {
      setGeneratingThumbnails(false);
      setThumbnailProgress({ current: 0, total: 0 });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SectionLoader text="Chargement des médias..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Media Library</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage images and media files</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Bouton toujours visible pour générer les thumbnails manquants */}
            <Button
              variant="outline"
              onClick={handleGenerateThumbnails}
              disabled={generatingThumbnails || media.length === 0}
              className="text-gray-700"
            >
              {generatingThumbnails ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {thumbnailProgress.total > 0 
                    ? `${thumbnailProgress.current}/${thumbnailProgress.total}...`
                    : 'Génération...'
                  }
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Générer thumbnails {mediaWithoutThumbnails > 0 ? `(${mediaWithoutThumbnails})` : ''}
                </>
              )}
            </Button>
            <MediaUploadDialog onUploadComplete={loadMedia} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Media</CardTitle>
                <CardDescription>{filteredMedia.length} files</CardDescription>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
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
          </CardHeader>
          <CardContent>
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No media files found</p>
                <p className="text-sm text-gray-500 mt-1">Upload your first media file to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center p-2 relative">
                      {item.file_type?.startsWith('image/') ? (
                        <img
                          src={item.thumbnail || item.url}
                          alt={item.alt_text || item.filename}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      )}
                      {/* Indicator for missing thumbnail */}
                      {!item.thumbnail && item.file_type?.startsWith('image/') && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" title="No thumbnail" />
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-sm font-medium truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                          {item.category || 'uncategorized'}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Media Management Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>• Organize files by category for easy management</p>
            <p>• Use descriptive filenames for better organization</p>
            <p>• Optimize images before uploading for better performance</p>
            <p>• Recommended image formats: JPG for photos, PNG for graphics with transparency</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
