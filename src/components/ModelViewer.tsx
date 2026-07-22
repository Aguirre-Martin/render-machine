"use client";

import type { Ref } from "react";
import { Box, ExternalLink, MonitorOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ADDON_OPTIONS,
  getChassis,
  getFinish,
  MODULE_OPTIONS,
  type BuildModules,
} from "@/data/mockData";

type ModelViewerProps = {
  chassisId: string;
  finishId: string;
  modules: BuildModules;
  /** Resolved GLB URL — local multi-part demo (stable across steps) */
  modelSrc: string;
  /** Mounted addons keyed by id — drive part show/hide via material alpha */
  parts: Record<string, boolean>;
};

/** Minimal surface of @google/model-viewer used for live material tinting. */
type ModelViewerElement = HTMLElement & {
  model?: {
    materials: Array<{
      name?: string;
      setEmissiveFactor?: (rgb: [number, number, number]) => void;
      emissiveFactor?: { set: (x: number, y: number, z: number) => void };
      pbrMetallicRoughness: {
        baseColorFactor?: readonly number[];
        setBaseColorFactor: (rgba: [number, number, number, number]) => void;
        setMetallicFactor: (value: number) => void;
        setRoughnessFactor: (value: number) => void;
        baseColorTexture?: {
          setTexture: (texture: unknown) => void;
        };
      };
    }>;
  };
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function setEmissive(
  material: NonNullable<ModelViewerElement["model"]>["materials"][number],
  rgb: [number, number, number],
) {
  if (typeof material.setEmissiveFactor === "function") {
    material.setEmissiveFactor(rgb);
    return;
  }
  material.emissiveFactor?.set(rgb[0], rgb[1], rgb[2]);
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function WebGLFallback() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-amber-500/40 bg-slate-950 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_65%)]" />
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
        <MonitorOff className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="font-mono text-[11px] tracking-[0.18em] text-amber-300/90 uppercase">
        WebGL no disponible
      </p>
      <h3 className="mt-2 max-w-sm text-base font-semibold text-slate-100">
        El visor 3D necesita aceleración gráfica
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        Este entorno (p. ej. Simple Browser de Cursor o GPU deshabilitada) no
        puede crear un contexto WebGL. Abre la demo en Chrome/Firefox normal con
        hardware acceleration activo.
      </p>
      <a
        href="http://localhost:3000"
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-400"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Abrir en navegador del sistema
      </a>
      <div className="mt-6 flex items-center gap-2 font-mono text-[10px] tracking-wider text-slate-500 uppercase">
        <Box className="h-3.5 w-3.5" />
        Preview 3D en espera
      </div>
    </div>
  );
}

/**
 * Factory-locked Pod IR — entire tube + black glass + hot IR pupil.
 * Never engamado with chassis/finish (brand optic stays black + infrared red).
 */
const FACTORY_IR: Record<
  string,
  {
    base: [number, number, number];
    emissive: [number, number, number];
    metallic: number;
    roughness: number;
  }
> = {
  // Full telescopic barrel — matte black factory housing
  part_pod: {
    base: [0.05, 0.05, 0.055],
    emissive: [0, 0, 0],
    metallic: 0.72,
    roughness: 0.42,
  },
  part_pod_glass: {
    base: [0.03, 0.03, 0.035],
    emissive: [0.02, 0.0, 0.0],
    metallic: 0.1,
    roughness: 0.14,
  },
  // Hot infrared pupil — push pure red, not amber/magenta wash
  part_pod_eye: {
    base: [0.12, 0.0, 0.01],
    emissive: [1.0, 0.02, 0.03],
    metallic: 0.02,
    roughness: 0.18,
  },
};

/** Whole Pod IR assembly (tube + glass + eye) is brand-locked. */
function isFactoryLockedPart(name: string): boolean {
  return name === "part_pod" || name.startsWith("part_pod_");
}

/**
 * Tint chassis / finish / module cues on body + addon housings.
 * DamagedHelmet is single-material; stand-in addon GLBs may have several.
 * Mutates in place after load — color/finish clicks do not reload the .glb.
 *
 * Addon metal (rail / antenna) engama with chassis+finish.
 * Entire Pod IR tube + glass + pupil stay factory black / hot IR red — brand lock.
 */
