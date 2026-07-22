"use client";

import { CheckCircle2, FileText, X } from "lucide-react";

type QuoteCtaProps = {
  summary: string;
  bomLines: string[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default function QuoteCta({
  summary,
  bomLines,
  open,
  onOpen,
  onClose,
}: QuoteCtaProps) {
  return (
    <>
      <footer className="sticky bottom-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">
              Configuración
            </p>
            <p className="truncate text-sm font-medium text-slate-100">
              {summary}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-cyan-400/50 bg-cyan-400/15 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/25"
          >
            <FileText className="h-4 w-4" strokeWidth={1.75} />
            Solicitar Propuesta de esta Configuración (PDF)
          </button>
        </div>
      </footer>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
          onClick={onClose}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2
                    id="quote-modal-title"
                    className="text-base font-semibold text-slate-50"
                  >
                    Propuesta de configuración
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Resumen de piezas elegidas. En producción esto exportaría un
                    PDF con spec sheet — sin generación real en este MVP.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-4 divide-y divide-slate-800 rounded-lg border border-slate-700/80 bg-slate-950/60">
              {bomLines.map((line) => (
                <li
                  key={line}
                  className="px-3 py-2.5 text-sm text-slate-200"
                >
                  {line}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-md border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-400"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
