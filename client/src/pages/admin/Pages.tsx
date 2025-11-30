import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ExternalLink, FileText, Calendar, Globe, Palette, Type, Megaphone, Layers, ArrowRight } from 'lucide-react';
import MediaSelector from '@/components/admin/MediaSelector';

interface Page {
  id: string;
  title: string;
  slug: string;
  template_type: string;
  is_published: boolean;
  // Hero
  hero_title: string | null;
  hero_title_highlight: string | null;
  hero_title_rest: string | null;
  hero_title_color_1: string | null;
  hero_title_color_2: string | null;
  hero_image: string | null;
  hero_background_color: string | null;
  hero_gradient_from: string | null;
  hero_gradient_to: string | null;
  hero_breadcrumb_label: string | null;
  // Text
  text_content: string | null;
  text_content_color: string | null;
  text_background_color: string | null;
  text_section_title: string | null;
  text_button_text: string | null;
  text_button_link: string | null;
  text_show_button: boolean | null;
  // CTA
  cta_background_type: string | null;
  cta_background_value: string | null;
  cta_text: string | null;
  cta_text_line2: string | null;
  cta_text_color: string | null;
  cta_text_position: string | null;
  cta_background_image: string | null;
  cta_show_button: boolean | null;
  cta_button_text: string | null;
  cta_button_link: string | null;
  cta_gradient_from: string | null;
  cta_gradient_to: string | null;
  // Service Card (for "Autres Services" section)
  service_icon: string | null;
  service_short_description: string | null;
  service_title_color: string | null;
  service_description_color: string | null;
  service_button_color: string | null;
  service_display_order: number | null;
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: string;
  updated_at: string;
}

const defaultFormData = {
  title: '',
  slug: '',
  template_type: 'service',
  is_published: false,
  // Hero
  hero_title: '',
  hero_title_highlight: '',
  hero_title_rest: '',
  hero_title_color_1: '#FFFFFF',
  hero_title_color_2: '#FFFFFF',
  hero_image: '',
  hero_background_color: '#2D1B4E',
  hero_gradient_from: '#FF6B35',
  hero_gradient_to: '#4C1D95',
  hero_breadcrumb_label: '',
  // Text
  text_content: '',
  text_content_color: '#374151',
  text_background_color: '#f5f5f5',
  text_section_title: '',
  text_button_text: 'See Our Work',
  text_button_link: '#portfolio',
  text_show_button: true,
  // CTA
  cta_background_type: 'gradient',
  cta_background_value: '',
  cta_text: '',
  cta_text_line2: '',
  cta_text_color: '#FFFFFF',
  cta_text_position: 'center',
  cta_background_image: '',
  cta_show_button: true,
  cta_button_text: 'Démarrer un projet',
  cta_button_link: '#contact',
  cta_gradient_from: '#3B1E6D',
  cta_gradient_to: '#1E3A5F',
  // Service Card
  service_icon: '',
  service_short_description: '',
  service_title_color: '#FF6B35',
  service_description_color: '#6b7280',
  service_button_color: '#FF6B35',
  service_display_order: 0,
  // SEO
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
};

