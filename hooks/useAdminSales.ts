'use client';

import { useRef, useState, type FormEvent } from 'react';
import { getAdminSales, registerManualSale, setSaleCoordination, cancelSale, deleteManualSale } from '@/lib/api/admin-sales';
import type { AdminSalesPage, ManualPaymentMethod, ManualSaleResult, SalesFilters, AdminSale, SaleAction, SaleActionInput } from '@/lib/types/admin-sales';
import type { AdminWorkshop } from '@/lib/types/admin-catalog';

const initialFilters: SalesFilters = { query: '', access: 'all', coordination: 'all', page: 1 };

export function useAdminSales(initial: AdminSalesPage) {
  const [data, setData] = useState(initial);
  const [filters, setFilters] = useState(initialFilters);
  const appliedFilters = useRef(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [created, setCreated] = useState<ManualSaleResult | null>(null);
  const [coordinationId, setCoordinationId] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const [actionTarget, setActionTarget] = useState<{ sale: AdminSale; action: SaleAction } | null>(null);
  const [actionInput, setActionInput] = useState<SaleActionInput>({ reason: '', confirmationCode: '', isTestOrMistake: false });
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  async function load(next: SalesFilters) {
    const version = ++requestVersion.current;
    setIsLoading(true); setError('');
    try {
      const page = await getAdminSales(next);
      // Si llegan respuestas fuera de orden, solo pintar la petición más reciente.
      if (version === requestVersion.current) { setData(page); appliedFilters.current = next; }
    } catch (error) { if (version === requestVersion.current) setError(error instanceof Error ? error.message : 'No se pudieron cargar las ventas.'); }
    finally { if (version === requestVersion.current) setIsLoading(false); }
  }
  function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void load({ ...filters, page: 1 }); }
  function refresh() { void load(appliedFilters.current); }
  function goToPage(page: number) { void load({ ...appliedFilters.current, page }); }
  function handleCreated(result: ManualSaleResult) {
    setCreated(result); setIsFormOpen(false); setFilters(initialFilters); void load(initialFilters);
  }
  async function toggleCoordination(id: string, coordinated: boolean) {
    if (coordinationId) return;
    setCoordinationId(id); setError('');
    try { await setSaleCoordination(id, coordinated); await load(appliedFilters.current); }
    catch (error) { setError(error instanceof Error ? error.message : 'No se pudo actualizar la coordinación.'); }
    finally { setCoordinationId(null); }
  }
  function openAction(sale: AdminSale, action: SaleAction) {
    if (actionPending || coordinationId) return;
    setActionTarget({ sale, action }); setActionError('');
    setActionInput({ reason: '', confirmationCode: '', isTestOrMistake: false });
  }
  function closeAction() { if (!actionPending) setActionTarget(null); }
  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actionTarget || actionPending) return;
    setActionPending(true); setActionError(''); setNotice('');
    try {
      if (actionTarget.action === 'cancel') await cancelSale(actionTarget.sale.id, actionInput.reason);
      else await deleteManualSale(actionTarget.sale.id, actionInput);
      setNotice(actionTarget.action === 'cancel' ? 'Venta anulada. Historial conservado; no se realizó ninguna devolución.' : 'Venta manual y acceso eliminados definitivamente.');
      setCreated(null); setActionTarget(null);
      await load({ ...appliedFilters.current, page: 1 });
    } catch (error) { setActionError(error instanceof Error ? error.message : 'No se pudo completar la operación.'); }
    finally { setActionPending(false); }
  }
  return { data, filters, setFilters, isLoading, error, isFormOpen, setIsFormOpen, created,
    search, refresh, goToPage, handleCreated, toggleCoordination, coordinationId,
    actionTarget, actionInput, setActionInput, actionPending, actionError, notice, openAction, closeAction, submitAction };
}

export function useManualSale(workshops: AdminWorkshop[], onSaved: (result: ManualSaleResult) => void) {
  const options = workshops.filter((workshop) => workshop.category === 'group' && workshop.groups.length);
  const [workshopId, setWorkshopId] = useState(options[0]?.id ?? '');
  const [groupId, setGroupId] = useState(options[0]?.groups[0]?.id ?? '');
  const [requestId] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState(() => ({ buyerName: '', buyerEmail: '', buyerPhone: '',
    amount: options[0]?.groups[0] ? (options[0].groups[0].priceCents / 100).toFixed(2) : '',
    // Perú usa UTC-5. datetime-local necesita una fecha sin sufijo de zona.
    purchasedAt: new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 19),
    paymentMethod: 'yape' as ManualPaymentMethod, paymentReference: '', paymentVerified: false }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const selectedWorkshop = options.find((workshop) => workshop.id === workshopId);
  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((previous) => ({ ...previous, [key]: value, ...(key !== 'paymentVerified' ? { paymentVerified: false } : {}) }));
  }
  function selectGroup(id: string, workshop = selectedWorkshop) {
    setGroupId(id);
    const group = workshop?.groups.find((group) => group.id === id);
    setForm((previous) => ({ ...previous, amount: group ? (group.priceCents / 100).toFixed(2) : '', paymentVerified: false }));
  }
  function selectWorkshop(id: string) {
    setWorkshopId(id);
    const workshop = options.find((option) => option.id === id);
    selectGroup(workshop?.groups[0]?.id ?? '', workshop);
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setError('');
    try {
      const amount = form.amount.trim().replace(',', '.');
      if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error('Ingresa el importe recibido en soles con máximo dos decimales.');
      const [soles, cents = ''] = amount.split('.');
      const result = await registerManualSale({ requestId, groupId, buyerName: form.buyerName, buyerEmail: form.buyerEmail,
        buyerPhone: form.buyerPhone, amountCents: Number(soles) * 100 + Number(cents.padEnd(2, '0')),
        purchasedAt: form.purchasedAt, paymentMethod: form.paymentMethod, paymentReference: form.paymentReference, paymentVerified: form.paymentVerified });
      onSaved(result);
    } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo registrar la venta. Reintenta con los mismos datos.'); }
    finally { setIsSubmitting(false); }
  }
  return { form, setField, options, selectedWorkshop, workshopId, groupId, selectWorkshop, selectGroup, isSubmitting, error, handleSubmit };
}
