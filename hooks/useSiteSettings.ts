'use client';
import { useState } from 'react';
import { saveSiteSettings, uploadSiteAsset } from '@/lib/api/site-settings';
import type { SiteContent, SiteTextKey, SiteVisibilityKey } from '@/lib/types/site-settings';

export function useSiteSettings(initial: SiteContent) {
  const [settings, setSettings] = useState(initial.settings);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'video' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const setText = (key: SiteTextKey, value: string) => { setMessage(''); setSettings((s) => ({ ...s, texts: { ...s.texts, [key]: value } })); };
  const setVisibility = (key: SiteVisibilityKey, value: boolean) => { setMessage(''); setSettings((s) => ({ ...s, visibility: { ...s.visibility, [key]: value } })); };
  const clearAsset = (kind: 'logo' | 'video') => {
    setSettings((s) => ({ ...s, [kind === 'logo' ? 'logoPath' : 'videoPath']: '' }));
    if (kind === 'logo') setLogoUrl(''); else setVideoUrl('');
    setMessage('Archivo retirado del borrador. Guarda para publicar el cambio.');
  };
  async function upload(file: File, kind: 'logo' | 'video') {
    if (uploading || isSaving) return;
    setUploading(kind); setErrorMessage(''); setMessage('');
    try {
      const asset = await uploadSiteAsset(file, kind);
      setSettings((s) => ({ ...s, [kind === 'logo' ? 'logoPath' : 'videoPath']: asset.path }));
      if (kind === 'logo') setLogoUrl(asset.url); else setVideoUrl(asset.url);
      setMessage('Archivo subido. Guarda los cambios para mostrarlo en la web.');
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'No se pudo subir el archivo.'); }
    finally { setUploading(null); }
  }
  async function save() {
    if (uploading || isSaving) return;
    setIsSaving(true); setErrorMessage(''); setMessage('');
    try { const result = await saveSiteSettings(settings); setSettings(result.settings); setMessage('Cambios guardados. Ya se muestran al recargar la web.'); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar.'); }
    finally { setIsSaving(false); }
  }
  return { settings, logoUrl, videoUrl, isSaving, uploading, errorMessage, message, setText, setVisibility, clearAsset, upload, save };
}
