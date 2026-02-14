"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";

import { MOMENTS, type Moment } from "@/lib/moments";
import ProgressDots from "@/components/ProgressDots";
import { makeAudio } from "@/lib/sound";
import TypewriterText from "@/components/TypewriterText";

/** util: clamp a number into [min, max] */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/* =====================================================================================
   Shared visual primitive: subtle paper grain (inline SVG data URI; no external assets)
===================================================================================== */
const PAPER_NOISE_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' seed='7'/>
    </filter>
    <rect width='180' height='180' filter='url(#n)' opacity='0.85'/>
  </svg>`
)}")`;

function PaperNoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.07] blur-[0.45px]"
      style={{
        backgroundImage: PAPER_NOISE_DATA_URI,
        backgroundSize: "180px 180px",
        mixBlendMode: "soft-light",
      }}
    />
  );
}

export default function InteractiveLoveCard() {
  // =========================
  // State
  // =========================
  const [active, setActive] = React.useState(0);
  const [musicOn, setMusicOn] = React.useState(false);

  // =========================
  // Audio refs (SFX + BGM)
  // =========================
  const sfxSnap = React.useRef<HTMLAudioElement | null>(null);
  const sfxRustle = React.useRef<HTMLAudioElement | null>(null);
  const bgm = React.useRef<HTMLAudioElement | null>(null);

  // =========================
  // Snap scheduling guard
  // =========================
  const snapTimeoutRef = React.useRef<number | null>(null);

  // =========================
  // Photo load tracking for active panel text fade-in
  // =========================
  const [loadedByMomentId, setLoadedByMomentId] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    // SFX
    sfxSnap.current = makeAudio("/audio/snap.mp3", 0.6);
    sfxRustle.current = makeAudio("/audio/rustle.mp3", 0.35);

    // Background music (loop)
    bgm.current = makeAudio("/audio/bg.mp3", 0.22);
    bgm.current.loop = true;

    // Cleanup: stop bgm on unmount
    return () => {
      bgm.current?.pause();
    };
  }, []);

  // =========================
  // Drag + motion values
  // =========================
  const y = useMotionValue(0);
  const maxIndex = MOMENTS.length - 1;

  const DRAG_THRESHOLD = 140;
  const MAX_DRAG = 220;

  // Motion styling derived from drag amount
  const rotate = useTransform(y, [0, MAX_DRAG], [0, 0.8]);
  const shadow = useTransform(
    y,
    [0, MAX_DRAG],
    ["0 16px 45px rgba(0,0,0,0.18)", "0 26px 70px rgba(0,0,0,0.22)"]
  );

  // =========================
  // Under-panel parallax depth (revealed panel subtly reacts to drag)
  // =========================
  const nextPanelScale = useTransform(y, [0, MAX_DRAG], [0.985, 1]);
  const nextPanelOpacity = useTransform(y, [0, MAX_DRAG], [0.8, 0.92]);
  const nextPanelY = useTransform(y, [0, MAX_DRAG], [-3, 0]);

  // =========================
  // Helpers
  // =========================
  const playAudio = React.useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, []);

  const toggleMusic = React.useCallback(() => {
    const audio = bgm.current;
    if (!audio) return;

    // If currently off -> try to start (user gesture safe)
    if (!musicOn) {
      void audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false));
      return;
    }

    // If currently on -> pause
    audio.pause();
    setMusicOn(false);
  }, [musicOn]);

  const goNext = React.useCallback(() => {
    setActive((i) => {
      const nextIndex = Math.min(i + 1, maxIndex);
      if (nextIndex !== i) {
        // paper feel + delayed snap confirm
        playAudio(sfxRustle);

        if (snapTimeoutRef.current !== null) {
          window.clearTimeout(snapTimeoutRef.current);
        }

        snapTimeoutRef.current = window.setTimeout(() => {
          playAudio(sfxSnap);
          snapTimeoutRef.current = null;
        }, 180);
      }
      return nextIndex;
    });
  }, [maxIndex, playAudio]);

  // Cleanup pending snap timeout on unmount
  React.useEffect(() => {
    return () => {
      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current);
      }
    };
  }, []);

  // Reset drag position when the moment changes + preload next image
  React.useEffect(() => {
    y.set(0);

    const next = MOMENTS[Math.min(active + 1, MOMENTS.length - 1)];
    if (next?.imageUrl) {
      const img = new Image();
      img.src = next.imageUrl;
    }
  }, [active, y]);

  // =========================
  // Drag handlers
  // =========================
  const onDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const next = clamp(info.offset.y, 0, MAX_DRAG);
    y.set(next);
  };

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const current = y.get();
    const v = info.velocity.y;

    const shouldAdvance = active < maxIndex && (current > DRAG_THRESHOLD || v > 900);

    if (shouldAdvance) {
      animate(y, MAX_DRAG, { type: "spring", stiffness: 260, damping: 26 }).then(() => goNext());
      return;
    }

    animate(y, 0, { type: "spring", stiffness: 320, damping: 26 });
  };

  // Keyboard: forward only
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext]);

  // =========================
  // Derived data
  // =========================
  const activeMoment = MOMENTS[active];
  const nextMoment = MOMENTS[Math.min(active + 1, maxIndex)];
  const activeKind = activeMoment.kind ?? "photo";
  const activeIsTextPage = activeKind === "cover" || activeKind === "letter";

  // =========================
  // Image-load detection for background-image cards (supports cached images)
  // =========================
  React.useEffect(() => {
    if (activeIsTextPage || !activeMoment.imageUrl) {
      setLoadedByMomentId((prev) => ({ ...prev, [activeMoment.id]: true }));
      return;
    }

    let cancelled = false;

    // Reset to hidden while this active image is being confirmed
    setLoadedByMomentId((prev) => ({ ...prev, [activeMoment.id]: false }));

    const image = new Image();
    image.src = activeMoment.imageUrl;

    const markLoaded = () => {
      if (cancelled) return;
      setLoadedByMomentId((prev) => ({ ...prev, [activeMoment.id]: true }));
    };

    if (image.complete) {
      markLoaded();
      return () => {
        cancelled = true;
      };
    }

    image.onload = markLoaded;
    image.onerror = markLoaded;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [activeMoment.id, activeMoment.imageUrl, activeIsTextPage]);

  const isActiveStoryReady = activeIsTextPage || !!loadedByMomentId[activeMoment.id];

  return (
    <div className="w-full">
      <div className="relative mx-auto rounded-[28px] bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur">
        {/* =========================
            Header
           ========================= */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] uppercase tracking-widest text-black/45">
                A little scrapbook
              </div>
              <div className="mt-1 text-xl font-semibold text-black/80">Pull down to reveal</div>
              <div className="mt-2 text-sm text-black/55">Drag down to move forward.</div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <ProgressDots total={MOMENTS.length} active={active} />
              <div className="text-xs text-black/45">
                {active + 1} / {MOMENTS.length}
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            Viewport
            NOTE: No fixed height anymore.
            The viewport grows with content (no inner scroll).
           ========================= */}
        <div className="px-4 pb-5">
          <div className="relative overflow-hidden rounded-[22px] px-4 pt-4 pb-4 ring-1 ring-black/5">
            {/* Next (peek underneath) */}
            {active < maxIndex && (
              <motion.div
                className="pointer-events-none absolute inset-4"
                style={{
                  scale: nextPanelScale,
                  opacity: nextPanelOpacity,
                  y: nextPanelY,
                }}
              >
                <PanelStatic moment={nextMoment} scale={1} />
              </motion.div>
            )}

            {/* Active (draggable) */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeMoment.id}
                className="relative z-10 cursor-grab active:cursor-grabbing"
                style={{ y }}
                drag="y"
                dragDirectionLock
                dragElastic={0.08}
                dragMomentum={false}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                initial={{ opacity: 0, y: 8, rotate: -0.2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
              >
                <PanelInteractive
                  moment={activeMoment}
                  rotate={rotate}
                  shadow={shadow}
                  isStoryReady={isActiveStoryReady}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hint pill (outside viewport so it never clips content) */}
          <div className="mt-3 flex items-center justify-center">
            <div className="rounded-full bg-white/70 px-4 py-2 text-xs text-black/55 ring-1 ring-black/5">
              {active < maxIndex ? "Pull down for the next moment ↓" : "End ✨"}
            </div>
          </div>

          {/* =========================
              Controls (minimal)
             ========================= */}
          <div className="mt-4 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={toggleMusic}
              className="h-11 rounded-full px-4 text-xs text-black/60 hover:bg-black/5"
            >
              {musicOn ? "Music: On" : "Music: Off"}
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={active === maxIndex}
              className="h-11 rounded-full px-5 text-xs text-black/60 hover:bg-black/5 disabled:opacity-40"
            >
              Next ↓
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          Soft background glow
         ========================= */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,210,230,0.35),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,240,200,0.35),transparent_50%)] blur-2xl" />
    </div>
  );
}

