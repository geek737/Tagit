import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { supabase } from '@/lib/supabase';
import type { CookieConsentSettings } from '@/types/integrations';
import { X, Cookie, Settings } from 'lucide-react';

export function CookieConsentBanner() {
  const { isLoaded, hasConsent, saveConsent, acceptAll, declineAll } = useCookieConsent();
  const [settings, setSettings] = useState<CookieConsentSettings | null>(null);
  const [showManage, setShowManage] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('cookie_consent_settings')
        .select('*')
        .maybeSingle();
      if (data) {
        setSettings(data);
      }
    }
    loadSettings();
  }, []);

  if (!isLoaded || hasConsent || !settings?.is_enabled) {
    return null;
  }

  const handleSavePreferences = () => {
    saveConsent(analytics, marketing);
    setShowManage(false);
  };

  if (showManage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowManage(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-[#FF6B35]" />
            <h3 className="text-lg font-semibold text-gray-900">
              {settings.manage_button_text}
            </h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label className="font-medium text-gray-900">Cookies essentiels</Label>
                <p className="text-sm text-gray-500">Toujours actifs</p>
              </div>
              <Switch checked disabled />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label className="font-medium text-gray-900">Cookies analytiques</Label>
                <p className="text-sm text-gray-500">Nous aident a comprendre l'utilisation du site</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <Label className="font-medium text-gray-900">Cookies marketing</Label>
                <p className="text-sm text-gray-500">Utilisés pour la publicité ciblée</p>
              </div>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowManage(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-[#FF6B35] hover:bg-[#e55a2a]"
              onClick={handleSavePreferences}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-[#FF6B35] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{settings.banner_title}</h3>
              <p className="text-sm text-gray-600">{settings.banner_message}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setShowManage(true)}
            >
              {settings.manage_button_text}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={declineAll}
            >
              {settings.decline_button_text}
            </Button>
            <Button
              size="sm"
              className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
              onClick={acceptAll}
            >
              {settings.accept_button_text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
