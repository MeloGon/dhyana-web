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
Ventas manuales, participantes y coordinación ya funcionan. Faltan reservas y checkout con Culqi. Otras secciones de la landing conservan contenido demo. La arquitectura actual
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
  admin/sales/          Ventas manuales, participantes y coordinación
  api/admin/sales/      Registro privado, búsqueda y coordinación
  admin/faqs/           Editor de preguntas frecuentes
  api/admin/faqs/       Lectura y escritura privada de preguntas
  api/faqs/             Preguntas publicadas para el acordeón
  admin/contact/        Configuración de la tarjeta de datos de consulta
  api/admin/contact-settings/ Lectura y edición privadas de contacto
  api/contact-settings/ Datos públicos y enlaces de contacto validados
  admin/about/          Configuración de la sección Sobre nosotros
  api/admin/about-settings/ Lectura y edición privadas de Sobre nosotros
  api/about-settings/   Datos públicos de la sección Sobre nosotros
  admin/quotes/         Editor de opiniones (contratos quotes conservados)
  api/admin/quotes/     Lectura y mutaciones privadas de citas
  api/quotes/           Opiniones publicadas para el mazo interactivo
  admin/legal/           Editor de Términos, Privacidad y Cambios/devoluciones
  api/admin/legal-settings/ Lectura y edición privadas de textos legales
  api/legal-settings/    Textos legales publicados para /legal
  legal/                 Página pública de Términos y políticas (fuera de la landing)
  admin/site/           Textos, visibilidad, logo SVG y video de inicio
  admin/services/       Editor de tarjetas de servicios
  api/admin/site-settings/ Configuración privada del sitio
  api/admin/site-media/ Subidas privadas de logo y video
  api/admin/services/   Guardado conjunto de servicios
  api/site-settings/    Configuración pública y servicios publicados
  libro-de-reclamaciones/ Formulario público del Libro de Reclamaciones (INDECOPI)
  admin/complaint-book/  Listado, detalle/respuesta y datos del proveedor
  api/complaint-book/    Configuración pública y envío de hojas
  api/admin/complaint-book/ Listado, detalle, estado/respuesta y export privados
  api/admin/complaint-book-settings/ Datos del proveedor y textos legales

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
  data/                 workshops, services, hero-videos
  server/database.ts    Cliente Supabase privilegiado, protegido con server-only
  server/admin-auth.ts  Identidad verificada y autorización activa
  server/auth-*.ts      Sesión SSR, configuración, Proxy y adaptadores HTTP
  server/catalog*.ts    Consultas, validación y RPC de guardado/eliminación de catálogo
  server/sales*.ts      Ventas manuales, filtros y coordinación mediante RPC
  server/complaint-book*.ts Numeración por RPC, PDF (@react-pdf/renderer) y correo (Gmail temporal / Resend) del libro
  types/complaint-book.ts Contratos públicos y privados del libro de reclamaciones
  types/admin-sales.ts  Contratos privados de ventas y participantes
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
tests/sales/            Privacidad HTTP y concurrencia remota de ventas con fixtures
tests/faqs/             Lectura pública y privacidad HTTP de preguntas frecuentes
tests/contact/          Privacidad HTTP y enlaces de datos de consulta
tests/about/            Privacidad HTTP y lectura pública de Sobre nosotros
tests/complaint-book/   Configuración pública, envío de hojas y privacidad HTTP del libro
tests/quotes/           Privacidad HTTP y lectura pública de citas
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
- **Colores**: fondos y texto adaptables usan variables de `globals.css` (`bg-[var(--surface)]`, `text-[color:var(--ink)]`). Mantener hex para acentos y contrastes fijos; comprobar ambos temas. No invertir imágenes para simular modo oscuro.

## Receta: agregar una sección nueva a la landing

1. `lib/data/<seccion>.ts` — el contenido (si tiene lista o textos largos).
2. `lib/types/<seccion>.ts` — el tipo, si lo usa más de un archivo.
3. `components/sections/<Seccion>.tsx` — con `'use client'` si es interactiva.
4. Montarla en `components/HomePage.tsx`, respetando visibilidad y orden. `app/page.tsx` carga configuración inicial desde servidor.
5. `<section id="mi-seccion" className="... scroll-mt-20">` — el `id` es lo que
   permite el scroll.
6. Si va en la navbar: agregar enlace y visibilidad en `lib/data/site-fields.ts`; `visibleSiteLinks` comparte navegación con el footer.

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

- Diseño y servicios: `/admin/site` edita identidad compartida navbar/footer, inicio,
  cabeceras, aviso, logo/video y visibilidad. `/admin/services` edita tarjetas y orden.
  `site_settings` singleton: JSONB content/services, guardados independientes y RLS,
  permisos SELECT/UPDATE solo de service_role tras requireAdmin y validación de Origin.
  `site-media` público: sin políticas de subida para visitantes. SVG estático validado
  (256 KB); video MP4/WebM (50 MB) por URL firmada para un archivo, sin SDK cliente.
  Validar existencia y contentType/size mediante Storage.info antes de publicar rutas.
  Archivos sustituidos se conservan; no eliminarlos automáticamente sin revisar referencias.
  Nunca incrustar SVG como HTML. Registrar migraciones de buckets también en pruebas SQL.
