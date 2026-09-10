# Dhyana — Arquitectura y guía para un desarrollador Flutter

Este proyecto (dhyana-web) es Next.js 16 con App Router. Esta guía explica los
conceptos que no existen en Flutter, la arquitectura y cómo crear o modificar
módulos. El objetivo y alcance están en [README.md](README.md); las reglas para
agentes, en [AGENTS.md](AGENTS.md). Esta es la guía técnica única del proyecto.

Las secciones 1 a 8 describen la base actual. Las secciones 9 a 12 distinguen la
base SQL, Auth, catálogo, ventas manuales y contratos ya incorporados de los servicios, endpoints y pantallas
de gestión comercial que todavía faltan.

## 1. Estructura de carpetas

```
app/                       ← Rutas de la app (el "Navigator" de Next.js)
  layout.tsx                  Envoltorio de TODAS las páginas (fuentes, <html>, <body>)
  page.tsx                    La página "/" (home) — orquesta las secciones
  globals.css                 Estilos globales + Tailwind

components/                ← Solo UI: pintan lo que reciben
  layout/                     Piezas presentes en TODA página (Navbar, Footer)
  sections/                   Un archivo por bloque de la landing page
    HeroVideo.tsx
    QuoteSection.tsx
    AboutSection.tsx
    ServicesSection.tsx
    ContactSection.tsx           orquestador de la sección de contacto
      contact/                   sus piezas (info, FAQ, form)
    WorkshopsSection.tsx         orquestador de la sección de talleres
      workshops/                 sus piezas (overview, grilla, form)

hooks/                     ← "ViewModel": estado y lógica, sin nada visual
  useContactForm.ts
  useWorkshopRegistration.ts
  useScrollTo.ts
  useScrollSpy.ts

lib/                       ← Todo lo que no es ni UI ni estado
  api/                        Auth y catálogo por HTTP; contacto aún simulado
  data/                       Contenido de demo: talleres, servicios, videos
  server/database.ts          Cliente Supabase privilegiado, solo servidor
  types/                      Interfaces compartidas
    catalog.ts                  Contrato público del catálogo persistido
    checkout.ts                 Compra, estado de pago y acceso mensual
    database.ts                 Tipos generados desde el esquema remoto
  utils.ts                    Helper cn() para combinar clases de Tailwind

supabase/migrations/       ← Evolución SQL versionada y sincronizada con el proyecto remoto
tests/database/            ← Pruebas de migraciones con PostgreSQL en memoria
scripts/check-database.mjs ← Verificación de credenciales y acceso por la Data API
```

**Regla de oro:** el flujo va en una sola dirección.

```
app → components → hooks → lib/api
```

Los componentes visuales no llaman al backend directamente; los servicios no
manejan estado de React. Viniendo de Flutter: `components/` son los Widgets,
`hooks/` cumplen un rol parecido a Controllers/ViewModels y `lib/api/` contiene
los servicios de comunicación. La lectura inicial desde servidor tiene otro
recorrido, descrito en la sección 9.

Patrón usado en Contact y Workshops: un archivo "orquestador" (ej.
`ContactSection.tsx`) que llama al hook y arma la sección, delegando cada
pedazo visual a un componente chico en su subcarpeta. El contenido del acordeón
de preguntas frecuentes ya se edita en `/admin/faqs`, sin tocar código.

### Dónde tocar según lo que quieras cambiar

| Quiero cambiar... | Voy a... |
|---|---|
| Contenido de demo | `lib/data/`; algunos textos todavía están en JSX o metadata |
| Cómo se ve algo | `components/` |
| Qué pasa al enviar un formulario | `hooks/` |
| Cambiar el transporte hacia el backend | `lib/api/` |
| El orden de las secciones | `app/page.tsx` |

Los talleres, precios y horarios ya se editan desde el panel. Conectar
un endpoint manteniendo su contrato puede cambiar solo `lib/api/`; incorporar pagos
reales también necesita servidor, datos y verificación. La separación limita el
impacto, pero no garantiza que toda funcionalidad nueva toque un único archivo.

## 2. App Router: cómo Next.js decide qué mostrar

No hay un `Navigator`/rutas declaradas a mano como en Flutter. Next.js mira la
carpeta `app/` y convierte su estructura en URLs:

- `app/page.tsx` → `/`
- `app/talleres/page.tsx` (si existiera) → `/talleres`
- `app/layout.tsx` envuelve TODO lo de adentro de `app/`, como un
  `Scaffold` que se repite en cada pantalla.

La presentación pública permanece en una página con scroll. El acceso
administrativo ya tiene rutas separadas en `app/admin/` y `app/auth/confirm/`.

## 3. Server Components vs Client Components (`'use client'`)

Las páginas y layouts de App Router son Server Components por defecto. Pueden
obtener datos y componer UI en servidor sin enviar su propio código al navegador.
Para estado, eventos y APIs del navegador se utilizan Client Components.

`'use client'` establece una frontera de imports: los módulos que importa entran en
el árbol cliente. No significa que el componente solo se ejecute en navegador;
Next.js también puede prerenderizarlo en servidor. No leer `window` al cargar un
módulo o durante un render que pueda ejecutarse en servidor.

