import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { compressImage, validateImageFile } from '@/utils/imageUtils';

interface HeroContent {
  id?: string;
  heading_line1: string;
  heading_line1_color: string;
  heading_line2: string;
  heading_line2_color: string;
  subheading: string;
  description: string;
  background_color: string;
  background_image: string | null;
  hero_image: string | null;
  button1_text: string;
  button1_url: string;
  button1_bg_color: string;
  button1_text_color: string;
  button2_text: string;
  button2_url: string;
}

export default function EnhancedHeroEditor() {
  const [content, setContent] = useState<HeroContent>({
    heading_line1: 'Digital marketing,',
    heading_line1_color: '#FF6B35',
    heading_line2: 'Branding, Content',
    heading_line2_color: '#FFFFFF',
    subheading: 'Every brand has a story to tell.',
    description: 'Ours is to help yours shine with ideas that make an impact, a strategy that inspires, and results that last.',
    background_color: '#2D1B4E',
    background_image: null,
    hero_image: null,
    button1_text: 'What we offer',
    button1_url: '#services',
    button1_bg_color: '#FF6B35',
    button1_text_color: '#FFFFFF',
    button2_text: 'About Us',
    button2_url: '#about'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
      toast.error('Failed to load hero content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (content.id) {
        const { error } = await supabase
          .from('hero_content')
          .update({
            ...content,
            updated_at: new Date().toISOString()
          })
          .eq('id', content.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_content')
          .insert([{ ...content, is_active: true }]);

        if (error) throw error;
      }

      toast.success('Hero section saved successfully!');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save hero section');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    field: 'background_image' | 'hero_image',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const setUploading = field === 'background_image' ? setUploadingBg : setUploadingHero;
    setUploading(true);

    try {
      toast.info('Compressing and uploading image...');
      const compressed = await compressImage(file, 1920, 1080, 0.85);
      setContent(prev => ({ ...prev, [field]: compressed }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const updateField = <K extends keyof HeroContent>(field: K, value: HeroContent[K]) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Hero Section Editor</h3>
          <p className="text-sm text-gray-500 mt-1">Edit the main landing section of your website</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
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
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div
              className="relative w-full min-h-[600px] p-8 lg:p-16 flex items-center"
              style={{
                backgroundColor: content.background_color,
                backgroundImage: content.background_image ? `url(${content.background_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    <span style={{ color: content.heading_line1_color }}>
                      {content.heading_line1}
                    </span>
                    <br />
                    <span style={{ color: content.heading_line2_color }}>
                      {content.heading_line2}
                    </span>
                  </h1>

                  <div className="space-y-4">
                    <h2 className="text-xl lg:text-2xl font-semibold text-white">
                      {content.subheading}
                    </h2>
                    <p className="text-base lg:text-lg text-white/90 max-w-xl leading-relaxed">
                      {content.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      style={{
                        backgroundColor: content.button1_bg_color,
                        color: content.button1_text_color
                      }}
                      className="px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      {content.button1_text}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold border-2 border-white text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      {content.button2_text}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {content.hero_image && (
                  <div className="flex-1 max-w-md lg:max-w-lg">
                    <div className="rounded-3xl border-4 border-white/20 overflow-hidden bg-white/5 backdrop-blur-sm">
                      <img
                        src={content.hero_image}
                        alt="Hero"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="styling">Styling & Images</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Heading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Line 1 Text</Label>
                    <Input
                      value={content.heading_line1}
                      onChange={(e) => updateField('heading_line1', e.target.value)}
                      placeholder="Digital marketing,"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line 1 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.heading_line1_color}
                        onChange={(e) => updateField('heading_line1_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={content.heading_line1_color}
                        onChange={(e) => updateField('heading_line1_color', e.target.value)}
                        placeholder="#FF6B35"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Line 2 Text</Label>
                    <Input
                      value={content.heading_line2}
                      onChange={(e) => updateField('heading_line2', e.target.value)}
                      placeholder="Branding, Content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line 2 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.heading_line2_color}
                        onChange={(e) => updateField('heading_line2_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={content.heading_line2_color}
                        onChange={(e) => updateField('heading_line2_color', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subheading & Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input
                    value={content.subheading}
                    onChange={(e) => updateField('subheading', e.target.value)}
                    placeholder="Every brand has a story to tell."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={content.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    placeholder="Write a compelling description..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Button</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={content.button1_text}
                      onChange={(e) => updateField('button1_text', e.target.value)}
                      placeholder="What we offer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button URL</Label>
                    <Input
                      value={content.button1_url}
                      onChange={(e) => updateField('button1_url', e.target.value)}
                      placeholder="#services"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.button1_bg_color}
                        onChange={(e) => updateField('button1_bg_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={content.button1_bg_color}
                        onChange={(e) => updateField('button1_bg_color', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.button1_text_color}
                        onChange={(e) => updateField('button1_text_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={content.button1_text_color}
                        onChange={(e) => updateField('button1_text_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600 mb-2 block">Button Preview</Label>
                  <button
                    style={{
                      backgroundColor: content.button1_bg_color,
                      color: content.button1_text_color
                    }}
                    className="px-6 py-2 rounded-lg font-semibold"
                  >
                    {content.button1_text}
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary Button</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={content.button2_text}
                      onChange={(e) => updateField('button2_text', e.target.value)}
                      placeholder="About Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button URL</Label>
                    <Input
                      value={content.button2_url}
                      onChange={(e) => updateField('button2_url', e.target.value)}
                      placeholder="#about"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600 mb-2 block">Button Preview</Label>
                  <button className="px-6 py-2 rounded-lg font-semibold border-2 border-gray-800 text-gray-800">
                    {content.button2_text}
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Background Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      value={content.background_color}
                      onChange={(e) => updateField('background_color', e.target.value)}
                      placeholder="#2D1B4E"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Image (Optional - Grid Pattern)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('background_image', e)}
                      disabled={uploadingBg}
                      className="flex-1"
                    />
                    {uploadingBg && <Loader2 className="h-10 w-10 animate-spin text-accent" />}
                  </div>
                  {content.background_image && (
                    <div className="relative">
                      <img
                        src={content.background_image}
                        alt="Background preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateField('background_image', null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Main Hero Image (3D Handshake / Robot)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('hero_image', e)}
                      disabled={uploadingHero}
                      className="flex-1"
                    />
                    {uploadingHero && <Loader2 className="h-10 w-10 animate-spin text-accent" />}
                  </div>
                  {content.hero_image && (
                    <div className="relative">
                      <img
                        src={content.hero_image}
                        alt="Hero image preview"
                        className="w-full h-64 object-contain rounded-md bg-gray-100"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateField('hero_image', null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {!content.hero_image && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">No hero image uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
