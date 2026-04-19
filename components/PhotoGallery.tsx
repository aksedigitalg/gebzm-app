"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface Props {
  photos: string[];
  title?: string;
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

  return (
    <>
      {/* Ana görsel */}
      <div className="relative bg-black">
        <div
          className="relative h-72 cursor-zoom-in overflow-hidden sm:h-96"
          onClick={() => setLightbox(true)}
        >
          <img
            src={photos[active]}
            alt={title}
            className="h-full w-full object-contain"
          />
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
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <ZoomIn className="h-3 w-3" />
            {active + 1} / {photos.length}
          </div>
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
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          {/* Kapat */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Sayaç */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
            {active + 1} / {photos.length}
          </div>

          {/* Sol ok */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* Resim */}
          <img
            src={photos[active]}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Sağ ok */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {/* Alt thumbnail şeridi */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 overflow-x-auto px-4">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i); }}
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg transition ${
                    i === active ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