export default function Pages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleOpenDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        template_type: page.template_type,
        is_published: page.is_published,
        hero_title: page.hero_title || '',
        hero_title_highlight: page.hero_title_highlight || '',
        hero_title_rest: page.hero_title_rest || '',
        hero_title_color_1: page.hero_title_color_1 || '#FFFFFF',
        hero_title_color_2: page.hero_title_color_2 || '#FFFFFF',
        hero_image: page.hero_image || '',
        hero_background_color: page.hero_background_color || '#2D1B4E',
        hero_gradient_from: page.hero_gradient_from || '#FF6B35',
        hero_gradient_to: page.hero_gradient_to || '#4C1D95',
        hero_breadcrumb_label: page.hero_breadcrumb_label || '',
        text_content: page.text_content || '',
        text_content_color: page.text_content_color || '#374151',
        text_background_color: page.text_background_color || '#f5f5f5',
        text_section_title: page.text_section_title || '',
        text_button_text: page.text_button_text || 'See Our Work',
        text_button_link: page.text_button_link || '#portfolio',
        text_show_button: page.text_show_button !== false,
        cta_background_type: page.cta_background_type || 'gradient',
        cta_background_value: page.cta_background_value || '',
        cta_text: page.cta_text || '',
        cta_text_line2: page.cta_text_line2 || '',
        cta_text_color: page.cta_text_color || '#FFFFFF',
        cta_text_position: page.cta_text_position || 'center',
        cta_background_image: page.cta_background_image || '',
        cta_show_button: page.cta_show_button !== false,
        cta_button_text: page.cta_button_text || 'Démarrer un projet',
        cta_button_link: page.cta_button_link || '#contact',
        cta_gradient_from: page.cta_gradient_from || '#3B1E6D',
        cta_gradient_to: page.cta_gradient_to || '#1E3A5F',
        // Service Card
        service_icon: page.service_icon || '',
        service_short_description: page.service_short_description || '',
        service_title_color: page.service_title_color || '#FF6B35',
        service_description_color: page.service_description_color || '#6b7280',
        service_button_color: page.service_button_color || '#FF6B35',
        service_display_order: page.service_display_order || 0,
        // SEO
        seo_title: page.seo_title || '',
        seo_description: page.seo_description || '',
        seo_keywords: page.seo_keywords || '',
      });
    } else {
      setEditingPage(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error('Title and slug are required');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (editingPage) {
        const { error } = await supabase
          .from('pages')
          .update(dataToSave)
          .eq('id', editingPage.id);

        if (error) throw error;
        toast.success('Page updated successfully');
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([formData]);

        if (error) throw error;
        toast.success('Page created successfully');
      }

      setIsDialogOpen(false);
      loadPages();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save page');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Page deleted successfully');
      loadPages();
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_published: !page.is_published })
        .eq('id', page.id);

      if (error) throw error;
      toast.success(`Page ${!page.is_published ? 'published' : 'unpublished'} successfully`);
      loadPages();
    } catch (error) {
      toast.error('Failed to update page status');
    }
  };

  // Check if template is service to show Service Card tab
  const isServiceTemplate = formData.template_type === 'service';

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Pages</h1>
            <p className="text-base text-gray-600">Create and manage your website pages with custom templates</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Page
          </Button>
        </div>

        {/* Stats Bar */}
        {pages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pages</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{pages.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {pages.filter(p => p.is_published).length}
                    </p>
                  </div>
                  <Globe className="h-10 w-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Services</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {pages.filter(p => p.template_type === 'service').length}
                    </p>
                  </div>
                  <Layers className="h-10 w-10 text-orange-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pages Grid */}
        {pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Card 
                key={page.id}
                className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-accent/50 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <CardTitle className="text-xl font-semibold text-gray-900 truncate">
                          {page.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono">/{page.slug}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                        page.is_published
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </div>
                      {page.template_type === 'service' && (
                        <span className="text-xs text-orange-500 font-medium">Service</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(page.updated_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(page)}
                      className="flex-1 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(page)}
                      className={`flex-1 ${
                        page.is_published 
                          ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {page.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    {page.is_published && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gray-100 p-6">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">No pages yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Get started by creating your first page.
                  </p>
                </div>
                <Button 
                  onClick={() => handleOpenDialog()}
                  className="mt-4 bg-accent hover:bg-accent/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Configure your page content, design, and settings using the tabs below.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-6">
              <TabsList className={`grid w-full mb-6 ${isServiceTemplate ? 'grid-cols-6' : 'grid-cols-5'}`}>
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Basic</span>
                </TabsTrigger>
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Hero</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                {isServiceTemplate && (
                  <TabsTrigger value="service" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span className="hidden sm:inline">Card</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="cta" className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  <span className="hidden sm:inline">CTA</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-5">
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                        Page Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g., Branding & Brand Content"
                        className="text-gray-900 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                        URL Slug <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="branding-brand-content"
                        className="text-gray-900 h-11 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Page Template</Label>
                      <Select
                        value={formData.template_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                      >
                        <SelectTrigger className="text-gray-900 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service Page</SelectItem>
                          <SelectItem value="landing">Landing Page</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Service pages appear in "Autres Services" section
                      </p>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={formData.is_published}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                          className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-2 focus:ring-accent"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">Published</span>
                          <span className="text-xs text-gray-500">Make visible to visitors</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Hero Banner Tab */}
              <TabsContent value="hero" className="space-y-5">
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Title Configuration</h4>
                  
                  {/* Preview du titre avec couleurs personnalisées */}
                  <div 
                    className="p-4 rounded-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.hero_gradient_from} 0%, ${formData.hero_gradient_to} 100%)` 
                    }}
                  >
                    <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Preview</p>
                    <h3 className="text-2xl md:text-3xl font-bold">
                      <span style={{ color: formData.hero_title_color_1 }}>{formData.hero_title_highlight || 'Branding'}</span>
                      <br />
                      <span style={{ color: formData.hero_title_color_2 }}>{formData.hero_title_rest || '& Brand content'}</span>
                    </h3>
                  </div>
                  
                  {/* Title Line 1 */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Title Line 1</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={formData.hero_title_highlight}
                        onChange={(e) => setFormData(prev => ({ ...prev, hero_title_highlight: e.target.value }))}
                        placeholder="Branding"
                        className="text-gray-900 h-11"
                      />
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Color:</Label>
                        <Input
                          type="color"
                          value={formData.hero_title_color_1}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_title_color_1: e.target.value }))}
                          className="w-14 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.hero_title_color_1}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_title_color_1: e.target.value }))}
                          placeholder="#FFFFFF"
                          className="text-gray-900 h-11 font-mono text-sm flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title Line 2 */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Title Line 2</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={formData.hero_title_rest}
                        onChange={(e) => setFormData(prev => ({ ...prev, hero_title_rest: e.target.value }))}
                        placeholder="& Brand content"
                        className="text-gray-900 h-11"
                      />
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Color:</Label>
                        <Input
                          type="color"
                          value={formData.hero_title_color_2}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_title_color_2: e.target.value }))}
                          className="w-14 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.hero_title_color_2}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_title_color_2: e.target.value }))}
                          placeholder="#FFFFFF"
                          className="text-gray-900 h-11 font-mono text-sm flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Breadcrumb Label</Label>
                    <Input
                      value={formData.hero_breadcrumb_label}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_breadcrumb_label: e.target.value }))}
                      placeholder="Branding & Brand content"
                      className="text-gray-900 h-11"
                    />
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Hero Image</h4>
                  <MediaSelector
                    label="3D Image (displayed on right side)"
                    value={formData.hero_image}
                    onChange={(url) => setFormData(prev => ({ ...prev, hero_image: url }))}
                    placeholder="Select or upload hero image..."
                  />
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Background Gradient</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Gradient Start</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.hero_gradient_from}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_gradient_from: e.target.value }))}
                          className="w-16 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.hero_gradient_from}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_gradient_from: e.target.value }))}
                          className="text-gray-900 h-11 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Gradient End</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.hero_gradient_to}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_gradient_to: e.target.value }))}
                          className="w-16 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.hero_gradient_to}
                          onChange={(e) => setFormData(prev => ({ ...prev, hero_gradient_to: e.target.value }))}
                          className="text-gray-900 h-11 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-5">
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Text Section</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Section Title</Label>
                    <Input
                      value={formData.text_section_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, text_section_title: e.target.value }))}
                      placeholder="Branding & Brand content"
                      className="text-gray-900 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Content</Label>
                    <Textarea
                      value={formData.text_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
                      placeholder="Enter your page content here..."
                      rows={8}
                      className="text-gray-900 resize-none"
                    />
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Section Background</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.text_background_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_background_color: e.target.value }))}
                          className="w-16 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.text_background_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_background_color: e.target.value }))}
                          className="text-gray-900 h-11 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.text_content_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_content_color: e.target.value }))}
                          className="w-16 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.text_content_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_content_color: e.target.value }))}
                          className="text-gray-900 h-11 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Action Button</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.text_show_button}
                        onChange={(e) => setFormData(prev => ({ ...prev, text_show_button: e.target.checked }))}
                        className="w-4 h-4 text-accent border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Show button</span>
                    </label>
                  </div>
                  {formData.text_show_button && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Button Text</Label>
                        <Input
                          value={formData.text_button_text}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_button_text: e.target.value }))}
                          placeholder="See Our Work"
                          className="text-gray-900 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Button Link</Label>
                        <Input
                          value={formData.text_button_link}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_button_link: e.target.value }))}
                          placeholder="#portfolio"
                          className="text-gray-900 h-11"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Service Card Tab - Only for Service Pages */}
              {isServiceTemplate && (
                <TabsContent value="service" className="space-y-5">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Info:</strong> Cette section définit comment ce service apparaîtra dans la section "Autres services" sur les autres pages de service.
                    </p>
                  </div>

                  {/* Live Preview Card */}
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preview de la carte</h4>
                    <div className="flex justify-center">
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg w-full max-w-xs">
                        {/* Icon Container */}
                        <div className="flex justify-center mb-6">
                          <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-50 to-orange-100/80" />
                            {formData.service_icon ? (
                              <img
                                src={formData.service_icon}
                                alt="Icon"
                                className="relative z-10 w-14 h-14 object-contain"
                              />
                            ) : (
                              <div className="relative z-10 w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-accent">
                                  {formData.title.charAt(0) || 'S'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3
                          className="text-lg font-bold text-center mb-3"
                          style={{ color: formData.service_title_color }}
                        >
                          {formData.title || 'Service Title'}
                        </h3>
                        
                        {/* Description */}
                        <p
                          className="text-sm leading-relaxed text-center mb-6 line-clamp-3"
                          style={{ color: formData.service_description_color }}
                        >
                          {formData.service_short_description || 'Description courte du service qui apparaîtra sur la carte.'}
                        </p>
                        
                        {/* Read More Button */}
                        <div className="flex justify-center">
                          <span 
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                            style={{ color: formData.service_button_color }}
                          >
                            <span className="uppercase tracking-wide">Read More</span>
                            <div 
                              className="flex items-center justify-center w-6 h-6 rounded-full"
                              style={{ backgroundColor: formData.service_button_color }}
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Service Icon</h4>
                    <MediaSelector
                      label="Icon Image"
                      value={formData.service_icon}
                      onChange={(url) => setFormData(prev => ({ ...prev, service_icon: url }))}
                      placeholder="Select or upload service icon..."
                    />
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Card Content</h4>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Short Description</Label>
                      <Textarea
                        value={formData.service_short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, service_short_description: e.target.value }))}
                        placeholder="Brief description that appears on the service card..."
                        rows={3}
                        className="text-gray-900 resize-none"
                      />
                      <p className="text-xs text-gray-500">Max ~100 characters recommended</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Display Order</Label>
                      <Input
                        type="number"
                        value={formData.service_display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, service_display_order: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="text-gray-900 h-11 w-32"
                      />
                      <p className="text-xs text-gray-500">Lower numbers appear first</p>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Card Colors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Title Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.service_title_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, service_title_color: e.target.value }))}
                            className="w-14 h-11 cursor-pointer"
                          />
                          <Input
                            value={formData.service_title_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, service_title_color: e.target.value }))}
                            className="text-gray-900 h-11 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Description Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.service_description_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, service_description_color: e.target.value }))}
                            className="w-14 h-11 cursor-pointer"
                          />
                          <Input
                            value={formData.service_description_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, service_description_color: e.target.value }))}
                            className="text-gray-900 h-11 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Button Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.service_button_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, service_button_color: e.target.value }))}
                            className="w-14 h-11 cursor-pointer"
                          />
                          <Input
                            value={formData.service_button_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, service_button_color: e.target.value }))}
                            className="text-gray-900 h-11 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* CTA Tab */}
              <TabsContent value="cta" className="space-y-5">
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">CTA Text</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Main Text (Line 1)</Label>
                    <Input
                      value={formData.cta_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                      placeholder="Contactez-nous dès maintenant"
                      className="text-gray-900 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Secondary Text (Line 2)</Label>
                    <Input
                      value={formData.cta_text_line2}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_text_line2: e.target.value }))}
                      placeholder="et commençons à construire votre identité unique"
                      className="text-gray-900 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.cta_text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_text_color: e.target.value }))}
                        className="w-16 h-11 cursor-pointer"
                      />
                      <Input
                        value={formData.cta_text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_text_color: e.target.value }))}
                        className="text-gray-900 h-11 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Background</h4>
                  
                  <MediaSelector
                    label="Background Image (optional)"
                    value={formData.cta_background_image}
                    onChange={(url) => setFormData(prev => ({ ...prev, cta_background_image: url }))}
                    placeholder="Select or upload background image..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Gradient Start</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.cta_gradient_from}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_gradient_from: e.target.value }))}
                          className="w-16 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.cta_gradient_from}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_gradient_from: e.target.value }))}
                          className="text-gray-900 h-11 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Gradient End</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.cta_gradient_to}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_gradient_to: e.target.value }))}
                          className="w-16 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.cta_gradient_to}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_gradient_to: e.target.value }))}
                          className="text-gray-900 h-11 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="h-24 rounded-lg relative overflow-hidden flex items-center justify-center"
                  >
                    {formData.cta_background_image && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${formData.cta_background_image})` }}
                      />
                    )}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        background: formData.cta_background_image 
                          ? `linear-gradient(135deg, ${formData.cta_gradient_from}dd 0%, ${formData.cta_gradient_to}cc 100%)`
                          : `linear-gradient(135deg, ${formData.cta_gradient_from} 0%, ${formData.cta_gradient_to} 100%)`
                      }}
                    />
                    <p 
                      className="relative z-10 text-lg font-medium italic"
                      style={{ color: formData.cta_text_color }}
                    >
                      Preview Text
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">CTA Button</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.cta_show_button}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_show_button: e.target.checked }))}
                        className="w-4 h-4 text-accent border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Show button</span>
                    </label>
                  </div>
                  {formData.cta_show_button && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Button Text</Label>
                        <Input
                          value={formData.cta_button_text}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                          placeholder="Démarrer un projet"
                          className="text-gray-900 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Button Link</Label>
                        <Input
                          value={formData.cta_button_link}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_button_link: e.target.value }))}
                          placeholder="#contact"
                          className="text-gray-900 h-11"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-5">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Info:</strong> Optimisez le référencement de cette page pour les moteurs de recherche.
                  </p>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Meta Tags</h4>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">SEO Title</Label>
                    <Input
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder={formData.title || "Titre de la page pour les moteurs de recherche"}
                      className="text-gray-900 h-11"
                    />
                    <p className="text-xs text-gray-500">Laissez vide pour utiliser le titre de la page. Recommandé: 50-60 caractères.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Meta Description</Label>
                    <Textarea
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="Description de la page pour les résultats de recherche..."
                      rows={3}
                      className="text-gray-900 resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.seo_description.length}/160 caractères (recommandé)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Keywords</Label>
                    <Input
                      value={formData.seo_keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                      placeholder="branding, design, agence digitale, création visuelle"
                      className="text-gray-900 h-11"
                    />
                    <p className="text-xs text-gray-500">Mots-clés séparés par des virgules.</p>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Aperçu Google</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="space-y-1">
                      <p className="text-blue-700 text-lg font-medium hover:underline cursor-pointer truncate">
                        {formData.seo_title || formData.title || 'Titre de la page'} | Tagit
                      </p>
                      <p className="text-green-700 text-sm">
                        tagit.ma/{formData.slug || 'page-slug'}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {formData.seo_description || formData.text_content?.substring(0, 160) || 'Description de la page qui apparaîtra dans les résultats de recherche Google...'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="px-6 text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="px-6 bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all"
              >
                {editingPage ? 'Update Page' : 'Create Page'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
