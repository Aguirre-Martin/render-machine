"use client";

import { Cpu, Droplets, Gauge, Radar } from "lucide-react";
import type { MachineConfig } from "@/data/mockData";

const ICONS = {
  valvulas: Gauge,
  motor: Cpu,
  refrigeracion: Droplets,
  sensores: Radar,
} as const;

type ControlPanelProps = {
  configs: MachineConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function ControlPanel({
  configs,
  selectedId,
  onSelect,
}: ControlPanelProps) {
  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
          Variables de configuración
        </h3>
        <span className="font-mono text-[10px] text-slate-500">
          {configs.length} módulos
        </span>
      </div>

      <ul className="grid gap-2">
        {configs.map((config) => {
          const Icon = ICONS[config.id as keyof typeof ICONS] ?? Cpu;
          const active = config.id === selectedId;

          return (
            <li key={config.id}>
              <button
                type="button"
                onClick={() => onSelect(config.id)}
                className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-200 ${
                  active
                    ? "border-cyan-400/70 bg-cyan-400/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                    : "border-slate-700/80 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border ${
                    active
                      ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                      : "border-slate-700 bg-slate-950 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-slate-50" : "text-slate-200"
                      }`}
                    >
                      {config.title}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${
                        active
                          ? "bg-cyan-400/15 text-cyan-300"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {config.tag}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-400">
                    {config.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
