import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { FacebookPixelConfig, SiteIntegration } from '@/types/integrations';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export function FacebookPixelEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [config, setConfig] = useState<FacebookPixelConfig>({
    pixel_id: '',
    track_page_view: true,
    track_view_content: true,
    track_lead: true,
    track_contact: true,
    advanced_matching: false,
    test_mode: false,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_integrations')
      .select('*')
      .eq('integration_type', 'facebook_pixel')
      .maybeSingle();

    if (error) {
      toast.error('Erreur lors du chargement de la configuration');
    } else if (data) {
      const integration = data as SiteIntegration;
      setIntegrationId(integration.id);
      setIsEnabled(integration.is_enabled);
      setConfig(integration.config as FacebookPixelConfig);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!integrationId) return;

    setSaving(true);
    const { error } = await supabase
      .from('site_integrations')
      .update({
        is_enabled: isEnabled,
        config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Configuration sauvegardée');
    }
    setSaving(false);
  }

  const updateConfig = (key: keyof FacebookPixelConfig, value: boolean | string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isConfigured = config.pixel_id && config.pixel_id.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Facebook Pixel
                {isEnabled && isConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription>
                Suivez les conversions et optimisez vos publicités Facebook
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="pixel-enabled" className="text-sm text-gray-600">
                {isEnabled ? 'Actif' : 'Inactif'}
              </Label>
              <Switch
                id="pixel-enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pixel-id">Pixel ID</Label>
            <Input
              id="pixel-id"
              placeholder="Entrez votre Pixel ID (ex: 123456789012345)"
              value={config.pixel_id}
              onChange={(e) => updateConfig('pixel_id', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Trouvez votre Pixel ID dans le{' '}
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF6B35] hover:underline inline-flex items-center gap-1"
              >
                Facebook Events Manager
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {config.test_mode && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Mode test actif - Les evenements sont envoyes au Test Events dans Facebook Events Manager
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Evenements a suivre</h4>

            <div className="grid gap-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <Label className="font-medium">PageView</Label>
                  <p className="text-sm text-gray-500">Suivi des pages visitees</p>
                </div>
                <Switch
                  checked={config.track_page_view}
                  onCheckedChange={(v) => updateConfig('track_page_view', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <Label className="font-medium">ViewContent</Label>
                  <p className="text-sm text-gray-500">Consultation de contenu (services, projets)</p>
                </div>
                <Switch
                  checked={config.track_view_content}
                  onCheckedChange={(v) => updateConfig('track_view_content', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <Label className="font-medium">Lead</Label>
                  <p className="text-sm text-gray-500">Soumission de formulaire de contact</p>
                </div>
                <Switch
                  checked={config.track_lead}
                  onCheckedChange={(v) => updateConfig('track_lead', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <Label className="font-medium">Contact</Label>
                  <p className="text-sm text-gray-500">Interaction avec les informations de contact</p>
                </div>
                <Switch
                  checked={config.track_contact}
                  onCheckedChange={(v) => updateConfig('track_contact', v)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900">Options avancees</h4>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="font-medium">Mode test</Label>
                <p className="text-sm text-gray-500">Envoyer les evenements au Test Events</p>
              </div>
              <Switch
                checked={config.test_mode}
                onCheckedChange={(v) => updateConfig('test_mode', v)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="font-medium">Advanced Matching</Label>
                <p className="text-sm text-gray-500">Ameliorer le ciblage avec les donnees utilisateur</p>
              </div>
              <Switch
                checked={config.advanced_matching}
                onCheckedChange={(v) => updateConfig('advanced_matching', v)}
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-base">Comment tester votre Pixel</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>1. Installez l'extension <strong>Facebook Pixel Helper</strong> sur Chrome</p>
          <p>2. Activez le <strong>Mode test</strong> ci-dessus</p>
          <p>3. Visitez votre site et verifiez que les evenements apparaissent</p>
          <p>4. Consultez le <strong>Test Events</strong> dans Facebook Events Manager</p>
        </CardContent>
      </Card>
    </div>
  );
}
