"use client";

import type { Ref } from "react";
import { Box, ExternalLink, MonitorOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getChassis,
  getFinish,
  MODULE_OPTIONS,
  MODEL_SRC,
  type BuildModules,
} from "@/data/mockData";

type ModelViewerProps = {
  chassisId: string;
  finishId: string;
  modules: BuildModules;
};

/** Minimal surface of @google/model-viewer used for live material tinting. */
type ModelViewerElement = HTMLElement & {
  model?: {
    materials: Array<{
      setEmissiveFactor?: (rgb: [number, number, number]) => void;
      emissiveFactor?: { set: (x: number, y: number, z: number) => void };
      pbrMetallicRoughness: {
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
    <div className="relative flex h-full min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-amber-500/40 bg-slate-950 px-6 text-center">
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
        puede crear un contexto WebGL. Abrí la demo en Chrome/Firefox normal con
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
 * DamagedHelmet ships a single PBR material — we always tint materials[0].
 * Clears painted albedo so chassis / finish / module cues stay readable.
 * Mutates in place; never reloads the .glb on option changes.
 */
function applyBuildMaterials(
  viewer: ModelViewerElement,
  chassisId: string,
  finishId: string,
  modules: BuildModules,
) {
  const material = viewer.model?.materials?.[0];
  if (!material) return;

  const chassis = getChassis(chassisId);
  const finish = getFinish(finishId);
  const [cr, cg, cb] = chassis.baseColor;
  const [tr, tg, tb] = finish.tint;
  const t = finish.tintStrength;

  // Chassis is the primary color; finish only blends a light wash + PBR surface
  const r = lerp(cr, tr, t);
  const g = lerp(cg, tg, t);
  const b = lerp(cb, tb, t);

  material.pbrMetallicRoughness.baseColorTexture?.setTexture(null);
  material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
  material.pbrMetallicRoughness.setMetallicFactor(finish.metallic);
  material.pbrMetallicRoughness.setRoughnessFactor(finish.roughness);

  // Module glow stacked on finish emissive
  let er = finish.emissive[0];
  let eg = finish.emissive[1];
  let eb = finish.emissive[2];

  if (modules.thermalVision) {
    er = Math.min(1, er + 0.85);
    eg = Math.min(1, eg + 0.18);
    eb = Math.min(1, eb + 0.02);
  }
  if (modules.lidar) {
    er = Math.min(1, er + 0.05);
    eg = Math.min(1, eg + 0.55);
    eb = Math.min(1, eb + 0.75);
  }

  setEmissive(material, [er, eg, eb]);
}

export default function ModelViewer({
  chassisId,
  finishId,
  modules,
}: ModelViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "no-webgl">(
    "checking",
  );
  const [modelReady, setModelReady] = useState(false);
  const modulesActive = modules.thermalVision || modules.lidar;
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
    const viewer = viewerRef.current;
    if (!viewer || status !== "ready") return;

    const onLoad = () => {
      setModelReady(true);
      applyBuildMaterials(viewer, chassisId, finishId, modules);
    };

    viewer.addEventListener("load", onLoad);
    if (viewer.model?.materials?.length) {
      setModelReady(true);
      applyBuildMaterials(viewer, chassisId, finishId, modules);
    }

    return () => {
      viewer.removeEventListener("load", onLoad);
    };
  }, [status, chassisId, finishId, modules]);

  useEffect(() => {
    if (!modelReady || !viewerRef.current) return;
    applyBuildMaterials(viewerRef.current, chassisId, finishId, modules);
  }, [chassisId, finishId, modules, modelReady]);

  if (status === "checking") {
    return (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950">
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
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          modules.thermalVision
            ? "bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.14)_0%,_transparent_60%)] opacity-100"
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
        src={MODEL_SRC}
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
          minHeight: "420px",
          backgroundColor: "transparent",
        }}
      />

      {/* Active module tags — overlay top-left (not model hotspots) */}
      {modulesActive && (
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex max-w-[min(100%,16rem)] flex-col gap-1.5">
          {MODULE_OPTIONS.filter((mod) => modules[mod.id]).map((mod) => (
            <span
              key={mod.id}
              className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] tracking-wider uppercase backdrop-blur-sm ${
                mod.id === "thermalVision"
                  ? "border-orange-400/50 bg-orange-500/15 text-orange-200"
                  : "border-cyan-400/50 bg-cyan-400/15 text-cyan-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  mod.id === "thermalVision" ? "bg-orange-400" : "bg-cyan-400"
                }`}
              />
              {mod.label} · Activo
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
