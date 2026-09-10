import type { AuthFormMode } from '@/lib/types/admin-auth';

export const AUTH_FORM_CONTENT: Record<AuthFormMode, { title: string; description: string; submit: string }> = {
  login: {
    title: 'Bienvenido a Dhyana',
    description: 'Ingresa con tu cuenta administrativa para acceder al panel.',
    submit: 'Entrar al panel',
  },
  recover: {
    title: 'Recupera tu acceso',
    description: 'Te enviaremos un enlace para definir una nueva contraseña. Ábrelo en este mismo navegador.',
    submit: 'Enviar enlace',
  },
  password: {
    title: 'Define tu contraseña',
    description: 'Elige una contraseña de al menos 12 caracteres que solo tú conozcas.',
    submit: 'Guardar contraseña',
  },
};
