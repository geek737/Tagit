import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Palette } from 'lucide-react';
import MediaUploadDialog from '@/components/admin/MediaUploadDialog';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

interface Section {
  id: string;
  name: string;
  background_color: string;
  background_image: string;
}

export default function Appearance() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsResult, sectionsResult] = await Promise.all([
        supabase.from('site_settings').select('*').eq('category', 'colors'),
        supabase.from('sections').select('id, name, background_color, background_image')
      ]);

      if (settingsResult.error) throw settingsResult.error;
      if (sectionsResult.error) throw sectionsResult.error;

      const settingsMap: Record<string, string> = {};
      settingsResult.data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
      setSections(sectionsResult.data || []);
    } catch (error) {
      toast.error('Failed to load appearance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveColors = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);

        if (error) throw error;
      }
      toast.success('Colors updated successfully');
    } catch (error) {
      toast.error('Failed to save colors');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSections = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('sections')
          .update({
            background_color: section.background_color,
            background_image: section.background_image,
            updated_at: new Date().toISOString()
          })
          .eq('id', section.id);

        if (error) throw error;
      }
      toast.success('Section backgrounds updated successfully');
    } catch (error) {
      toast.error('Failed to save section backgrounds');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (id: string, field: keyof Section, value: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const handleBackgroundUpload = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSection(sectionId, 'background_image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const colorSettings = [
    { key: 'primary_color', label: 'Primary Color', description: 'Main brand color' },
    { key: 'secondary_color', label: 'Secondary Color', description: 'Secondary brand color' },
    { key: 'accent_color', label: 'Accent Color', description: 'Accent and highlight color' },
    { key: 'background_color', label: 'Background Color', description: 'Main background color' },
    { key: 'text_color', label: 'Text Color', description: 'Default text color' },
  ];

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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
          <p className="text-gray-600 mt-1">Customize your website's visual appearance</p>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Upload className="h-4 w-4 mr-2" />
              Section Backgrounds
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Global Color Scheme</CardTitle>
                <CardDescription>Configure the color palette for your entire website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {colorSettings.map(setting => (
                    <div key={setting.key} className="space-y-3">
                      <div>
                        <Label htmlFor={setting.key}>{setting.label}</Label>
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Input
                          id={setting.key}
                          type="color"
                          value={settings[setting.key] || '#000000'}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="w-20 h-12 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings[setting.key] || '#000000'}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                      <div
                        className="h-16 rounded-md border-2 border-gray-200"
                        style={{ backgroundColor: settings[setting.key] || '#000000' }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button variant="outline" onClick={loadData}>
                    Reset Changes
                  </Button>
                  <Button onClick={handleSaveColors} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Color Scheme'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your color scheme looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 p-6 rounded-lg border-2" style={{ backgroundColor: settings.background_color }}>
                  <h3 className="text-2xl font-bold" style={{ color: settings.primary_color }}>
                    Primary Color Heading
                  </h3>
                  <p style={{ color: settings.text_color }}>
                    This is sample text using your configured text color.
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: settings.accent_color }}
                    >
                      Accent Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: settings.secondary_color }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>Section Backgrounds</CardTitle>
                <CardDescription>Customize background colors and images for each section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{section.name} Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={section.background_color || '#FFFFFF'}
                              onChange={(e) => updateSection(section.id, 'background_color', e.target.value)}
                              className="w-20 h-10"
                            />
                            <Input
                              type="text"
                              value={section.background_color || '#FFFFFF'}
                              onChange={(e) => updateSection(section.id, 'background_color', e.target.value)}
                              placeholder="#FFFFFF"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Background Image (Optional)</Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBackgroundUpload(section.id, e)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="icon">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {section.background_image && (
                        <div className="space-y-2">
                          <Label>Current Background</Label>
                          <img
                            src={section.background_image}
                            alt={`${section.name} background`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSection(section.id, 'background_image', '')}
                          >
                            Remove Background Image
                          </Button>
                        </div>
                      )}

                      <div
                        className="h-24 rounded-md border-2 relative overflow-hidden"
                        style={{
                          backgroundColor: section.background_color || '#FFFFFF',
                          backgroundImage: section.background_image ? `url(${section.background_image})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <span className="text-white font-medium capitalize">{section.name} Preview</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveSections} disabled={saving} size="lg">
                    {saving ? 'Saving...' : 'Save All Section Backgrounds'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
