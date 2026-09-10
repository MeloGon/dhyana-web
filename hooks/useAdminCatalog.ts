'use client';

import { useState, type FormEvent } from 'react';
import { deleteWorkshop, saveWorkshop } from '@/lib/api/catalog';
import { workshopSlug } from '@/lib/workshop-slug';
import type { AdminGroup, AdminWorkshop, GroupDraft, WorkshopInput } from '@/lib/types/admin-catalog';

function groupDraft(group?: AdminGroup): GroupDraft {
  return { key: group?.id ?? crypto.randomUUID(), id: group?.id,
    scheduleDescription: group?.scheduleDescription ?? '', price: group ? (group.priceCents / 100).toFixed(2) : '',
    capacity: group ? String(group.capacity) : '', isPublished: group?.isPublished ?? false };
}

export function useAdminCatalog(initial: AdminWorkshop[]) {
  const [workshops, setWorkshops] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');
  const selected = workshops.find((workshop) => workshop.id === selectedId);
  function selectWorkshop(id: string | null) { setSelectedId(id); setMessage(''); }
  function handleWorkshopSaved(saved: AdminWorkshop) {
    setWorkshops((previous) => previous.some((item) => item.id === saved.id)
      ? previous.map((item) => item.id === saved.id ? saved : item) : [saved, ...previous]);
    setSelectedId(saved.id);
    setMessage('Taller y horarios guardados.');
  }
  function handleWorkshopDeleted(id: string) {
    setWorkshops((previous) => previous.filter((item) => item.id !== id));
    setSelectedId(null);
    setMessage('Taller eliminado.');
  }
  return { workshops, selected, selectedId, selectWorkshop, handleWorkshopSaved, handleWorkshopDeleted, isBusy, setIsBusy, message };
}

export function useWorkshopEditor(workshop: AdminWorkshop | undefined, onSaved: (saved: AdminWorkshop) => void,
  onDeleted: (id: string) => void, onBusyChange: (busy: boolean) => void) {
  const [form, setForm] = useState<WorkshopInput>({ title: workshop?.title ?? '',
    summary: workshop?.summary ?? '', category: workshop?.category ?? 'group', isPublished: workshop?.isPublished ?? false });
  const [groups, setGroups] = useState<GroupDraft[]>(() => workshop ? workshop.groups.map(groupDraft) : [groupDraft()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const slug = workshop && form.title.trim() === workshop.title ? workshop.slug : workshopSlug(form.title);

  function setField<K extends keyof WorkshopInput>(key: K, value: WorkshopInput[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  function setGroupField<K extends keyof GroupDraft>(key: string, field: K, value: GroupDraft[K]) {
    setGroups((previous) => previous.map((group) => group.key === key ? { ...group, [field]: value } : group));
  }
  function addGroup() { setGroups((previous) => [...previous, groupDraft()]); }
  function removeGroup(key: string) { setGroups((previous) => previous.filter((group) => group.key !== key)); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isDeleting) return;
    setIsSubmitting(true); onBusyChange(true); setErrorMessage('');
    try {
      const inputs = groups.map((group, index) => {
        const price = group.price.trim().replace(',', '.');
        if (!/^\d+(\.\d{1,2})?$/.test(price)) throw new Error(`Horario ${index + 1}: ingresa un precio con máximo dos decimales.`);
        // Igual que un ViewModel: convertir lo escrito antes de llamar al servicio.
        const [soles, cents = ''] = price.split('.');
        return { ...(group.id ? { id: group.id } : {}), scheduleDescription: group.scheduleDescription,
          priceCents: Number(soles) * 100 + Number(cents.padEnd(2, '0')), capacity: Number(group.capacity), isPublished: group.isPublished };
      });
      const saved = await saveWorkshop({ ...form, groups: inputs }, workshop?.id);
      // Conservar los IDs recién creados: el siguiente guardado debe editar, no duplicar.
      setGroups(saved.groups.map(groupDraft));
      setForm({ title: saved.title, summary: saved.summary, category: saved.category, isPublished: saved.isPublished });
      onSaved(saved);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar el taller.'); }
    finally { setIsSubmitting(false); onBusyChange(false); }
  }
  async function handleDelete() {
    if (!workshop || !confirmDelete || isSubmitting || isDeleting) return;
    setIsDeleting(true); onBusyChange(true); setErrorMessage('');
    try { await deleteWorkshop(workshop.id); onDeleted(workshop.id); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar el taller.'); }
    finally { setIsDeleting(false); onBusyChange(false); }
  }
  return { form, slug, setField, groups, setGroupField, addGroup, removeGroup, isSubmitting, isDeleting,
    confirmDelete, setConfirmDelete, errorMessage, handleSubmit, handleDelete };
}
