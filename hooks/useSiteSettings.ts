'use client';
import { useState } from 'react';
import { saveSiteSettings, uploadSiteAsset } from '@/lib/api/site-settings';
import { DEFAULT_SECTION_ORDER, DEFAULT_FLOATING_SOCIAL } from '@/lib/data/site-fields';
import type { SiteContent, SiteTextKey, SiteVisibilityKey, FloatingSocialDesign } from '@/lib/types/site-settings';

export function useSiteSettings(initial: SiteContent) {
  const [settings, setSettings] = useState({
    ...initial.settings,
    sectionOrder: initial.settings.sectionOrder?.length ? initial.settings.sectionOrder : [...DEFAULT_SECTION_ORDER],
    floatingSocial: initial.settings.floatingSocial || { ...DEFAULT_FLOATING_SOCIAL },
  });
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'video' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const setText = (key: SiteTextKey, value: string) => { setMessage(''); setSettings((s) => ({ ...s, texts: { ...s.texts, [key]: value } })); };
  const setVisibility = (key: SiteVisibilityKey, value: boolean) => { setMessage(''); setSettings((s) => ({ ...s, visibility: { ...s.visibility, [key]: value } })); };
  const setFloatingSocialEnabled = (enabled: boolean) => {
    setMessage('');
    setSettings((s) => ({ ...s, floatingSocial: { ...(s.floatingSocial || DEFAULT_FLOATING_SOCIAL), isEnabled: enabled } }));
  };
  const setFloatingSocialDesign = (design: FloatingSocialDesign) => {
    setMessage('');
    setSettings((s) => ({ ...s, floatingSocial: { ...(s.floatingSocial || DEFAULT_FLOATING_SOCIAL), design } }));
  };
  const setSocialNetwork = (network: 'facebook' | 'instagram' | 'youtube', field: 'enabled' | 'url', value: boolean | string) => {
    setMessage('');
    setSettings((s) => {
      const current = s.floatingSocial || { ...DEFAULT_FLOATING_SOCIAL };
      if (network === 'facebook') {
        return { ...s, floatingSocial: { ...current, ...(field === 'enabled' ? { facebookEnabled: Boolean(value) } : { facebookUrl: String(value) }) } };
      }
      if (network === 'instagram') {
        return { ...s, floatingSocial: { ...current, ...(field === 'enabled' ? { instagramEnabled: Boolean(value) } : { instagramUrl: String(value) }) } };
      }
      return { ...s, floatingSocial: { ...current, ...(field === 'enabled' ? { youtubeEnabled: Boolean(value) } : { youtubeUrl: String(value) }) } };
    });
  };
  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    setMessage('');
    setSettings((s) => {
      const current = [...(s.sectionOrder || DEFAULT_SECTION_ORDER)];
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
      return { ...s, sectionOrder: current };
    });
  };
  const moveSectionDown = (index: number) => {
    setMessage('');
    setSettings((s) => {
      const current = [...(s.sectionOrder || DEFAULT_SECTION_ORDER)];
      if (index >= current.length - 1) return s;
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
      return { ...s, sectionOrder: current };
    });
  };
  const resetSectionOrder = () => {
    setMessage('');
    setSettings((s) => ({ ...s, sectionOrder: [...DEFAULT_SECTION_ORDER] }));
  };
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
  return {
    settings,
    logoUrl,
    videoUrl,
    isSaving,
    uploading,
    errorMessage,
    message,
    setText,
    setVisibility,
    setFloatingSocialEnabled,
    setFloatingSocialDesign,
    setSocialNetwork,
    moveSectionUp,
    moveSectionDown,
    resetSectionOrder,
    clearAsset,
    upload,
    save,
  };
}
