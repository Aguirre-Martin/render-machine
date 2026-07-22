"use client";

import { Building2, LogIn } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
            <Building2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-base">
              Industrial Configurator Pro
            </p>
            <p className="truncate font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">
              Demo Showroom
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-800 sm:text-sm"
        >
          <LogIn className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Acceso Distribuidores</span>
          <span className="sm:hidden">Acceso</span>
        </button>
      </div>
    </header>
  );
}
