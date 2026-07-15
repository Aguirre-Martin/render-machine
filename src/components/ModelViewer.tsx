"use client";

import { Box, ExternalLink, MonitorOff } from "lucide-react";
import { useEffect, useState } from "react";
import { MODEL_SRC } from "@/data/mockData";

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

export default function ModelViewer() {
  const [status, setStatus] = useState<"checking" | "ready" | "no-webgl">(
    "checking",
  );

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.06)_0%,_transparent_65%)]" />
      <model-viewer
        src={MODEL_SRC}
        alt="Modelo 3D de maquinaria industrial"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        rotation-per-second="18deg"
        shadow-intensity="1"
        shadow-softness="0.8"
        exposure="1"
        interaction-prompt="none"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "420px",
          backgroundColor: "transparent",
        }}
      />
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
