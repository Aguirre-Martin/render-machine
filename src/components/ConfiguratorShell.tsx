"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_BUILD,
  buildBomLines,
  formatBuildSummary,
  getAddon,
  getAddonBlockReason,
  resolveActiveMedia,
  resolveModelSrc,
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
  const modelSrc = useMemo(() => resolveModelSrc(build), [build]);

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
      const nextModules = { ...prev.modules, [id]: nextValue };

      // Drop any mounted part that the newly enabled module blocks.
      let parts = prev.parts;
      if (nextValue) {
        parts = { ...prev.parts };
        for (const partId of Object.keys(parts)) {
          const addon = getAddon(partId);
          if (parts[partId] && addon && getAddonBlockReason(addon, nextModules)) {
            delete parts[partId];
          }
        }
      }

      return {
        ...prev,
        modules: nextModules,
        parts,
        // Preview the module video when enabling; keep current media when disabling
        activeMediaId: nextValue ? id : prev.activeMediaId,
      };
    });
  }

  /** Mount / unmount an addon — stackable; click again to remove. */
  function selectAddon(addonId: string) {
    setBuild((prev) => {
      const addon = getAddon(addonId);
      if (!addon) return prev;
      if (getAddonBlockReason(addon, prev.modules)) return prev;

      const mounted = Boolean(prev.parts[addonId]);
      const parts = { ...prev.parts };
      if (mounted) delete parts[addonId];
      else parts[addonId] = true;

      return {
        ...prev,
        parts,
        activeMediaId: mounted ? prev.activeMediaId : addonId,
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
                modelSrc={modelSrc}
                parts={build.parts}
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
              onAddonSelect={selectAddon}
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
