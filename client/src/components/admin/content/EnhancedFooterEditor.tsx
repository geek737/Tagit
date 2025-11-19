import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, Plus, Trash2, X } from 'lucide-react';

interface FooterSection {
  id?: string;
  section_key: string;
  section_title: string;
  content: any;
  display_order: number;
  is_visible: boolean;
}

interface FooterSettings {
  id?: string;
  background_color: string;
  text_color: string;
  link_color: string;
  link_hover_color: string;
  copyright_text: string;
  legal_links: any[];
}

export default function EnhancedFooterEditor() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<FooterSettings>({
    background_color: '#7C3AED',
    text_color: '#FFFFFF',
    link_color: '#FFFFFF',
    link_hover_color: '#FF6B35',
    copyright_text: '2025 tagit. All rights reserved.',
    legal_links: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [sectionsRes, settingsRes] = await Promise.all([
        supabase.from('footer_sections').select('*').order('display_order', { ascending: true }),
        supabase.from('footer_settings').select('*').single()
      ]);

      if (sectionsRes.data) setSections(sectionsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error loading footer content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSections = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        if (section.id) {
          await supabase
            .from('footer_sections')
            .update({ ...section, updated_at: new Date().toISOString() })
            .eq('id', section.id);
        } else {
          await supabase.from('footer_sections').insert([section]);
        }
      }

      toast.success('Footer sections saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save footer sections');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = settings.id
        ? await supabase
            .from('footer_settings')
            .update({ ...settings, updated_at: new Date().toISOString() })
            .eq('id', settings.id)
        : await supabase.from('footer_settings').insert([settings]);

      if (error) throw error;
      toast.success('Footer settings saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save footer settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, field: keyof FooterSection, value: any) => {
    setSections(prev => prev.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    ));
  };

  const updateSectionContent = (index: number, contentField: string, value: any) => {
    setSections(prev => prev.map((s, i) =>
      i === index ? {
        ...s,
        content: { ...s.content, [contentField]: value }
      } : s
    ));
  };

  const addLinkToSection = (sectionIndex: number, linkType: 'links' | 'items') => {
    setSections(prev => prev.map((s, i) => {
      if (i === sectionIndex) {
        const links = s.content[linkType] || [];
        return {
          ...s,
          content: {
            ...s.content,
            [linkType]: [...links, { label: '', href: '' }]
          }
        };
      }
      return s;
    }));
  };

  const updateLink = (sectionIndex: number, linkIndex: number, field: string, value: string, linkType: 'links' | 'items') => {
    setSections(prev => prev.map((s, i) => {
      if (i === sectionIndex) {
        const links = [...(s.content[linkType] || [])];
        links[linkIndex] = { ...links[linkIndex], [field]: value };
        return {
          ...s,
          content: { ...s.content, [linkType]: links }
        };
      }
      return s;
    }));
  };

  const removeLink = (sectionIndex: number, linkIndex: number, linkType: 'links' | 'items') => {
    setSections(prev => prev.map((s, i) => {
      if (i === sectionIndex) {
        const links = (s.content[linkType] || []).filter((_: any, li: number) => li !== linkIndex);
        return {
          ...s,
          content: { ...s.content, [linkType]: links }
        };
      }
      return s;
    }));
  };

  const addLegalLink = () => {
    setSettings(prev => ({
      ...prev,
      legal_links: [...prev.legal_links, { label: '', href: '' }]
    }));
  };

  const updateLegalLink = (index: number, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      legal_links: prev.legal_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLegalLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      legal_links: prev.legal_links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const brandSection = sections.find(s => s.section_key === 'brand');
  const navSection = sections.find(s => s.section_key === 'navigation');
  const servicesSection = sections.find(s => s.section_key === 'services');
  const contactSection = sections.find(s => s.section_key === 'contact');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Footer Section Editor</h3>
          <p className="text-sm text-gray-600">Edit footer content, navigation, and styling</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
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
            <footer
              className="w-full py-12"
              style={{ backgroundColor: settings.background_color, color: settings.text_color }}
            >
              <div className="container mx-auto px-8">
                <div className="grid grid-cols-4 gap-8 mb-8">
                  {brandSection && (
                    <div>
                      <h4 className="text-xl font-bold mb-4">{brandSection.section_title}</h4>
                      <p className="text-sm">{brandSection.content.tagline}</p>
                    </div>
                  )}
                  {navSection && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4">{navSection.section_title}</h4>
                      <ul className="space-y-2">
                        {navSection.content.links?.map((link: any, i: number) => (
                          <li key={i}>
                            <a href={link.href} style={{ color: settings.link_color }}>
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {servicesSection && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4">{servicesSection.section_title}</h4>
                      <ul className="space-y-2">
                        {servicesSection.content.links?.map((link: any, i: number) => (
                          <li key={i}>
                            <a href={link.href} style={{ color: settings.link_color }}>
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {contactSection && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4">{contactSection.section_title}</h4>
                      <ul className="space-y-2">
                        {contactSection.content.items?.map((item: any, i: number) => (
                          <li key={i} className="text-sm">
                            {item.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="border-t pt-6" style={{ borderColor: settings.link_color }}>
                  <div className="flex justify-between items-center">
                    <p className="text-sm">{settings.copyright_text}</p>
                    <div className="flex gap-4">
                      {settings.legal_links?.map((link: any, i: number) => (
                        <a key={i} href={link.href} className="text-sm" style={{ color: settings.link_color }}>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content Sections</TabsTrigger>
            <TabsTrigger value="settings">Settings & Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="space-y-4">
              {sections.map((section, sIndex) => (
                <Card key={section.id || sIndex}>
                  <CardHeader>
                    <CardTitle>{section.section_title} Section</CardTitle>
                    <CardDescription>{section.section_key}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.section_key === 'brand' && (
                      <>
                        <div className="space-y-2">
                          <Label>Brand Name</Label>
                          <Input
                            value={section.section_title}
                            onChange={(e) => updateSection(sIndex, 'section_title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tagline</Label>
                          <Textarea
                            value={section.content.tagline || ''}
                            onChange={(e) => updateSectionContent(sIndex, 'tagline', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </>
                    )}

                    {(section.section_key === 'navigation' || section.section_key === 'services') && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Links</Label>
                          <Button size="sm" variant="outline" onClick={() => addLinkToSection(sIndex, 'links')}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Link
                          </Button>
                        </div>
                        {section.content.links?.map((link: any, lIndex: number) => (
                          <div key={lIndex} className="flex gap-2">
                            <Input
                              placeholder="Label"
                              value={link.label}
                              onChange={(e) => updateLink(sIndex, lIndex, 'label', e.target.value, 'links')}
                            />
                            <Input
                              placeholder="URL"
                              value={link.href}
                              onChange={(e) => updateLink(sIndex, lIndex, 'href', e.target.value, 'links')}
                            />
                            <Button size="sm" variant="ghost" onClick={() => removeLink(sIndex, lIndex, 'links')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.section_key === 'contact' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Contact Items</Label>
                          <Button size="sm" variant="outline" onClick={() => addLinkToSection(sIndex, 'items')}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Item
                          </Button>
                        </div>
                        {section.content.items?.map((item: any, iIndex: number) => (
                          <div key={iIndex} className="flex gap-2">
                            <Input
                              placeholder="Type (email, phone, location)"
                              value={item.type}
                              onChange={(e) => updateLink(sIndex, iIndex, 'type', e.target.value, 'items')}
                            />
                            <Input
                              placeholder="Value"
                              value={item.value}
                              onChange={(e) => updateLink(sIndex, iIndex, 'value', e.target.value, 'items')}
                            />
                            <Button size="sm" variant="ghost" onClick={() => removeLink(sIndex, iIndex, 'items')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleSaveSections} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save All Sections
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure colors and bottom bar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.background_color}
                        onChange={(e) => setSettings(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.background_color}
                        onChange={(e) => setSettings(prev => ({ ...prev, background_color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.text_color}
                        onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.text_color}
                        onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input
                    value={settings.copyright_text}
                    onChange={(e) => setSettings(prev => ({ ...prev, copyright_text: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Legal Links</Label>
                    <Button size="sm" variant="outline" onClick={addLegalLink}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  {settings.legal_links?.map((link: any, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Label"
                        value={link.label}
                        onChange={(e) => updateLegalLink(index, 'label', e.target.value)}
                      />
                      <Input
                        placeholder="URL"
                        value={link.href}
                        onChange={(e) => updateLegalLink(index, 'href', e.target.value)}
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeLegalLink(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
