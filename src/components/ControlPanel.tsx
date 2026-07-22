"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BUILD_STEPS,
  CHASSIS_OPTIONS,
  FINISH_OPTIONS,
  MODULE_OPTIONS,
  type BuildConfig,
  type BuildModules,
  type BuildStep,
} from "@/data/mockData";

type ControlPanelProps = {
  build: BuildConfig;
  onStepChange: (step: BuildStep) => void;
  onChassisSelect: (id: string) => void;
  onFinishSelect: (id: string) => void;
  onModuleToggle: (id: keyof BuildModules) => void;
};

export default function ControlPanel({
  build,
  onStepChange,
  onChassisSelect,
  onFinishSelect,
  onModuleToggle,
}: ControlPanelProps) {
  const stepIndex = BUILD_STEPS.findIndex((s) => s.id === build.activeStep);
  const canPrev = stepIndex > 0;
  const canNext = stepIndex < BUILD_STEPS.length - 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
          Builder
        </h3>
        <span className="font-mono text-[10px] text-slate-500">
          Paso {stepIndex + 1}/{BUILD_STEPS.length}
        </span>
      </div>

      {/* Step tabs — compact Volvo-style tray header */}
      <div
        className="flex gap-1 rounded-lg border border-slate-700/80 bg-slate-900/60 p-1"
        role="tablist"
        aria-label="Pasos de configuración"
      >
        {BUILD_STEPS.map((step, i) => {
          const active = step.id === build.activeStep;
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStepChange(step.id)}
              className={`flex-1 rounded-md px-2 py-1.5 font-mono text-[10px] tracking-wide uppercase transition-colors ${
                active
                  ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                  : "text-slate-500 hover:bg-slate-800/80 hover:text-slate-300"
              }`}
            >
              <span className="mr-1 text-slate-600">{i + 1}.</span>
              {step.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[200px] rounded-lg border border-slate-700/80 bg-slate-900/40 p-3">
        {build.activeStep === "chassis" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Elegí el color de chasis — el casco 3D se tiñe al instante.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CHASSIS_OPTIONS.map((option) => {
                const active = option.id === build.chassisId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChassisSelect(option.id)}
                    className={`group flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors ${
                      active
                        ? "border-cyan-400/70 bg-cyan-400/10"
                        : "border-slate-700/80 bg-slate-950/50 hover:border-slate-500"
                    }`}
                  >
                    <span
                      className={`relative h-10 w-10 rounded-full border-2 shadow-inner ${
                        active ? "border-cyan-300" : "border-slate-600"
                      }`}
                      style={{ backgroundColor: option.swatch }}
                      aria-hidden
                    >
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className="h-4 w-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            style={{
                              color:
                                option.id === "blanco-tactico"
                                  ? "#0f172a"
                                  : "#f8fafc",
                            }}
                            strokeWidth={2.5}
                          />
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-center text-[11px] leading-tight font-medium ${
                        active ? "text-slate-50" : "text-slate-400"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {build.activeStep === "finish" && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              El acabado cambia brillo y tinte (mate, naranja o metálico).
            </p>
          <ul className="grid gap-2">
            {FINISH_OPTIONS.map((option) => {
              const active = option.id === build.finishId;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => onFinishSelect(option.id)}
                    className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-200 ${
                      active
                        ? "border-cyan-400/70 bg-cyan-400/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                        : "border-slate-700/80 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-900"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border ${
                        active
                          ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                          : "border-slate-700 bg-slate-950 text-slate-500"
                      }`}
                    >
                      {active ? (
                        <Check className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-600" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          active ? "text-slate-50" : "text-slate-200"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-400">
                        {option.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          </div>
        )}

        {build.activeStep === "modules" && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Activá sensores: glow IR / LIDAR sobre el casco.
            </p>
          <ul className="grid gap-2">
            {MODULE_OPTIONS.map((option) => {
              const active = build.modules[option.id];
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => onModuleToggle(option.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-200 ${
                      active
                        ? "border-cyan-400/70 bg-cyan-400/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                        : "border-slate-700/80 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-900"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          active ? "text-slate-50" : "text-slate-200"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-400">
                        {option.description}
                      </span>
                    </span>

                    {/* Toggle pill */}
                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                        active
                          ? "border-cyan-400/60 bg-cyan-400/30"
                          : "border-slate-600 bg-slate-800"
                      }`}
                      aria-hidden
                    >
                      <span
                        className={`absolute top-0.5 rounded-full bg-slate-100 shadow transition-transform ${
                          active ? "left-5" : "left-0.5"
                        }`}
                        style={{ height: 18, width: 18 }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          </div>
        )}
      </div>

      {/* Prev / Next — Volvo tray navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() =>
            canPrev && onStepChange(BUILD_STEPS[stepIndex - 1].id)
          }
          className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-2 font-mono text-[11px] tracking-wide text-slate-300 uppercase transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Volver
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() =>
            canNext && onStepChange(BUILD_STEPS[stepIndex + 1].id)
          }
          className="inline-flex items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 font-mono text-[11px] tracking-wide text-cyan-200 uppercase transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
