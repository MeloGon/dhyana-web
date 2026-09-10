import { createClient } from '@supabase/supabase-js';

// Diagnóstico local por la Data API. Solo solicita encabezados: no descarga datos
// de compradores ni imprime credenciales. No reemplaza las pruebas del backend.
try {
  process.loadEnvFile('.env.local');
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error('No se pudo cargar .env.local. Revisá el archivo localmente.');
    process.exit(1);
  }
}

const url = process.env.SUPABASE_URL?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!url || !secretKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY. Completá .env.local.');
  process.exit(1);
}

if (!secretKey.startsWith('sb_secret_')) {
  console.error('SUPABASE_SECRET_KEY debe ser una Secret key del proyecto (sb_secret_...).');
  process.exit(1);
}

try {
  const database = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error, status } = await database
    .from('workshops')
    .select('id', { head: true })
    .limit(1)
    .abortSignal(AbortSignal.timeout(10000));

  if (error) {
    // La respuesta completa o su mensaje podrían contener detalles del proyecto.
    console.error(`No se pudo verificar la conexión con Supabase (HTTP ${status}).`);
    process.exitCode = 1;
  } else {
    console.log('Conexión verificada: Supabase permite consultar workshops desde el servidor.');
  }
} catch {
  console.error('No se pudo verificar Supabase. Revisá configuración y acceso a la red.');
  process.exitCode = 1;
}
