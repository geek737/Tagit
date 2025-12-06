import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { SectionLoader } from '@/components/ui/GlobalLoader';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  display_order: number;
  is_visible: boolean;
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .is('parent_id', null)
        .order('display_order');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of menuItems) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            label: item.label,
            href: item.href,
            is_visible: item.is_visible,
            display_order: item.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) throw error;
      }
      toast.success('Menu updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = async () => {
    try {
      const newOrder = menuItems.length > 0
        ? Math.max(...menuItems.map(item => item.display_order)) + 1
        : 1;

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          label: 'New Item',
          href: '#',
          display_order: newOrder,
          is_visible: true
        })
        .select()
        .single();

      if (error) throw error;
      setMenuItems(prev => [...prev, data]);
      toast.success('Menu item added');
    } catch (error) {
      toast.error('Failed to add menu item');
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast.success('Menu item deleted');
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string | boolean | number) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <SectionLoader text="Chargement du menu..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Menu Management</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Configure your website navigation menu</p>
          </div>
          <Button onClick={addMenuItem} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Drag to reorder, edit labels and links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No menu items found</p>
                <p className="text-sm text-gray-500 mt-1">Add your first menu item to get started</p>
              </div>
            ) : (
              menuItems.map((item, index) => (
                <Card key={item.id} className="border-2">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`label-${item.id}`}>Label</Label>
                            <Input
                              id={`label-${item.id}`}
                              value={item.label}
                              onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                              placeholder="Menu label"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`href-${item.id}`}>Link</Label>
                            <Input
                              id={`href-${item.id}`}
                              value={item.href}
                              onChange={(e) => updateMenuItem(item.id, 'href', e.target.value)}
                              placeholder="#section"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`visible-${item.id}`}
                              checked={item.is_visible}
                              onCheckedChange={(checked) => updateMenuItem(item.id, 'is_visible', checked)}
                            />
                            <Label htmlFor={`visible-${item.id}`}>Visible</Label>
                          </div>
                          <span className="text-sm text-gray-500">Order: {item.display_order}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 justify-end">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move hidden sm:block" />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMenuItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {menuItems.length > 0 && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
