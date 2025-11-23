import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Plus, Trash2, X, GripVertical, Grid3x3, Columns } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FooterSection {
  id: string;
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
  legal_links: Array<{ label: string; href: string }>;
  layout_columns: number;
  is_active: boolean;
}

function SortableSectionItem({
  section,
  index,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: {
  section: FooterSection;
  index: number;
  onUpdate: (index: number, field: keyof FooterSection, value: any) => void;
  onDelete: (index: number) => void;
  onToggleVisibility: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <CardTitle className="text-base capitalize">{section.section_key}</CardTitle>
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor={`visible-${section.id}`} className="text-sm">Visible</Label>
                <Switch
                  id={`visible-${section.id}`}
                  checked={section.is_visible}
                  onCheckedChange={() => onToggleVisibility(index)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input
              value={section.section_title}
              onChange={(e) => onUpdate(index, 'section_title', e.target.value)}
              placeholder="Section title"
            />
          </div>

          {!['brand', 'navigation', 'services', 'contact', 'custom', 'text', 'social'].includes(section.section_key) && (
            <div className="space-y-2">
              <Label>Section Key (unique identifier)</Label>
              <Input
                value={section.section_key}
                onChange={(e) => onUpdate(index, 'section_key', e.target.value)}
                placeholder="section-key"
              />
              <p className="text-xs text-gray-500">
                This is used to identify the section. Use lowercase with hyphens.
              </p>
            </div>
          )}

          {section.section_key === 'brand' && (
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Textarea
                value={section.content?.tagline || ''}
                onChange={(e) => {
                  onUpdate(index, 'content', {
                    ...section.content,
                    tagline: e.target.value,
                  });
                }}
                rows={3}
                placeholder="Your tagline here..."
              />
            </div>
          )}

          {(section.section_key === 'navigation' || section.section_key === 'services') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Links</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const links = section.content?.links || [];
                    onUpdate(index, 'content', {
                      ...section.content,
                      links: [...links, { label: '', href: '' }],
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Link
                </Button>
              </div>
              {(section.content?.links || []).map((link: any, linkIndex: number) => (
                <div key={linkIndex} className="flex gap-2">
                  <Input
                    placeholder="Label"
                    value={link.label || ''}
                    onChange={(e) => {
                      const links = [...(section.content?.links || [])];
                      links[linkIndex] = { ...link, label: e.target.value };
                      onUpdate(index, 'content', { ...section.content, links });
                    }}
                  />
                  <Input
                    placeholder="URL (e.g., #about)"
                    value={link.href || ''}
                    onChange={(e) => {
                      const links = [...(section.content?.links || [])];
                      links[linkIndex] = { ...link, href: e.target.value };
                      onUpdate(index, 'content', { ...section.content, links });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const links = (section.content?.links || []).filter(
                        (_: any, i: number) => i !== linkIndex
                      );
                      onUpdate(index, 'content', { ...section.content, links });
                    }}
                  >
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const items = section.content?.items || [];
                    onUpdate(index, 'content', {
                      ...section.content,
                      items: [...items, { type: 'email', value: '', icon: 'mail' }],
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>
              {(section.content?.items || []).map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="flex gap-2">
                  <Select
                    value={item.type || 'email'}
                    onValueChange={(value) => {
                      const items = [...(section.content?.items || [])];
                      const iconMap: { [key: string]: string } = {
                        email: 'mail',
                        phone: 'phone',
                        location: 'map-pin',
                        address: 'map-pin',
                      };
                      items[itemIndex] = {
                        ...item,
                        type: value,
                        icon: iconMap[value] || item.icon || 'mail',
                      };
                      onUpdate(index, 'content', { ...section.content, items });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="address">Address</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={item.value || ''}
                    onChange={(e) => {
                      const items = [...(section.content?.items || [])];
                      items[itemIndex] = { ...item, value: e.target.value };
                      const newContent = { ...section.content, items };
                      onUpdate(index, 'content', newContent);
                    }}
                  />
                  <Select
                    value={item.icon || 'mail'}
                    onValueChange={(value) => {
                      const items = [...(section.content?.items || [])];
                      items[itemIndex] = { ...item, icon: value };
                      onUpdate(index, 'content', { ...section.content, items });
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mail">Mail</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="map-pin">Map Pin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const items = (section.content?.items || []).filter(
                        (_: any, i: number) => i !== itemIndex
                      );
                      onUpdate(index, 'content', { ...section.content, items });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {section.section_key === 'custom' && (
            <div className="space-y-2">
              <Label>Section Key (unique identifier)</Label>
              <Input
                value={section.section_key}
                onChange={(e) => onUpdate(index, 'section_key', e.target.value)}
                placeholder="custom-section-1"
              />
              <Label>Custom Content (HTML allowed)</Label>
              <Textarea
                value={section.content?.html || ''}
                onChange={(e) => {
                  onUpdate(index, 'content', {
                    ...section.content,
                    html: e.target.value,
                  });
                }}
                rows={6}
                placeholder="<p>Your custom HTML content here...</p>"
              />
              <p className="text-xs text-gray-500">
                You can use HTML tags. Links will use the footer link colors automatically.
              </p>
            </div>
          )}

          {section.section_key === 'text' && (
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Textarea
                value={section.content?.text || ''}
                onChange={(e) => {
                  onUpdate(index, 'content', {
                    ...section.content,
                    text: e.target.value,
                  });
                }}
                rows={4}
                placeholder="Your text content here..."
              />
            </div>
          )}

          {section.section_key === 'social' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Social Media Links</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const links = section.content?.links || [];
                    onUpdate(index, 'content', {
                      ...section.content,
                      links: [...links, { platform: 'facebook', url: '' }],
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Social Link
                </Button>
              </div>
                      {(section.content?.links || []).map((link: any, linkIndex: number) => {
                        const isCustomPlatform = link.platform && !['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'github'].includes(link.platform);
                        return (
                          <div key={linkIndex} className="flex gap-2">
                            {!isCustomPlatform ? (
                              <Select
                                value={link.platform || 'facebook'}
                                onValueChange={(value) => {
                                  const links = [...(section.content?.links || [])];
                                  links[linkIndex] = { ...link, platform: value };
                                  onUpdate(index, 'content', { ...section.content, links });
                                }}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="facebook">Facebook</SelectItem>
                                  <SelectItem value="twitter">Twitter</SelectItem>
                                  <SelectItem value="instagram">Instagram</SelectItem>
                                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="tiktok">TikTok</SelectItem>
                                  <SelectItem value="github">GitHub</SelectItem>
                                  <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                placeholder="Platform name"
                                value={link.platform || ''}
                                onChange={(e) => {
                                  const links = [...(section.content?.links || [])];
                                  links[linkIndex] = { ...link, platform: e.target.value };
                                  onUpdate(index, 'content', { ...section.content, links });
                                }}
                                className="w-40"
                              />
                            )}
                            <Input
                              placeholder="URL"
                              value={link.url || ''}
                              onChange={(e) => {
                                const links = [...(section.content?.links || [])];
                                links[linkIndex] = { ...link, url: e.target.value };
                                onUpdate(index, 'content', { ...section.content, links });
                              }}
                            />
                            {isCustomPlatform && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const links = [...(section.content?.links || [])];
                                  links[linkIndex] = { ...link, platform: 'facebook' };
                                  onUpdate(index, 'content', { ...section.content, links });
                                }}
                              >
                                Use Select
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const links = (section.content?.links || []).filter(
                                  (_: any, i: number) => i !== linkIndex
                                );
                                onUpdate(index, 'content', { ...section.content, links });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EnhancedFooterEditor() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<FooterSettings>({
    background_color: '#7C3AED',
    text_color: '#FFFFFF',
    link_color: '#FFFFFF',
    link_hover_color: '#FF6B35',
    copyright_text: '2025 tagit. All rights reserved.',
    legal_links: [],
    layout_columns: 4,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [sectionsRes, settingsRes] = await Promise.all([
        supabase.from('footer_sections').select('*').order('display_order', { ascending: true }),
        supabase.from('footer_settings').select('*').eq('is_active', true).maybeSingle()
      ]);

      // Load sections - if empty, create default sections
      if (sectionsRes.data && sectionsRes.data.length > 0) {
        setSections(sectionsRes.data);
      } else {
        // Create default sections based on current footer
        const defaultSections: FooterSection[] = [
          {
            id: `new-${Date.now()}-1`,
            section_key: 'brand',
            section_title: 'tagit',
            content: {
              tagline: 'Your digital marketing agency in Morocco. We transform your ideas into digital success.',
            },
            display_order: 0,
            is_visible: true,
          },
          {
            id: `new-${Date.now()}-2`,
            section_key: 'navigation',
            section_title: 'Navigation',
            content: {
              links: [
                { label: 'Home', href: '#main-content' },
                { label: 'About', href: '#about' },
                { label: 'Our Services', href: '#services' },
                { label: 'Contact', href: '#contact' },
              ],
            },
            display_order: 1,
            is_visible: true,
          },
          {
            id: `new-${Date.now()}-3`,
            section_key: 'services',
            section_title: 'Services',
            content: {
              links: [
                { label: 'Digital Marketing', href: '#services' },
                { label: 'Branding & Brand Content', href: '#services' },
                { label: 'Social Media Management', href: '#services' },
                { label: 'Content Creation', href: '#services' },
                { label: 'Web Design & UI/UX', href: '#services' },
                { label: 'Visual Design', href: '#services' },
              ],
            },
            display_order: 2,
            is_visible: true,
          },
          {
            id: `new-${Date.now()}-4`,
            section_key: 'contact',
            section_title: 'Contact',
            content: {
              items: [
                { type: 'email', value: 'contact@tagit.ma', icon: 'mail' },
                { type: 'phone', value: '+212 6 00 00 00 00', icon: 'phone' },
                { type: 'location', value: 'Morocco', icon: 'map-pin' },
              ],
            },
            display_order: 3,
            is_visible: true,
          },
        ];
        setSections(defaultSections);
      }

      // Load settings - if empty, create default settings
      if (settingsRes.data) {
        setSettings({
          ...settingsRes.data,
          layout_columns: settingsRes.data.layout_columns || 4,
        });
      } else {
        // Use default settings based on current footer
        setSettings({
          background_color: '#7C3AED',
          text_color: '#FFFFFF',
          link_color: '#FFFFFF',
          link_hover_color: '#FF6B35',
          copyright_text: `${new Date().getFullYear()} tagit. All rights reserved.`,
          legal_links: [
            { label: 'Legal Notice', href: '#legal' },
            { label: 'Privacy Policy', href: '#privacy' },
            { label: 'Terms', href: '#terms' },
          ],
          layout_columns: 4,
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Error loading footer content:', error);
      toast.error('Failed to load footer content');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update display_order
        return newItems.map((item, index) => ({
          ...item,
          display_order: index,
        }));
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get all existing sections to identify deleted ones
      const { data: existingSections } = await supabase
        .from('footer_sections')
        .select('id');

      const existingIds = new Set(existingSections?.map((s) => s.id) || []);
      const currentIds = new Set(sections.map((s) => s.id).filter((id) => !id.startsWith('new-')));

      // Delete sections that were removed
      const idsToDelete = Array.from(existingIds).filter((id) => !currentIds.has(id));
      if (idsToDelete.length > 0) {
        await supabase.from('footer_sections').delete().in('id', idsToDelete);
      }

      // Save sections (new and updated)
      for (const section of sections) {
        if (section.id.startsWith('new-')) {
          const { data, error } = await supabase
            .from('footer_sections')
            .insert({
              section_key: section.section_key,
              section_title: section.section_title,
              content: section.content,
              display_order: section.display_order,
              is_visible: section.is_visible,
            })
            .select()
            .single();

          if (error) throw error;
        } else {
          // Ensure content is properly formatted as JSON
          const contentToSave = typeof section.content === 'string' 
            ? JSON.parse(section.content) 
            : section.content;
          
          const updateData = {
            section_key: section.section_key,
            section_title: section.section_title,
            content: contentToSave,
            display_order: section.display_order,
            is_visible: section.is_visible,
            updated_at: new Date().toISOString(),
          };
          
          const { error } = await supabase
            .from('footer_sections')
            .update(updateData)
            .eq('id', section.id);

          if (error) throw error;
        }
      }

      // Save settings
      if (settings.id) {
        const settingsToUpdate: any = {
          background_color: settings.background_color,
          text_color: settings.text_color,
          link_color: settings.link_color,
          link_hover_color: settings.link_hover_color,
          copyright_text: settings.copyright_text,
          legal_links: settings.legal_links,
          is_active: settings.is_active,
          updated_at: new Date().toISOString(),
        };
        
        if (settings.layout_columns !== undefined) {
          settingsToUpdate.layout_columns = settings.layout_columns;
        }
        
        const { error } = await supabase
          .from('footer_settings')
          .update(settingsToUpdate)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const settingsToInsert: any = {
          background_color: settings.background_color,
          text_color: settings.text_color,
          link_color: settings.link_color,
          link_hover_color: settings.link_hover_color,
          copyright_text: settings.copyright_text,
          legal_links: settings.legal_links,
          is_active: settings.is_active,
        };
        
        if (settings.layout_columns !== undefined) {
          settingsToInsert.layout_columns = settings.layout_columns;
        }
        
        const { data, error } = await supabase
          .from('footer_settings')
          .insert([settingsToInsert])
          .select()
          .single();

        if (error) throw error;
        if (data) setSettings({ ...settings, id: data.id });
      }

      toast.success('Footer saved successfully');
      await loadContent();
    } catch (error) {
      console.error('Failed to save footer:', error);
      toast.error('Failed to save footer');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, field: keyof FooterSection, value: any) => {
    setSections((prev) => {
      const updated = prev.map((s, i) => {
        if (i === index) {
          // Deep clone for content field to ensure proper update
          const newSection = field === 'content' 
            ? { ...s, [field]: JSON.parse(JSON.stringify(value)) } // Deep clone for JSON
            : { ...s, [field]: value };
          return newSection;
        }
        return s;
      });
      return updated;
    });
  };

  const deleteSection = (index: number) => {
    const section = sections[index];
    if (section.id) {
      // Mark for deletion (will be deleted on save)
      setSections((prev) => prev.filter((_, i) => i !== index));
      toast.info('Section will be deleted when you save changes');
    } else {
      setSections((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleSectionVisibility = (index: number) => {
    updateSection(index, 'is_visible', !sections[index].is_visible);
  };

  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [newSectionType, setNewSectionType] = useState<string>('brand');

  const addSection = () => {
    const sectionTemplates: { [key: string]: { title: string; content: any } } = {
      brand: { title: 'Brand', content: { tagline: '' } },
      navigation: { title: 'Navigation', content: { links: [] } },
      services: { title: 'Services', content: { links: [] } },
      contact: { title: 'Contact', content: { items: [] } },
      custom: { title: 'Custom HTML', content: { html: '' } },
      text: { title: 'Text Content', content: { text: '' } },
      social: { title: 'Social Media', content: { links: [] } },
    };

    const template = sectionTemplates[newSectionType];
    if (!template) {
      toast.error('Invalid section type');
      return;
    }

    // For custom sections, generate a unique key
    let sectionKey = newSectionType;
    if (newSectionType === 'custom' || newSectionType === 'text' || newSectionType === 'social') {
      const existingCustomKeys = sections
        .filter((s) => s.section_key.startsWith(newSectionType))
        .map((s) => s.section_key);
      let counter = 1;
      while (existingCustomKeys.includes(`${newSectionType}-${counter}`)) {
        counter++;
      }
      sectionKey = `${newSectionType}-${counter}`;
    }

    const newSection: FooterSection = {
      id: `new-${Date.now()}`,
      section_key: sectionKey,
      section_title: template.title,
      content: template.content,
      display_order: sections.length,
      is_visible: true,
    };

    setSections([...sections, newSection]);
    setShowAddSectionDialog(false);
    setNewSectionType('brand');
    toast.success('Section added successfully');
  };

  const addLegalLink = () => {
    setSettings((prev) => ({
      ...prev,
      legal_links: [...(prev.legal_links || []), { label: '', href: '' }],
    }));
  };

  const updateLegalLink = (index: number, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      legal_links: (prev.legal_links || []).map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeLegalLink = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      legal_links: (prev.legal_links || []).filter((_, i) => i !== index),
    }));
  };

  const getGridCols = (columns: number) => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      mail: '📧',
      phone: '📞',
      'map-pin': '📍',
    };
    return icons[iconName?.toLowerCase()] || '📧';
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
          <h3 className="text-xl font-bold">Footer Editor</h3>
          <p className="text-sm text-gray-600">Manage footer sections, layout, and styling</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            className={previewMode ? "bg-accent text-white hover:bg-accent/90" : "text-black hover:text-accent hover:border-accent"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            ) : (
              <>
            <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-0">
            <footer
              className="w-full py-12"
              style={{
                backgroundColor: settings.background_color,
                color: settings.text_color,
              }}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
                <div className={`grid ${getGridCols(settings.layout_columns)} gap-8 md:gap-12`}>
                  {sections
                    .filter((s) => s.is_visible)
                    .map((section) => {
                      if (section.section_key === 'brand') {
                        return (
                          <div key={section.id} className="space-y-4">
                            <div className="h-10 w-32 bg-white/20 rounded"></div>
                            <p className="text-sm" style={{ color: settings.text_color + 'CC' }}>
                              {section.content?.tagline || 'Tagline here...'}
                            </p>
                    </div>
                        );
                      }

                      if (section.section_key === 'navigation' || section.section_key === 'services') {
                        return (
                          <div key={section.id}>
                            <h4
                              className="text-lg font-semibold mb-4"
                              style={{ color: settings.link_hover_color }}
                            >
                              {section.section_title}
                            </h4>
                      <ul className="space-y-2">
                              {(section.content?.links || []).map((link: any, i: number) => (
                          <li key={i}>
                                  <a
                                    href={link.href || '#'}
                                    className="text-sm transition-colors"
                                    style={{ color: settings.text_color + 'CC' }}
                                  >
                                    {link.label || 'Link'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                        );
                      }

                      if (section.section_key === 'contact') {
                        return (
                          <div key={section.id}>
                            <h4
                              className="text-lg font-semibold mb-4"
                              style={{ color: settings.link_hover_color }}
                            >
                              {section.section_title}
                            </h4>
                            <ul className="space-y-3">
                              {(section.content?.items || []).map((item: any, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: settings.text_color + 'CC' }}>
                                  <span>{getIcon(item.icon)}</span>
                                  <span>{item.value || 'Contact info'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                        );
                      }

                      if (section.section_key === 'text') {
                        return (
                          <div key={section.id}>
                            {section.section_title && (
                              <h4
                                className="text-lg font-semibold mb-4"
                                style={{ color: settings.link_hover_color }}
                              >
                                {section.section_title}
                              </h4>
                            )}
                            <p className="text-sm whitespace-pre-line" style={{ color: settings.text_color + 'CC' }}>
                              {section.content?.text || 'Text content here...'}
                            </p>
                          </div>
                        );
                      }

                      if (section.section_key === 'social') {
                        return (
                          <div key={section.id}>
                            {section.section_title && (
                              <h4
                                className="text-lg font-semibold mb-4"
                                style={{ color: settings.link_hover_color }}
                              >
                                {section.section_title}
                              </h4>
                            )}
                      <ul className="space-y-2">
                              {(section.content?.links || []).map((link: any, i: number) => (
                                <li key={i}>
                                  <a
                                    href={link.url || '#'}
                                    className="text-sm transition-colors"
                                    style={{ color: settings.text_color + 'CC' }}
                                  >
                                    {link.platform || link.url || 'Social link'}
                                  </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                        );
                      }

                      if (section.section_key === 'custom' || section.section_key.startsWith('custom-')) {
                        return (
                          <div
                            key={section.id}
                            dangerouslySetInnerHTML={{ __html: section.content?.html || '<p>Custom HTML content</p>' }}
                            style={{ color: settings.text_color }}
                            className="text-sm"
                          />
                        );
                      }

                      return null;
                    })}
                </div>
                <div className="mt-12 pt-8 border-t" style={{ borderColor: settings.text_color + '33' }}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm" style={{ color: settings.text_color + '99' }}>
                      {settings.copyright_text}
                    </p>
                    <div className="flex gap-6 text-sm">
                      {(settings.legal_links || []).map((link, i) => (
                        <a
                          key={i}
                          href={link.href || '#'}
                          style={{ color: settings.text_color + '99' }}
                        >
                          {link.label || 'Link'}
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
        <Tabs defaultValue="sections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="layout">Layout & Styling</TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Footer Sections</h3>
                <Button onClick={() => setShowAddSectionDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {showAddSectionDialog && (
                <Card className="mb-4 border-2 border-accent">
                  <CardHeader>
                    <CardTitle>Add New Section</CardTitle>
                    <CardDescription>Choose the type of section you want to add</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        <div className="space-y-2">
                      <Label>Section Type</Label>
                      <Select value={newSectionType} onValueChange={setNewSectionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand">Brand (Logo + Tagline)</SelectItem>
                          <SelectItem value="navigation">Navigation (Links List)</SelectItem>
                          <SelectItem value="services">Services (Services List)</SelectItem>
                          <SelectItem value="contact">Contact (Contact Info with Icons)</SelectItem>
                          <SelectItem value="text">Text Content (Simple Text)</SelectItem>
                          <SelectItem value="social">Social Media (Social Links)</SelectItem>
                          <SelectItem value="custom">Custom HTML (Advanced)</SelectItem>
                        </SelectContent>
                      </Select>
                        </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
                        Cancel
                          </Button>
                      <Button onClick={addSection}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                            </Button>
                        </div>
                  </CardContent>
                </Card>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section, index) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      index={index}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                      onToggleVisibility={toggleSectionVisibility}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {sections.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No sections yet. Click "Add Section" to get started.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="layout">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Layout</CardTitle>
                  <CardDescription>Choose the number of columns for the footer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant={settings.layout_columns === 2 ? "default" : "outline"}
                      className={settings.layout_columns === 2 ? "bg-accent text-white" : ""}
                      onClick={() => setSettings((prev) => ({ ...prev, layout_columns: 2 }))}
                    >
                      <Columns className="h-4 w-4 mr-2" />
                      2 Columns
                          </Button>
                    <Button
                      variant={settings.layout_columns === 3 ? "default" : "outline"}
                      className={settings.layout_columns === 3 ? "bg-accent text-white" : ""}
                      onClick={() => setSettings((prev) => ({ ...prev, layout_columns: 3 }))}
                    >
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      3 Columns
                    </Button>
                    <Button
                      variant={settings.layout_columns === 4 ? "default" : "outline"}
                      className={settings.layout_columns === 4 ? "bg-accent text-white" : ""}
                      onClick={() => setSettings((prev) => ({ ...prev, layout_columns: 4 }))}
                    >
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      4 Columns
                            </Button>
                          </div>
                  </CardContent>
                </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Colors</CardTitle>
                  <CardDescription>Customize footer colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.background_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, background_color: e.target.value }))
                          }
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.background_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, background_color: e.target.value }))
                          }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.text_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, text_color: e.target.value }))
                          }
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.text_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, text_color: e.target.value }))
                          }
                      />
                    </div>
                  </div>
                    <div className="space-y-2">
                      <Label>Link Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.link_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, link_color: e.target.value }))
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.link_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, link_color: e.target.value }))
                          }
                        />
                </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Link Hover Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.link_hover_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, link_hover_color: e.target.value }))
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.link_hover_color}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, link_hover_color: e.target.value }))
                          }
                      />
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Copyright & Legal Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input
                    value={settings.copyright_text}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, copyright_text: e.target.value }))
                      }
                      placeholder="2025 tagit. All rights reserved."
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
                    {(settings.legal_links || []).map((link, index) => (
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
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
