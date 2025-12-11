import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, Mail, Send, Eye, EyeOff } from 'lucide-react';

interface SMTPSettings {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'tls' | 'ssl' | 'none';
  from_email: string;
  from_name: string;
  is_enabled: boolean;
}

export function SMTPEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SMTPSettings>({
    id: '',
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    from_email: '',
    from_name: '',
    is_enabled: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('smtp_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error('Erreur lors du chargement des parametres SMTP');
    } else if (data) {
      setSettings(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const dataToSave = {
      host: settings.host,
      port: settings.port,
      username: settings.username,
      password: settings.password,
      encryption: settings.encryption,
      from_email: settings.from_email,
      from_name: settings.from_name,
      is_enabled: settings.is_enabled,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (settings.id) {
      const result = await supabase
        .from('smtp_settings')
        .update(dataToSave)
        .eq('id', settings.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('smtp_settings')
        .insert(dataToSave)
        .select()
        .single();
      error = result.error;
      if (result.data) {
        setSettings(prev => ({ ...prev, id: result.data.id }));
      }
    }

    if (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'));
    } else {
      toast.success('Configuration SMTP sauvegardee');
    }
    setSaving(false);
  }

  async function handleTestConnection() {
    if (!settings.host || !settings.from_email) {
      toast.error('Veuillez configurer le serveur SMTP et l\'email expediteur');
      return;
    }

    setTesting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email?action=test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(settings),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const result = await response.json();

      if (result.success) {
        toast.success('Test reussi! Un email a ete envoye a ' + settings.from_email);
      } else {
        toast.error('Echec du test: ' + (result.error || 'Erreur inconnue'));
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error('Timeout: le serveur SMTP ne repond pas');
      } else {
        toast.error('Erreur de connexion au serveur');
      }
    }
    setTesting(false);
  }

  const updateSettings = (key: keyof SMTPSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isConfigured = settings.host && settings.from_email;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuration SMTP
                {settings.is_enabled && isConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription>
                Configurez le serveur SMTP pour l'envoi d'emails
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="smtp-enabled" className="text-sm text-gray-600">
                {settings.is_enabled ? 'Actif' : 'Inactif'}
              </Label>
              <Switch
                id="smtp-enabled"
                checked={settings.is_enabled}
                onCheckedChange={(v) => updateSettings('is_enabled', v)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">Serveur SMTP</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                value={settings.host}
                onChange={(e) => updateSettings('host', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={settings.port}
                onChange={(e) => updateSettings('port', parseInt(e.target.value) || 587)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-encryption">Chiffrement</Label>
            <Select
              value={settings.encryption}
              onValueChange={(v) => updateSettings('encryption', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectionnez le chiffrement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS (recommande)</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">Aucun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Nom d'utilisateur</Label>
              <Input
                id="smtp-username"
                placeholder="user@example.com"
                value={settings.username}
                onChange={(e) => updateSettings('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe SMTP"
                  value={settings.password}
                  onChange={(e) => updateSettings('password', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-4">Expediteur par defaut</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from-name">Nom de l'expediteur</Label>
                <Input
                  id="from-name"
                  placeholder="Mon Entreprise"
                  value={settings.from_name}
                  onChange={(e) => updateSettings('from_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">Email de l'expediteur</Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="contact@example.com"
                  value={settings.from_email}
                  onChange={(e) => updateSettings('from_email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !isConfigured}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Tester la connexion
            </Button>
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
          <CardTitle className="text-blue-900 text-base">Configuration SMTP courante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p><strong>Gmail:</strong> smtp.gmail.com, Port 587, TLS (utilisez un mot de passe d'application)</p>
          <p><strong>Outlook/Office 365:</strong> smtp.office365.com, Port 587, TLS</p>
          <p><strong>OVH:</strong> ssl0.ovh.net, Port 587, TLS</p>
          <p><strong>Mailjet:</strong> in-v3.mailjet.com, Port 587, TLS</p>
        </CardContent>
      </Card>
    </div>
  );
}
