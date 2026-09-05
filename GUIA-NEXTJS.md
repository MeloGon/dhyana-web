# Guía Next.js para dev de Flutter

Este proyecto (dhyana-web) es Next.js 16 con App Router. Esta guía explica los
conceptos que no existen en Flutter, para que puedas navegar el código sin
tener que aprender Next.js entero primero.

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

Un componente nunca llama al backend directo, y `lib/` nunca sabe que React
existe. Viniendo de Flutter: `components/` son los Widgets, `hooks/` son tus
Controllers/ViewModels, y `lib/api/` es tu capa de repositorios/servicios.

Patrón usado en Contact y Workshops: un archivo "orquestador" (ej.
`ContactSection.tsx`) que llama al hook y arma la sección, delegando cada
pedazo visual a un componente chico en su subcarpeta. Si necesitás cambiar el
texto del acordeón de preguntas frecuentes, vas directo a
`lib/data/faqs.ts` — sin tocar una sola línea de UI.

### Dónde tocar según lo que quieras cambiar

| Quiero cambiar... | Voy a... |
|---|---|
| Un texto, precio, cupo de taller | `lib/data/` |
| Cómo se ve algo | `components/` |
| Qué pasa al enviar un formulario | `hooks/` |
| Conectar el backend real | `lib/api/` (y nada más) |
| El orden de las secciones | `app/page.tsx` |

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

Esto es lo más distinto a Flutter. Por default, TODO componente en Next.js es
un **Server Component**: corre en el servidor, arma el HTML, y ese HTML viaja
al navegador — el componente en sí nunca se manda como JS al cliente. Es
rápido pero **no puede usar `useState`, `useEffect`, `onClick`, ni nada
interactivo**, porque el navegador nunca ejecuta ese código.

Cuando un componente necesita interactividad (estado, eventos, hooks), se le
pone `'use client'` como primera línea del archivo. Ahí Next.js sí manda ese
componente al navegador para que corra como una app normal de React.

En este proyecto: `app/layout.tsx` es Server Component (solo arma el
esqueleto). Casi todo lo demás tiene `'use client'` arriba porque son
formularios, menús, videos con controles, etc. — todo interactivo.

Regla práctica: si un archivo usa `useState`, `useEffect`, `onClick`, o
`onChange`, necesita `'use client'`.

## 4. Hooks ≈ StatefulWidget

| React (este proyecto) | Flutter |
|---|---|
| `useState(valorInicial)` | una variable de estado + `setState()` |
| `useEffect(fn, [])` | `initState()` |
| `useEffect(fn, [dep])` | reaccionar cuando cambia una prop (como `didUpdateWidget`) |
| `useEffect` con `return () => ...` | `dispose()` |
| `useRef()` | `GlobalKey` — referencia directa a un elemento del DOM |
| props (`{ onScrollTo }`) | constructor params de un Widget |

## 5. Tailwind CSS ≈ estilos inline de Flutter

Las clases como `className="flex items-center gap-3 rounded-full bg-white"`
son atajos CSS, no nombres custom — cada palabra es una regla de estilo (como
armar un `Container` + `Row` + `BoxDecoration` a mano, pero en una sola
línea). No hay StyleSheet central: el estilo vive pegado a cada elemento.

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

Por eso en este proyecto no hace falta Redux ni Provider: el hook ya cumple ese
rol, y React lo trae de fábrica.

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
npm install   # instala dependencias (ya se corrió una vez al integrar todo)
npm run dev   # levanta el servidor de desarrollo en http://localhost:3000
```

Cambios en cualquier archivo de `app/` o `components/` se reflejan solos en
el navegador (hot reload), como el hot reload de Flutter.
