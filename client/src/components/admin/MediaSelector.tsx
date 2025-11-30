import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Image as ImageIcon, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaUploadDialog from './MediaUploadDialog';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  file_type: string;
  category: string;
  alt_text: string;
}

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

const ITEMS_PER_PAGE = 12;

export default function MediaSelector({ value, onChange, label, placeholder }: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open, searchTerm]);

  useEffect(() => {
    if (open && media.length > 0) {
      const filtered = getFilteredMedia();
      const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      setTotalPages(pages || 1);
      if (currentPage > pages) {
        setCurrentPage(1);
      }
    }
  }, [searchTerm, media, open]);

  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    if (url.startsWith('/client/src/')) {
      return url.replace('/client/src/', '/src/');
    }
    if (url.startsWith('client/src/')) {
      return url.replace('client/src/', 'src/');
    }
    return url;
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
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

  const getFilteredMedia = () => {
    return media.filter(item =>
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredMedia = getFilteredMedia();
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMedia = filteredMedia.slice(startIndex, endIndex);

  const handleSelect = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of media grid
    const gridElement = document.getElementById('media-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex gap-2">
        {value ? (
          <div className="flex-1 relative group">
            <img
              src={value}
              alt="Selected image preview"
              className="w-full h-20 object-cover rounded-lg border border-gray-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-20 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 text-sm">Invalid image URL</div>`;
                }
              }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "/src/assets/image.png"}
            className="flex-1 text-gray-900"
          />
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="text-gray-900 border-gray-300 hover:bg-gray-50">
              <ImageIcon className="h-4 w-4 mr-2" />
              Select
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Select Image from Media Library</DialogTitle>
              <DialogDescription className="text-gray-600">
                Choose an image from your media library or upload a new one
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 text-gray-900"
                  />
                </div>
                <MediaUploadDialog
                  onUploadComplete={() => {
                    loadMedia();
                    toast.success('Image uploaded! You can now select it.');
                  }}
                  trigger={
                    <Button type="button" className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-50">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload New
                    </Button>
                  }
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No media found. Upload an image to get started.</p>
                </div>
              ) : (
                <>
                  <div id="media-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedMedia.map((item) => (
                      <div
                        key={item.id}
                        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          value === item.url
                            ? 'border-accent ring-2 ring-accent'
                            : 'border-gray-200 hover:border-accent'
                        }`}
                        onClick={() => handleSelect(item.url)}
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          {item.url ? (
                            <img
                              src={item.url}
                              alt={item.alt_text || item.filename}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="truncate">{item.filename}</p>
                        </div>
                        {value === item.url && (
                          <div className="absolute top-2 right-2 bg-accent text-white rounded-full p-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="text-gray-900 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="text-gray-900 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="text-gray-900 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              {value && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className="text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