function applyBuildMaterials(
  viewer: ModelViewerElement,
  chassisId: string,
  finishId: string,
  modules: BuildModules,
  activePartMaterials: Set<string>,
) {
  const materials = viewer.model?.materials;
  if (!materials?.length) return;

  const chassis = getChassis(chassisId);
  const finish = getFinish(finishId);
  const [cr, cg, cb] = chassis.baseColor;
  const [tr, tg, tb] = finish.tint;
  const t = finish.tintStrength;

  const r = lerp(cr, tr, t);
  const g = lerp(cg, tg, t);
  const b = lerp(cb, tb, t);

  // Housings share the palette but sit slightly darker / more metallic so they
  // read as bolted gear, not a flat paint continuation of the shell.
  const hr = r * 0.82;
  const hg = g * 0.82;
  const hb = b * 0.82;
  const hMetallic = Math.min(1, finish.metallic + 0.12);
  const hRoughness = Math.max(0.12, finish.roughness - 0.06);
  const her = finish.emissive[0] * 0.55;
  const heg = finish.emissive[1] * 0.55;
  const heb = finish.emissive[2] * 0.55;

  let er = finish.emissive[0];
  let eg = finish.emissive[1];
  let eb = finish.emissive[2];

  if (modules.thermalVision) {
    // Infrared / thermal cue — crimson, not warm amber
    er = Math.min(1, er + 0.75);
    eg = Math.min(1, eg + 0.06);
    eb = Math.min(1, eb + 0.12);
  }
  if (modules.lidar) {
    er = Math.min(1, er + 0.05);
    eg = Math.min(1, eg + 0.55);
    eb = Math.min(1, eb + 0.75);
  }

  for (const material of materials) {
    // part_* = mounted geometry. Rail/antenna follow chassis; whole Pod IR is locked.
    // Sub-materials (part_pod + part_pod_glass + part_pod_eye) toggle via prefix.
    if (material.name?.startsWith("part_")) {
      const name = material.name;
      const visible = Array.from(activePartMaterials).some(
        (m) => name === m || name.startsWith(`${m}_`),
      );
      const alpha = visible ? 1 : 0;

      if (isFactoryLockedPart(name)) {
        const factory =
          FACTORY_IR[name] ?? FACTORY_IR.part_pod_eye;
        material.pbrMetallicRoughness.setBaseColorFactor([
          factory.base[0],
          factory.base[1],
          factory.base[2],
          alpha,
        ]);
        material.pbrMetallicRoughness.setMetallicFactor(factory.metallic);
        material.pbrMetallicRoughness.setRoughnessFactor(factory.roughness);
        setEmissive(material, factory.emissive);
        continue;
      }

      material.pbrMetallicRoughness.setBaseColorFactor([hr, hg, hb, alpha]);
      material.pbrMetallicRoughness.setMetallicFactor(hMetallic);
      material.pbrMetallicRoughness.setRoughnessFactor(hRoughness);
      setEmissive(material, [her, heg, heb]);
      continue;
    }

    material.pbrMetallicRoughness.baseColorTexture?.setTexture(null);
    material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
    material.pbrMetallicRoughness.setMetallicFactor(finish.metallic);
    material.pbrMetallicRoughness.setRoughnessFactor(finish.roughness);
    setEmissive(material, [er, eg, eb]);
  }
}

