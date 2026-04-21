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
  autoPlay = false,
}: {
  src: string;
  savedTime: number;
  onSaveTime: (t: number) => void;
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ctrlVis, setCtrlVis] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(onSaveTime);
  useEffect(() => { cbRef.current = onSaveTime; }, [onSaveTime]);

  /* restore saved time on mount, then autoPlay if requested */
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const start = () => {
      if (savedTime > 0) v.currentTime = savedTime;
      if (autoPlay) v.play().catch(() => {});
    };
    if (v.readyState >= 1) start();
    else v.addEventListener("loadedmetadata", start, { once: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* save time on unmount */
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
        muted={false}
        preload="auto"
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

  /* active thumbnail her zaman görünür alanda kalır */
  useEffect(() => {
    const el = itemRefs.current[active];
    if (el) el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div
      className="flex justify-center gap-1.5 overflow-x-auto bg-black/90 p-2 scrollbar-hide"
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)` }}
      /* ThumbStrip scroll hareketinin ana galeri swipe'ını tetiklememesi için */
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      {photos.map((url, i) => (
        <button
          key={i}
          ref={el => { itemRefs.current[i] = el; }}
          onClick={e => { e.stopPropagation(); onSelect(i); }}
          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ${i === active ? "ring-2 ring-white ring-offset-1 ring-offset-black" : "opacity-60 hover:opacity-100"}`}
        >
          {isVideo(url) ? (
            <>
              <video
                src={url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="auto"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-4 w-4 text-white" fill="white" />
              </div>
            </>
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
  /* null = thumbnail göster, string = o URL'i VideoOverlay ile oynat */
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [menu, setMenu] = useState(false);
  const videoTimesRef = useRef<Record<string, number>>({});
  const touchX = useRef<number | null>(null);

  const goTo = useCallback((idx: number, startPlay = false) => {
    setPlayingUrl(null);
    setAutoPlayNext(false);
    setActive(idx);
    if (startPlay && isVideo(photos[idx])) {
      /* kısa gecikme: setActive işlendikten sonra VideoOverlay mount edilsin */
      setTimeout(() => { setPlayingUrl(photos[idx]); setAutoPlayNext(true); }, 0);
    }
  }, [photos]);

  const prev = useCallback(() => goTo((active - 1 + photos.length) % photos.length), [active, photos.length, goTo]);
  const next = useCallback(() => goTo((active + 1) % photos.length), [active, photos.length, goTo]);

  /* lightbox: keyboard, body overflow, scrollbar compensation */
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
              playingUrl === currentUrl ? (
                <VideoOverlay
                  key={currentUrl}
                  src={currentUrl}
                  savedTime={videoTimesRef.current[currentUrl] || 0}
                  onSaveTime={t => { videoTimesRef.current[currentUrl] = t; }}
                  autoPlay={autoPlayNext}
                />
              ) : (
                /* Video thumbnail: preload="auto" muted → ilk kare görünür */
                <div
                  className="relative h-full w-full bg-black cursor-pointer"
                  onClick={() => { setPlayingUrl(currentUrl); setAutoPlayNext(true); }}
                >
                  <video
                    src={currentUrl}
                    className="h-full w-full object-contain"
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70">
                      <Play className="h-7 w-7 translate-x-0.5" fill="white" />
                    </div>
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
          <ThumbStrip
            photos={photos}
            active={active}
            onSelect={i => goTo(i, true)}
          />
        )}
      </div>

      {/* ===== Lightbox (resimler için, video varsa inline oynar) ===== */}
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
              className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              <X className="h-4 w-4" />
              <span>Kapat</span>
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
                    autoPlay
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
              <ThumbStrip photos={photos} active={active} onSelect={i => goTo(i, true)} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
