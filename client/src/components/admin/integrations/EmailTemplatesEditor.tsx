import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, FileText, Send, Reply, Info } from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_type: 'contact_notification' | 'auto_response';
  subject: string;
  body_html: string;
  body_text: string;
  is_enabled: boolean;
}

export function EmailTemplatesEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_templates')
      .select('*');

    if (error) {
      toast.error('Erreur lors du chargement des modeles');
    } else if (data) {
      setTemplates(data);
    }
    setLoading(false);
  }

  async function handleSave(templateType: string) {
    const template = templates.find(t => t.template_type === templateType);
    if (!template) return;

    setSaving(templateType);
    const { error } = await supabase
      .from('email_templates')
      .update({
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text,
        is_enabled: template.is_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', template.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Modele sauvegarde');
    }
    setSaving(null);
  }

  const updateTemplate = (
    templateType: string,
    field: keyof EmailTemplate,
    value: string | boolean
  ) => {
    setTemplates(prev =>
      prev.map(t =>
        t.template_type === templateType ? { ...t, [field]: value } : t
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const notificationTemplate = templates.find(t => t.template_type === 'contact_notification');
  const autoResponseTemplate = templates.find(t => t.template_type === 'auto_response');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modeles d'emails
          </CardTitle>
          <CardDescription>
            Personnalisez les emails envoyes automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Variables disponibles:</p>
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{name}}'}</code> Nom du contact,{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{email}}'}</code> Email,{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{phone}}'}</code> Telephone,{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{subject}}'}</code> Sujet,{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{message}}'}</code> Message,{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{date}}'}</code> Date,{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">{'{{time}}'}</code> Heure
              </div>
            </div>
          </div>

          <Tabs defaultValue="notification" className="space-y-4">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="notification" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Notification Admin
              </TabsTrigger>
              <TabsTrigger value="autoresponse" className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                Reponse automatique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notification" className="space-y-4">
              {notificationTemplate && (
                <>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">Activer les notifications</Label>
                      <p className="text-sm text-gray-500">
                        Envoyer un email aux administrateurs pour chaque nouveau message
                      </p>
                    </div>
                    <Switch
                      checked={notificationTemplate.is_enabled}
                      onCheckedChange={(v) => updateTemplate('contact_notification', 'is_enabled', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sujet de l'email</Label>
                    <Input
                      value={notificationTemplate.subject}
                      onChange={(e) => updateTemplate('contact_notification', 'subject', e.target.value)}
                      placeholder="Nouveau message de contact: {{subject}}"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu HTML</Label>
                    <Textarea
                      value={notificationTemplate.body_html}
                      onChange={(e) => updateTemplate('contact_notification', 'body_html', e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu texte (fallback)</Label>
                    <Textarea
                      value={notificationTemplate.body_text}
                      onChange={(e) => updateTemplate('contact_notification', 'body_text', e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave('contact_notification')}
                      disabled={saving === 'contact_notification'}
                      className="bg-[#FF6B35] hover:bg-[#e55a2a]"
                    >
                      {saving === 'contact_notification' && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Sauvegarder
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="autoresponse" className="space-y-4">
              {autoResponseTemplate && (
                <>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">Activer la reponse automatique</Label>
                      <p className="text-sm text-gray-500">
                        Envoyer un email de confirmation au visiteur apres soumission
                      </p>
                    </div>
                    <Switch
                      checked={autoResponseTemplate.is_enabled}
                      onCheckedChange={(v) => updateTemplate('auto_response', 'is_enabled', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sujet de l'email</Label>
                    <Input
                      value={autoResponseTemplate.subject}
                      onChange={(e) => updateTemplate('auto_response', 'subject', e.target.value)}
                      placeholder="Merci pour votre message - {{subject}}"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu HTML</Label>
                    <Textarea
                      value={autoResponseTemplate.body_html}
                      onChange={(e) => updateTemplate('auto_response', 'body_html', e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu texte (fallback)</Label>
                    <Textarea
                      value={autoResponseTemplate.body_text}
                      onChange={(e) => updateTemplate('auto_response', 'body_text', e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave('auto_response')}
                      disabled={saving === 'auto_response'}
                      className="bg-[#FF6B35] hover:bg-[#e55a2a]"
                    >
                      {saving === 'auto_response' && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Sauvegarder
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
