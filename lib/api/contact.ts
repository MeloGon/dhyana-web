import type { ContactFormData, SubmitResult } from '@/lib/types';

/**
 * Envía una solicitud de cita / mensaje de contacto.
 *
 * ⚠️ STUB: hoy simula la llamada con un delay y genera un código local.
 * No hay backend conectado todavía.
 *
 * Para conectar el backend real, reemplazar el cuerpo por el fetch y NO tocar
 * nada más: el hook (`useContactForm`) y el componente (`ContactSection`) ya
 * consumen esta firma. Ejemplo de cómo quedaría:
 *
 *   const res = await fetch('/api/contacto', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data),
 *   });
 *   if (!res.ok) throw new Error('No se pudo enviar la solicitud');
 *   return res.json();
 */
export async function submitContactRequest(data: ContactFormData): Promise<SubmitResult> {
  await new Promise((resolve) => setTimeout(resolve, 850));

  // `data` se ignora mientras sea stub; queda en la firma para que el día que
  // haya backend no cambie nada del lado del hook ni del componente.
  void data;

  return {
    ok: true,
    referenceCode: `PSI-${Math.floor(100000 + Math.random() * 900000)}`,
  };
}
