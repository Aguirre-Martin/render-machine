"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ActiveMedia } from "@/data/mockData";

type VideoPlayerProps = {
  media: ActiveMedia;
};

export default function VideoPlayer({ media }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setVisible(false);
    setBuffering(true);
    setFailed(false);

    const fadeInTimer = window.setTimeout(() => setVisible(true), 40);
    const failSafe = window.setTimeout(() => {
      setBuffering(false);
      const video = videoRef.current;
      if (video && video.readyState < 2) {
        setFailed(true);
      }
    }, 12000);

    return () => {
      window.clearTimeout(fadeInTimer);
      window.clearTimeout(failSafe);
    };
  }, [media.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      // muted + playsInline should allow autoplay; ignore policy blocks
    });
  }, [media.videoUrl]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950">
        {buffering && !failed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1px]">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-950 px-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
            <p className="text-sm text-slate-300">No se pudo cargar el preview</p>
            <p className="font-mono text-[10px] text-slate-500 break-all">
              {media.videoUrl}
            </p>
          </div>
        )}

        <video
          key={media.id}
          ref={videoRef}
          src={media.videoUrl}
          className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${
            visible && !failed ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadStart={() => {
            setBuffering(true);
            setFailed(false);
          }}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => {
            setBuffering(false);
            setFailed(false);
          }}
          onCanPlay={() => setBuffering(false)}
          onError={() => {
            setBuffering(false);
            setFailed(true);
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 pt-10">
          <p className="font-mono text-[10px] tracking-widest text-cyan-300/90 uppercase">
            Preview técnico · {media.tag}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
          {media.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {media.description}
        </p>
      </div>
    </div>
  );
}
