# Industrial Configurator — Agent Context

Living product/architecture notes for agents working on this repo.
Prefer this file + the Cursor rule over chat memory.

## UX reference (must internalize)

Volvo Truck Builder — wizard / tray / selection feedback:

https://www.volvotrucks.es/es-es/tools/truck-builder.html#/es-es/configurator/fh16aero

**Take the flow, not the white Volvo skin.** Our skin stays dark industrial (slate/cyan).

Patterns to mirror:
- Step wizard (Chasis → Acabado → Módulos → Agregados)
- Hero product (3D) + side preview (video)
- Tray of selectable cards with clear selected state (check / cyan border)
- Volver / Siguiente
- Live summary bar of the active build

## What this MVP is

- Next.js App Router + Tailwind + `@google/model-viewer` (CSR via `ModelViewerClient`, `ssr: false`)
- State in `ConfiguratorShell` as `BuildConfig` (no Zustand, no backend)
- Data in `src/data/mockData.ts`
- Deploy: push to `main` → Vercel production (repo linked as `render-machine`)

## Do not break

- `ModelViewerClient` dynamic SSR isolation
- Layout grid: 3D `col-span-3` | video+panel `col-span-2`
- Header / dark industrial look
- No new deps unless explicitly asked
- No real PDF / no pricing in UI for now (price fields may exist in mock for later)

## Current build model

```
BuildConfig {
  chassisId    → helmet base color (materials[0])
  finishId     → metallic / roughness / light tint (chassis stays dominant)
  modules      → thermalVision / lidar → emissive glow (no hotspot labels)
  addonId      → max 1 geometry addon (null = none)
  activeStep   → chassis | finish | modules | addons
  activeMediaId → which video is shown
}
```

DamagedHelmet = single material demo stand-in. Clear albedo texture, tint `materials[0]`. Never reload `.glb` on every click for color/finish.

## Agregados (Paso 4)

Geometry addons (rail / pod IR / antenna) — **not** a paint step in the wizard, and **not** swapping the whole hero model for a random GLB.
- UI: wizard step + cards + in-panel detail drawer
- Rules: max 1 addon; e.g. LIDAR blocks Antena X
- **Color rule:** metal housings (`part_rail` / `part_antenna`) engaman with chassis + finish. The whole Pod IR (`part_pod` tube + `part_pod_glass` + `part_pod_eye`) is **factory-locked** — matte black tube + hot infrared red pupil; never retint.
- Today: multi-part demo GLB for all steps; selection toggles part_* meshes + video / summary / BOM. Same src throughout — no model swap when entering Agregados.
- Real 3D attach later: client GLB with slots, prebaked casco+add, or R3F composition

## Key files

| File | Role |
|------|------|
| `src/components/ConfiguratorShell.tsx` | Single source of truth |
| `src/components/ControlPanel.tsx` | Builder steps UI |
| `src/components/ModelViewer.tsx` | Live material mutations |
| `src/components/ModelViewerClient.tsx` | `dynamic(..., { ssr: false })` |
| `src/components/VideoPlayer.tsx` | Active media preview |
| `src/components/QuoteCta.tsx` | Summary bar + BOM modal (no PDF) |
| `src/data/mockData.ts` | Options, helpers, video URLs |

## Working rules

- Minimal focused diffs; English comments in code
- No commits unless the user asks
- When unsure about UX density, prefer Volvo tray clarity over dashboard clutter
