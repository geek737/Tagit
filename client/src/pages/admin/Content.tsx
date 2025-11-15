import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Section {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  is_visible: boolean;
  display_order: number;
}

export default function Content() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: Section) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sections')
        .update({
          title: section.title,
          subtitle: section.subtitle,
          description: section.description,
          is_visible: section.is_visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      if (error) throw error;
      toast.success('Section updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (id: string, field: keyof Section, value: string | boolean) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">Edit content for each section of your website</p>
        </div>

        <Tabs defaultValue={sections[0]?.name || 'hero'} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            {sections.map(section => (
              <TabsTrigger key={section.name} value={section.name} className="capitalize">
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map(section => (
            <TabsContent key={section.name} value={section.name}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">{section.name} Section</CardTitle>
                      <CardDescription>Configure content for the {section.name} section</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`visible-${section.id}`}>Visible</Label>
                      <Switch
                        id={`visible-${section.id}`}
                        checked={section.is_visible}
                        onCheckedChange={(checked) => updateSection(section.id, 'is_visible', checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${section.id}`}>Title</Label>
                    <Input
                      id={`title-${section.id}`}
                      value={section.title || ''}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Section title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`subtitle-${section.id}`}>Subtitle</Label>
                    <Input
                      id={`subtitle-${section.id}`}
                      value={section.subtitle || ''}
                      onChange={(e) => updateSection(section.id, 'subtitle', e.target.value)}
                      placeholder="Section subtitle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${section.id}`}>Description</Label>
                    <Textarea
                      id={`description-${section.id}`}
                      value={section.description || ''}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Section description"
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave(section)}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
