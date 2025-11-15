import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

export default function Appearance() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('category', 'colors');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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

        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>Configure the color palette for your website</CardDescription>
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
              <Button
                variant="outline"
                onClick={loadSettings}
              >
                Reset Changes
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
      </div>
    </AdminLayout>
  );
}
