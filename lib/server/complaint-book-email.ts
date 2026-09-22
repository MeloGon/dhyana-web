import 'server-only';

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { formatLimaDate } from '@/lib/format';

interface SendResult {
  consumidorEnviado: boolean;
  internoEnviado: boolean;
  error: string;
}

interface Message {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

// Devuelve '' si se envió o el mensaje de error. Nunca lanza.
type Sender = (message: Message) => Promise<string>;

// ─────────────────────────────────────────────────────────────────────────────
// PROVEEDOR DE CORREO — TEMPORAL: Gmail (sin dominio propio todavía).
//
// Resend exige un dominio verificado para enviar a cualquier destinatario, y
// *.vercel.app no se puede verificar. Mientras tanto se usa SMTP de Gmail con
// una contraseña de aplicación (GMAIL_SMTP_USER / GMAIL_SMTP_APP_PASSWORD).
// Límite aproximado de Gmail: unos cientos de correos al día.
//
// CUANDO COMPRES EL DOMINIO:
//   1. Verificarlo en resend.com/domains (agregar sus registros DNS).
//   2. En .env.local y en Vercel: RESEND_API_KEY y
//      COMPLAINT_BOOK_EMAIL_FROM=Dhyana <reclamos@tudominio.pe>.
//   3. Borrar GMAIL_SMTP_USER y GMAIL_SMTP_APP_PASSWORD: con ellas presentes,
//      Gmail tiene prioridad sobre Resend (ver `createSender`).
//   4. Opcional: borrar `gmailSender`, la dependencia `nodemailer` y
//      `@types/nodemailer`.
// ─────────────────────────────────────────────────────────────────────────────
function gmailSender(user: string, appPassword: string): Sender {
  const transport = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass: appPassword } });
  // Gmail reescribe el remitente a la cuenta autenticada; se fija aquí para no depender de eso.
  const from = `"Libro de Reclamaciones Dhyana" <${user}>`;
  return async (message) => {
    try {
      await transport.sendMail({ from, ...message });
      return '';
    } catch (error) {
      return error instanceof Error ? error.message : 'Error desconocido';
    }
  };
}

function resendSender(apiKey: string, from: string): Sender {
  const resend = new Resend(apiKey);
  return async (message) => {
    try {
      // Resend no lanza por errores de la API: los devuelve en `error`.
      const { error } = await resend.emails.send({ from, ...message });
      return error ? error.message : '';
    } catch (error) {
      return error instanceof Error ? error.message : 'Error desconocido';
    }
  };
}

function createSender(): Sender | null {
  const gmailUser = process.env.GMAIL_SMTP_USER?.trim();
  const gmailPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (gmailUser && gmailPassword) return gmailSender(gmailUser, gmailPassword);
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.COMPLAINT_BOOK_EMAIL_FROM?.trim();
  if (resendKey && resendFrom) return resendSender(resendKey, resendFrom);
  return null;
}

function buildSummaryHtml(numeroHoja: string, tipo: string, createdAt: string, hasPdf: boolean) {
  return `<p>Se registró tu ${tipo} en el Libro de Reclamaciones con el número <strong>${numeroHoja}</strong>, el ${formatLimaDate(createdAt)} (hora de Perú).</p>
    <p>${hasPdf ? 'Adjuntamos la constancia en PDF.' : 'Conserva este número como constancia de registro.'} El proveedor debe responder en un plazo máximo de 15 días hábiles improrrogables.</p>`;
}

// Mejor esfuerzo: la hoja ya quedó registrada en base de datos antes de llamar
// esta función. Un fallo de envío nunca invalida el registro ni se propaga
// como error al visitante; solo queda anotado para revisión en el panel.
export async function sendComplaintConfirmationEmails(params: {
  numeroHoja: string;
  tipo: string;
  createdAt: string;
  consumidorCorreo: string;
  correoReclamosInterno: string;
  pdf: Buffer | null;
}): Promise<SendResult> {
  const send = createSender();
  if (!send) {
    return { consumidorEnviado: false, internoEnviado: false, error: 'Correo: envío no configurado (GMAIL_SMTP_* o RESEND_API_KEY).' };
  }
  const attachments = params.pdf ? [{ filename: `${params.numeroHoja}.pdf`, content: params.pdf }] : undefined;
  const html = buildSummaryHtml(params.numeroHoja, params.tipo, params.createdAt, !!params.pdf);

  const consumidorError = await send({ to: params.consumidorCorreo, subject: `Constancia de registro — Libro de Reclamaciones Nº ${params.numeroHoja}`, html, attachments });
  const internoError = params.correoReclamosInterno
    ? await send({ to: params.correoReclamosInterno, subject: `Nueva hoja registrada — ${params.numeroHoja}`, html, attachments })
    : 'sin correo de reclamos configurado';

  const errors = [consumidorError && `Correo consumidor: ${consumidorError}`, internoError && `Correo interno: ${internoError}`].filter(Boolean);
  return { consumidorEnviado: !consumidorError, internoEnviado: !internoError, error: errors.join(' ') };
}
