"use client";

import dynamic from "next/dynamic";
import type { BuildModules } from "@/data/mockData";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
        <p className="font-mono text-xs tracking-widest text-slate-400 uppercase">
          Inicializando motor 3D…
        </p>
      </div>
    </div>
  ),
});

type ModelViewerClientProps = {
  chassisId: string;
  finishId: string;
  modules: BuildModules;
};

export default function ModelViewerClient({
  chassisId,
  finishId,
  modules,
}: ModelViewerClientProps) {
  return (
    <ModelViewer
      chassisId={chassisId}
      finishId={finishId}
      modules={modules}
    />
  );
}
