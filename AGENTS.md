<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# dhyana-web — Guía para agentes

Sitio del **Centro de Desarrollo Integral Dhyana**: psicoterapia y talleres.
Hoy es una landing de una sola página con secciones ancladas por scroll.

El alcance comercial vigente está en `README.md`: talleres grupales con compra
independiente de un mes calendario, Culqi y panel; sin módulo de renovación.
La migración inicial ya está aplicada en Supabase (referencia en README). El cliente
de servidor y su configuración local están preparados; acceso por Data API verificado.
Login, recuperación y panel inicial protegido ya están implementados.
Gestión de catálogo y lectura pública ya están conectadas a Supabase. El editor guarda taller y horarios juntos por RPC transaccional, genera slug desde título y permite eliminar solo sin compras.
Faltan ventas y pagos. Otras secciones de la landing conservan contenido demo. La arquitectura actual
y su extensión propuesta se explican en `GUIA-NEXTJS.md`; no confundir propuesta
con funcionalidad implementada. Los documentos externos son referencias.

El dueño del proyecto viene de **Flutter y no de Next.js**. Priorizá código
explícito y legible sobre código "inteligente". Si algo requiere conocer una
sutileza de React/Next para entenderlo, dejá un comentario corto explicándolo.
El responsable pidió explicaciones breves durante el trabajo: al introducir una
pieza, explicar qué hace y cómo se relaciona con Flutter cuando ayude.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict ·
Tailwind CSS 4 · lucide-react (íconos) · sin librería de estado.

## Arquitectura: por capas, con hooks como ViewModel

Flujo **en una sola dirección**. Nunca al revés:

```
app/  →  components/  →  hooks/  →  lib/api  →  (backend)
                                 ↘  lib/data (contenido estático)
```

| Capa | Rol | Regla dura |
|---|---|---|
| `app/` | Rutas. Componen secciones y nada más | No lógica de negocio |
| `components/` | UI. Pintan lo que reciben | No `fetch`. No lógica de envío |
| `hooks/` | ViewModel: estado + orquestación | No JSX. No `fetch` directo |
| `lib/api/` | Única puerta al backend | No estado de React |
| `lib/data/` | Contenido estático (textos, catálogos) | Solo datos + tipos |
| `lib/types/` | Interfaces compartidas por 2+ archivos | — |

**Por qué así:** mantener un contrato permite cambiar su transporte en `lib/api/`
sin rehacer la UI. Una funcionalidad nueva como pagos también requiere servidor,
datos y validación; no prometer que se conecta tocando un solo archivo.

Al incorporar el backend, seguir la extensión de la guía: `lib/api/` llama por
HTTP a `app/api/**/route.ts`, que delega reglas a `lib/server/`. Las páginas de
servidor pueden llamar a esos servicios para su lectura inicial y componer UI.
`app/` sigue sin reglas de negocio. `lib/server/` se protege con `server-only`;
los secretos nunca viajan al cliente. Estas carpetas se crean cuando hagan falta.

## Mapa de carpetas

```
app/
  layout.tsx            Server Component: fuentes, metadata, <html>/<body>
  page.tsx              Home "/". Orquesta las secciones
  globals.css           Tailwind + variables de color + fuentes
  admin/                Login, recuperación, contraseña y panel privado
  auth/confirm/         Recepción de enlaces de invitación/recuperación
  api/auth/[action]/    Adaptador HTTP que delega en lib/server
  api/admin/session/    Identidad administrativa validada
  admin/workshops/      Editor de talleres y grupos
  api/admin/workshops/  Lectura y escritura privada de catálogo
  api/workshops/        Lectura pública sin capacidad total

components/
  layout/               Presentes en toda la página (Navbar, Footer)
  sections/             Un archivo por bloque de la landing
    <Seccion>.tsx         orquestador de la sección
    <seccion>/            piezas internas cuando el orquestador crece

hooks/
  useContactForm.ts     ViewModel del form de contacto
  useWorkshopRegistration.ts
  useScrollTo.ts        scroll suave a una sección (compensa la navbar)
  useScrollSpy.ts       sección activa + estado "scrolleado" de la navbar

lib/
  api/                  submitContactRequest(), submitWorkshopRegistration()
  data/                 workshops, services, about, faqs, hero-videos
  server/database.ts    Cliente Supabase privilegiado, protegido con server-only
  server/admin-auth.ts  Identidad verificada y autorización activa
  server/auth-*.ts      Sesión SSR, configuración, Proxy y adaptadores HTTP
  server/catalog*.ts    Consultas, validación y RPC de guardado/eliminación de catálogo
  types/admin-catalog.ts Contratos privados de talleres y grupos
  types/index.ts        Tipos de la landing demo
  types/catalog.ts      Catálogo público, sin capacidad total
  types/checkout.ts     Compra, estado de pago y acceso mensual
  types/database.ts     Tipos generados desde el esquema remoto
  utils.ts              cn() — merge de clases Tailwind

supabase/migrations/    Esquema SQL versionado (Supabase)
tests/database/         Pruebas SQL con PGlite, solo para desarrollo
tests/auth/             Pruebas HTTP del acceso administrativo
tests/catalog/          Pruebas HTTP de catálogo y privacidad
proxy.ts                Renueva sesión y aplica cabeceras privadas
scripts/check-database.mjs  Comprobación de conexión por Data API
```

