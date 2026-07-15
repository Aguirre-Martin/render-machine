# Industrial Configurator Pro — Demo Showroom

MVP comercial de un configurador web interactivo de maquinaria industrial.
Next.js (App Router) + TypeScript + Tailwind + `@google/model-viewer`.

## Setup

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

```bash
npx vercel
```

O conectá el repo en el dashboard de Vercel. Build command: `next build`.

## Stack

- Visor 3D: `@google/model-viewer` (cargado con `dynamic(..., { ssr: false })`)
- Iconos: `lucide-react`
- Videos / modelo: URLs públicas CDN (Google + Khronos)

## Estructura

```
src/
  app/                  # layout + page
  components/
    ConfiguratorShell   # estado principal
    ModelViewerClient   # dynamic SSR-off wrapper
    ModelViewer         # web component
    VideoPlayer         # fade + autoplay
    ControlPanel        # selección de módulos
    Header / QuoteCta
  data/mockData.ts
```
