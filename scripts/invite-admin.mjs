import { createClient } from '@supabase/supabase-js';

// Este comando envía un correo real. Ejecutarlo solo al solicitar la invitación.
try { process.loadEnvFile('.env.local'); } catch (error) {
  if (error.code !== 'ENOENT') throw new Error('No se pudo leer la configuración local.');
}
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: npm run admin:invite -- correo@ejemplo.com');
  process.exit(1);
}
const { SUPABASE_URL, SUPABASE_SECRET_KEY, APP_URL } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY?.startsWith('sb_secret_') || !APP_URL) {
  console.error('Faltan variables privadas de Supabase o APP_URL.');
  process.exit(1);
}
const client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const { data: admins, error: lookupError } = await client.from('admin_users')
  .select('user_id').eq('is_active', true);
if (lookupError) {
  console.error('No se pudo consultar la lista de administradores.');
  process.exit(1);
}
let invitedUser;
for (const admin of admins) {
  const { data, error } = await client.auth.admin.getUserById(admin.user_id);
  if (error) {
    console.error('No se pudo verificar una identidad administrativa.');
    process.exit(1);
  }
  if (data.user.email?.toLowerCase() === email) invitedUser = data.user;
}
if (!invitedUser) {
  console.error('El correo no corresponde a un administrador activo preparado.');
  process.exit(1);
}
if (invitedUser.email_confirmed_at) {
  console.error('Esta cuenta ya confirmó su correo. Usar la pantalla de recuperación.');
  process.exit(1);
}
const { error } = await client.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${new URL(APP_URL).origin}/auth/confirm`,
});
if (error) {
  console.error('No se pudo enviar la invitación. Código:', error.code ?? error.status);
  process.exit(1);
}
console.log('Supabase aceptó el envío de la invitación. Revisa el correo y la carpeta de spam.');
