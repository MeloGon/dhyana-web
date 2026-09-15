'use client';
import { useState } from 'react';
import { saveSiteServices } from '@/lib/api/site-settings';
import type { SiteService } from '@/lib/types/site-settings';

export function useSiteServices(initial: SiteService[]) {
  const [services, setServices] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const update = (id: string, change: Partial<SiteService>) => { setMessage(''); setServices((items) => items.map((item) => item.id === id ? { ...item, ...change } : item)); };
  const add = () => { setMessage(''); setServices((items) => [...items, { id: crypto.randomUUID(), title: '', description: '', benefits: [], duration: '', modality: '', badge: '', icon: 'user', isPublished: false }]); };
  const remove = () => { setMessage(''); setServices((items) => items.filter((item) => item.id !== deleteId)); setDeleteId(null); };
  const move = (index: number, direction: number) => {
    setMessage(''); setServices((items) => { const result = [...items]; const next = index + direction;
      if (next >= 0 && next < result.length) [result[index], result[next]] = [result[next], result[index]];
      return result;
    });
  };
  async function save() {
    setIsSaving(true); setErrorMessage(''); setMessage('');
    try { setServices(await saveSiteServices(services)); setMessage('Servicios guardados.'); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar.'); }
    finally { setIsSaving(false); }
  }
  return { services, isSaving, errorMessage, message, deleteId, setDeleteId, update, add, remove, move, save };
}
