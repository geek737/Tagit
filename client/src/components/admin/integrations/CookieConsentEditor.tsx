import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { CookieConsentSettings } from '@/types/integrations';
import { Loader2, Cookie } from 'lucide-react';

export function CookieConsentEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Omit<CookieConsentSettings, 'id' | 'created_at' | 'updated_at'>>({
    banner_title: 'Cookies',
    banner_message: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
    accept_button_text: 'Accepter',
    decline_button_text: 'Refuser',
    manage_button_text: 'Gérer les préférences',
    is_enabled: true,
    consent_expiry_days: 365,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cookie_consent_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      toast.error('Erreur lors du chargement');
    } else if (data) {
      setSettingsId(data.id);
      setSettings({
        banner_title: data.banner_title,
        banner_message: data.banner_message,
        accept_button_text: data.accept_button_text,
        decline_button_text: data.decline_button_text,
        manage_button_text: data.manage_button_text,
        is_enabled: data.is_enabled,
        consent_expiry_days: data.consent_expiry_days,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    if (settingsId) {
      const { error } = await supabase
        .from('cookie_consent_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId);

      if (error) {
        toast.error('Erreur lors de la sauvegarde');
      } else {
        toast.success('Parametres sauvegardes');
      }
    } else {
      const { data, error } = await supabase
        .from('cookie_consent_settings')
        .insert(settings)
        .select()
        .single();

      if (error) {
        toast.error('Erreur lors de la creation');
      } else {
        setSettingsId(data.id);
        toast.success('Parametres crees');
      }
    }
    setSaving(false);
  }

  const updateSettings = (key: keyof typeof settings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-[#FF6B35]" />
              <div>
                <CardTitle>Bandeau de cookies</CardTitle>
                <CardDescription>
                  Configurez le bandeau de consentement RGPD
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="banner-enabled" className="text-sm text-gray-600">
                {settings.is_enabled ? 'Actif' : 'Inactif'}
              </Label>
              <Switch
                id="banner-enabled"
                checked={settings.is_enabled}
                onCheckedChange={(v) => updateSettings('is_enabled', v)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Titre</Label>
              <Input
                id="banner-title"
                value={settings.banner_title}
                onChange={(e) => updateSettings('banner_title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-days">Duree de validite (jours)</Label>
              <Input
                id="expiry-days"
                type="number"
                min={1}
                max={730}
                value={settings.consent_expiry_days}
                onChange={(e) => updateSettings('consent_expiry_days', parseInt(e.target.value) || 365)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-message">Message</Label>
            <Textarea
              id="banner-message"
              rows={3}
              value={settings.banner_message}
              onChange={(e) => updateSettings('banner_message', e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="accept-text">Bouton Accepter</Label>
              <Input
                id="accept-text"
                value={settings.accept_button_text}
                onChange={(e) => updateSettings('accept_button_text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decline-text">Bouton Refuser</Label>
              <Input
                id="decline-text"
                value={settings.decline_button_text}
                onChange={(e) => updateSettings('decline_button_text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manage-text">Bouton Gerer</Label>
              <Input
                id="manage-text"
                value={settings.manage_button_text}
                onChange={(e) => updateSettings('manage_button_text', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF6B35] hover:bg-[#e55a2a]"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
