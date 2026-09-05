<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# dhyana-web — Guía para agentes

Sitio del **Centro de Desarrollo Integral Dhyana**: psicoterapia y talleres.
Hoy es una landing de una sola página con secciones ancladas por scroll.

El dueño del proyecto viene de **Flutter y no de Next.js**. Priorizá código
explícito y legible sobre código "inteligente". Si algo requiere conocer una
sutileza de React/Next para entenderlo, dejá un comentario corto explicándolo.

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

**Por qué así:** cuando se conecte el backend real, cada formulario se activa
tocando **un solo archivo** en `lib/api/`. Ni los hooks ni los componentes
cambian.

## Mapa de carpetas

```
app/
  layout.tsx            Server Component: fuentes, metadata, <html>/<body>
  page.tsx              Home "/". Orquesta las secciones
  globals.css           Tailwind + variables de color + fuentes

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
  types/index.ts        WorkshopItem, ContactFormData, SubmitResult, ...
  utils.ts              cn() — merge de clases Tailwind
```

## Convenciones

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
  `lib/data/`, nunca hardcodeada dentro del JSX.
- **Colores**: hex directo en las clases (`bg-[#83D0C6]`), siguiendo la paleta
  ya definida en `globals.css`.

## Receta: agregar una sección nueva a la landing

1. `lib/data/<seccion>.ts` — el contenido (si tiene lista o textos largos).
2. `lib/types/index.ts` — el tipo, si lo usa más de un archivo.
3. `components/sections/<Seccion>.tsx` — con `'use client'` si es interactiva.
4. Montarla en `app/page.tsx`, en el orden visual que corresponda.
5. `<section id="mi-seccion" className="... scroll-mt-20">` — el `id` es lo que
   permite el scroll.
6. Si va en la navbar: agregar `{ id, label }` a `NAV_LINKS` en
   `components/layout/Navbar.tsx`.

## Receta: agregar un módulo con backend

1. **Tipos** en `lib/types/index.ts` (payload + respuesta).
2. **Servicio** en `lib/api/<modulo>.ts`. Devolver `SubmitResult` o un tipo
   propio. Lanzar `Error` si la respuesta no es ok.
3. **Hook** en `hooks/use<Modulo>.ts`: estado, `handleSubmit` con
   `try/catch/finally`, y `errorMessage` para que la UI pueda mostrar el fallo.
4. **Componentes**: orquestador que llama al hook + piezas tontas por props.
5. Verificar con `npm run build` y `npm run lint`.

Los formularios de contacto y talleres ya siguen esta receta completa —
copiarlos como referencia.

## Estado actual / pendientes

- Los dos formularios usan **stubs** en `lib/api/` (delay simulado + código
  aleatorio). No hay backend ni persistencia. Los `TODO` están documentados en
  cada archivo de `lib/api/`.
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
```

Antes de dar por terminado un cambio: `npm run build` y `npm run lint`, ambos
en verde.

## Documentación relacionada

- `GUIA-NEXTJS.md` — explicación de Next.js/React para el dueño del proyecto,
  con equivalencias a Flutter. Si cambia la estructura de carpetas o alguna
  convención, actualizar **los dos** archivos.
