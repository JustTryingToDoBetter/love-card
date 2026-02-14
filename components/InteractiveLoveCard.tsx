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
  type motionValue
} from "framer-motion";
import { MOMENTS, type Moment } from "@/lib/moments";

import ProgressDots from "@/components/ProgressDots";
import { makeAudio } from "@/lib/sound";



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

  // Drag distance (downwards) for the top/active panel
  const y = useMotionValue(0);

  const maxIndex = MOMENTS.length - 1;

  // Tunables for UX feel
  const DRAG_THRESHOLD = 140; // px needed to “commit” to next panel
  const MAX_DRAG = 220;       // cap drag so it never feels sloppy

  const playAudio = React.useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browser may block audio until a user gesture.
    });
  }, []);

  const toggleMusic = React.useCallback(() => {
    const audio = bgm.current;
    if (!audio) return;

    if (!musicOn) {
      void audio.play().then(() => {
        setMusicOn(true);
      }).catch(() => {
        setMusicOn(false);
      });
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

  // Reset y whenever panel changes
  React.useEffect(() => {
    const next = MOMENTS[Math.min(active + 1, MOMENTS.length - 1)];
    if (next?.imageUrl) {
        const img = new Image();
        img.src = next.imageUrl;
    }
}, [active]);


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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext]);

  const activeMoment = MOMENTS[active];
  const nextMoment = MOMENTS[Math.min(active + 1, maxIndex)];
  const prevMoment = MOMENTS[Math.max(active - 1, 0)];

  const kind = moment.kind ?? "photo";
const isTextPage = kind === "cover" || kind === "letter";

return (
  <motion.div
    className="h-full rounded-[18px] bg-white/90 ring-1 ring-black/5 backdrop-blur"
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
              style={{ backgroundImage: `url(${moment.imageUrl})` }}
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <div className="text-xs uppercase tracking-widest text-black/45">
            {moment.dateLabel}
          </div>

          <div className="mt-1 text-lg font-semibold text-black/85">
            {moment.title}
          </div>

          <div className="mt-3 text-sm leading-relaxed text-black/65">
            {moment.story}
          </div>
        </div>
      </div>
    )}
  </motion.div>
);
}

function PanelStatic({ moment, scale }: { moment: Moment; scale: number }) {
  return (
    <div
      className="flex h-full flex-col rounded-[18px] bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="overflow-hidden rounded-[18px] bg-white">
        {moment.imageUrl ? (
          <img
            src={moment.imageUrl}
            alt={moment.title}
            className="h-full max-h-[42dvh] min-h-[220px] w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-32 items-center justify-center bg-white/80 text-sm text-black/40">
            Cover
          </div>
        )}
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
  rotate, 
  shadow,
}: {
  moment: Moment;
  rotate: MotionValue<number>;
  shadow: MotionValue<string>;
}) {
  // Map drag to tiny “lift” feel (rotate + shadow)
  const rotate = useTransform(progressY, [0, maxDrag], [0, 0.8]);
  const shadow = useTransform(
    y,
    [0, maxDrag],
    ["0 16px 45px rgba(0,0,0,0.18)", "0 26px 70px rgba(0,0,0,0.22)"]
  );
  const kind = moment.kind ?? "photo";
  const isTextPage = kind === "cover" || kind === "letter";

return (
  <motion.div className="h-full rounded-[18px] bg-white/85 ring-1 ring-black/5 backdrop-blur"
              style={{ rotate, boxShadow: shadow }}>
    <div className="flex h-full flex-col">
      {isTextPage ? (
        <div className="flex-1 rounded-[18px]  p-5">
          <div className="text-sm text-black/45">Dear love,</div>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-black/70">
            {moment.story}
          </div>
          <div className="mt-6 text-sm text-black/55">— Yours</div>
        </div>
      ) : (
        <>
          {/* photo frame */}
          <div className="rounded-[18px] bg-white p-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-black/5">
              {/* if you're still using bg-image, switch to contain */}
              <div
                className="absolute inset-x-4 top-4 bottom-4r"
                style={{ backgroundImage: `url(${moment.imageUrl})` }}
              />
            </div>
            <div className="mt-3 h-6" />
          </div>

          {/* caption */}
          <div className="px-5 pb-5 pt-3">
            <div className="text-xs uppercase tracking-widest text-black/45">{moment.dateLabel}</div>
            <div className="mt-1 text-lg font-semibold text-black/80">{moment.title}</div>
            <div className="mt-3 text-sm leading-relaxed text-black/60">{moment.story}</div>
          </div>
        </>
      )}
    </div>
  </motion.div>
);
}
