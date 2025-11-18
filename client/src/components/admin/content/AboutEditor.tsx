import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  leftImage: string;
  backgroundColor: string;
  backgroundImage: string;
}

export default function AboutEditor() {
  const [content, setContent] = useState<AboutContent>({
    title: '',
    subtitle: '',
    description: '',
    leftImage: '',
    backgroundColor: '#FFFFFF',
    backgroundImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data: section } = await supabase
        .from('sections')
        .select('*')
        .eq('name', 'about')
        .single();

      const { data: sectionContent } = await supabase
        .from('section_content')
        .select('*')
        .eq('section_id', section?.id);

      const contentMap: Record<string, string> = {};
      sectionContent?.forEach(item => {
        contentMap[item.content_key] = item.content_value;
      });

      setContent({
        title: section?.title || '',
        subtitle: section?.subtitle || '',
        description: section?.description || '',
        leftImage: contentMap['left_image'] || '',
        backgroundColor: section?.background_color || '#FFFFFF',
        backgroundImage: section?.background_image || ''
      });
    } catch (error) {
      console.error('Failed to load about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: section } = await supabase
        .from('sections')
        .select('id')
        .eq('name', 'about')
        .single();

      if (!section) throw new Error('About section not found');

      await supabase
        .from('sections')
        .update({
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
          background_color: content.backgroundColor,
          background_image: content.backgroundImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      const { data: existingContent } = await supabase
        .from('section_content')
        .select('id')
        .eq('section_id', section.id)
        .eq('content_key', 'left_image')
        .single();

      if (existingContent) {
        await supabase
          .from('section_content')
          .update({
            content_value: content.leftImage,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContent.id);
      } else {
        await supabase
          .from('section_content')
          .insert({
            section_id: section.id,
            content_key: 'left_image',
            content_value: content.leftImage,
            content_type: 'image'
          });
      }

      toast.success('About section updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (field: 'leftImage' | 'backgroundImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Section Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="About Us"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={content.subtitle}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Who We Are"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell your story..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images & Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Left Side Image</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('leftImage', e)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {content.leftImage && (
              <img
                src={content.leftImage}
                alt="Left side preview"
                className="w-full h-64 object-cover rounded-md"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                value={content.backgroundColor}
                onChange={(e) => setContent(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-20 h-10"
              />
              <Input
                value={content.backgroundColor}
                onChange={(e) => setContent(prev => ({ ...prev, backgroundColor: e.target.value }))}
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Image (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('backgroundImage', e)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {content.backgroundImage && (
              <img
                src={content.backgroundImage}
                alt="Background preview"
                className="w-full h-32 object-cover rounded-md"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save About Section'}
        </Button>
      </div>
    </div>
  );
}
