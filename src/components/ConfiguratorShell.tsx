"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_BUILD,
  buildBomLines,
  formatBuildSummary,
  resolveActiveMedia,
  type BuildConfig,
  type BuildModules,
  type BuildStep,
} from "@/data/mockData";
import ControlPanel from "@/components/ControlPanel";
import Header from "@/components/Header";
import ModelViewerClient from "@/components/ModelViewerClient";
import QuoteCta from "@/components/QuoteCta";
import VideoPlayer from "@/components/VideoPlayer";

export default function ConfiguratorShell() {
  const [build, setBuild] = useState<BuildConfig>(DEFAULT_BUILD);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const media = useMemo(() => resolveActiveMedia(build), [build]);
  const summary = useMemo(() => formatBuildSummary(build), [build]);
  const bomLines = useMemo(
    () => buildBomLines(build).map((line) => line.label),
    [build],
  );

  function setStep(activeStep: BuildStep) {
    setBuild((prev) => ({ ...prev, activeStep }));
  }

  function selectChassis(chassisId: string) {
    setBuild((prev) => ({
      ...prev,
      chassisId,
      activeMediaId: chassisId,
    }));
  }

  function selectFinish(finishId: string) {
    setBuild((prev) => ({
      ...prev,
      finishId,
      activeMediaId: finishId,
    }));
  }

  function toggleModule(id: keyof BuildModules) {
    setBuild((prev) => {
      const nextValue = !prev.modules[id];
      return {
        ...prev,
        modules: { ...prev.modules, [id]: nextValue },
        // Preview the module video when enabling; keep current media when disabling
        activeMediaId: nextValue ? id : prev.activeMediaId,
      };
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 lg:py-6">
        <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-4">
          <p className="font-mono text-[11px] tracking-[0.2em] text-cyan-400/80 uppercase">
            Showroom B2B · Configurador interactivo
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
            Armá tu configuración y visualizá el sistema en tiempo real
          </h1>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          <section className="flex min-h-[420px] flex-col gap-3 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                Visor 3D
              </h2>
              <span className="font-mono text-[10px] text-slate-500">
                WebGL · model-viewer
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <ModelViewerClient
                chassisId={build.chassisId}
                finishId={build.finishId}
                modules={build.modules}
              />
            </div>
          </section>

          <section className="flex flex-col gap-5 lg:col-span-2">
            <VideoPlayer media={media} />
            <ControlPanel
              build={build}
              onStepChange={setStep}
              onChassisSelect={selectChassis}
              onFinishSelect={selectFinish}
              onModuleToggle={toggleModule}
            />
          </section>
        </div>
      </main>

      <QuoteCta
        summary={summary}
        bomLines={bomLines}
        open={quoteOpen}
        onOpen={() => setQuoteOpen(true)}
        onClose={() => setQuoteOpen(false)}
      />
    </div>
  );
}