/* =====================================================================================
   PanelStatic
   - Used for the “next” panel underneath (peek preview)
   - Pointer-events disabled by parent so it never captures input
===================================================================================== */
function PanelStatic({ moment, scale }: { moment: Moment; scale: number }) {
  const kind = moment.kind ?? "photo";
  const isTextPage = kind === "cover" || kind === "letter";

  return (
    <div
      className="relative h-full overflow-hidden rounded-[18px] bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Added: reusable subtle paper texture */}
      <PaperNoiseOverlay />

      {isTextPage ? (
        <div className="flex h-full flex-col justify-center p-6">
          <div className="text-sm text-black/45">Dear love,</div>
          <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-black/75">
            {moment.story}
          </div>
          <div className="mt-6 text-sm text-black/55">— Yours</div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-black/5">
              <div
                className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                style={{ backgroundImage: moment.imageUrl ? `url(${moment.imageUrl})` : "none" }}
              />
            </div>
          </div>

          <div className="px-5 pb-5 pt-2">
            <div className="text-xs uppercase tracking-widest text-black/45">{moment.dateLabel}</div>
            <div className="mt-1 text-lg font-semibold text-black/85">{moment.title}</div>
            <div className="mt-3 text-sm leading-relaxed text-black/65">{moment.story}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================================
   PanelInteractive
   - Foreground draggable panel
   - NO inner scroll: story area expands naturally
===================================================================================== */
function PanelInteractive({
  moment,
  rotate,
  shadow,
  isStoryReady,
}: {
  moment: Moment;
  rotate: MotionValue<number>;
  shadow: MotionValue<string>;
  isStoryReady: boolean;
}) {
  const kind = moment.kind ?? "photo";
  const isTextPage = kind === "cover" || kind === "letter";

  return (
    <motion.div
      className="relative overflow-hidden rounded-[18px] bg-white ring-1 ring-black/5"
      style={{ rotate, boxShadow: shadow }}
    >
      {/* Added: reusable subtle paper texture */}
      <PaperNoiseOverlay />

      {isTextPage ? (
        <div className="flex flex-col justify-center p-6">
          <div className="text-sm text-black/45">Dear love,</div>

          {/* Text pages: simple expanding content */}
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-black/75">
            {moment.story}
          </div>

          <div className="mt-8 text-sm text-black/55">— Yours</div>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Photo area */}
          <div className="p-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-black/5">
              <div
                className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                style={{ backgroundImage: moment.imageUrl ? `url(${moment.imageUrl})` : "none" }}
              />
            </div>
          </div>

          {/* Caption/story area (NO scroll; it expands) */}
          <div className="px-5 pb-5 pt-2">
            <div className="text-xs uppercase tracking-widest text-black/45">{moment.dateLabel}</div>
            <div className="mt-1 text-lg font-semibold text-black/85">{moment.title}</div>

            {/* Added: story fades in only after photo is confirmed loaded */}
            <motion.div
              className="mt-3 text-sm leading-relaxed text-black/65"
              initial={false}
              animate={{ opacity: isStoryReady ? 1 : 0, y: isStoryReady ? 0 : 6 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <TypewriterText
                text={moment.story}
                className="whitespace-pre-line"
                cursorClassName="ml-0.5 text-black/50"
                typingSpeedMs={18}
                blinkIntervalMs={450}
                soundEnabled
                typingSoundSrc="/audio/rustle.mp3"
                typingSoundVolume={0.08}
                typingSoundThrottleMs={45}
                start
              />
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
