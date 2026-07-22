# Industrial Configurator Pro — Demo Showroom

MVP comercial de un configurador web interactivo de maquinaria industrial.
Next.js (App Router) + TypeScript + Tailwind + `@google/model-viewer`.

## Agent / product context

- Living notes: [`docs/CONTEXT.md`](docs/CONTEXT.md)
- UX reference (Volvo Truck Builder — flow only):  
  https://www.volvotrucks.es/es-es/tools/truck-builder.html#/es-es/configurator/fh16aero

## Setup

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

```bash
npx vercel
```

O conecta el repo en el dashboard de Vercel. Build command: `next build`.
Push a `main` dispara producción si el repo está vinculado.

## Stack

- Visor 3D: `@google/model-viewer` (cargado con `dynamic(..., { ssr: false })`)
- Iconos: `lucide-react`
- Videos / modelo: URLs públicas CDN (Google + Khronos)

## Estructura

```
src/
  app/                  # layout + page
  components/
    ConfiguratorShell   # BuildConfig (source of truth)
    ModelViewerClient   # dynamic SSR-off wrapper
    ModelViewer         # live materials
    VideoPlayer         # fade + autoplay
    ControlPanel        # builder steps
    Header / QuoteCta
  data/mockData.ts
docs/
  CONTEXT.md            # agent + product context
```