- `app/page.tsx` es servidor: obtiene configuración inicial y compone `HomePage` cliente.
  Orden Inicio, Servicios, Talleres, Opiniones, Sobre nosotros, Contacto. Visibilidad también
  controla enlaces. Formulario y tarjeta de contacto inicialmente ocultos; formulario sigue
  simulado y el panel lo advierte. Culqi y reservas no se modificaron.
- Tema claro/oscuro en web y administración: variables CSS, `useTheme` y `ThemeToggle`.
  Script inicial aplica selección local o preferencia del sistema antes de hidratar.

- Opiniones editables en `/admin/quotes` y visualizadas como mazo de cartas
  interactivo en `#opiniones` (`QuoteDeckSection`); campos y tabla quotes conservados. Tabla `quotes` privada con RLS y
  escritura restringida a `service_role` tras `requireAdmin()` y verificación de Origin.
  `/api/quotes` devuelve solo citas publicadas ordenadas por `order_index`. Carga inicial
  con textos del centro; el hook usa estados de carga/error/vacío reales, sin restaurar
  contenido despublicado desde un fallback. Mazo con rotación automática (6s),
  pausa al posar el cursor, controles de avance/retroceso e indicadores.
- Sección Sobre nosotros editable en `/admin/about`. Tabla única `about_settings`,
  RLS y permisos solo SELECT/UPDATE para service_role. 22 campos (cabecera,
  perfil, credenciales, cita, enfoque y pilares). Guardado conjunto tras
  `requireAdmin()` y validación de Origin. Carga inicial del diseño.
  Íconos y estilos de pilares se mantienen en código; textos e imagen son editables.
- Datos de consulta editables en `/admin/contact`. Tabla única `contact_settings`,
  RLS y permisos solo SELECT/UPDATE para service_role. Guardado conjunto tras
  `requireAdmin()` y validación de Origin. Enlaces tel/mailto/WhatsApp generados
  desde datos validados; no aceptar URLs libres. Carga inicial del diseño.
  Comparte datos y enlaces con el contacto directo del footer. Visibilidad independiente.
- Preguntas frecuentes editables en `/admin/faqs`: pregunta, respuesta, orden y
  publicación; eliminación confirmada. Tabla `faqs` privada con RLS, escritura
  tras `requireAdmin()` y validación de Origin. `/api/faqs` solo entrega publicadas.
  Cuatro textos originales cargados por migración; no hay fallback hardcodeado.
- Términos y políticas editables en `/admin/legal`, publicados en `/legal` (ruta propia,
  fuera de la landing y sin Navbar/Footer completos). Tabla única `legal_settings`
  (Términos, Privacidad, Cambios/devoluciones), RLS y permisos solo SELECT/UPDATE de
  service_role, mismo patrón que `contact_settings`/`about_settings`. Carga inicial con
  texto provisional explícito ("en preparación"), no contenido legal real: reemplazar
  desde el panel antes de publicar o de habilitar cobros con Culqi. Enlace desde el
  footer. `getPublicLegalSettings()` usa `connection()` para no fijar el texto en el build.
- Contacto mantiene su stub. La inscripción demo ya no se monta en la landing;
  sus archivos quedan como referencia sin formar parte del flujo público.
- Catálogo persistido: formulario conjunto de taller y horarios; slug automático; eliminación con confirmación solo sin compras. Guardado por save_workshop_catalog y borrado por delete_workshop_catalog, SECURITY INVOKER exclusivos de service_role. sort_order conserva el orden de horarios. Talleres y grupos editables, borradores y publicación
  separada. Público solo recibe campos explícitos y cupos restantes; nunca capacidad. Soporte para precio referencial opcional en USD (`usd_price_cents`) con selector interactivo PEN/USD en tarjetas públicas.
  No reactivar el formulario simulado como confirmación de venta.
- Migración inicial en `supabase/migrations/` aplicada al proyecto remoto: catálogo,
  administradores, compras y accesos mensuales. Historial local/remoto alineado.
  Cliente de servidor conectado por Data API; Auth y panel inicial funcionan.
  Los accesos vencen un mes calendario después del pago, en `America/Lima`, a la
  misma hora y ajustando fechas inexistentes al último día del mes.
- Tablas sin acceso directo para `anon`/`authenticated`. RLS no sustituye la
  autorización del servidor al usar `service_role`. `requireAdmin()` valida `getUser()`
  y entrada activa en `admin_users` antes de operaciones privadas. Registro manual y edición de catálogo comparten bloqueo de taller/grupo. Reservas y Culqi siguen pendientes.
