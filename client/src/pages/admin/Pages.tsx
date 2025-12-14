import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Edit, Trash2, ExternalLink, FileText, Calendar, Globe, Palette, Type, Megaphone, Layers, ArrowRight, ChevronRight, FolderOpen } from 'lucide-react';
import MediaSelector from '@/components/admin/MediaSelector';
import PortfolioProjectsEditor from '@/components/admin/content/PortfolioProjectsEditor';
import { SectionLoader } from '@/components/ui/GlobalLoader';

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
  // Portfolio
  portfolio_title_line1: string | null;
  portfolio_title_line2: string | null;
  portfolio_title_line1_color: string | null;
  portfolio_title_line2_color: string | null;
  portfolio_items_per_page: number | null;
  // Portfolio Child
  portfolio_child_title: string | null;
  portfolio_child_title_color: string | null;
  portfolio_child_subtitle: string | null;
  portfolio_child_subtitle_color: string | null;
  portfolio_parent_slug: string | null;
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
  // Portfolio
  portfolio_title_line1: 'Our bold',
  portfolio_title_line2: 'projects',
  portfolio_title_line1_color: '#FF6B35',
  portfolio_title_line2_color: '#7C3AED',
  portfolio_items_per_page: 4,
  // Portfolio Child
  portfolio_child_title: '',
  portfolio_child_title_color: '#FF6B35',
  portfolio_child_subtitle: '',
  portfolio_child_subtitle_color: '#1f2937',
  portfolio_parent_slug: 'portfolio',
  // SEO
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
};

interface PortfolioChildPreview {
  id: string;
  title: string;
  slug: string;
  first_project_image: string | null;
}