export default function ModelViewer({
  chassisId,
  finishId,
  modules,
  modelSrc,
  parts,
}: ModelViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "no-webgl">(
    "checking",
  );
  const [modelReady, setModelReady] = useState(false);
  const modulesActive = modules.thermalVision || modules.lidar;
  const activeAddons = ADDON_OPTIONS.filter((addon) => parts[addon.id]);
  const activePartMaterials = new Set(
    activeAddons
      .map((addon) => addon.partMaterial)
      .filter((name): name is string => Boolean(name)),
  );
  const partsKey = activeAddons.map((addon) => addon.id).join(",");

  // Latest build for the load handler — avoids stale chassis tint on GLB swap.
  const buildRef = useRef({
    chassisId,
    finishId,
    modules,
    activePartMaterials,
  });
  buildRef.current = {
    chassisId,
    finishId,
    modules,
    activePartMaterials,
  };

  let exposure = finishId === "plata" ? "1.12" : "1";
  if (modules.thermalVision && modules.lidar) exposure = String(Number(exposure) + 0.3);
  else if (modulesActive) exposure = String(Number(exposure) + 0.15);

  useEffect(() => {
    let cancelled = false;

    if (!isWebGLAvailable()) {
      setStatus("no-webgl");
      return;
    }

    void import("@google/model-viewer")
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("no-webgl");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setModelReady(false);
  }, [modelSrc]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || status !== "ready") return;

    const paint = () => {
      const build = buildRef.current;
      applyBuildMaterials(
        viewer,
        build.chassisId,
        build.finishId,
        build.modules,
        build.activePartMaterials,
      );
      setModelReady(true);
    };

    const onLoad = () => {
      paint();
    };

    viewer.addEventListener("load", onLoad);
    // Cached / already-loaded GLB — paint immediately so we don't wait forever.
    if (viewer.model?.materials?.length) {
      paint();
    }

    return () => {
      viewer.removeEventListener("load", onLoad);
    };
  }, [status, modelSrc]);

  // In-place retint (same GLB) — chassis/finish/modules/parts, no reload.
  useEffect(() => {
    if (!modelReady || !viewerRef.current) return;
    applyBuildMaterials(
      viewerRef.current,
      chassisId,
      finishId,
      modules,
      activePartMaterials,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chassisId, finishId, modules, modelReady, partsKey]);

  if (status === "checking") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          <p className="font-mono text-xs tracking-widest text-slate-400 uppercase">
            Cargando visor 3D…
          </p>
        </div>
      </div>
    );
  }

  if (status === "no-webgl") {
    return <WebGLFallback />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          modules.thermalVision
            ? "bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.12)_0%,_transparent_60%)] opacity-100"
            : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          modules.lidar
            ? "bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.14)_0%,_transparent_60%)] opacity-100"
            : modules.thermalVision
              ? "opacity-0"
              : "bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.06)_0%,_transparent_65%)] opacity-100"
        }`}
      />

      <model-viewer
        ref={viewerRef as Ref<HTMLElement>}
        src={modelSrc}
        alt="Modelo 3D de maquinaria industrial"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        rotation-per-second="18deg"
        shadow-intensity="1"
        shadow-softness="0.8"
        exposure={exposure}
        interaction-prompt="none"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      />

      {/* Active module / addon tags — horizontal strip to save vertical space */}
      {(modulesActive || activeAddons.length > 0) && (
        <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex flex-wrap gap-1.5">
          {MODULE_OPTIONS.filter((mod) => modules[mod.id]).map((mod) => (
            <span
              key={mod.id}
              className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] tracking-wider uppercase backdrop-blur-sm ${
                mod.id === "thermalVision"
                  ? "border-rose-400/50 bg-rose-500/15 text-rose-200"
                  : "border-cyan-400/50 bg-cyan-400/15 text-cyan-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  mod.id === "thermalVision" ? "bg-rose-400" : "bg-cyan-400"
                }`}
              />
              {mod.label} · Activo
            </span>
          ))}
          {activeAddons.map((addon) => (
            <span
              key={addon.id}
              className="inline-flex items-center gap-1.5 rounded border border-cyan-400/50 bg-cyan-400/15 px-2 py-1 font-mono text-[10px] tracking-wider text-cyan-200 uppercase backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {addon.label} · Montado
            </span>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-center justify-between">
        <span className="rounded border border-slate-600/80 bg-slate-900/80 px-2 py-1 font-mono text-[10px] tracking-wider text-slate-300 uppercase backdrop-blur-sm">
          Rotación 360° · Zoom
        </span>
        <span className="rounded border border-cyan-500/30 bg-slate-900/80 px-2 py-1 font-mono text-[10px] tracking-wider text-cyan-300/90 uppercase backdrop-blur-sm">
          Live 3D
        </span>
      </div>
    </div>
  );
}
