"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Play, Pause } from "lucide-react";

interface Props {
  photos: string[];
  title?: string;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function VideoPlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = ref.current;
    if (!v || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  };

  return (
    <div className={`relative flex flex-col bg-black ${className ?? ""}`} onClick={e => e.stopPropagation()}>
      <video
        ref={ref}
        src={src}
        className="flex-1 w-full object-contain"
        playsInline
        preload="metadata"
        onTimeUpdate={() => setCur(ref.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDur(ref.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {/* Özel kontroller */}
      <div className="flex items-center gap-3 bg-black/80 px-4 py-2 backdrop-blur-sm">
        <button onClick={toggle} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition">
          {playing ? <Pause className="h-4 w-4" fill="white" /> : <Play className="h-4 w-4" fill="white" />}
        </button>
        <span className="text-[11px] tabular-nums text-white/70 shrink-0">{fmt(cur)}</span>
        <div
          className="relative flex-1 h-1 cursor-pointer rounded-full bg-white/20"
          onClick={seek}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
            style={{ width: dur ? `${(cur / dur) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-white/70 shrink-0">{fmt(dur)}</span>
      </div>
    </div>
  );
}

export function PhotoGallery({ photos, title = "" }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);

  const prev = useCallback(() => setActive(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setActive(i => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, prev, next]);

  if (!photos?.length) return null;

  const activeIsVideo = isVideo(photos[active]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    touchX.current = null;
  };

  return (
    <>
      {/* Ana görsel */}
      <div
        className="relative bg-black select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`relative h-72 overflow-hidden sm:h-96 ${!activeIsVideo ? "cursor-zoom-in" : ""}`}
          onClick={() => { if (!activeIsVideo) setLightbox(true); }}
        >
          {activeIsVideo
            ? <VideoPlayer key={photos[active]} src={photos[active]} className="h-full" />
            : <img src={photos[active]} alt={title} className="h-full w-full object-contain" />
          }

          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 z-10">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 z-10">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {!activeIsVideo && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm z-10">
              <ZoomIn className="h-3 w-3" />{active + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* Thumbnail şeridi */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto bg-black/90 p-2 scrollbar-hide">
            {photos.map((url, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition ${i === active ? "ring-2 ring-primary ring-offset-1 ring-offset-black" : "opacity-60 hover:opacity-100"}`}>
                {isVideo(url)
                  ? <>
                      <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-3 w-3 text-white" fill="white" />
                      </div>
                    </>
                  : <img src={url} alt="" className="h-full w-full object-cover" />
                }
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => { if (!activeIsVideo) setLightbox(false); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm z-10">
            {active + 1} / {photos.length}
          </div>

          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {activeIsVideo
            ? <VideoPlayer key={photos[active]} src={photos[active]} className="w-full max-w-3xl rounded-xl overflow-hidden" />
            : <img src={photos[active]} alt={title} className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
          }

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 overflow-x-auto px-4 z-10">
              {photos.map((url, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i); }}
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg transition ${i === active ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"}`}>
                  {isVideo(url)
                    ? <>
                        <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-3 w-3 text-white" fill="white" />
                        </div>
                      </>
                    : <img src={url} alt="" className="h-full w-full object-cover" />
                  }
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
