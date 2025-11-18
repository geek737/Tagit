import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react';

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
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast.error('Failed to load contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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

      toast.success('Contact info updated successfully');
      loadContacts();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
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

  const deleteContact = async (id: string) => {
    if (id.startsWith('new-')) {
      setContacts(contacts.filter(c => c.id !== id));
    } else {
      try {
        await supabase.from('contact_info').delete().eq('id', id);
        setContacts(contacts.filter(c => c.id !== id));
        toast.success('Contact info deleted');
      } catch (error) {
        toast.error('Failed to delete contact info');
      }
    }
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Contact Information'}
        </Button>
      </div>
    </div>
  );
}
