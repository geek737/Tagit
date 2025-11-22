import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, Plus, Trash2, GripVertical } from 'lucide-react';
import { compressImage, validateImageFile } from '@/utils/imageUtils';

interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  icon_image: string;
  title_color: string;
  description_color: string;
  button_color: string;
  display_order: number;
  is_visible: boolean;
}

interface ServicesHeader {
  id?: string;
  heading_line1: string;
  heading_line2: string;
  description: string;
  button_text: string;
  button_url: string;
  background_image: string;
  background_color: string;
  heading_line1_color: string;
  heading_line2_color: string;
  description_color: string;
  button_bg_color: string;
  button_text_color: string;
}

export default function EnhancedServicesEditor() {
  const [header, setHeader] = useState<ServicesHeader>({
    heading_line1: 'Smart ideas',
    heading_line2: 'Real growth',
    description: 'Thanks to our results-driven approach, digital becomes much more than just a tool: a powerful growth engine.',
    button_text: 'See Our Work',
    button_url: '#contact',
    background_image: '',
    background_color: '#7C3AED',
    heading_line1_color: '#FFFFFF',
    heading_line2_color: '#FFFFFF',
    description_color: '#FFFFFF',
    button_bg_color: '#FF6B35',
    button_text_color: '#FFFFFF'
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, servicesRes] = await Promise.all([
        supabase.from('services_header').select('*').single(),
        supabase.from('services').select('*').order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (error) {
      console.error('Error loading services content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      const { error } = header.id
        ? await supabase
            .from('services_header')
            .update({ ...header, updated_at: new Date().toISOString() })
            .eq('id', header.id)
        : await supabase.from('services_header').insert([header]);

      if (error) throw error;
      toast.success('Services header saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save services header');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      const updates = services.map((service, index) => ({
        ...service,
        display_order: index,
        updated_at: new Date().toISOString()
      }));

      for (const service of updates) {
        if (service.id) {
          await supabase.from('services').update(service).eq('id', service.id);
        } else {
          await supabase.from('services').insert([service]);
        }
      }

      toast.success('Services saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save services');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'background' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      const compressed = await compressImage(file);

      if (field === 'background') {
        setHeader(prev => ({ ...prev, background_image: compressed }));
      } else {
        setServices(prev => prev.map((s, i) =>
          i === field ? { ...s, icon_image: compressed } : s
        ));
      }
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  const addService = () => {
    setServices(prev => [...prev, {
      title: 'New Service',
      description: 'Service description',
      icon_image: '',
      title_color: '#FF6B35',
      description_color: '#FFFFFF',
      button_color: '#FF6B35',
      display_order: prev.length,
      is_visible: true
    }]);
  };

  const removeService = async (index: number) => {
    const service = services[index];
    if (service.id) {
      await supabase.from('services').delete().eq('id', service.id);
    }
    setServices(prev => prev.filter((_, i) => i !== index));
    toast.success('Service removed');
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    setServices(prev => prev.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Services Section Editor</h3>
          <p className="text-sm text-gray-600">Edit header content and manage service cards</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            className={previewMode ? "bg-accent text-white hover:bg-accent/90" : "text-black hover:text-accent hover:border-accent"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-0">
            <section
              className="w-full min-h-screen relative overflow-hidden flex items-center"
              style={{ backgroundColor: header.background_color }}
            >
              {header.background_image && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${header.background_image})` }}
                />
              )}
              <div className="max-w-7xl mx-auto px-16 py-20 relative z-10">
                <div className="w-full grid grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <h2 className="text-6xl font-bold leading-tight">
                      <span style={{ color: header.heading_line1_color }}>{header.heading_line1}</span>
                      <br />
                      <span style={{ color: header.heading_line2_color }}>{header.heading_line2}</span>
                    </h2>
                    <p className="text-lg leading-relaxed" style={{ color: header.description_color }}>
                      {header.description}
                    </p>
                    <button
                      className="px-5 py-2.5 rounded-full font-semibold text-base inline-flex items-center gap-2"
                      style={{
                        backgroundColor: header.button_bg_color,
                        color: header.button_text_color
                      }}
                    >
                      {header.button_text}
                      <span>→</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {services.filter(s => s.is_visible).map((service, index) => (
                      <div key={index} className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-3">
                          {service.icon_image && (
                            <img src={service.icon_image} alt={service.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <h3 className="font-bold text-base mb-2" style={{ color: service.title_color }}>
                          {service.title}
                        </h3>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: service.description_color }}>
                          {service.description}
                        </p>
                        <button
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: service.button_color }}
                        >
                          →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="header" className="space-y-4">
          <TabsList>
            <TabsTrigger value="header">Header Content</TabsTrigger>
            <TabsTrigger value="services">Service Cards ({services.length})</TabsTrigger>
            <TabsTrigger value="styling">Colors & Background</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Header Content</CardTitle>
                <CardDescription>Edit the main heading and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Heading Line 1</Label>
                  <Input
                    value={header.heading_line1}
                    onChange={(e) => setHeader(prev => ({ ...prev, heading_line1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading Line 2</Label>
                  <Input
                    value={header.heading_line2}
                    onChange={(e) => setHeader(prev => ({ ...prev, heading_line2: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={header.description}
                    onChange={(e) => setHeader(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={header.button_text}
                      onChange={(e) => setHeader(prev => ({ ...prev, button_text: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button URL</Label>
                    <Input
                      value={header.button_url}
                      onChange={(e) => setHeader(prev => ({ ...prev, button_url: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Header'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Manage your service cards (max 6 recommended)</p>
                <Button onClick={addService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>

              {services.map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        <CardTitle>Service {index + 1}</CardTitle>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeService(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Service Title</Label>
                        <Input
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon Upload</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    {service.icon_image && (
                      <div className="flex justify-center p-4 bg-gray-100 rounded">
                        <img src={service.icon_image} alt={service.title} className="w-24 h-24 object-cover rounded-xl" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleSaveServices} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Services'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="styling">
            <Card>
              <CardHeader>
                <CardTitle>Colors & Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Line 1 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.heading_line1_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_line1_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.heading_line1_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_line1_color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Heading Line 2 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.heading_line2_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_line2_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.heading_line2_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_line2_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.background_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.background_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, background_color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'background')}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Styling
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
