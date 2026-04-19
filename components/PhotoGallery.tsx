"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Play, Pause, MoreHorizontal, Download, Share2 } from "lucide-react";

interface Props {
  photos: string[];
  title?: string;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}

function VideoOverlay({ src, playingUrl, onPlay, onPause }: {
  src: string;
  playingUrl: string | null;
  onPlay: (url: string) => void;
  onPause: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const isPlaying = playingUrl === src;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (isPlaying) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isPlaying]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) onPause();
    else onPlay(src);
  };

  return (
    <div className="relative h-full w-full bg-black" onClick={e => e.stopPropagation()}>
      <video
        ref={ref}
        src={src}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        onEnded={onPause}
        onPause={() => { if (isPlaying) onPause(); }}
      />
      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={isPlaying ? "Durdur" : "Oynat"}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
          {isPlaying
            ? <Pause className="h-6 w-6" fill="white" />
            : <Play className="h-6 w-6 translate-x-0.5" fill="white" />
          }
        </div>
      </button>
    </div>
  );
}

async function doShare(url: string, title: string) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch {}
  }
  try {
    await navigator.clipboard.writeText(url);
    alert("Link kopyalandı");
  } catch {
    alert(url);
  }
}

export function PhotoGallery({ photos, title = "" }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const touchX = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setPlayingUrl(null);
    setActive(idx);
    setTimeout(() => setTransitioning(false), 200);
  }, [transitioning]);

  const prev = useCallback(() => goTo((active - 1 + photos.length) % photos.length), [active, photos.length, goTo]);
  const next = useCallback(() => goTo((active + 1) % photos.length), [active, photos.length, goTo]);

  useEffect(() => {
    if (!lightbox) { setMenu(false); return; }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightbox(false); setPlayingUrl(null); }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, prev, next]);

  if (!photos?.length) return null;

  const activeIsVideo = isVideo(photos[active]);
  const currentUrl = photos[active];

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
      <div className="relative bg-black select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className={`relative h-72 overflow-hidden sm:h-96 ${!activeIsVideo ? "cursor-zoom-in" : ""}`}
          onClick={() => { if (!activeIsVideo) setLightbox(true); }}
        >
          <div
            className="h-full w-full transition-opacity duration-200"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {activeIsVideo
              ? <VideoOverlay
                  key={currentUrl}
                  src={currentUrl}
                  playingUrl={playingUrl}
                  onPlay={url => setPlayingUrl(url)}
                  onPause={() => setPlayingUrl(null)}
                />
              : <img src={currentUrl} alt={title} className="h-full w-full object-contain" />
            }
          </div>

          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {!activeIsVideo && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <ZoomIn className="h-3 w-3" />{active + 1} / {photos.length}
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto bg-black/90 p-2 scrollbar-hide">
            {photos.map((url, i) => (
              <button key={i} onClick={() => goTo(i)}
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
          onClick={() => { if (!activeIsVideo) { setLightbox(false); setPlayingUrl(null); } }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
            {/* Sol: üç nokta menü */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setMenu(m => !m); }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menu && (
                <div
                  className="absolute left-0 top-12 z-30 min-w-[160px] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-800"
                  onClick={e => e.stopPropagation()}
                >
                  <a
                    href={currentUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" />İndir
                  </a>
                  <button
                    onClick={() => { setMenu(false); doShare(currentUrl, title); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-700"
                  >
                    <Share2 className="h-4 w-4" />Paylaş
                  </button>
                </div>
              )}
            </div>

            {/* Orta: sayaç */}
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              {active + 1} / {photos.length}
            </div>

            {/* Sağ: kapat */}
            <button
              onClick={e => { e.stopPropagation(); setLightbox(false); setPlayingUrl(null); }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Ortadaki içerik */}
          <div
            className="w-full max-w-3xl px-2 transition-opacity duration-200"
            style={{ opacity: transitioning ? 0 : 1 }}
            onClick={e => e.stopPropagation()}
          >
            {activeIsVideo
              ? <div className="overflow-hidden rounded-xl">
                  <VideoOverlay
                    key={currentUrl}
                    src={currentUrl}
                    playingUrl={playingUrl}
                    onPlay={url => setPlayingUrl(url)}
                    onPause={() => setPlayingUrl(null)}
                  />
                </div>
              : <img
                  src={currentUrl}
                  alt={title}
                  className="max-h-[75vh] w-full rounded-xl object-contain shadow-2xl"
                  onClick={e => e.stopPropagation()}
                />
            }
          </div>

          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 overflow-x-auto px-4">
              {photos.map((url, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); goTo(i); }}
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