export default function Pages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [portfolioChildPages, setPortfolioChildPages] = useState<PortfolioChildPreview[]>([]);
  const [loadingPortfolioChildren, setLoadingPortfolioChildren] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  // Load portfolio child pages when editing a portfolio page
  useEffect(() => {
    if (isDialogOpen && formData.template_type === 'portfolio' && formData.slug) {
      const timeoutId = setTimeout(() => {
        loadPortfolioChildPages();
      }, 300); // Debounce to avoid too many requests while typing
      
      return () => clearTimeout(timeoutId);
    } else {
      setPortfolioChildPages([]);
    }
  }, [isDialogOpen, formData.slug, formData.template_type, editingPage?.id]);

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

  const loadPortfolioChildPages = async () => {
    if (formData.template_type !== 'portfolio') {
      setPortfolioChildPages([]);
      return;
    }
    
    const parentSlug = formData.slug || editingPage?.slug;
    
    if (!parentSlug) {
      setPortfolioChildPages([]);
      return;
    }
    
    setLoadingPortfolioChildren(true);
    try {
      
      // Load portfolio child pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('template_type', 'portfolio_child')
        .eq('is_published', true)
        .eq('portfolio_parent_slug', parentSlug)
        .order('service_display_order', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true })
        .limit(4); // Limit to 4 for preview

      if (pagesError) throw pagesError;
      
      if (!pagesData || pagesData.length === 0) {
        setPortfolioChildPages([]);
        setLoadingPortfolioChildren(false);
        return;
      }

      // Load first project image for each page
      const itemsWithImages = await Promise.all(
        pagesData.map(async (page) => {
          // Get the first visible project for this page
          const { data: projectData } = await supabase
            .from('portfolio_projects')
            .select('main_image')
            .eq('page_id', page.id)
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .limit(1);

          const firstProjectImage = projectData && projectData.length > 0 
            ? projectData[0].main_image 
            : null;

          return {
            ...page,
            first_project_image: firstProjectImage
          };
        })
      );

      setPortfolioChildPages(itemsWithImages);
    } catch (error) {
      console.error('Error loading portfolio child pages:', error);
    } finally {
      setLoadingPortfolioChildren(false);
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
      
      // For portfolio_child pages, extract just the child part of the slug
      // The full slug in DB is now: parent/child (e.g., 'portfolio/social-media-management')
      let displaySlug = page.slug;
      if (page.template_type === 'portfolio_child' && page.portfolio_parent_slug) {
        const prefix = `${page.portfolio_parent_slug}/`;
        if (page.slug.startsWith(prefix)) {
          displaySlug = page.slug.substring(prefix.length);
        }
      }
      
      setFormData({
        title: page.title,
        slug: displaySlug,
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
        // Portfolio
        portfolio_title_line1: page.portfolio_title_line1 || 'Our bold',
        portfolio_title_line2: page.portfolio_title_line2 || 'projects',
        portfolio_title_line1_color: page.portfolio_title_line1_color || '#FF6B35',
        portfolio_title_line2_color: page.portfolio_title_line2_color || '#7C3AED',
        portfolio_items_per_page: page.portfolio_items_per_page || 4,
        // Portfolio Child
        portfolio_child_title: page.portfolio_child_title || '',
        portfolio_child_title_color: page.portfolio_child_title_color || '#FF6B35',
        portfolio_child_subtitle: page.portfolio_child_subtitle || '',
        portfolio_child_subtitle_color: page.portfolio_child_subtitle_color || '#1f2937',
        portfolio_parent_slug: page.portfolio_parent_slug || 'portfolio',
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

    // Build the full slug/route for portfolio_child pages
    let finalSlug = formData.slug;
    
    // For portfolio_child, prefix with parent slug to make route unique
    if (formData.template_type === 'portfolio_child') {
      const parentSlug = formData.portfolio_parent_slug || 'portfolio';
      // Remove any existing parent prefix to avoid duplication
      const cleanSlug = formData.slug.replace(new RegExp(`^${parentSlug}/`), '');
      finalSlug = `${parentSlug}/${cleanSlug}`;
    } else {
      // For non-child pages, ensure no slash prefix
      finalSlug = formData.slug.replace(/^\/+/, '');
    }

    try {
      const dataToSave = {
        ...formData,
        slug: finalSlug,
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
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Page created successfully');
      }

      setIsDialogOpen(false);
      loadPages();
    } catch (error: any) {
      // Better error message for duplicate slug
      if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        toast.error(`Cette route existe déjà : /${finalSlug}`);
      } else {
      toast.error(error.message || 'Failed to save page');
      }
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

  // Check template type to show appropriate tabs
  const isServiceTemplate = formData.template_type === 'service';
  const isPortfolioTemplate = formData.template_type === 'portfolio';
  const isPortfolioChildTemplate = formData.template_type === 'portfolio_child';

  // Calculate number of tabs for grid
  const getTabsCount = () => {
    if (isServiceTemplate) return 6; // Basic, Hero, Content, Card, CTA, SEO
    if (isPortfolioTemplate) return 5; // Basic, Hero, Portfolio, CTA, SEO
    if (isPortfolioChildTemplate) return 5; // Basic, Hero, Projects, CTA, SEO
    return 5; // Default
  };

  if (loading) {
    return (
      <AdminLayout>
        <SectionLoader text="Chargement des pages..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 sm:pb-6 border-b border-gray-200">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Pages</h1>
            <p className="text-sm sm:text-base text-gray-600">Create and manage your website pages with custom templates</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
                        <span className="font-mono">
                          /{page.slug}
                        </span>
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
                      {page.template_type === 'portfolio' && (
                        <span className="text-xs text-purple-500 font-medium">Portfolio</span>
                      )}
                      {page.template_type === 'portfolio_child' && (
                        <span className="text-xs text-indigo-500 font-medium">Portfolio Child</span>
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
                        title={`View page: /${page.slug}`}
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
          <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6">
            <DialogHeader className="pb-3 sm:pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Configure your page content, design, and settings using the tabs below.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4 sm:mt-6">
              <TabsList className={`grid w-full mb-4 sm:mb-6 gap-1 h-auto grid-cols-3 sm:grid-cols-${getTabsCount()}`}>
                <TabsTrigger value="basic" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">Basic</span>
                </TabsTrigger>
                <TabsTrigger value="hero" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">Hero</span>
                </TabsTrigger>
                {/* Content Tab - Only for Service Pages */}
                {isServiceTemplate && (
                  <TabsTrigger value="content" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                    <Type className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Content</span>
                  </TabsTrigger>
                )}
                {/* Portfolio Tab - Only for Portfolio Pages */}
                {isPortfolioTemplate && (
                  <TabsTrigger value="portfolio" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                    <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Portfolio</span>
                  </TabsTrigger>
                )}
                {/* Projects Tab - Only for Portfolio Child Pages */}
                {isPortfolioChildTemplate && (
                  <TabsTrigger value="projects" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                    <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Projects</span>
                  </TabsTrigger>
                )}
                {/* Service Card Tab - Only for Service Pages */}
                {isServiceTemplate && (
                  <TabsTrigger value="service" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                    <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Card</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="cta" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                  <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">CTA</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">SEO</span>
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
                      {/* Display full URL for portfolio_child pages */}
                      {formData.template_type === 'portfolio_child' && formData.slug && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-800 font-medium">Full URL:</span>
                            <span className="text-xs text-blue-900 font-mono">
                              /{formData.portfolio_parent_slug || 'portfolio'}/{formData.slug}
                            </span>
                            {formData.is_published && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const url = `/${formData.portfolio_parent_slug || 'portfolio'}/${formData.slug}`;
                                  window.open(url, '_blank');
                                }}
                                className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 ml-auto"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Display URL for other page types */}
                      {formData.template_type !== 'portfolio_child' && formData.slug && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-gray-600" />
                            <span className="text-xs text-gray-700 font-medium">URL:</span>
                            <span className="text-xs text-gray-900 font-mono">/{formData.slug}</span>
                            {formData.is_published && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/${formData.slug}`, '_blank')}
                                className="h-6 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 ml-auto"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
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
                          <SelectItem value="portfolio">Portfolio Page</SelectItem>
                          <SelectItem value="portfolio_child">Portfolio Child (Projects)</SelectItem>
                          <SelectItem value="landing">Landing Page</SelectItem>
                      </SelectContent>
                    </Select>
                      <p className="text-xs text-gray-500">
                        {formData.template_type === 'service' && 'Service pages appear in "Autres Services" section'}
                        {formData.template_type === 'portfolio' && 'Portfolio displays all services in a masonry grid'}
                        {formData.template_type === 'portfolio_child' && 'Portfolio Child displays detailed projects with images'}
                        {formData.template_type === 'landing' && 'Landing pages are standalone pages'}
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
                  
                  {/* Preview complet du Hero Banner */}
                  <div 
                    className="rounded-lg overflow-hidden relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.hero_gradient_from} 0%, ${formData.hero_gradient_from} 35%, ${formData.hero_gradient_to} 100%)` 
                    }}
                  >
                    {/* Decorative elements */}
                    <div 
                      className="absolute top-0 right-0 w-[60%] h-full opacity-20"
                      style={{
                        background: `radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                      }}
                    />
                    <div 
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
                        `,
                        backgroundSize: '30px 30px'
                      }}
                    />
                    
                    <div className="relative z-10 p-4 sm:p-6">
                      <p className="text-xs text-white/60 mb-3 uppercase tracking-wide">Preview Hero Banner</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                            <span style={{ color: formData.hero_title_color_1 }}>{formData.hero_title_highlight || 'Branding'}</span>
                            <br />
                            <span style={{ color: formData.hero_title_color_2 }}>{formData.hero_title_rest || '& Brand content'}</span>
                          </h3>
                          {/* Breadcrumb preview */}
                          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm">
                            <span className="text-white/80">Accueil</span>
                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white">
                              <ChevronRight className="w-2.5 h-2.5 text-gray-800" />
                            </div>
                            <span className="text-white/90 font-medium">{formData.hero_breadcrumb_label || formData.title || 'Page'}</span>
                          </div>
                        </div>
                        {/* Hero image preview */}
                        {formData.hero_image && (
                          <div className="hidden sm:block w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                            <img 
                              src={formData.hero_image} 
                              alt="Hero" 
                              className="w-full h-full object-contain drop-shadow-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Bottom wave */}
                    <div className="h-4 bg-white" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }} />
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

              {/* Content Tab - Only for Service Pages */}
              {isServiceTemplate && (
              <TabsContent value="content" className="space-y-5">
                {/* Preview Text Section */}
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preview Text Section</h4>
                  <div 
                    className="rounded-lg overflow-hidden relative p-4 sm:p-6"
                    style={{ backgroundColor: formData.text_background_color || '#f5f5f5' }}
                  >
                    {/* Network pattern decoration - simplified */}
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-30 hidden sm:block">
                      <svg className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32" viewBox="0 0 500 500">
                        <g stroke="#9333ea" strokeWidth="1" fill="none" opacity="0.4">
                          <line x1="250" y1="50" x2="400" y2="120" />
                          <line x1="400" y1="120" x2="450" y2="250" />
                          <line x1="300" y1="150" x2="350" y2="280" />
                        </g>
                        <g fill="#9333ea" opacity="0.5">
                          <circle cx="250" cy="50" r="3" />
                          <circle cx="400" cy="120" r="4" />
                          <circle cx="450" cy="250" r="3" />
                          <circle cx="300" cy="150" r="3" />
                          <circle cx="350" cy="280" r="3" />
                        </g>
                      </svg>
                </div>
                    
                    <div className="relative z-10 max-w-lg">
                      {formData.text_section_title && (
                        <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: '#1f2937' }}>
                          {formData.text_section_title}
                        </h3>
                      )}
                      <p 
                        className="text-xs sm:text-sm leading-relaxed line-clamp-3"
                        style={{ color: formData.text_content_color || '#374151' }}
                      >
                        {formData.text_content || 'Your content will appear here...'}
                      </p>
                      {formData.text_show_button && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-800">{formData.text_button_text || 'See Our Work'}</span>
                          <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-white">
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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
              )}

              {/* Portfolio Tab - Only for Portfolio Pages */}
              {isPortfolioTemplate && (
              <TabsContent value="portfolio" className="space-y-5">
                {/* Preview Portfolio Section */}
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preview Portfolio Section</h4>
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-100">
                    {/* Title Preview */}
                    <div className="space-y-1 mb-6">
                      <h2 
                        className="text-xl sm:text-2xl md:text-3xl font-bold"
                        style={{ color: formData.portfolio_title_line1_color }}
                      >
                        {formData.portfolio_title_line1 || 'Our bold'}
                      </h2>
                      <h2 
                        className="text-xl sm:text-2xl md:text-3xl font-bold"
                        style={{ color: formData.portfolio_title_line2_color }}
                      >
                        {formData.portfolio_title_line2 || 'projects'}
                      </h2>
                  </div>
                    {/* Grid Preview - Portfolio Child Pages */}
                    {loadingPortfolioChildren ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    ) : portfolioChildPages.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {portfolioChildPages.map((childPage) => (
                            <div key={childPage.id} className="group relative">
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                {childPage.first_project_image ? (
                                  <img
                                    src={childPage.first_project_image}
                                    alt={childPage.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-300">
                                      {childPage.title.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="pt-3">
                                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                                  {childPage.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs font-medium text-gray-700">
                                    See Our Work
                                  </span>
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white">
                                    <ArrowRight className="w-3 h-3" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Fill remaining slots if less than 4 */}
                          {Array.from({ length: Math.max(0, 4 - portfolioChildPages.length) }).map((_, i) => (
                            <div key={`placeholder-${i}`} className="aspect-[4/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-400">Portfolio Child</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          {portfolioChildPages.length} portfolio child {portfolioChildPages.length > 1 ? 'pages' : 'page'} affichée{portfolioChildPages.length > 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-400">Portfolio Child</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          Aucun portfolio child page publié pour cette page portfolio. Les pages de type "Portfolio Child" avec le même parent slug seront affichées ici.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Section Title</h4>
                  
                  {/* Title Line 1 */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Title Line 1</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                        value={formData.portfolio_title_line1}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio_title_line1: e.target.value }))}
                        placeholder="Our bold"
                        className="text-gray-900 h-11"
                      />
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Color:</Label>
                        <Input
                            type="color"
                          value={formData.portfolio_title_line1_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_title_line1_color: e.target.value }))}
                          className="w-14 h-11 cursor-pointer"
                          />
                          <Input
                          value={formData.portfolio_title_line1_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_title_line1_color: e.target.value }))}
                          placeholder="#FF6B35"
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
                        value={formData.portfolio_title_line2}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio_title_line2: e.target.value }))}
                        placeholder="projects"
                        className="text-gray-900 h-11"
                      />
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Color:</Label>
                        <Input
                          type="color"
                          value={formData.portfolio_title_line2_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_title_line2_color: e.target.value }))}
                          className="w-14 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.portfolio_title_line2_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_title_line2_color: e.target.value }))}
                          placeholder="#7C3AED"
                          className="text-gray-900 h-11 font-mono text-sm flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Display Settings</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Items Per Page (Carousel)</Label>
                    <Input
                      type="number"
                      min="2"
                      max="8"
                      value={formData.portfolio_items_per_page}
                      onChange={(e) => setFormData(prev => ({ ...prev, portfolio_items_per_page: parseInt(e.target.value) || 4 }))}
                      className="text-gray-900 h-11 w-32"
                    />
                    <p className="text-xs text-gray-500">Nombre de projets affichés avant pagination (2-8)</p>
                  </div>
                </div>
              </TabsContent>
              )}

              {/* Projects Tab - Only for Portfolio Child Pages */}
              {isPortfolioChildTemplate && (
              <TabsContent value="projects" className="space-y-5">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-800">
                    <strong>Info:</strong> Gérez les projets affichés sur cette page portfolio. Ajoutez des projets avec leurs images, descriptions et informations client.
                  </p>
                  </div>

                {/* Section Title Settings */}
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Section Settings</h4>
                  
                  {/* Title Preview */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
                    <h3 
                      className="text-xl md:text-2xl font-bold"
                      style={{ color: formData.portfolio_child_title_color }}
                    >
                      {formData.portfolio_child_title || 'Branding & Brand content'}
                    </h3>
                    {formData.portfolio_child_subtitle && (
                      <p 
                        className="mt-1 text-sm"
                        style={{ color: formData.portfolio_child_subtitle_color }}
                      >
                        {formData.portfolio_child_subtitle}
                      </p>
                    )}
                </div>

                  {/* Title */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Section Title</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={formData.portfolio_child_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio_child_title: e.target.value }))}
                        placeholder="Branding & Brand content"
                        className="text-gray-900 h-11"
                      />
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Color:</Label>
                        <Input
                          type="color"
                          value={formData.portfolio_child_title_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_child_title_color: e.target.value }))}
                          className="w-14 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.portfolio_child_title_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_child_title_color: e.target.value }))}
                          placeholder="#FF6B35"
                          className="text-gray-900 h-11 font-mono text-sm flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Section Subtitle (optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={formData.portfolio_child_subtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio_child_subtitle: e.target.value }))}
                        placeholder="Subtitle text..."
                        className="text-gray-900 h-11"
                      />
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Color:</Label>
                        <Input
                          type="color"
                          value={formData.portfolio_child_subtitle_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_child_subtitle_color: e.target.value }))}
                          className="w-14 h-11 cursor-pointer"
                        />
                        <Input
                          value={formData.portfolio_child_subtitle_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_child_subtitle_color: e.target.value }))}
                          placeholder="#1f2937"
                          className="text-gray-900 h-11 font-mono text-sm flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parent Portfolio Link */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Parent Portfolio Page Slug</Label>
                    <Input
                      value={formData.portfolio_parent_slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, portfolio_parent_slug: e.target.value }))}
                      placeholder="portfolio"
                      className="text-gray-900 h-11 w-64"
                    />
                    <p className="text-xs text-gray-500">Used for the "All Projects" navigation button</p>
                    
                    {/* Display full URL */}
                    {formData.slug && (
                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Globe className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs text-indigo-800 font-medium">Page URL:</span>
                          <span className="text-xs text-indigo-900 font-mono break-all">
                            /{formData.portfolio_parent_slug || 'portfolio'}/{formData.slug}
                          </span>
                          {formData.is_published && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const url = `/${formData.portfolio_parent_slug || 'portfolio'}/${formData.slug}`;
                                window.open(url, '_blank');
                              }}
                              className="h-7 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 ml-auto flex-shrink-0"
                              title="View page"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">View</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Display Order for Navigation */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Navigation Order</Label>
                    <Input
                      type="number"
                      value={formData.service_display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_display_order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="text-gray-900 h-11 w-32"
                    />
                    <p className="text-xs text-gray-500">Détermine l'ordre dans la navigation entre les pages portfolio child (plus petit = en premier)</p>
                  </div>
                </div>

                {/* Projects Manager - Only show for existing pages */}
                {editingPage && (
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <PortfolioProjectsEditor pageId={editingPage.id} />
                  </div>
                )}

                {!editingPage && (
                  <div className="p-5 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Sauvegardez d'abord la page, puis vous pourrez ajouter des projets.
                    </p>
                  </div>
                )}
              </TabsContent>
              )}

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
                        {/* Icon Container - Sans cercle de fond */}
                        <div className="flex justify-center mb-6">
                          <div className="w-20 h-20 flex items-center justify-center">
                            {formData.service_icon ? (
                              <img
                                src={formData.service_icon}
                                alt="Icon"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
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
                  
                  {/* Preview CTA complet */}
                  <div 
                    className="rounded-lg relative overflow-hidden py-6 sm:py-8"
                  >
                    {/* Background Image */}
                    {formData.cta_background_image && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${formData.cta_background_image})` }}
                      />
                    )}
                    {/* Overlay gradient */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        background: formData.cta_background_image 
                          ? `linear-gradient(135deg, ${formData.cta_gradient_from}dd 0%, ${formData.cta_gradient_to}cc 100%)`
                          : `linear-gradient(135deg, ${formData.cta_gradient_from} 0%, ${formData.cta_gradient_to} 100%)`
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 px-4 flex flex-col items-center text-center">
                      <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Preview CTA Section</p>
                      <div className="space-y-1">
                        <p 
                          className="text-base sm:text-lg md:text-xl font-medium leading-tight italic"
                          style={{ color: formData.cta_text_color || '#FFFFFF' }}
                        >
                          {formData.cta_text || 'Contactez-nous dès maintenant'}
                        </p>
                        {formData.cta_text_line2 && (
                          <p 
                            className="text-base sm:text-lg md:text-xl font-medium leading-tight italic"
                            style={{ color: formData.cta_text_color || '#FFFFFF' }}
                          >
                            {formData.cta_text_line2}
                          </p>
                        )}
                  </div>
                      
                      {/* Button preview */}
                      {formData.cta_show_button && (
                        <div className="mt-4">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-accent text-sm">
                            {formData.cta_button_text || 'Démarrer un projet'}
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </span>
                        </div>
                      )}
                    </div>
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
