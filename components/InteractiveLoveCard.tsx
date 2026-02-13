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


const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function InteractiveLoveCard() {
  const [active, setActive] = React.useState(0);

  // Drag distance (downwards) for the top/active panel
  const y = useMotionValue(0);

  const maxIndex = MOMENTS.length - 1;

  // Tunables for UX feel
  const DRAG_THRESHOLD = 140; // px needed to “commit” to next panel
  const MAX_DRAG = 220;       // cap drag so it never feels sloppy

  const goNext = React.useCallback(() => {
    setActive((i) => Math.min(i + 1, maxIndex));
  }, [maxIndex]);

  const goPrev = React.useCallback(() => {
    setActive((i) => Math.max(i - 1, 0));
  }, []);

  // Reset y whenever panel changes
  React.useEffect(() => {
    y.set(0);
  }, [active, y]);

  const onDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only allow downward drag to reveal next
    const next = clamp(info.offset.y, 0, MAX_DRAG);
    y.set(next);
  };

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const current = y.get();
    const v = info.velocity.y;

    const shouldAdvance =
        active < maxIndex && (current > DRAG_THRESHOLD || v > 900);

    if (shouldAdvance) {
        animate(y, MAX_DRAG, { type: "spring", stiffness: 260, damping: 26 }).then(
        () => goNext()
        );
        return;
    }

    animate(y, 0, { type: "spring", stiffness: 320, damping: 26 });
    };


  // Keyboard (nice for desktop)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const activeMoment = MOMENTS[active];
  const nextMoment = MOMENTS[Math.min(active + 1, maxIndex)];
  const prevMoment = MOMENTS[Math.max(active - 1, 0)];

  return (
    <div className="w-full max-w-[430px]">
      <div className="relative mx-auto">
        {/* Outer “paper” body */}
        <div className="rounded-[28px] bg-gradient-to-b from-white/90 to-white/70 shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur">
          {/* Header */}
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[13px] uppercase tracking-widest text-black/50">
                  A little scrapbook
                </div>
                <div className="mt-1 text-xl font-semibold text-black/80">
                  Pull down to reveal
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <ProgressDots total={MOMENTS.length} active={active} />
                <div className="text-xs text-black/45">
                  {active + 1} / {MOMENTS.length}
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-black/55">
              Drag down (or press ↓) to move forward.
            </div>
          </div>

          {/* Card viewport */}
          <div className="relative px-5 pb-5">
            <div className="relative h-[520px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,210,230,0.45),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,240,200,0.55),transparent_50%),linear-gradient(to_bottom,rgba(255,255,255,0.65),rgba(255,255,255,0.35))] shadow-inner ring-1 ring-black/5">
              {/* Previous (subtle hint above) */}
              {active > 0 && (
                <div className="pointer-events-none absolute -top-8 left-0 right-0 mx-auto w-[92%] opacity-40">
                  <PanelStatic moment={prevMoment} scale={0.96} />
                </div>
              )}

              {/* Next (peek underneath) */}
              {active < maxIndex && (
                <div className="pointer-events-none absolute top-10 left-0 right-0 mx-auto w-[92%] opacity-85">
                  <PanelStatic moment={nextMoment} scale={0.985} />
                </div>
              )}

              {/* Active (draggable) */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeMoment.id}
                  className="absolute top-10 left-0 right-0 mx-auto w-[92%] cursor-grab active:cursor-grabbing"
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
                  <PanelInteractive moment={activeMoment} progressY={y} maxDrag={MAX_DRAG} />
                </motion.div>
              </AnimatePresence>

              {/* Bottom hint */}
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
                <div className="rounded-full bg-white/60 px-4 py-2 text-xs text-black/55 ring-1 ring-black/5 backdrop-blur">
                  {active < maxIndex ? "Pull down for the next moment ↓" : "End of the scrapbook ✨"}
                </div>
              </div>
            </div>

            {/* Tiny controls (simple & romantic; not “app-y”) */}
            <div className="mt-4 flex items-center justify-between px-1">
              <button
                className="rounded-full px-3 py-2 text-xs text-black/60 hover:bg-black/5 disabled:opacity-40"
                onClick={goPrev}
                disabled={active === 0}
                type="button"
              >
                ↑ Back
              </button>

              <button
                className="rounded-full px-3 py-2 text-xs text-black/60 hover:bg-black/5 disabled:opacity-40"
                onClick={() => setActive(0)}
                disabled={active === 0}
                type="button"
              >
                Replay
              </button>

              <button
                className="rounded-full px-3 py-2 text-xs text-black/60 hover:bg-black/5 disabled:opacity-40"
                onClick={goNext}
                disabled={active === maxIndex}
                type="button"
              >
                Next ↓
              </button>
            </div>
          </div>
        </div>

        {/* Soft glow behind the card */}
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_50%_40%,rgba(255,170,210,0.35),transparent_55%),radial-gradient(circle_at_20%_20%,rgba(255,230,180,0.35),transparent_50%)] blur-2xl" />
      </div>
    </div>
  );
}

function PanelStatic({ moment, scale }: { moment: Moment; scale: number }) {
  return (
    <div
      className="rounded-[18px] bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="overflow-hidden rounded-[18px] bg-white">
        <div
          className="h-[280px] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${moment.imageUrl})` }}
        />
        <div className="h-7 bg-white/90" />
      </div>
      <div className="px-4 py-4">
        <div className="text-xs uppercase tracking-widest text-black/45">{moment.dateLabel}</div>
        <div className="mt-1 font-semibold text-black/75">{moment.title}</div>
        <div className="mt-2 line-clamp-2 text-sm text-black/55">{moment.story}</div>
      </div>
    </div>
  );
}

function PanelInteractive({
  moment,
  progressY,
  maxDrag,
}: {
  moment: Moment;
  progressY: MotionValue<number>;
  maxDrag: number;
}) {
  // Map drag to tiny “lift” feel (rotate + shadow)
  const rotate = useTransform(progressY, [0, maxDrag], [0, 0.8]);
  const shadow = useTransform(
    progressY,
    [0, maxDrag],
    ["0 16px 45px rgba(0,0,0,0.18)", "0 26px 70px rgba(0,0,0,0.22)"]
  );

  return (
    <motion.div
      className="rounded-[18px] bg-white/80 ring-1 ring-black/5 backdrop-blur"
      style={{ rotate, boxShadow: shadow }}
    >
      <div className="overflow-hidden rounded-[18px] bg-white">
        <div
          className="h-[280px] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${moment.imageUrl})` }}
        />
        <div className="h-7 bg-white/90" />
      </div>

      {/* “Paper caption” area (scrapbook vibe) */}
      <div className="px-5 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-xs uppercase tracking-widest text-black/45">{moment.dateLabel}</div>
          <div className="text-xs text-black/40">—</div>
        </div>

        <div className="mt-1 text-lg font-semibold text-black/80">{moment.title}</div>

        <div className="mt-3 text-sm leading-relaxed text-black/60">
          {moment.story}
        </div>

        {/* Little “tape” accent */}
        <div className="mt-5 flex justify-end">
          <div className="h-3 w-20 rotate-[-2deg] rounded-sm bg-[linear-gradient(to_right,rgba(255,210,230,0.65),rgba(255,240,200,0.65))] opacity-70 shadow-sm" />
        </div>
      </div>
    </motion.div>
  );
}