- El contenido es de demo (Lic. Alejandro Morales, teléfonos y direcciones de
  ejemplo). Reemplazar por los datos reales de Dhyana antes de publicar.
- Imágenes y videos apuntan a Unsplash / Pixabay / Mixkit. Cualquier dominio
  nuevo para `next/image` debe agregarse a `images.remotePatterns` en
  `next.config.ts`.
- Libro de Reclamaciones virtual (`/libro-de-reclamaciones`, enlace con ícono solo en el footer, por decisión del responsable;
  panel en `/admin/complaint-book`) conectado a Supabase, cumpliendo INDECOPI
  (Ley 29571, DS 011-2011-PCM, Ley 32495): sin login, sin checkbox de aceptación,
  numeración propia `WEB-{año}-{correlativo}` por `register_complaint_sheet`
  (RPC con `pg_advisory_xact_lock`, sin huecos), PDF Anexo I generado una sola vez
  con `@react-pdf/renderer` y guardado en el bucket privado `complaint-book`
  (URL firmada, nunca pública), copia por correo en modo best-effort; sin
  configurar, la hoja se registra igual y solo falla el envío. TEMPORAL sin
  dominio propio: Gmail SMTP (`GMAIL_SMTP_USER`/`GMAIL_SMTP_APP_PASSWORD`, tiene
  prioridad). Al comprar dominio: verificarlo en Resend, usar `RESEND_API_KEY`/
  `COMPLAINT_BOOK_EMAIL_FROM` y quitar las de Gmail; pasos en
  `lib/server/complaint-book-email.ts`. Ninguna hoja se puede eliminar ni editar
  su Anexo I original (sin GRANT DELETE + trigger de columnas inmutables); estados
  registrado → en_tramite → respondido con auditoría en `complaint_book_status_log`.
  Datos del proveedor y textos legales editables en `/admin/complaint-book/settings`;
  los textos de cumplimiento (aviso INDECOPI, plazo de 15 días) piden confirmación
  aparte antes de guardarse. Migración `20260922120000_complaint_book.sql` aplicada
  y tipos regenerados. `npm run test:complaint-book` cubre HTTP público/privado/Origin;
  `test:db` cubre numeración, validación, transiciones e inmutabilidad (65 pruebas).
- Historial de migraciones local/remoto con versiones distintas para el mismo
  contenido: `editable_legal` (local 20260921120000, remoto 20260921182246) y
  `workshop_discounts` (local 20260916160000, remoto 20260916205545);
  `about_media_types` (20260918150000) no figura en el historial remoto. Revisar
  este desfase antes de usar `supabase db push` para no reaplicar cambios.

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
npm run test:sales # privacidad HTTP; variables explícitas habilitan pruebas RPC remotas
npm run test:faqs # lectura pública y rechazo de visitantes/orígenes ajenos
npm run test:contact # privacidad HTTP y enlaces de la tarjeta de consulta
npm run test:about # privacidad HTTP y lectura de Sobre nosotros
npm run test:quotes # privacidad HTTP y lectura de opiniones
npm run test:complaint-book # público/privado/Origin del libro de reclamaciones
npm run test:site # configuración, privacidad, servicios, SVG y visibilidad
npm run test:legal # privacidad HTTP y lectura pública de /legal
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
El cálculo público de cupos cuenta accesos vigentes. Ventas manuales y edición de
capacidad usan bloqueos en orden taller → grupo. group_peak_occupancy comprueba el
máximo simultáneo del período; register_manual_sale guarda compra/acceso de forma
atómica y deduplica por manual_request_id. No escribir ventas directamente desde
endpoints nuevos: usar el mismo protocolo al incorporar Culqi y reservas.
El formulario manual exige pago verificado, fecha real en Perú e importe recibido.
No crea cobros ni renovaciones. Coordinación es independiente del pago/acceso.
No hay reservas actuales. Las pruebas RPC remotas guardan IDs de fixtures para limpiar
por SQL privilegiado. service_role solo borra ventas manuales mediante
delete_manual_sale con código y declaración de prueba/error; triggers bloquean
DELETE directo. Limpiar también los UUID técnicos de fixtures eliminados.
Anular mediante cancel_sale conserva historial y auditoría, sin devolución.
La ocupación efectiva acaba en cancelled_at; lectura pública exige paid.
No autorizar acceso usando solo monthly_accesses de una compra anulada.
Estas pruebas no sustituyen la verificación con Supabase ni pruebas concurrentes
al implementar reservas y pagos.

## Documentación relacionada

- `README.md` — fuente del objetivo, alcance, estado y plan de entrega.
- `GUIA-NEXTJS.md` — arquitectura y recetas con equivalencias a Flutter. Si cambia
  la estructura o una convención, actualizar la guía y este archivo.
- `CLAUDE.md` — remite a estas reglas; no duplicarlas allí.
- No crear MD separados por cada módulo, modelo o decisión mientras quepan en las
  secciones existentes. Los borradores de Downloads no se mantienen en paralelo.
