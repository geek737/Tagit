import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
}

interface FooterContent {
  id: string;
  section: string;
  content: string;
  link_url: string;
  display_order: number;
  is_visible: boolean;
}

const socialIcons = [
  { value: 'Facebook', label: 'Facebook', icon: Facebook },
  { value: 'Twitter', label: 'Twitter', icon: Twitter },
  { value: 'Instagram', label: 'Instagram', icon: Instagram },
  { value: 'Linkedin', label: 'LinkedIn', icon: Linkedin }
];

export default function FooterEditor() {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [footerContent, setFooterContent] = useState<FooterContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const [socialResult, contentResult] = await Promise.all([
        supabase.from('social_media').select('*').order('display_order'),
        supabase.from('footer_content').select('*').order('display_order')
      ]);

      if (socialResult.error) throw socialResult.error;
      if (contentResult.error) throw contentResult.error;

      setSocialMedia(socialResult.data || []);
      setFooterContent(contentResult.data || []);
    } catch (error) {
      toast.error('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const social of socialMedia) {
        if (social.id.startsWith('new-')) {
          await supabase.from('social_media').insert({
            platform: social.platform,
            url: social.url,
            icon: social.icon,
            display_order: social.display_order,
            is_visible: social.is_visible
          });
        } else {
          await supabase
            .from('social_media')
            .update({
              platform: social.platform,
              url: social.url,
              icon: social.icon,
              display_order: social.display_order,
              is_visible: social.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', social.id);
        }
      }

      for (const content of footerContent) {
        if (content.id.startsWith('new-')) {
          await supabase.from('footer_content').insert({
            section: content.section,
            content: content.content,
            link_url: content.link_url,
            display_order: content.display_order,
            is_visible: content.is_visible
          });
        } else {
          await supabase
            .from('footer_content')
            .update({
              section: content.section,
              content: content.content,
              link_url: content.link_url,
              display_order: content.display_order,
              is_visible: content.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', content.id);
        }
      }

      toast.success('Footer updated successfully');
      loadFooterData();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addSocialMedia = () => {
    const newSocial: SocialMedia = {
      id: `new-${Date.now()}`,
      platform: 'Facebook',
      url: 'https://facebook.com',
      icon: 'Facebook',
      display_order: socialMedia.length,
      is_visible: true
    };
    setSocialMedia([...socialMedia, newSocial]);
  };

  const deleteSocialMedia = async (id: string) => {
    if (id.startsWith('new-')) {
      setSocialMedia(socialMedia.filter(s => s.id !== id));
    } else {
      try {
        await supabase.from('social_media').delete().eq('id', id);
        setSocialMedia(socialMedia.filter(s => s.id !== id));
        toast.success('Social media deleted');
      } catch (error) {
        toast.error('Failed to delete social media');
      }
    }
  };

  const updateSocialMedia = (id: string, field: keyof SocialMedia, value: any) => {
    setSocialMedia(socialMedia.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const addFooterContent = () => {
    const newContent: FooterContent = {
      id: `new-${Date.now()}`,
      section: 'general',
      content: 'New footer content',
      link_url: '',
      display_order: footerContent.length,
      is_visible: true
    };
    setFooterContent([...footerContent, newContent]);
  };

  const deleteFooterContent = async (id: string) => {
    if (id.startsWith('new-')) {
      setFooterContent(footerContent.filter(c => c.id !== id));
    } else {
      try {
        await supabase.from('footer_content').delete().eq('id', id);
        setFooterContent(footerContent.filter(c => c.id !== id));
        toast.success('Footer content deleted');
      } catch (error) {
        toast.error('Failed to delete footer content');
      }
    }
  };

  const updateFooterContent = (id: string, field: keyof FooterContent, value: any) => {
    setFooterContent(footerContent.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Social Media Links</CardTitle>
            <Button onClick={addSocialMedia} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Social Media
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialMedia.map((social) => (
            <div key={social.id} className="flex gap-4 items-end p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <select
                    value={social.icon}
                    onChange={(e) => {
                      updateSocialMedia(social.id, 'icon', e.target.value);
                      updateSocialMedia(social.id, 'platform', e.target.value);
                    }}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    {socialIcons.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>URL</Label>
                  <Input
                    value={social.url}
                    onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteSocialMedia(social.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Footer Content</CardTitle>
            <Button onClick={addFooterContent} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerContent.map((content) => (
            <div key={content.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">{content.section}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteFooterContent(content.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input
                    value={content.section}
                    onChange={(e) => updateFooterContent(content.id, 'section', e.target.value)}
                    placeholder="copyright, description, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link URL (Optional)</Label>
                  <Input
                    value={content.link_url || ''}
                    onChange={(e) => updateFooterContent(content.id, 'link_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={content.content}
                  onChange={(e) => updateFooterContent(content.id, 'content', e.target.value)}
                  placeholder="Footer text"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Footer'}
        </Button>
      </div>
    </div>
  );
}
