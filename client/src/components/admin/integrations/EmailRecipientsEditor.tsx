import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Users, Plus, Trash2, Star } from 'lucide-react';

interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  is_primary: boolean;
  is_enabled: boolean;
}

export function EmailRecipientsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ email: '', name: '' });

  useEffect(() => {
    loadRecipients();
  }, []);

  async function loadRecipients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_recipients')
      .select('*')
      .order('is_primary', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des destinataires');
    } else if (data) {
      setRecipients(data);
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newRecipient.email) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient.email)) {
      toast.error('Adresse email invalide');
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from('email_recipients')
      .insert({
        email: newRecipient.email,
        name: newRecipient.name,
        is_primary: recipients.length === 0,
        is_enabled: true,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de l\'ajout');
    } else if (data) {
      setRecipients(prev => [...prev, data]);
      setNewRecipient({ email: '', name: '' });
      toast.success('Destinataire ajoute');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('email_recipients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      setRecipients(prev => prev.filter(r => r.id !== id));
      toast.success('Destinataire supprime');
    }
  }

  async function handleToggle(id: string, field: 'is_enabled' | 'is_primary', value: boolean) {
    if (field === 'is_primary' && value) {
      await supabase
        .from('email_recipients')
        .update({ is_primary: false })
        .neq('id', id);

      setRecipients(prev =>
        prev.map(r => ({ ...r, is_primary: r.id === id }))
      );
    } else {
      setRecipients(prev =>
        prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
      );
    }

    const { error } = await supabase
      .from('email_recipients')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise a jour');
      loadRecipients();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Destinataires des notifications
        </CardTitle>
        <CardDescription>
          Les emails de notification seront envoyes a ces adresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Email"
              type="email"
              value={newRecipient.email}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Nom (optionnel)"
              value={newRecipient.name}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={saving}
            className="bg-[#FF6B35] hover:bg-[#e55a2a]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {recipients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun destinataire configure. Ajoutez une adresse email pour recevoir les notifications.
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {recipient.is_primary && (
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {recipient.name || recipient.email}
                    </p>
                    {recipient.name && (
                      <p className="text-sm text-gray-500">{recipient.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-500">Principal</Label>
                    <Switch
                      checked={recipient.is_primary}
                      onCheckedChange={(v) => handleToggle(recipient.id, 'is_primary', v)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-500">Actif</Label>
                    <Switch
                      checked={recipient.is_enabled}
                      onCheckedChange={(v) => handleToggle(recipient.id, 'is_enabled', v)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(recipient.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