## Convenciones

- **Commits**: agrupar cambios relacionados por funcionalidad, con título y explicación
  en español. Mantener cada commit coherente; excluir credenciales y archivos locales.
- **Idioma**: comentarios y textos de UI en **español**. Nombres de código en
  inglés (`handleSubmit`, `isSubmitting`).
- **`'use client'`**: obligatorio en todo archivo que use `useState`,
  `useEffect`, `onClick` u `onChange`. Por default un componente es Server
  Component y esas APIs fallan.
- **Tamaño**: si un componente pasa de ~250 líneas, partirlo en una subcarpeta
  con el nombre de la sección (ver `sections/contact/`, `sections/workshops/`).
- **Patrón orquestador + piezas**: el orquestador tiene el estado y compone;
  las piezas reciben todo por props y no saben de dónde viene.
- **Imports**: siempre con alias `@/` (`@/lib/types`), nunca `../../..`.
- **Datos**: cualquier lista de contenido (servicios, talleres, FAQs) va a
  `lib/data/` mientras sea estática, nunca hardcodeada dentro del JSX. El catálogo
  persistido será consultado por servicios y editado en el panel.
- **Tipos nuevos**: agrupar contratos por módulo en `lib/types/<module>.ts`.
  Mantener los tipos existentes hasta migrarlos por necesidad; no agregar reexports.
- **Colores**: hex directo en las clases (`bg-[#83D0C6]`), siguiendo la paleta
  ya definida en `globals.css`.

## Receta: agregar una sección nueva a la landing

1. `lib/data/<seccion>.ts` — el contenido (si tiene lista o textos largos).
2. `lib/types/<seccion>.ts` — el tipo, si lo usa más de un archivo.
3. `components/sections/<Seccion>.tsx` — con `'use client'` si es interactiva.
4. Montarla en `app/page.tsx`, en el orden visual que corresponda.
5. `<section id="mi-seccion" className="... scroll-mt-20">` — el `id` es lo que
   permite el scroll.
6. Si va en la navbar: agregar `{ id, label }` a `NAV_LINKS` en
   `components/layout/Navbar.tsx`.

## Receta: agregar un módulo con backend

1. **Tipos** en `lib/types/<modulo>.ts` (payload + respuesta).
2. **Servicio** en `lib/api/<modulo>.ts`. Devolver `SubmitResult` o un tipo
   propio. Lanzar `Error` si la respuesta no es ok.
3. **Hook** en `hooks/use<Modulo>.ts`: estado, `handleSubmit` con
   `try/catch/finally`, y `errorMessage` para que la UI pueda mostrar el fallo.
4. **Componentes**: orquestador que llama al hook + piezas tontas por props.
5. Verificar con `npm run build` y `npm run lint`.

Los formularios existentes sirven de referencia de UI/hook/servicio, pero sus
respuestas simuladas no sirven como confirmación de pago. Para backend propio,
seguir también las recetas de datos, servicios de servidor y endpoints de la guía.

## Estado actual / pendientes

- Contacto mantiene su stub. La inscripción demo ya no se monta en la landing;
  sus archivos quedan como referencia sin formar parte del flujo público.
