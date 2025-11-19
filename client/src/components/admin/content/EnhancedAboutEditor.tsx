import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Save, Eye } from 'lucide-react';

interface AboutContent {
  id?: string;
  heading_line1: string;
  heading_line1_color: string;
  heading_line2_part1: string;
  heading_line2_part2: string;
  heading_color: string;
  subtitle: string;
  subtitle_highlight: string;
  subtitle_color: string;
  subtitle_highlight_color: string;
  paragraph1: string;
  paragraph2: string;
  text_color: string;
  robot_image: string;
  robot_alt_text: string;
  background_color: string;
}

export default function EnhancedAboutEditor() {
  const [content, setContent] = useState<AboutContent>({
    heading_line1: 'Step inside',
    heading_line1_color: '#7C3AED',
    heading_line2_part1: 'Our ',
    heading_line2_part2: 'World',
    heading_color: '#7C3AED',
    subtitle: 'Digital Agency - ',
    subtitle_highlight: 'Web',
    subtitle_color: '#000000',
    subtitle_highlight_color: '#FF6B35',
    paragraph1: 'We design digital experiences that make brands shine. Guided by strategy, driven by creativity and powered by digital, we create content and stories that inspire, dare and leave a lasting impression, while generating real impact.',
    paragraph2: 'We would love to collaborate with you, imagine together projects that make a difference and give your brand the visibility and impact it deserves.',
    text_color: '#000000',
    robot_image: '',
    robot_alt_text: 'Robot 3D orange et violet représentant l\'innovation de l\'agence tagit',
    background_color: '#FFFFFF'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setContent(data);
    } catch (error) {
      console.error('Error loading about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, robot_image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = content.id
        ? await supabase
            .from('about_content')
            .update({ ...content, updated_at: new Date().toISOString() })
            .eq('id', content.id)
        : await supabase
            .from('about_content')
            .insert([content]);

      if (error) throw error;
      toast.success('About section saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save about section');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AboutContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
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
          <h3 className="text-xl font-bold">About Section Editor</h3>
          <p className="text-sm text-gray-600">Edit content and styling for the About section</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
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
              className="w-full px-16 py-24 min-h-screen flex items-center"
              style={{ backgroundColor: content.background_color }}
            >
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between gap-16">
                  <div className="flex-1 flex justify-center">
                    {content.robot_image && (
                      <img
                        src={content.robot_image}
                        alt={content.robot_alt_text}
                        className="w-full max-w-lg h-auto object-contain"
                      />
                    )}
                  </div>

                  <div className="flex-1 space-y-8">
                    <h2 className="text-6xl leading-tight">
                      <span className="font-bold" style={{ color: content.heading_line1_color }}>
                        {content.heading_line1}
                      </span>
                      <br />
                      <span className="font-bold" style={{ color: content.heading_color }}>
                        {content.heading_line2_part1}
                      </span>
                      <span className="font-normal" style={{ color: content.heading_color }}>
                        {content.heading_line2_part2}
                      </span>
                    </h2>

                    <p className="text-2xl font-medium" style={{ color: content.subtitle_color }}>
                      {content.subtitle}
                      <span className="font-semibold" style={{ color: content.subtitle_highlight_color }}>
                        {content.subtitle_highlight}
                      </span>
                    </p>

                    <div className="space-y-5" style={{ color: content.text_color }}>
                      <p className="text-lg leading-relaxed text-justify">
                        {content.paragraph1}
                      </p>
                      <p className="text-lg leading-relaxed text-justify">
                        {content.paragraph2}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styling">Styling & Colors</TabsTrigger>
            <TabsTrigger value="image">Robot Image</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Heading & Text Content</CardTitle>
                <CardDescription>Edit the main heading and paragraphs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heading_line1">Heading Line 1</Label>
                  <Input
                    id="heading_line1"
                    value={content.heading_line1}
                    onChange={(e) => updateField('heading_line1', e.target.value)}
                    placeholder="Step inside"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heading_line2_part1">Heading Line 2 - Part 1 (Bold)</Label>
                    <Input
                      id="heading_line2_part1"
                      value={content.heading_line2_part1}
                      onChange={(e) => updateField('heading_line2_part1', e.target.value)}
                      placeholder="Our "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heading_line2_part2">Heading Line 2 - Part 2 (Normal)</Label>
                    <Input
                      id="heading_line2_part2"
                      value={content.heading_line2_part2}
                      onChange={(e) => updateField('heading_line2_part2', e.target.value)}
                      placeholder="World"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle Text</Label>
                    <Input
                      id="subtitle"
                      value={content.subtitle}
                      onChange={(e) => updateField('subtitle', e.target.value)}
                      placeholder="Digital Agency - "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle_highlight">Subtitle Highlight</Label>
                    <Input
                      id="subtitle_highlight"
                      value={content.subtitle_highlight}
                      onChange={(e) => updateField('subtitle_highlight', e.target.value)}
                      placeholder="Web"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paragraph1">First Paragraph</Label>
                  <Textarea
                    id="paragraph1"
                    value={content.paragraph1}
                    onChange={(e) => updateField('paragraph1', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paragraph2">Second Paragraph</Label>
                  <Textarea
                    id="paragraph2"
                    value={content.paragraph2}
                    onChange={(e) => updateField('paragraph2', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling">
            <Card>
              <CardHeader>
                <CardTitle>Colors & Styling</CardTitle>
                <CardDescription>Customize colors for text and background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Line 1 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.heading_line1_color}
                        onChange={(e) => updateField('heading_line1_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={content.heading_line1_color}
                        onChange={(e) => updateField('heading_line1_color', e.target.value)}
                        placeholder="#7C3AED"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Heading Line 2 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.heading_color}
                        onChange={(e) => updateField('heading_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={content.heading_color}
                        onChange={(e) => updateField('heading_color', e.target.value)}
                        placeholder="#7C3AED"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subtitle Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.subtitle_color}
                        onChange={(e) => updateField('subtitle_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={content.subtitle_color}
                        onChange={(e) => updateField('subtitle_color', e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subtitle Highlight Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.subtitle_highlight_color}
                        onChange={(e) => updateField('subtitle_highlight_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={content.subtitle_highlight_color}
                        onChange={(e) => updateField('subtitle_highlight_color', e.target.value)}
                        placeholder="#FF6B35"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paragraph Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.text_color}
                        onChange={(e) => updateField('text_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={content.text_color}
                        onChange={(e) => updateField('text_color', e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.background_color}
                        onChange={(e) => updateField('background_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={content.background_color}
                        onChange={(e) => updateField('background_color', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card>
              <CardHeader>
                <CardTitle>Robot Image</CardTitle>
                <CardDescription>Upload and configure the robot image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="robot_image">Upload Robot Image</Label>
                  <Input
                    id="robot_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robot_alt_text">Image Alt Text</Label>
                  <Input
                    id="robot_alt_text"
                    value={content.robot_alt_text}
                    onChange={(e) => updateField('robot_alt_text', e.target.value)}
                  />
                </div>

                {content.robot_image && (
                  <div className="space-y-2">
                    <Label>Current Image Preview</Label>
                    <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                      <img
                        src={content.robot_image}
                        alt={content.robot_alt_text}
                        className="max-w-md h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