En este proyecto: `app/layout.tsx` es Server Component (solo arma el
esqueleto). Casi todo lo demás tiene `'use client'` arriba porque son
formularios, menús, videos con controles, etc. — todo interactivo.

Como convención explícita del proyecto, los archivos que usan `useState`,
`useEffect`, `onClick` u `onChange` declaran `'use client'`.

## 4. Hooks ≈ StatefulWidget

| React (este proyecto) | Flutter |
|---|---|
| `useState(valorInicial)` | una variable de estado + `setState()` |
| `useEffect(fn, deps)` | Sincronizar con un sistema externo; no es un equivalente exacto de `initState` |
| Limpieza devuelta por `useEffect` | Liberar recursos; ocurre también antes de repetir el efecto |
| `useRef()` | Referencia mutable persistente que no provoca un render al cambiar; no equivale en general a `GlobalKey` |
| props (`{ onScrollTo }`) | constructor params de un Widget |

Un efecto sirve para temporizadores, eventos del navegador o reproductores. En
Strict Mode puede haber un ciclo adicional de preparación y limpieza en desarrollo.
Una compra se inicia desde una acción explícita, nunca desde un efecto de montaje.
Los hooks se llaman al nivel superior, no dentro de bucles o condiciones.

Referencias: [useEffect](https://react.dev/reference/react/useEffect) y
[useRef](https://react.dev/reference/react/useRef).

### TypeScript desde Dart

`.ts` contiene TypeScript; `.tsx` también permite JSX, el marcado que describe UI.
`Promise<T>` se parece a `Future<T>` y se usa con `async`, `await` y `try/catch`.
Una `interface` describe campos, pero no construye objetos ni parsea JSON. Los tipos
desaparecen al ejecutar: se debe validar igualmente la entrada del backend.

```ts
// Fragmento dentro de un hook: copiar un objeto se parece a usar copyWith en Dart.
setFormData((previous) => ({ ...previous, name: 'Ana' }));
```

`...previous` conserva los otros campos. No se modifica directamente el objeto de
estado. `@/` apunta a la raíz del proyecto y evita imports con varios `../`.

## 5. Tailwind CSS ≈ estilos inline de Flutter

Las clases como `className="flex items-center gap-3 rounded-full bg-white"`
son atajos CSS, no nombres custom — cada palabra es una regla de estilo (como
armar un `Container` + `Row` + `BoxDecoration` a mano, pero en una sola
línea). También existe `app/globals.css` para estilos y variables globales.

`lib/utils.ts` exporta `cn()`, que combina clases condicionales sin que se
pisen (equivalente a mergear un `TextStyle` base con overrides).

### Custom hooks = tus ViewModels

Un "custom hook" es una función que empieza con `use` y agrupa estado + lógica.
No dibuja nada. Es lo más parecido a un ViewModel/Controller de Flutter:

```ts
// hooks/useContactForm.ts  ← el ViewModel
export function useContactForm(preselectedService: string) {
  const [formData, setFormData] = useState(...);
  const handleSubmit = async (e) => { ... };
  return { formData, setFormData, handleSubmit, ... };
}
```

```tsx
// ContactSection.tsx  ← la View: pide el ViewModel y solo pinta
const contactForm = useContactForm(preselectedService);
```

Cada llamada al hook tiene su propio estado; no es un Controller compartido ni
crea estado global automáticamente. Si dos componentes necesitan el mismo estado,
se comparte desde un ancestro común. Hoy no hace falta agregar una librería global.

## 6. Patrón "levantar el estado" (lifting state up)

Cuando dos componentes hermanos necesitan compartir datos (ej: elegís un
servicio en `ServicesSection` y el formulario de `ContactSection` se
actualiza), el estado vive en el ancestro común más cercano —
`app/page.tsx` — y baja a los hijos por props. Es el mismo patrón que usarías
en Flutter subiendo el estado a un widget padre en vez de manejarlo en cada
hijo por separado (sin Provider/Riverpod de por medio, porque el árbol es
chico).

## 7. Cosas Next-específicas que vas a ver

- **`next/font`** (`app/layout.tsx`): descarga y optimiza fuentes de Google en
  build time, no en el navegador.
- **`next/image`** (`AboutSection.tsx`): versión optimizada de `<img>`. Si
  usás una imagen de un dominio externo nuevo, hay que agregarlo en
  `next.config.ts` → `images.remotePatterns`, si no Next.js la bloquea.
- **`metadata`** (`app/layout.tsx`): así se define el título de pestaña y la
  info que se ve al compartir el link (equivalente al `AndroidManifest`/
  `Info.plist` para "cómo se presenta la app hacia afuera", pero para web).

## 8. Correr el proyecto

```bash
npm install   # instala las dependencias declaradas del proyecto
npm run dev   # levanta el servidor de desarrollo en http://localhost:3000
```

Cambios en cualquier archivo de `app/` o `components/` se reflejan solos en
el navegador (hot reload), como el hot reload de Flutter.

## 9. Extensión propuesta: backend en el mismo proyecto

Ya existe el cliente de base de datos en `lib/server/database.ts`, protegido con
`server-only`. Los servicios de Auth, catálogo y ventas manuales ya funcionan; checkout y pagos web siguen pendientes. También
existen los contratos públicos, tipos generados y la migración aplicada descrita
en la sección 10. Los demás archivos se crearán cuando el módulo los necesite.

```text
Interacción:
components → hooks → lib/api → HTTP → app/api/**/route.ts
                                              ↓
                                          lib/server
                                              ↓
                                   base de datos / Culqi

Lectura inicial en servidor:
app/**/page.tsx → lib/server → datos públicos → components
```

La página de servidor compone y llama a un servicio; no necesita pedir por HTTP a
su propio endpoint. El endpoint traduce entrada/salida HTTP y delega. El hook maneja
la experiencia de UI; no decide el precio ni si un pago es válido.

| Ubicación (salvo contrato y cliente de base, todavía propuesta) | Responsabilidad |
|---|---|
| `lib/types/checkout.ts` | Contratos compartidos sin React ni secretos |
| `lib/api/checkout.ts` | Llamada HTTP desde el frontend |
| `lib/server/checkout.ts` | Reglas y coordinación de precio, reserva y compra |
| `lib/server/workshops.ts` | Consulta y gestión de catálogo y disponibilidad |
| `lib/server/culqi.ts` | Detalles específicos del proveedor de pago |
| `lib/server/database.ts` | Ya implementado: cliente Supabase privilegiado para servicios de servidor |
| `app/api/checkout/route.ts` | Entrada HTTP para la compra |
| `app/api/webhooks/culqi/route.ts` | Notificaciones del proveedor |

Los archivos de `lib/server/` deben usar `import 'server-only'` para impedir imports
desde cliente. Las credenciales privadas no llevan `NEXT_PUBLIC_` y no se envían
en props ni respuestas. Un secreto puede usarse en un servicio de servidor fuera
de `app/api/`; importa la frontera de ejecución, no solo la carpeta.

Supabase es la persistencia elegida; el proyecto remoto y la migración aplicada
están en README. El cliente de servidor está preparado y sus credenciales locales
fueron verificadas por la Data API. Auth consulta permisos, catálogo lee/escribe talleres y ventas registra pagos externos verificados. Faltan checkout y pagos web.
Se conserva Next.js para frontend y backend. No hace falta una interfaz genérica de pasarelas
para un proveedor futuro hipotético; Culqi queda aislado en su propio servicio.

## 10. Módulos, datos y páginas propuestos

Un módulo es una responsabilidad de negocio. Sus archivos se distribuyen en las
capas anteriores; no necesita entidades, repositorios y casos de uso separados.

| Módulo | Incluye | Pantallas propuestas |
|---|---|---|
| Presentación y catálogo | Centro, FAQ, talleres, grupos, horarios y cupos públicos | Home existente y detalle compartible `/talleres/[slug]` |
| Compras y pagos | Datos mínimos, reserva, Culqi, estado y código de compra | Compra desde detalle o checkout y confirmación sin cuenta |
| Administración | Acceso privado, edición, ventas manuales, participantes y coordinación | `/admin` |

Las pantallas se adaptarán al diseño existente. No se agrega registro previo ni
portal de Meet por defecto. No hay módulo de renovación: cada compra es independiente.

### Modelo de datos inicial

La fuente del esquema físico es `supabase/migrations/`. La primera migración está
aplicada y verificada tanto localmente como en Supabase. La tabla siguiente
resume responsabilidades, sin duplicar el detalle de columnas.

| Concepto | Datos y responsabilidad |
|---|---|
| Taller (`workshops`) | Título, slug, resumen, categoría y publicación; el resto del contenido se añadirá al conectar el catálogo |
| Grupo/horario (`workshop_groups`) | Taller, descripción de horario, precio en céntimos de sol y capacidad privada |
| Compra (`purchases`) | Grupo, comprador, importe histórico, origen, referencia y estados de pago/coordinación |
| Acceso (`monthly_accesses`) | Compra que lo origina y período mensual; máximo un acceso por compra confirmada |
| Intento/evento de pago — pendiente | Conciliar respuestas y reintentos sin duplicar cobros ni accesos |
| Usuario administrativo (`admin_users`) | Lista explícita de identidades de Supabase Auth autorizadas; Auth valida esta lista activa; gestión comercial pendiente |

La coordinación se asocia a la compra y no modifica su estado de pago. El esquema
físico se versiona en migraciones SQL, sin otro MD que copie
cada columna. Los tipos nuevos se agrupan por módulo en `lib/types/`; el actual
`index.ts` se mantiene mientras no haya una razón para migrarlo, sin agregar reexports.

El contrato público expondrá `remainingSpots`, no el registro completo del grupo.
RLS restringe filas, pero por sí sola no oculta capacidad o enlaces privados dentro
de una fila pública. Las escrituras administrativas necesitan autorización en
servidor; ocultar el botón del panel no protege el endpoint.

### Qué garantiza la migración y qué falta

Los importes se guardan como enteros en céntimos y con moneda `PEN`. La compra
conserva su precio aunque se edite el grupo. Un cargo de Culqi no puede vincularse
a dos compras y una compra no puede tener dos accesos. El acceso exige la fecha
real de una compra pagada mediante una clave foránea compuesta; una compra
pendiente no puede originarlo.

El vencimiento es una columna generada y almacenada por PostgreSQL: suma un mes
calendario en `America/Lima`, conservando la hora y ajustando días inexistentes al
último día del mes. El intervalo de acceso es `[starts_at, ends_at)`: el instante
final queda fuera. La fecha de una venta manual es la del pago verificado, no la
de carga en el panel. Este cálculo vive en SQL para no duplicar reglas en React.

Todas las tablas tienen RLS activado y permisos directos revocados a `anon` y
`authenticated`. No hay políticas públicas de lectura ni escritura. El
servicio de catálogo en Next expone campos explícitos y calcula `remainingSpots`.
El backend podrá usar `service_role`, que omite RLS, solo después de validar las
entradas y, en acciones administrativas, la identidad y su entrada activa en
`admin_users`. Esa validación ya existe en `requireAdmin()` y se debe repetir en cada servicio privado. No agregar políticas que permitan
a una persona autoasignarse acceso administrativo.

El servidor tiene permisos de lectura/escritura comercial, con borrado manual confirmado mediante RPC, y solo
lectura de administradores. La lista de administradores se configura explícitamente
desde SQL después de crear las identidades de Auth. El primero está autorizado;
su invitación ya fue aceptada y definió su contraseña. No se fijaron roles distintos para los operadores.
La recuperación por enlace y el cambio de contraseña ya tienen pantallas y endpoints.

Esta migración no implementa reservas, control concurrente de capacidad, verificación
de pagos ni confirmación atómica de compra/acceso. Migraciones posteriores implementan registro manual atómico y concurrencia;
reservas y verificación de pagos Culqi siguen pendientes.

### Probar y aplicar la base

`npm run test:db` ejecuta las migraciones en una base PostgreSQL en memoria con
PGlite y el runner nativo de Node. PGlite es una dependencia de desarrollo: no se
importa desde la aplicación. Las pruebas cubren meses cortos, bisiestos, zona horaria,
compras manuales, duplicados y privilegios. Reproducen solo los roles y la referencia
a `auth.users`: no prueban Supabase Auth, la Data API ni concurrencia entre conexiones.

La migración inicial se aplicó por el conector Supabase al proyecto de Dhyana.
Se alineó el nombre del archivo local con la versión asignada en el historial remoto,
sin cambiar el SQL. Supabase CLI todavía no está configurada ni vinculada localmente.
No reaplicar esa migración ni ejecutarla en el proyecto de otra aplicación.
Los cambios siguientes requieren una nueva migración.
Referencia: [migraciones de Supabase](https://supabase.com/docs/guides/local-development/database-migrations).

La verificación remota comprobó RLS y privilegios en las cinco tablas, ocho casos de
vencimiento (incluidos bisiesto y cambio de fecha entre Perú/UTC), duplicados y compra
pendiente. Las inserciones temporales se revirtieron con `ROLLBACK`; no quedaron datos
de prueba. Esto no sustituye futuras pruebas de reservas, concurrencia ni Culqi.

Los asesores de Supabase devolvieron solo avisos `INFO`:

- [RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy):
  esperado; las tablas bloquean acceso directo de `anon`/`authenticated` por diseño.
- [Índices sin uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index):
  esperado en una base nueva sin tráfico. Se conservan los índices de relaciones.
- [FK sin índice compuesto](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys):
  la FK de `monthly_accesses` combina compra y fecha; `purchase_id` ya es clave
  primaria única. `EXPLAIN` confirmó `Index Scan using monthly_accesses_pkey` para
  consultar ambos campos, con máximo una fila. No se añadió un índice redundante.

### Configuración y cliente del servidor

`.env.example` documenta `SUPABASE_URL` y `SUPABASE_SECRET_KEY`. Sus valores reales
van en `.env.local`, ignorado por Git, y en las variables privadas del futuro hosting.
El cliente `createDatabaseAdminClient()` usa `@supabase/supabase-js` con versiones
fijas en package.json y lockfile. Crea un cliente sin persistencia, renovación ni
detección de sesiones y exige una Secret key moderna (`sb_secret_...`).

Este cliente utiliza el rol privilegiado del servidor. No sirve para iniciar sesión
como usuario del panel ni para autorizar una solicitud. Cada servicio administrativo
deberá validar la sesión y la entrada activa en `admin_users` antes de llamarlo.
El cliente de sesión está separado en `auth-session.ts`. Los tipos generados de `database.ts`
describen persistencia; los servicios convertirán filas a contratos públicos explícitos.

`npm run check:database` usa la misma URL y clave desde Node para hacer una consulta
`HEAD` a `workshops` por la Data API, sin descargar filas ni mostrar claves. Sirve
para comprobar configuración y red, pero no prueba una ruta Next.js ni permisos
por usuario. La comprobación local ya pasó. El SDK requiere Node.js 22 o superior.

### Acceso administrativo y sesiones (implementado)

`@supabase/ssr` configura una sesión por petición con cookies HttpOnly. No hay SDK
Auth en navegador: UI → hooks → `lib/api/admin-auth.ts` → endpoints → `lib/server`.
La clave publicable se usa en el cliente de sesión; la Secret key permanece separada
en `database.ts`. Ambas versiones de Supabase están fijadas en package.json/lockfile.

- `auth-config.ts`: variables SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y APP_URL.
  APP_URL determina el origen permitido de POST y los enlaces; HTTPS en producción.
- `auth-session.ts`: cookies asíncronas de Next. Las páginas solo leen; endpoints
  escriben. `proxy.ts` delega renovación a `auth-proxy.ts`, copiando cookies hacia
  la petición y respuesta, y evitando caché compartida en rutas de Auth/admin.
- `admin-auth.ts`: `getUser()` consulta identidad a Supabase; después lee la entrada
  activa en admin_users con el cliente privilegiado. No usa user_metadata ni confía
  en getSession(). La consulta de permisos no se cachea; desactivar al administrador
  bloquea la siguiente operación. No basta proteger un layout o esconder botones.
- `auth-http.ts`: valida Origin contra APP_URL, exige JSON y devuelve errores
  sanitizados. No expone tokens ni respuestas internas del proveedor.
- `app/admin/page.tsx` y `password/page.tsx`: llaman requireAdminPage() y componen UI.
  Cada futuro endpoint privado deberá llamar requireAdmin() por su cuenta.

Invitaciones estándar llegan con tokens en el fragmento: useAuthConfirmation los
retiene solo en memoria, limpia la URL y espera un clic antes de enviarlos al servidor.
Recuperación usa código PKCE, ligado al navegador que solicitó el enlace. También se
aceptan token_hash de tipo invite/recovery para plantillas propias y pruebas. Todos
los casos pasan por Supabase y por la lista de administradores; el destino es fijo.
Sin enlace válido, no se concede sesión. El responsable confirmó recepción de la invitación y creación de contraseña.

Cerrar sesión elimina cookies y revoca la sesión local en Supabase. Un access token
ya emitido puede durar hasta su vencimiento; desactivar admin_users revoca el acceso
al panel inmediatamente por su comprobación en cada solicitud. No se implementó
revocación adicional basada en auth.sessions ni MFA.

El comando admin:invite se ejecuta bajo petición explícita y solo para una identidad
activa ya preparada. El usuario define su contraseña, nunca el agente. No hay registro
público de cuentas desde esta aplicación; tampoco políticas para autoasignarse permiso.
Antes de publicar, revisar también registro en la configuración de Supabase Auth,
SMTP propio y URLs permitidas. El correo predeterminado del nuevo proyecto Free usa
plantillas fijas, que este flujo admite sin cambios.
[SSR oficial](https://supabase.com/docs/guides/auth/server-side/creating-a-client) ·
[Invitaciones](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail) ·
[Restricción de plantillas Free](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier).

Pruebas: test:auth requiere Next ejecutándose; usar build de producción para verificar
cabeceras, porque Next dev modifica caché de redirecciones. La suite básica cubre
visitantes, cookies falsas, CSRF, entradas inválidas y enlace inválido. Los casos con
AUTH_TEST_FIXTURES requieren dos cuentas temporales (admin autorizado y usuario ajeno
con metadatos admin); validan sesión, contraseña y logout. Nunca apuntarlos a usuarios
reales. Las cuentas y datos temporales se eliminan después; correo se verifica aparte.

Verificación realizada: siete pruebas HTTP completas en producción local y 19 de
base de datos; además, renovación de sesión y revocación del administrador con una
sesión abierta. Se eliminaron las dos identidades temporales. Solo queda el primer
administrador real, con correo ya confirmado y contraseña definida por el responsable. Build Webpack y lint pasan.

El asesor de seguridad ahora también informa `auth_leaked_password_protection`
(`WARN`): la detección de contraseñas filtradas está deshabilitada y Supabase la
ofrece desde Pro. Se mantiene el plan Free autorizado; la aplicación exige mínimo
12 caracteres al definir contraseña, pero no detecta contraseñas filtradas.
[Disponibilidad y configuración](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### Catálogo: flujo completo (implementado)

Un taller guarda título, descripción, categoría e identificador (`slug`, nombre
corto único). Un grupo pertenece a un taller y guarda horario, precio y capacidad.
Esta separación permite ofrecer el mismo taller en varios horarios. En pantalla,
ambos se editan juntos: primer horario inmediato, botón para agregar otros y un solo
guardado. GroupEditor solo pinta campos; el hook mantiene todos los borradores.
`workshopSlug()` genera la vista previa desde el título; el servidor recalcula y
la función SQL resuelve nombres repetidos con sufijos. Sin cambio de título, conserva
el identificador existente.

| Pieza | Qué hace | Equivalencia útil en Flutter |
|---|---|---|
| `components/admin/catalog/` | Formularios, lista y mensajes | Widgets |
| `hooks/useAdminCatalog.ts` | Estado, envío y errores | ViewModel / Controller |
| `lib/api/catalog.ts` | Solicitudes HTTP con contratos tipados | Servicio HTTP |
| `app/api/admin/workshops/**/route.ts` | Recibe HTTP y delega | Endpoint del backend |
| `lib/server/catalog.ts` | Verifica administrador, consulta y guarda | Servicio de negocio del backend |
| `lib/types/admin-catalog.ts` | Forma de datos privados | Modelos / DTOs tipados |
| `lib/types/catalog.ts` | Campos públicos sin capacidad total | Modelo de respuesta pública |

Cada guardado privado llama requireAdmin(). El adaptador HTTP valida Origin y JSON;
los servicios validan campos y llaman `save_workshop_catalog` por RPC. RPC significa
llamar una función de la base de datos: aquí guarda taller y horarios dentro de una
transacción, de modo que un error revierte todo. `sort_order` conserva el orden del
formulario. Los IDs devueltos reemplazan los borradores para que guardar otra vez
edite los horarios recién creados. Las funciones son SECURITY INVOKER; solo
service_role puede ejecutarlas. El borrado de ventas manuales se habilita después mediante una RPC confirmada y triggers.
`HttpError` representa un fallo esperado con código HTTP y mensaje seguro: Auth y
catálogo lo comparten. Los detalles internos de Supabase no se devuelven al navegador.

WorkshopEditor usa key al cambiar el taller elegido: React reinicia su estado como
un widget nuevo, evitando un efecto que sobrescriba texto mientras se escribe.
Los precios del formulario son soles; el hook convierte la parte entera y decimal a
céntimos y el servidor exige un entero positivo. Guardar no cambia compras pasadas.

La landing usa usePublicCatalog → lib/api → `/api/workshops`. Hay estados de carga,
error con reintento y catálogo vacío. PublicWorkshopCard recibe exclusivamente un
contrato público. Solo aparecen talleres publicados y grupos publicados; individuales
no muestran horarios comprables. No se monta el formulario de inscripción demo.
Los archivos antiguos de demo permanecen como referencia, sin uso en la sección activa.

`remainingSpots = max(0, capacity - accesos vigentes)`, con `starts_at <= ahora < ends_at`.
Se usa COUNT exacto por grupo publicado para evitar truncar ocupación por el límite de
filas de la Data API. La lectura no expone compradores. Para este catálogo pequeño,
la lectura usa una consulta de talleres y un conteo por grupo; si crece, agrupar
conteos en SQL y paginar catálogo. Las ventas manuales y el editor ya comparten
bloqueos de taller/grupo. Aún no hay reservas: el checkout deberá incorporarlas y
respetar el mismo orden de bloqueos. No activar compras web antes de resolverlo.

Taller/horario se despublican conservando relaciones e historial. Eliminar taller
pide confirmación y llama DELETE al endpoint privado, que delega en
`delete_workshop_catalog`. Talleres y horarios con cualquier compra asociada no se
borran; las FK también protegen esas relaciones. Quitar un horario con compras
rechaza todo el guardado, con mensaje para despublicarlo.
Un grupo no puede moverse a otro taller desde su edición. La ruta del panel verifica
sesión y carga datos iniciales; error.tsx usa retry de Next 16.3 ante fallos de lectura.

`test:catalog` tiene un caso público y comprobaciones de escritura al proporcionar
fixtures temporales (CATALOG_TEST_FIXTURES). Los IDs de filas creadas se registran en
un archivo privado `.rows` para limpieza controlada. Crear fixtures de prueba, registrar
su administrador por SQL, ejecutar y retirar accesos/compras/grupos/talleres/administrador
por sus IDs antes de eliminar las identidades Auth. No usar cuentas del responsable.
No envía correos ni confirma pagos reales. Para el editor unificado se verificaron
27 casos SQL, las operaciones remotas con rollback y el formulario real (crear,
editar y añadir horarios); las pruebas HTTP completas requieren esos fixtures.

### Preguntas frecuentes (implementado)

Las preguntas frecuentes tienen un recorrido independiente, ya implementado:
`/admin/faqs` verifica sesión y compone `AdminFaqs`; `useAdminFaqs` mantiene el
formulario como un ViewModel, `lib/api/faqs.ts` comunica por HTTP y
`lib/server/faqs.ts` autoriza, valida y persiste cada pregunta. Las rutas HTTP
validan Origin y no cachean respuestas. Cada guardado afecta una sola fila.

La tabla privada `faqs` contiene pregunta, respuesta, orden y publicación. Su
migración carga una sola vez los cuatro textos originales del diseño. Los tipos
están en `lib/types/faqs.ts`; las filas SQL, en los tipos generados. No queda una
copia estática para volver a mostrar preguntas eliminadas u ocultas.
`ContactSection` conecta `usePublicFaqs` con el acordeón de presentación. La
lectura pública devuelve solo ID, pregunta y respuesta de filas publicadas,
ordenadas por número y luego ID para resolver empates. Sin preguntas, se oculta
el bloque; ante errores, muestra reintento. El cambio se ve al recargar el sitio.

### Datos de la consulta (implementado)

`/admin/contact` verifica sesión y carga `AdminContactSettings`. El hook
`useAdminContactSettings` conserva formulario y errores como un ViewModel;
`lib/api/contact-settings.ts` transporta los datos y `lib/server/contact-settings.ts`
valida permisos y campos. Una actualización de la única fila de `contact_settings`
guarda todos los valores de forma atómica. Las notas pueden quedar vacías.

`ContactSection` conecta `usePublicContactSettings` con `ContactInfoCard`, que solo
pinta datos y enlaces recibidos. El servidor genera `tel:`, `mailto:` y `https://wa.me/`
con destinos validados y mensaje codificado, sin aceptar URLs libres. No se añaden
clientes Supabase de navegador. La tarjeta tiene carga y error con reintento, sin
fallback al contenido estático. El footer sigue fuera de esta configuración.

## 11. Recorrido de una compra

1. El navegador envía el identificador del grupo y los datos mínimos. El servidor
   obtiene precio, estado y disponibilidad, sin aceptar el importe del navegador.
2. Comprueba y reserva capacidad atómicamente en base de datos: para dos solicitudes
   concurrentes de la última plaza, solo una debe obtenerla.
3. El checkout de Culqi captura los datos de pago y el backend coordina el cobro
   según el contrato real del proveedor. Un token no equivale a un pago confirmado.
4. El servidor verifica estado, identidad de la operación, importe y moneda.
   Abrir una página de éxito o presentar una captura no confirma la venta.
5. La compra pagada genera un acceso mensual. Los reintentos no crean otro acceso
   ni vuelven a descontar un cupo. La venta conserva sus importes y fechas.
6. Se muestra el estado real y código compartible por WhatsApp. El administrador
   busca la venta confirmada y marca la coordinación realizada.

Una notificación entrante o webhook es una llamada de Culqi a nuestro servidor.
Su autenticidad se comprueba con el mecanismo soportado y, cuando corresponda, una
consulta autenticada de la operación. No suponer firma, secreto o reintentos sin
verificar la integración elegida. Respuestas verificadas y notificaciones convergen
en la misma operación de confirmación para mantener consistencia.

Registrar un evento recibido y fallar después no debe bloquear su reprocesamiento.
La compra y el acceso se confirman atómicamente; se distingue recibido de procesado.
Un timeout no prueba que el cobro falló: debe poder conciliarse. Un evento anterior
recibido tarde no puede convertir una compra ya pagada en fallida.

La reserva de checkout es temporal; no es el acceso mensual. Se debe decidir cómo
resolver un pago confirmado después de vencer la reserva si ya no queda capacidad.
No se mantiene una transacción de base de datos abierta mientras se llama a Culqi.

Una venta por Yape directo utiliza la acción administrativa de registrar venta
manual, con las mismas reglas de capacidad y acceso. Buscar un pago de Culqi para
coordinar por WhatsApp no registra otra venta. La capacidad se calcula con períodos
vigentes y reservas temporales; el historial permanece después del vencimiento.

Los handlers `POST` no se cachean: no necesitan `force-dynamic` para evitar una
supuesta caché de webhooks. La frescura del catálogo y cupos se decide explícitamente.

Referencias al implementar: [Checkout](https://docs.culqi.com/es/documentacion/checkout/checkout-custom/),
[Yape](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape/),
[webhooks](https://docs.culqi.com/es/documentacion/pagos-online/webhooks/) y
[seguridad de Supabase](https://supabase.com/docs/guides/database/secure-data).
Para Next.js, consultar `node_modules/next/dist/docs/`, especialmente las guías
`05-server-and-client-components.md` y `15-route-handlers.md` de
`01-app/01-getting-started/`, antes de escribir código.

## 12. Crear, modificar y verificar un módulo

### Agregar una sección visual

1. Contenido en `lib/data/<section>.ts` y tipo compartido si corresponde.
2. UI en `components/sections/<Section>.tsx`; piezas internas si crece demasiado.
3. Hook si hay estado y coordinación de acciones; piezas reciben props y callbacks.
4. Montar en `app/page.tsx` con `id` y `scroll-mt-20`.
5. Agregar a `NAV_LINKS` de Navbar si requiere navegación y comprobar móvil/teclado.

### Agregar un módulo con backend: ejemplo de compra

El contrato `lib/types/checkout.ts` ya existe. Los servicios, endpoints, hook y
componentes siguientes siguen propuestos; aún no existen en el repositorio.

1. **Contrato:** extender `lib/types/checkout.ts`, que ya define `CreatePurchaseInput`,
   `PurchaseStatus` y `PurchaseStatusResult`. No usar el `SubmitResult` demo para
   expresar pagos; añadir errores de compra cuando se implemente el endpoint.
2. **Reglas y datos:** implementar `lib/server/checkout.ts`, migraciones y permisos.
   Aislar Culqi en su servicio. Nunca confiar en precio o permisos del navegador.
3. **Endpoint:** `app/api/checkout/route.ts` valida el cuerpo y delega. En operaciones
   administrativas también verifica identidad y permisos.
4. **Transporte:** `lib/api/checkout.ts` hace `fetch`, comprueba la respuesta y devuelve
   el contrato. No contiene estado de React.
5. **ViewModel:** `hooks/useCheckout.ts` maneja campos, envío y errores. Expone acciones
   como `submitPurchase`, sin decidir si el cobro es válido.
6. **UI:** `components/checkout/CheckoutForm.tsx` recibe valores y callbacks. El
   orquestador conecta el hook. La UI cancela el envío HTML con `preventDefault`;
   la acción recibe datos, no eventos del DOM.
7. **Composición:** conectar al detalle del taller sin registro previo de usuario.
8. **Verificar:** reglas críticas y experiencia móvil, build y lint; actualizar esta
   guía si cambia el contrato o estructura y AGENTS.md si cambian las reglas.

### Modificar un módulo existente

| Cambio | Dónde intervenir |
|---|---|
| Campo de compra nuevo | Tipo, formulario, hook, validación de servidor y persistencia si corresponde |
| Regla de precio o capacidad | Servicio de servidor y operación de base de datos |
| Endpoint o formato externo | Servicio de transporte y adaptación del contrato |
| Estado o mensaje de interfaz | Hook y componente correspondiente |
| Modelo de datos | Migración, contrato y servicio que lo utiliza |
| Contenido publicado | Panel, una vez implementado |

Para diagnosticar seguir UI → hook → servicio cliente → endpoint → servicio de
servidor. Diferenciar red, validación, falta de cupo y pago pendiente; conservar los
campos escritos si falla el envío. Un estado explícito `idle | submitting | success |
error` puede evitar booleanos contradictorios. El estado real del pago es otro dato,
consultado al backend.

Verificar última plaza concurrente, eventos repetidos, reserva vencida, venta manual,
mes calendario y accesos administrativos sin permiso. No agregar pruebas que solo
repitan textos o clases CSS. Ejecutar build y lint según AGENTS.md.

Actualizar la sección correspondiente cuando se implemente una propuesta y retirar
la alternativa sustituida. Ampliar aquí los datos y pagos cuando se concreten; no
copiar los siete borradores externos como siete documentos de mantenimiento.

### Ventas manuales: recorrido implementado

`app/admin/sales/page.tsx` verifica sesión y compone la pantalla con lecturas iniciales.
`AdminSales`, `ManualSaleForm` y `SalesList` son la presentación; `useAdminSales` y
`useManualSale` mantienen estado, filtros, envío y errores como ViewModels de Flutter.
`lib/api/admin-sales.ts` es la puerta HTTP. Las rutas delegan en `lib/server/sales*.ts`,
que comprueban autorización, validan campos y llaman las funciones SQL privadas.

`register_manual_sale` recibe el administrador validado por el servidor y registra
compra y acceso juntos. El navegador nunca decide el administrador ni el vencimiento.
El formulario entrega fecha local de Perú; el servidor valida y convierte a ISO con
zona. La columna generada calcula el mes calendario y su ajuste al último día del mes.

Cada formulario conserva un UUID de solicitud. Reenviarlo tras una respuesta perdida
no duplica la venta: la función devuelve su ID original si los datos coinciden.
Tras un registro exitoso, abrir otro formulario crea un UUID distinto. La referencia
opcional agrega detección de duplicados entre formularios para el mismo medio de pago;
sin referencia sigue siendo necesaria la revisión del administrador.

El guardado bloquea taller y grupo en el mismo orden que el editor de catálogo.
`group_peak_occupancy` calcula la máxima ocupación simultánea en un intervalo,
considerando inclusivo el inicio y exclusivo el vencimiento. Esto protege pagos
cargados tarde y evita contar juntos accesos que nunca coincidieron. El editor no
reduce capacidad por debajo de ocupación actual o futura. Los futuros pagos web y
reservas deben entrar por el mismo protocolo; escribir filas directamente con una
clave privilegiada no sustituye esas reglas de negocio.

`admin_sales_page` devuelve 20 ventas pagadas o anuladas con período original, total y fecha de lectura.
La búsqueda usa texto literal, sin SQL dinámico. La lista muestra datos personales
solo después de `requireAdmin()` y nunca se cachea. Los filtros se aplican al buscar;
«Actualizar» refresca la página actual. Las fechas se construyen con partes numéricas
en `America/Lima`, evitando diferencias de abreviaturas/espacios entre Node y navegador.

`set_sale_coordination` marca o desmarca coordinación y conserva autor y fecha de
la primera marca mientras siga activa. No envía mensajes, cobra ni modifica acceso.
Las funciones de negocio y el cálculo de ocupación son SECURITY INVOKER con
EXECUTE solo para service_role. Cada endpoint privado valida Origin y autorización.

Pruebas: casos SQL para importe histórico, vencimiento, ocupación, duplicados,
permisos, filtros y coordinación. `test:sales` agrega privacidad HTTP y, con fixtures
explícitos, concurrencia real vía RPC. Los IDs quedan en un archivo privado para
limpieza por SQL privilegiado; no se cobra ni se altera la contraseña de ninguna cuenta.

`SaleActionForm` presenta confirmación de borrado o motivo de anulación; el hook
orquesta y `lib/api` llama POST `/api/admin/sales/[id]/cancel` o DELETE
`/api/admin/sales/[id]`. Ambos endpoints validan Origin e identidad activa.
`cancel_sale` conserva historial y auditoría, sin devolución de dinero. El acceso
original sigue almacenado, pero su ocupación efectiva termina en `cancelled_at`.
La lectura pública exige estado paid; la privada distingue las anuladas.

`delete_manual_sale` exige código y declaración de prueba/error, elimina compra y
acceso en una transacción y guarda solo el UUID técnico de la solicitud. El bloqueo
por solicitud precede taller → grupo → compra, igual que el registro manual, para
que un reintento concurrente no recree lo borrado. Los triggers restringen DELETE
del servidor a esa operación; el propietario postgres conserva mantenimiento.
No usar el acceso original de una venta anulada para autorizar asistencia futura.