- Catálogo persistido: formulario conjunto de taller y horarios; slug automático; eliminación con confirmación solo sin compras. Guardado por save_workshop_catalog y borrado por delete_workshop_catalog, SECURITY INVOKER exclusivos de service_role. sort_order conserva el orden de horarios. Talleres y grupos editables, borradores y publicación
  separada. Público solo recibe campos explícitos y cupos restantes; nunca capacidad.
  No reactivar el formulario simulado como confirmación de venta.
- Migración inicial en `supabase/migrations/` aplicada al proyecto remoto: catálogo,
  administradores, compras y accesos mensuales. Historial local/remoto alineado.
  Cliente de servidor conectado por Data API; Auth y panel inicial funcionan.
  Los accesos vencen un mes calendario después del pago, en `America/Lima`, a la
  misma hora y ajustando fechas inexistentes al último día del mes.
- Tablas sin acceso directo para `anon`/`authenticated`. RLS no sustituye la
  autorización del servidor al usar `service_role`. `requireAdmin()` valida `getUser()`
  y entrada activa en `admin_users` antes de operaciones privadas. Reservas,
  confirmación atómica, concurrencia de cupos y Culqi siguen pendientes.
- El contenido es de demo (Lic. Alejandro Morales, teléfonos y direcciones de
  ejemplo). Reemplazar por los datos reales de Dhyana antes de publicar.
- Imágenes y videos apuntan a Unsplash / Pixabay / Mixkit. Cualquier dominio
  nuevo para `next/image` debe agregarse a `images.remotePatterns` en
  `next.config.ts`.

## No hacer (sobreingeniería para el tamaño de este proyecto)

- ❌ Redux / Zustand / Context global — el árbol es chico, alcanza con props.
- ❌ Capas de Clean Architecture (entities, use-cases, repositories, ports).
- ❌ Barrel files (`index.ts` que re-exporta todo) — rompen el tree-shaking y
  esconden de dónde viene cada cosa.
- ❌ Componentes genéricos "por si acaso" (`<Button variant>` con 12 props)
  hasta que haya al menos 3 usos reales que lo justifiquen.
- ❌ Agregar dependencias sin necesidad clara; preferir la plataforma.

## Comandos

```bash
npm run dev     # desarrollo en http://localhost:3000
npm run build   # build de producción + chequeo de TypeScript
npm run lint    # ESLint
npm run test:db # reglas y permisos de migraciones, PostgreSQL en memoria
npm run check:database # comprueba configuración privada y acceso a Supabase
npm run test:auth # HTTP contra Next en ejecución; producción para probar caché
npm run test:catalog # HTTP público; fixtures temporales habilitan escrituras de prueba
```

Antes de dar por terminado un cambio: `npm run build` y `npm run lint`, ambos
en verde.
Requiere Node.js 22 o superior por el SDK de Supabase. No imprimir credenciales en
salidas de herramientas ni versionar `.env.local`; `.env.example` es la plantilla versionada.
Auth usa cookies HttpOnly y llamadas por `lib/api/`; no añadir cliente Supabase de
navegador sin revisar ese contrato. Proxy renueva sesión, pero no autoriza: cada
página y endpoint privado debe llamar `requireAdminPage()` o `requireAdmin()`.
No cachear respuestas privadas. Validar Origin contra APP_URL en mutaciones.
Primer administrador activo, invitación aceptada y contraseña definida por él. `admin:invite` envía correo
real: ejecutarlo solo cuando el usuario pida el envío. No crear cuentas reales para
pruebas ni cambiar la contraseña del usuario.
Si cambia una migración o regla persistida, ejecutar también `npm run test:db`.
El cálculo de cupos actual cuenta accesos vigentes. La comprobación de capacidad
antes de editar un grupo aún no es atómica frente a ventas; resolverlo en la etapa
de ventas antes de habilitar checkout. No prometer reservas actuales.
Estas pruebas no sustituyen la verificación con Supabase ni pruebas concurrentes
al implementar reservas y pagos.

## Documentación relacionada

- `README.md` — fuente del objetivo, alcance, estado y plan de entrega.
- `GUIA-NEXTJS.md` — arquitectura y recetas con equivalencias a Flutter. Si cambia
  la estructura o una convención, actualizar la guía y este archivo.
- `CLAUDE.md` — remite a estas reglas; no duplicarlas allí.
- No crear MD separados por cada módulo, modelo o decisión mientras quepan en las
  secciones existentes. Los borradores de Downloads no se mantienen en paralelo.
