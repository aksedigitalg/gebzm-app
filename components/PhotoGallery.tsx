"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause, MoreHorizontal, Download, Share2 } from "lucide-react";

interface Props {
  photos: string[];
  title?: string;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}

/* ---- VideoOverlay ---- */
function VideoOverlay({
  src,
  savedTime,
  onSaveTime,
}: {
  src: string;
  savedTime: number;
  onSaveTime: (t: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ctrlVis, setCtrlVis] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(onSaveTime);
  useEffect(() => { cbRef.current = onSaveTime; }, [onSaveTime]);

  useEffect(() => {
    const v = ref.current;
    if (!v || savedTime <= 0) return;
    const go = () => { v.currentTime = savedTime; };
    if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (ref.current) cbRef.current(ref.current.currentTime);
  }, []);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCtrlVis(false), 2000);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = ref.current;
    if (!v) return;
    setCtrlVis(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (v.paused) { v.play().catch(() => {}); }
    else { v.pause(); }
  };

  return (
    <div className="relative h-full w-full bg-black cursor-pointer" onClick={handleClick}>
      <video
        ref={ref}
        src={src}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        onPlay={() => { setPlaying(true); scheduleHide(); }}
        onPause={() => { setPlaying(false); setCtrlVis(true); if (hideTimer.current) clearTimeout(hideTimer.current); }}
        onEnded={() => { setPlaying(false); setCtrlVis(true); }}
      />
      <div className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${ctrlVis ? "opacity-100" : "opacity-0"}`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
          {playing
            ? <Pause className="h-7 w-7" fill="white" />
            : <Play className="h-7 w-7 translate-x-0.5" fill="white" />
          }
        </div>
      </div>
    </div>
  );
}

/* ---- ThumbStrip ---- */
function ThumbStrip({
  photos, active, onSelect,
}: { photos: string[]; active: number; onSelect: (i: number) => void }) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[active];
    if (el) el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div
      className="flex justify-center gap-1.5 overflow-x-auto bg-black/90 p-2 scrollbar-hide"
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)` }}
    >
      {photos.map((url, i) => (
        <button
          key={i}
          ref={el => { itemRefs.current[i] = el; }}
          onClick={e => { e.stopPropagation(); onSelect(i); }}
          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ${i === active ? "ring-2 ring-white ring-offset-1 ring-offset-black" : "opacity-60 hover:opacity-100"}`}
        >
          {isVideo(url) ? (
            <div className="h-full w-full bg-zinc-700 flex items-center justify-center">
              <Play className="h-5 w-5 text-white" fill="white" />
            </div>
          ) : (
            <img src={url} alt="" className="h-full w-full object-cover" />
          )}
        </button>
      ))}
    </div>
  );
}

async function shareMedia(url: string, title: string) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch {}
  }
  try { await navigator.clipboard.writeText(url); alert("Link kopyalandı"); } catch { alert(url); }
}

/* ---- Main component ---- */
export function PhotoGallery({ photos, title = "" }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mainPlayingUrl, setMainPlayingUrl] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const videoTimesRef = useRef<Record<string, number>>({});
  const touchX = useRef<number | null>(null);

  const prev = useCallback(() => {
    setMainPlayingUrl(null);
    setActive(i => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setMainPlayingUrl(null);
    setActive(i => (i + 1) % photos.length);
  }, [photos.length]);

  const goTo = useCallback((idx: number) => {
    setMainPlayingUrl(null);
    setActive(idx);
  }, []);

  useEffect(() => {
    if (!lightbox) { setMenu(false); return; }
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarW}px`;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [lightbox, prev, next]);

  if (!photos?.length) return null;

  const currentUrl = photos[active];
  const activeIsVideo = isVideo(currentUrl);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    touchX.current = null;
  };

  return (
    <>
      {/* ===== Ana galeri ===== */}
      <div className="relative bg-black select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative h-72 overflow-hidden sm:h-96">
          <div className="h-full w-full">
            {activeIsVideo ? (
              mainPlayingUrl === currentUrl ? (
                <VideoOverlay
                  key={currentUrl}
                  src={currentUrl}
                  savedTime={videoTimesRef.current[currentUrl] || 0}
                  onSaveTime={t => { videoTimesRef.current[currentUrl] = t; }}
                />
              ) : (
                <div
                  className="relative h-full w-full bg-zinc-900 cursor-pointer flex items-center justify-center"
                  onClick={() => setMainPlayingUrl(currentUrl)}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/75">
                    <Play className="h-9 w-9 translate-x-0.5" fill="white" />
                  </div>
                </div>
              )
            ) : (
              <img
                src={currentUrl}
                alt={title}
                className="h-full w-full object-contain cursor-zoom-in"
                onClick={() => setLightbox(true)}
              />
            )}
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {active + 1} / {photos.length}
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <ThumbStrip photos={photos} active={active} onSelect={goTo} />
        )}
      </div>

      {/* ===== Lightbox ===== */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/96 backdrop-blur-sm"
          onClick={() => { if (!activeIsVideo) setLightbox(false); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Üst butonlar */}
          <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setMenu(m => !m)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menu && (
                <div className="absolute left-0 top-12 z-30 min-w-[160px] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-800">
                  <a href={currentUrl} download target="_blank" rel="noopener noreferrer"
                    onClick={() => setMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-700">
                    <Download className="h-4 w-4" />İndir
                  </a>
                  <button onClick={() => { setMenu(false); shareMedia(currentUrl, title); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-700">
                    <Share2 className="h-4 w-4" />Paylaş
                  </button>
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                {active + 1} / {photos.length}
              </span>
            )}

            <button
              onClick={e => { e.stopPropagation(); setLightbox(false); }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* İçerik */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2" onClick={e => e.stopPropagation()}>
            <div className="flex h-full w-full max-w-3xl items-center justify-center">
              {activeIsVideo ? (
                <div className="w-full overflow-hidden rounded-xl" style={{ height: "clamp(220px, 55vh, 500px)" }}>
                  <VideoOverlay
                    key={currentUrl}
                    src={currentUrl}
                    savedTime={videoTimesRef.current[currentUrl] || 0}
                    onSaveTime={t => { videoTimesRef.current[currentUrl] = t; }}
                  />
                </div>
              ) : (
                <img
                  src={currentUrl}
                  alt={title}
                  className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
                />
              )}
            </div>

            {photos.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button onClick={e => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div onClick={e => e.stopPropagation()}>
              <ThumbStrip photos={photos} active={active} onSelect={goTo} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
