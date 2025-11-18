import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon_url: string;
  display_order: number;
  is_visible: boolean;
}

export default function ServicesEditor() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const service of services) {
        if (service.id.startsWith('new-')) {
          await supabase
            .from('services')
            .insert({
              title: service.title,
              description: service.description,
              icon_url: service.icon_url,
              display_order: service.display_order,
              is_visible: service.is_visible
            });
        } else {
          await supabase
            .from('services')
            .update({
              title: service.title,
              description: service.description,
              icon_url: service.icon_url,
              display_order: service.display_order,
              is_visible: service.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', service.id);
        }
      }

      toast.success('Services updated successfully');
      loadServices();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    const newService: Service = {
      id: `new-${Date.now()}`,
      title: 'New Service',
      description: 'Service description',
      icon_url: '',
      display_order: services.length,
      is_visible: true
    };
    setServices([...services, newService]);
  };

  const deleteService = async (id: string) => {
    if (id.startsWith('new-')) {
      setServices(services.filter(s => s.id !== id));
    } else {
      try {
        await supabase.from('services').delete().eq('id', id);
        setServices(services.filter(s => s.id !== id));
        toast.success('Service deleted');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setServices(services.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleIconUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateService(id, 'icon_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Services Management</h3>
        <Button onClick={addService} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={service.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-base">Service {index + 1}</CardTitle>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteService(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={service.title}
                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                    placeholder="Service title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload(service.id, e)}
                      className="flex-1"
                    />
                    {service.icon_url && (
                      <img
                        src={service.icon_url}
                        alt="Icon"
                        className="w-10 h-10 object-contain border rounded"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={service.description || ''}
                  onChange={(e) => updateService(service.id, 'description', e.target.value)}
                  placeholder="Service description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Services'}
        </Button>
      </div>
    </div>
  );
}
