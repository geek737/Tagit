import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Star, Upload } from 'lucide-react';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  author_company: string;
  author_image_url: string;
  content: string;
  rating: number;
  display_order: number;
  is_visible: boolean;
}

export default function TestimonialsEditor() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const testimonial of testimonials) {
        if (testimonial.id.startsWith('new-')) {
          await supabase
            .from('testimonials')
            .insert({
              author_name: testimonial.author_name,
              author_role: testimonial.author_role,
              author_company: testimonial.author_company,
              author_image_url: testimonial.author_image_url,
              content: testimonial.content,
              rating: testimonial.rating,
              display_order: testimonial.display_order,
              is_visible: testimonial.is_visible
            });
        } else {
          await supabase
            .from('testimonials')
            .update({
              author_name: testimonial.author_name,
              author_role: testimonial.author_role,
              author_company: testimonial.author_company,
              author_image_url: testimonial.author_image_url,
              content: testimonial.content,
              rating: testimonial.rating,
              display_order: testimonial.display_order,
              is_visible: testimonial.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', testimonial.id);
        }
      }

      toast.success('Testimonials updated successfully');
      loadTestimonials();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `new-${Date.now()}`,
      author_name: 'Client Name',
      author_role: 'Position',
      author_company: 'Company Name',
      author_image_url: '',
      content: 'Testimonial content goes here...',
      rating: 5,
      display_order: testimonials.length,
      is_visible: true
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const deleteTestimonial = async (id: string) => {
    if (id.startsWith('new-')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    } else {
      try {
        await supabase.from('testimonials').delete().eq('id', id);
        setTestimonials(testimonials.filter(t => t.id !== id));
        toast.success('Testimonial deleted');
      } catch (error) {
        toast.error('Failed to delete testimonial');
      }
    }
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
    setTestimonials(testimonials.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTestimonial(id, 'author_image_url', reader.result as string);
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
        <h3 className="text-lg font-semibold">Client Testimonials</h3>
        <Button onClick={addTestimonial} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{testimonial.author_name}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTestimonial(testimonial.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <Input
                    value={testimonial.author_name}
                    onChange={(e) => updateTestimonial(testimonial.id, 'author_name', e.target.value)}
                    placeholder="Client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={testimonial.author_role || ''}
                    onChange={(e) => updateTestimonial(testimonial.id, 'author_role', e.target.value)}
                    placeholder="CEO, Manager, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={testimonial.author_company || ''}
                    onChange={(e) => updateTestimonial(testimonial.id, 'author_company', e.target.value)}
                    placeholder="Company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={testimonial.rating}
                      onChange={(e) => updateTestimonial(testimonial.id, 'rating', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= testimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Author Photo</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(testimonial.id, e)}
                    className="flex-1"
                  />
                  {testimonial.author_image_url && (
                    <img
                      src={testimonial.author_image_url}
                      alt="Author"
                      className="w-12 h-12 object-cover rounded-full border-2"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Testimonial Content</Label>
                <Textarea
                  value={testimonial.content}
                  onChange={(e) => updateTestimonial(testimonial.id, 'content', e.target.value)}
                  placeholder="What did the client say?"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Testimonials'}
        </Button>
      </div>
    </div>
  );
}
