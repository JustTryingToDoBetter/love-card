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
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function InteractiveLoveCard() {
  const [active, setActive] = React.useState(0);
  const [musicOn, setMusicOn] = React.useState(false);

  const sfxSnap = React.useRef<HTMLAudioElement | null>(null);
  const sfxRustle = React.useRef<HTMLAudioElement | null>(null);
  const bgm = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    sfxSnap.current = makeAudio("/audio/snap.mp3", 0.6);
    sfxRustle.current = makeAudio("/audio/rustle.mp3", 0.35);

    bgm.current = makeAudio("/audio/bg.mp3", 0.22);
    bgm.current.loop = true;

    return () => {
      bgm.current?.pause();
    };
  }, []);

  const y = useMotionValue(0);
  const maxIndex = MOMENTS.length - 1;

  const DRAG_THRESHOLD = 140;
  const MAX_DRAG = 220;

  // Compute motion styles ONCE here (correct scope)
  const rotate = useTransform(y, [0, MAX_DRAG], [0, 0.8]);
  const shadow = useTransform(
    y,
    [0, MAX_DRAG],
    ["0 16px 45px rgba(0,0,0,0.18)", "0 26px 70px rgba(0,0,0,0.22)"]
  );

  const playAudio = React.useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, []);

  const toggleMusic = React.useCallback(() => {
    const audio = bgm.current;
    if (!audio) return;

    if (!musicOn) {
      void audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false));
      return;
    }

    audio.pause();
    setMusicOn(false);
  }, [musicOn]);

  const goNext = React.useCallback(() => {
    setActive((i) => {
      const nextIndex = Math.min(i + 1, maxIndex);
      if (nextIndex !== i) {
        playAudio(sfxRustle);
        window.setTimeout(() => playAudio(sfxSnap), 120);
      }
      return nextIndex;
    });
  }, [maxIndex, playAudio]);

  // Reset drag position when moment changes + preload next image
  React.useEffect(() => {
    y.set(0);

    const next = MOMENTS[Math.min(active + 1, MOMENTS.length - 1)];
    if (next?.imageUrl) {
      const img = new Image();
      img.src = next.imageUrl;
    }
  }, [active, y]);

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

  // keyboard forward only
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext]);

  const activeMoment = MOMENTS[active];
  const nextMoment = MOMENTS[Math.min(active + 1, maxIndex)];

  return (
    <div className="w-full">
      <div className="relative mx-auto rounded-[28px] bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur">
        {/* Header */}
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

        {/* Viewport */}
        <div className="px-4 pb-5">
          <div
            className="relative overflow-hidden rounded-[22px] px-4 pt-4 pb-16 ring-1 ring-black/5"
            style={{ height: "min(70svh, 640px)" }}
          >
            {/* Next (peek underneath) */}
            {active < maxIndex && (
              <div className="pointer-events-none absolute inset-x-4 top-4 bottom-4 opacity-85">
                <PanelStatic moment={nextMoment} scale={0.985} />
              </div>
            )}

            {/* Active (draggable) */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeMoment.id}
                className="absolute inset-x-4 top-4 bottom-4 cursor-grab active:cursor-grabbing"
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
                <PanelInteractive moment={activeMoment} rotate={rotate} shadow={shadow} />
              </motion.div>
            </AnimatePresence>

            
          
          </div>

          <div className="mt-3 flex items-center justify-center">
          <div className="rounded-full bg-white/70 px-4 py-2 text-xs text-black/55 ring-1 ring-black/5">
            {active < maxIndex ? "Pull down for the next moment ↓" : "End ✨"}
          </div>
        </div>


          {/* Controls (minimal) */}
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

      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,210,230,0.35),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,240,200,0.35),transparent_50%)] blur-2xl" />
    </div>
  );
}

function PanelStatic({ moment, scale }: { moment: Moment; scale: number }) {
  const kind = moment.kind ?? "photo";
  const isTextPage = kind === "cover" || kind === "letter";

  return (
    <div
      className="h-full rounded-[18px] bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur"
      style={{ transform: `scale(${scale})` }}
    >
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

function PanelInteractive({
  moment,
  rotate,
  shadow,
}: {
  moment: Moment;
  rotate: MotionValue<number>;
  shadow: MotionValue<string>;
}) {
  const kind = moment.kind ?? "photo";
  const isTextPage = kind === "cover" || kind === "letter";

  return (
    <motion.div
      className="h-full rounded-[18px] bg-white ring-1 ring-black/5"
      style={{ rotate, boxShadow: shadow }}
    >
      {isTextPage ? (
        <div className="flex h-full flex-col justify-center p-6">
          <div className="text-sm text-black/45">Dear love,</div>
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-black/75">
            {moment.story}
          </div>
          <div className="mt-8 text-sm text-black/55">— Yours</div>
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
            <div className="mt-3 text-sm leading-relaxed text-black/65">
            <TypewriterText
              text={moment.story}
              className="whitespace-pre-line"
              cursorClassName="ml-0.5 text-black/50"
              typingSpeedMs={18}
              blinkIntervalMs={450}
              soundEnabled={true}
              typingSoundSrc="/audio/rustle.mp3"
              typingSoundVolume={0.08}
              typingSoundThrottleMs={45}
              start={true}
              />
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
}
