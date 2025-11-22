import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, Phone, MapPin, Save, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ContactHeader {
  id?: string;
  heading_line1: string;
  heading_line2: string;
  heading_line1_color: string;
  heading_line2_color: string;
  description: string;
  description_color: string;
  background_color: string;
  background_gradient: string | null;
  is_active: boolean;
}

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
}

const iconOptions = [
  { value: 'Mail', label: 'Email', icon: Mail },
  { value: 'Phone', label: 'Phone', icon: Phone },
  { value: 'MapPin', label: 'Location', icon: MapPin }
];

export default function ContactEditor() {
  const [header, setHeader] = useState<ContactHeader>({
    heading_line1: 'Contact',
    heading_line2: 'Us',
    heading_line1_color: '#FFFFFF',
    heading_line2_color: '#FF6B35',
    description: 'Ready to make your brand shine? Let\'s talk about your project and discover together how we can help you.',
    description_color: '#FFFFFF',
    background_color: '#2D1B4E',
    background_gradient: null,
    is_active: true
  });
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, contactsRes] = await Promise.all([
        supabase.from('contact_header').select('*').eq('is_active', true).single(),
        supabase.from('contact_info').select('*').order('display_order')
      ]);

      if (headerRes.data) {
        setHeader(headerRes.data);
      }
      if (contactsRes.data) {
        setContacts(contactsRes.data || []);
      }
    } catch (error) {
      console.error('Error loading contact content:', error);
      toast.error('Failed to load contact content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sauvegarder le header
      if (header.id) {
        const { error: headerError } = await supabase
          .from('contact_header')
          .update({
            ...header,
            updated_at: new Date().toISOString()
          })
          .eq('id', header.id);

        if (headerError) throw headerError;
      } else {
        const { data, error: headerError } = await supabase
          .from('contact_header')
          .insert(header)
          .select()
          .single();

        if (headerError) throw headerError;
        if (data) setHeader({ ...header, id: data.id });
      }

      // Récupérer tous les contacts existants pour identifier ceux à supprimer
      const { data: existingContacts } = await supabase
        .from('contact_info')
        .select('id');

      const existingIds = new Set(existingContacts?.map(c => c.id) || []);
      const currentIds = new Set(contacts.map(c => c.id).filter(id => !id.startsWith('new-')));
      
      // Supprimer les contacts qui ne sont plus dans la liste
      const idsToDelete = Array.from(existingIds).filter(id => !currentIds.has(id));
      if (idsToDelete.length > 0) {
        await supabase
          .from('contact_info')
          .delete()
          .in('id', idsToDelete);
      }

      // Sauvegarder les contacts (nouveaux et modifiés)
      for (const contact of contacts) {
        if (contact.id.startsWith('new-')) {
          await supabase
            .from('contact_info')
            .insert({
              type: contact.type,
              label: contact.label,
              value: contact.value,
              icon: contact.icon,
              display_order: contact.display_order,
              is_visible: contact.is_visible
            });
        } else {
          await supabase
            .from('contact_info')
            .update({
              type: contact.type,
              label: contact.label,
              value: contact.value,
              icon: contact.icon,
              display_order: contact.display_order,
              is_visible: contact.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', contact.id);
        }
      }

      toast.success('Contact content updated successfully');
      loadContent();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateHeader = (field: keyof ContactHeader, value: any) => {
    setHeader(prev => ({ ...prev, [field]: value }));
  };

  const addContact = () => {
    const newContact: ContactInfo = {
      id: `new-${Date.now()}`,
      type: 'email',
      label: 'Email',
      value: 'contact@example.com',
      icon: 'Mail',
      display_order: contacts.length,
      is_visible: true
    };
    setContacts([...contacts, newContact]);
  };

  const deleteContact = (id: string) => {
    // Marquer pour suppression (ne pas supprimer immédiatement)
    setContacts(contacts.filter(c => c.id !== id));
    toast.info('Contact will be deleted when you save changes');
  };

  const updateContact = (id: string, field: keyof ContactInfo, value: any) => {
    setContacts(contacts.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Contact Section Editor</h3>
          <p className="text-sm text-gray-600">Edit header content and contact information</p>
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
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-0">
            <section 
              id="contact" 
              className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 lg:py-24"
              style={{
                backgroundColor: header.background_color,
                background: header.background_gradient || header.background_color
              }}
            >
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    <span style={{ color: header.heading_line1_color }}>
                      {header.heading_line1}
                    </span>{' '}
                    <span style={{ color: header.heading_line2_color }}>
                      {header.heading_line2}
                    </span>
                  </h2>
                  <p 
                    className="text-base md:text-lg max-w-2xl mx-auto"
                    style={{ color: header.description_color }}
                  >
                    {header.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-4">
                    {contacts.filter(c => c.is_visible).map((contact) => {
                      const IconComponent = iconOptions.find(opt => opt.value === contact.icon)?.icon || Mail;
                      return (
                        <div key={contact.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium mb-1">{contact.label}</h4>
                            <p className="text-foreground/70 text-sm">{contact.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    <p className="text-white text-sm">Contact form preview</p>
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
            <TabsTrigger value="contacts">Contact Information</TabsTrigger>
            <TabsTrigger value="styling">Colors & Background</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Section Header</CardTitle>
                <CardDescription>Edit the main heading and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Line 1</Label>
                    <Input
                      value={header.heading_line1}
                      onChange={(e) => updateHeader('heading_line1', e.target.value)}
                      placeholder="Contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heading Line 2</Label>
                    <Input
                      value={header.heading_line2}
                      onChange={(e) => updateHeader('heading_line2', e.target.value)}
                      placeholder="Us"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={header.description}
                    onChange={(e) => updateHeader('description', e.target.value)}
                    rows={3}
                    placeholder="Ready to make your brand shine?"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <Button onClick={addContact} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">{contact.type}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteContact(contact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={contact.type}
                    onChange={(e) => updateContact(contact.id, 'type', e.target.value)}
                    placeholder="email, phone, address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={contact.label}
                    onChange={(e) => updateContact(contact.id, 'label', e.target.value)}
                    placeholder="Display label"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={contact.value}
                    onChange={(e) => updateContact(contact.id, 'value', e.target.value)}
                    placeholder="Contact value"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    value={contact.icon}
                    onChange={(e) => updateContact(contact.id, 'icon', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`visible-${contact.id}`}
                    checked={contact.is_visible}
                    onCheckedChange={(checked) => updateContact(contact.id, 'is_visible', checked)}
                  />
                  <Label htmlFor={`visible-${contact.id}`}>Visible</Label>
                </div>
                <span className="text-sm text-gray-500">Order: {contact.display_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

            </div>
          </TabsContent>

          <TabsContent value="styling">
            <Card>
              <CardHeader>
                <CardTitle>Colors & Background</CardTitle>
                <CardDescription>Customize section colors and background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Line 1 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.heading_line1_color}
                        onChange={(e) => updateHeader('heading_line1_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={header.heading_line1_color}
                        onChange={(e) => updateHeader('heading_line1_color', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Heading Line 2 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.heading_line2_color}
                        onChange={(e) => updateHeader('heading_line2_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={header.heading_line2_color}
                        onChange={(e) => updateHeader('heading_line2_color', e.target.value)}
                        placeholder="#FF6B35"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={header.description_color}
                      onChange={(e) => updateHeader('description_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={header.description_color}
                      onChange={(e) => updateHeader('description_color', e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={header.background_color}
                      onChange={(e) => updateHeader('background_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={header.background_color}
                      onChange={(e) => updateHeader('background_color', e.target.value)}
                      placeholder="#2D1B4E"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Gradient (optional)</Label>
                  <Input
                    value={header.background_gradient || ''}
                    onChange={(e) => updateHeader('background_gradient', e.target.value || null)}
                    placeholder="linear-gradient(135deg, #2D1B4E 0%, #1A0F2E 100%)"
                  />
                  <p className="text-xs text-gray-500">Leave empty to use solid background color</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
