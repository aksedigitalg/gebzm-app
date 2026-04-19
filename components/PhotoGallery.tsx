"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Play } from "lucide-react";

interface Props {
  photos: string[];
  title?: string;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}

function MediaItem({ url, title, className }: { url: string; title?: string; className?: string }) {
  if (isVideo(url)) {
    return (
      <video
        src={url}
        className={className}
        controls
        playsInline
        preload="metadata"
        onClick={e => e.stopPropagation()}
      />
    );
  }
  return <img src={url} alt={title} className={className} />;
}

function ThumbItem({ url, className }: { url: string; className?: string }) {
  if (isVideo(url)) {
    return (
      <div className={`${className} flex items-center justify-center bg-black`}>
        <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-4 w-4 text-white" fill="white" />
        </div>
      </div>
    );
  }
  return <img src={url} alt="" className={`${className} object-cover`} />;
}

export function PhotoGallery({ photos, title = "" }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

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
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, prev, next]);

  if (!photos?.length) return null;

  const activeIsVideo = isVideo(photos[active]);

  return (
    <>
      {/* Ana görsel */}
      <div className="relative bg-black">
        <div
          className={`relative h-72 overflow-hidden sm:h-96 ${activeIsVideo ? "" : "cursor-zoom-in"}`}
          onClick={() => { if (!activeIsVideo) setLightbox(true); }}
        >
          {activeIsVideo ? (
            <video
              key={photos[active]}
              src={photos[active]}
              className="h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={photos[active]} alt={title} className="h-full w-full object-contain" />
          )}

          {photos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {!activeIsVideo && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <ZoomIn className="h-3 w-3" />
              {active + 1} / {photos.length}
            </div>
          )}
          {activeIsVideo && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Play className="h-3 w-3" fill="white" />
              {active + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* Thumbnail şeridi */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto bg-black/90 p-2 scrollbar-hide">
            {photos.map((url, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition ${
                  i === active ? "ring-2 ring-primary ring-offset-1 ring-offset-black" : "opacity-60 hover:opacity-100"
                }`}
              >
                {isVideo(url) ? (
                  <>
                    <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-3 w-3 text-white" fill="white" />
                    </div>
                  </>
                ) : (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — sadece resimler için */}
      {lightbox && !activeIsVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
            {active + 1} / {photos.length}
          </div>

          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <MediaItem
            url={photos[active]}
            title={title}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />

          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 overflow-x-auto px-4">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i); }}
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg transition ${
                    i === active ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  {isVideo(url) ? (
                    <>
                      <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-3 w-3 text-white" fill="white" />
                      </div>
                    </>
                  ) : (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
