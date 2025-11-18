import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Palette } from 'lucide-react';

interface HeroContent {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage: string;
  backgroundColor: string;
  buttonStyle: {
    backgroundColor: string;
    textColor: string;
    hoverColor: string;
  };
}

export default function HeroEditor() {
  const [content, setContent] = useState<HeroContent>({
    headline: '',
    subtext: '',
    ctaText: '',
    ctaUrl: '',
    backgroundImage: '',
    backgroundColor: '#FFFFFF',
    buttonStyle: {
      backgroundColor: '#FF6B35',
      textColor: '#FFFFFF',
      hoverColor: '#E55A2B'
    }
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
        .eq('name', 'hero')
        .single();

      const { data: sectionContent } = await supabase
        .from('section_content')
        .select('*')
        .eq('section_id', section?.id);

      const contentMap: Record<string, string> = {};
      sectionContent?.forEach(item => {
        contentMap[item.content_key] = item.content_value;
      });

      const { data: button } = await supabase
        .from('buttons')
        .select('*')
        .eq('section_name', 'hero')
        .single();

      setContent({
        headline: section?.title || '',
        subtext: section?.subtitle || '',
        ctaText: button?.button_text || 'Get Started',
        ctaUrl: button?.button_url || '#contact',
        backgroundImage: section?.background_image || '',
        backgroundColor: section?.background_color || '#FFFFFF',
        buttonStyle: button?.button_style || content.buttonStyle
      });
    } catch (error) {
      console.error('Failed to load hero content:', error);
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
        .eq('name', 'hero')
        .single();

      if (!section) throw new Error('Hero section not found');

      await supabase
        .from('sections')
        .update({
          title: content.headline,
          subtitle: content.subtext,
          background_image: content.backgroundImage,
          background_color: content.backgroundColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      const { data: existingButton } = await supabase
        .from('buttons')
        .select('id')
        .eq('section_name', 'hero')
        .single();

      if (existingButton) {
        await supabase
          .from('buttons')
          .update({
            button_text: content.ctaText,
            button_url: content.ctaUrl,
            button_style: content.buttonStyle,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingButton.id);
      } else {
        await supabase
          .from('buttons')
          .insert({
            section_name: 'hero',
            button_text: content.ctaText,
            button_url: content.ctaUrl,
            button_style: content.buttonStyle
          });
      }

      toast.success('Hero section updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, backgroundImage: reader.result as string }));
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
          <CardTitle>Hero Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={content.headline}
              onChange={(e) => setContent(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="Your amazing headline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtext">Subtext</Label>
            <Textarea
              id="subtext"
              value={content.subtext}
              onChange={(e) => setContent(prev => ({ ...prev, subtext: e.target.value }))}
              placeholder="Supporting text"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Button Text</Label>
              <Input
                id="ctaText"
                value={content.ctaText}
                onChange={(e) => setContent(prev => ({ ...prev, ctaText: e.target.value }))}
                placeholder="Call to action"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaUrl">Button URL</Label>
              <Input
                id="ctaUrl"
                value={content.ctaUrl}
                onChange={(e) => setContent(prev => ({ ...prev, ctaUrl: e.target.value }))}
                placeholder="#section"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Background & Styling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Label htmlFor="bgImage">Background Image</Label>
            <div className="flex gap-2">
              <Input
                id="bgImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Button Color</Label>
              <Input
                type="color"
                value={content.buttonStyle.backgroundColor}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  buttonStyle: { ...prev.buttonStyle, backgroundColor: e.target.value }
                }))}
                className="w-full h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={content.buttonStyle.textColor}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  buttonStyle: { ...prev.buttonStyle, textColor: e.target.value }
                }))}
                className="w-full h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Hover Color</Label>
              <Input
                type="color"
                value={content.buttonStyle.hoverColor}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  buttonStyle: { ...prev.buttonStyle, hoverColor: e.target.value }
                }))}
                className="w-full h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Hero Section'}
        </Button>
      </div>
    </div>
  );
}
