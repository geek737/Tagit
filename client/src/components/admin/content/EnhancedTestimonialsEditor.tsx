import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, Plus, Trash2, GripVertical } from 'lucide-react';
import { SectionLoader } from '@/components/ui/GlobalLoader';

interface Testimonial {
  id?: string;
  author_name: string;
  author_role: string;
  content: string;
  content_color: string;
  author_name_color: string;
  author_role_color: string;
  quote_icon_color: string;
  display_order: number;
  is_visible: boolean;
}

interface TestimonialsHeader {
  id?: string;
  heading_part1: string;
  heading_part1_color: string;
  heading_part2: string;
  heading_part2_color: string;
  background_color: string;
}

export default function EnhancedTestimonialsEditor() {
  const [header, setHeader] = useState<TestimonialsHeader>({
    heading_part1: 'Clients',
    heading_part1_color: '#7C3AED',
    heading_part2: 'Feedback',
    heading_part2_color: '#000000',
    background_color: '#FFFFFF'
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, testimonialsRes] = await Promise.all([
        supabase.from('testimonials_header').select('*').single(),
        supabase.from('testimonials').select('*').order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error loading testimonials content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      const { error } = header.id
        ? await supabase
            .from('testimonials_header')
            .update({ ...header, updated_at: new Date().toISOString() })
            .eq('id', header.id)
        : await supabase.from('testimonials_header').insert([header]);

      if (error) throw error;
      toast.success('Testimonials header saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save testimonials header');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTestimonials = async () => {
    setSaving(true);
    try {
      const updates = testimonials.map((testimonial, index) => ({
        ...testimonial,
        display_order: index,
        updated_at: new Date().toISOString()
      }));

      for (const testimonial of updates) {
        if (testimonial.id) {
          await supabase.from('testimonials').update(testimonial).eq('id', testimonial.id);
        } else {
          await supabase.from('testimonials').insert([testimonial]);
        }
      }

      toast.success('Testimonials saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save testimonials');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const addTestimonial = () => {
    setTestimonials(prev => [...prev, {
      author_name: 'Client Name',
      author_role: 'Role, Company',
      content: 'Testimonial content here...',
      content_color: '#374151',
      author_name_color: '#FF6B35',
      author_role_color: '#6B7280',
      quote_icon_color: '#FF6B35',
      display_order: prev.length,
      is_visible: true
    }]);
  };

  const removeTestimonial = async (index: number) => {
    const testimonial = testimonials[index];
    if (testimonial.id) {
      await supabase.from('testimonials').delete().eq('id', testimonial.id);
    }
    setTestimonials(prev => prev.filter((_, i) => i !== index));
    toast.success('Testimonial removed');
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    setTestimonials(prev => prev.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    ));
  };

  if (loading) {
    return <SectionLoader text="Chargement des témoignages..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Testimonials Section Editor</h3>
          <p className="text-sm text-gray-600">Edit header and manage client feedback</p>
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
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-0">
            <section
              className="w-full min-h-screen flex items-center py-16"
              style={{ backgroundColor: header.background_color }}
            >
              <div className="container mx-auto px-8">
                <div className="flex flex-col gap-12">
                  <h2 className="text-6xl font-bold text-center">
                    <span style={{ color: header.heading_part1_color }}>{header.heading_part1}</span>{' '}
                    <span style={{ color: header.heading_part2_color }}>{header.heading_part2}</span>
                  </h2>

                  {testimonials.filter(t => t.is_visible)[0] && (
                    <div className="max-w-4xl mx-auto text-center">
                      <div className="text-6xl mb-8" style={{ color: testimonials[0].quote_icon_color }}>
                        ❝
                      </div>
                      <p className="text-lg mb-8" style={{ color: testimonials[0].content_color }}>
                        {testimonials[0].content}
                      </p>
                      <div>
                        <p className="text-xl font-bold uppercase" style={{ color: testimonials[0].author_name_color }}>
                          {testimonials[0].author_name}
                        </p>
                        <p className="text-base" style={{ color: testimonials[0].author_role_color }}>
                          {testimonials[0].author_role}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="header" className="space-y-4">
          <TabsList>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials ({testimonials.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Header Content</CardTitle>
                <CardDescription>Edit the section heading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Part 1</Label>
                    <Input
                      value={header.heading_part1}
                      onChange={(e) => setHeader(prev => ({ ...prev, heading_part1: e.target.value }))}
                    />
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={header.heading_part1_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_part1_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.heading_part1_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_part1_color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Heading Part 2</Label>
                    <Input
                      value={header.heading_part2}
                      onChange={(e) => setHeader(prev => ({ ...prev, heading_part2: e.target.value }))}
                    />
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={header.heading_part2_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_part2_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.heading_part2_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_part2_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Header
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Manage client testimonials</p>
                <Button onClick={addTestimonial}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Testimonial
                </Button>
              </div>

              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        <CardTitle>Testimonial {index + 1}</CardTitle>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Testimonial Content</Label>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Author Name</Label>
                        <Input
                          value={testimonial.author_name}
                          onChange={(e) => updateTestimonial(index, 'author_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Author Role</Label>
                        <Input
                          value={testimonial.author_role}
                          onChange={(e) => updateTestimonial(index, 'author_role', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleSaveTestimonials} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save All Testimonials
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
