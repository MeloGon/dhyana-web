# Dhyana — Arquitectura y guía para un desarrollador Flutter

Este proyecto (dhyana-web) es Next.js 16 con App Router. Esta guía explica los
conceptos que no existen en Flutter, la arquitectura y cómo crear o modificar
módulos. El objetivo y alcance están en [README.md](README.md); las reglas para
agentes, en [AGENTS.md](AGENTS.md). Esta es la guía técnica única del proyecto.

Las secciones 1 a 8 describen la base actual. Las secciones 9 a 12 proponen su
extensión para ventas y administración: esos archivos y funciones aún no existen.

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
  api/                        Única puerta al backend (hoy stubs simulados)
  data/                       Contenido: talleres, servicios, FAQs, videos
  types/                      Interfaces compartidas
  utils.ts                    Helper cn() para combinar clases de Tailwind
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
pedazo visual a un componente chico en su subcarpeta. Si necesitás cambiar el
texto del acordeón de preguntas frecuentes, vas directo a
`lib/data/faqs.ts` — sin tocar una sola línea de UI.

### Dónde tocar según lo que quieras cambiar

| Quiero cambiar... | Voy a... |
|---|---|
| Contenido de demo | `lib/data/`; algunos textos todavía están en JSX o metadata |
| Cómo se ve algo | `components/` |
| Qué pasa al enviar un formulario | `hooks/` |
| Cambiar el transporte hacia el backend | `lib/api/` |
| El orden de las secciones | `app/page.tsx` |

En producción los talleres, precios y horarios se editarán desde el panel. Conectar
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

Hoy el sitio es de una sola página (todo vive en `app/page.tsx`, secciones con
scroll — no hay rutas separadas).

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

No está implementada. Los archivos se crearán cuando el módulo lo necesite, sin
carpetas vacías ni capas genéricas por anticipado.

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

| Ubicación propuesta | Responsabilidad |
|---|---|
| `lib/types/checkout.ts` | Contratos compartidos sin React ni secretos |
| `lib/api/checkout.ts` | Llamada HTTP desde el frontend |
| `lib/server/checkout.ts` | Reglas y coordinación de precio, reserva y compra |
| `lib/server/workshops.ts` | Consulta y gestión de catálogo y disponibilidad |
| `lib/server/culqi.ts` | Detalles específicos del proveedor de pago |
| `lib/server/database.ts` | Acceso a la base de datos elegida |
| `app/api/checkout/route.ts` | Entrada HTTP para la compra |
| `app/api/webhooks/culqi/route.ts` | Notificaciones del proveedor |

Los archivos de `lib/server/` usarán `import 'server-only'` para impedir imports
desde cliente. Las credenciales privadas no llevan `NEXT_PUBLIC_` y no se envían
en props ni respuestas. Un secreto puede usarse en un servicio de servidor fuera
de `app/api/`; importa la frontera de ejecución, no solo la carpeta.

Supabase es la propuesta para persistencia; falta cerrar esa elección. Se conserva
Next.js para frontend y backend. No hace falta una interfaz genérica de pasarelas
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

### Modelo conceptual, todavía no un esquema aprobado

| Concepto | Datos y responsabilidad |
|---|---|
| Taller | Descripción, imagen, categoría y publicación |
| Grupo/horario | Taller, horario, precio en soles y capacidad privada |
| Compra | Grupo, comprador, importe histórico, origen, referencia y estado de pago |
| Acceso | Compra que lo origina y período mensual; único por compra confirmada |
| Intento/evento de pago | Conciliar respuestas y reintentos sin duplicar cobros ni accesos |
| Usuario administrativo | Identidad y permisos para operar el panel |

La coordinación se asocia a la compra y no modifica su estado de pago. El esquema
físico se versionará en migraciones SQL cuando se concrete, sin otro MD que copie
cada columna. Los tipos nuevos se agrupan por módulo en `lib/types/`; el actual
`index.ts` se mantiene mientras no haya una razón para migrarlo, sin agregar reexports.

El contrato público expondrá `remainingSpots`, no el registro completo del grupo.
RLS restringe filas, pero por sí sola no oculta capacidad o enlaces privados dentro
de una fila pública. Las escrituras administrativas necesitan autorización en
servidor; ocultar el botón del panel no protege el endpoint.

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

Los nombres siguientes son propuestos; aún no existen en el repositorio.

1. **Contrato:** `lib/types/checkout.ts` define entrada y respuesta. Por ejemplo,
   `CreatePurchaseInput` y `PurchaseStatus`. No forzar el `SubmitResult` demo si no
   expresa pago pendiente y errores de compra.
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
