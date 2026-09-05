import type { WorkshopFormData, SubmitResult } from '@/lib/types';

/**
 * Registra una pre-inscripción a un taller.
 *
 * ⚠️ STUB: hoy simula la llamada con un delay y genera un código local.
 * No hay backend conectado todavía.
 *
 * Para conectar el backend real, reemplazar el cuerpo por el fetch y NO tocar
 * nada más: el hook (`useWorkshopRegistration`) y el componente
 * (`WorkshopsSection`) ya consumen esta firma. Ejemplo:
 *
 *   const res = await fetch('/api/talleres/inscripcion', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data),
 *   });
 *   if (!res.ok) throw new Error('No se pudo registrar la inscripción');
 *   return res.json();
 */
export async function submitWorkshopRegistration(data: WorkshopFormData): Promise<SubmitResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  void data;

  return {
    ok: true,
    referenceCode: `TAL-${Math.floor(100000 + Math.random() * 900000)}`,
  };
}
