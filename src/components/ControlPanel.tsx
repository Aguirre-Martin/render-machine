"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import {
  ADDON_OPTIONS,
  BUILD_STEPS,
  CHASSIS_OPTIONS,
  FINISH_OPTIONS,
  MODULE_OPTIONS,
  getAddon,
  getAddonBlockReason,
  type AddonOption,
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
  onAddonSelect: (id: string) => void;
};

export default function ControlPanel({
  build,
  onStepChange,
  onChassisSelect,
  onFinishSelect,
  onModuleToggle,
  onAddonSelect,
}: ControlPanelProps) {
  const stepIndex = BUILD_STEPS.findIndex((s) => s.id === build.activeStep);
  const canPrev = stepIndex > 0;
  const canNext = stepIndex < BUILD_STEPS.length - 1;
  const [detailAddonId, setDetailAddonId] = useState<string | null>(null);
  const detailAddon = getAddon(detailAddonId);

  return (
    <div className="relative flex flex-col gap-3">
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
              className={`flex-1 rounded-md px-1.5 py-1.5 font-mono text-[9px] tracking-wide uppercase transition-colors sm:text-[10px] sm:px-2 ${
                active
                  ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                  : "text-slate-500 hover:bg-slate-800/80 hover:text-slate-300"
              }`}
            >
              <span className="mr-0.5 text-slate-600 sm:mr-1">{i + 1}.</span>
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

        {build.activeStep === "addons" && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Agregados — máx. 1. Suma a la config y al video; la geometría 3D
              sobre el casco espera assets del cliente.
            </p>
            <ul className="grid gap-2">
              {ADDON_OPTIONS.map((option) => (
                <AddonCard
                  key={option.id}
                  option={option}
                  selected={build.addonId === option.id}
                  blockReason={getAddonBlockReason(option, build.modules)}
                  onSelect={() => onAddonSelect(option.id)}
                  onDetail={() => setDetailAddonId(option.id)}
                />
              ))}
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

      {detailAddon && (
        <AddonDetailDrawer
          addon={detailAddon}
          onClose={() => setDetailAddonId(null)}
        />
      )}
    </div>
  );
}

function AddonCard({
  option,
  selected,
  blockReason,
  onSelect,
  onDetail,
}: {
  option: AddonOption;
  selected: boolean;
  blockReason: string | null;
  onSelect: () => void;
  onDetail: () => void;
}) {
  const blocked = Boolean(blockReason);

  return (
    <li>
      <div
        className={`rounded-lg border transition-colors ${
          selected
            ? "border-cyan-400/70 bg-cyan-400/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
            : blocked
              ? "border-slate-800 bg-slate-950/40 opacity-70"
              : "border-slate-700/80 bg-slate-950/50 hover:border-slate-500"
        }`}
      >
        <button
          type="button"
          disabled={blocked}
          onClick={onSelect}
          aria-pressed={selected}
          className="flex w-full items-start gap-3 px-3 py-3 text-left disabled:cursor-not-allowed"
        >
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border ${
              selected
                ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                : "border-slate-700 bg-slate-950 text-slate-500"
            }`}
          >
            {selected ? (
              <Check className="h-4 w-4" strokeWidth={2} />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-600" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  selected ? "text-slate-50" : "text-slate-200"
                }`}
              >
                {option.label}
              </span>
              <span className="rounded border border-slate-600/80 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-slate-400 uppercase">
                {option.slot}
              </span>
            </span>
            <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-400">
              {option.description}
            </span>
            <span className="mt-2 flex flex-wrap gap-1">
              {option.compatibleWith.map((chip) => (
                <span
                  key={chip}
                  className="rounded border border-slate-700/80 bg-slate-900/80 px-1.5 py-0.5 text-[10px] text-slate-400"
                >
                  Compatible con {chip}
                </span>
              ))}
            </span>
            {blocked && (
              <span className="mt-2 block text-[11px] text-amber-300/90">
                {blockReason}
              </span>
            )}
          </span>
        </button>
        <div className="flex justify-end border-t border-slate-800/80 px-2 py-1.5">
          <button
            type="button"
            onClick={onDetail}
            className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] tracking-wide text-slate-400 uppercase transition-colors hover:bg-slate-800 hover:text-cyan-300"
          >
            <Info className="h-3 w-3" strokeWidth={2} />
            Detalle
          </button>
        </div>
      </div>
    </li>
  );
}

/** In-builder drawer — stays inside the panel, no new route. */
function AddonDetailDrawer({
  addon,
  onClose,
}: {
  addon: AddonOption;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col rounded-lg border border-slate-600 bg-slate-950/95 p-3 shadow-xl backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addon-detail-title"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">
            Detalle del agregado
          </p>
          <h4
            id="addon-detail-title"
            className="mt-1 text-sm font-semibold text-slate-50"
          >
            {addon.label}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
          aria-label="Cerrar detalle"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-900">
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            {addon.slot === "rail_L" && (
              <span className="block h-2 w-20 rounded-sm border border-cyan-300/50 bg-slate-600/80" />
            )}
            {addon.slot === "visor" && (
              <span className="block h-10 w-12 rounded-md border border-orange-300/50 bg-slate-700" />
            )}
            {addon.slot === "antenna" && (
              <span className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-cyan-300/70" />
                <span className="h-12 w-0.5 bg-cyan-300/60" />
              </span>
            )}
            <p className="font-mono text-[10px] tracking-wide text-slate-400 uppercase">
              Spec sheet · mesh 3D pendiente
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {addon.detailBullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-2 text-xs leading-relaxed text-slate-300"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400/80" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
