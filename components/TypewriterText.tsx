"use client";

import * as React from "react";

type TypewriterTextProps = {
  text: string;
  className?: string;
  cursorClassName?: string;
  typingSpeedMs?: number;
  blinkIntervalMs?: number;
  soundEnabled?: boolean;
  typingSoundSrc?: string;
  typingSoundVolume?: number;
  typingSoundThrottleMs?: number;
  start?: boolean;
  onComplete?: () => void;
};

export default function TypewriterText({
  text,
  className,
  cursorClassName,
  typingSpeedMs = 20,
  blinkIntervalMs = 500,
  soundEnabled = true,
  typingSoundSrc,
  typingSoundVolume = 0.12,
  typingSoundThrottleMs = 45,
  start = true,
  onComplete,
}: TypewriterTextProps) {
  const [visibleChars, setVisibleChars] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [cursorVisible, setCursorVisible] = React.useState(true);
  const typingAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastSoundAtRef = React.useRef(0);

  React.useEffect(() => {
    if (!typingSoundSrc) {
      typingAudioRef.current = null;
      return;
    }

    const audio = new Audio(typingSoundSrc);
    audio.preload = "auto";
    audio.volume = typingSoundVolume;
    typingAudioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, [typingSoundSrc, typingSoundVolume]);

  // Reset typing state whenever the source text changes.
  React.useEffect(() => {
    setVisibleChars(0);
    setIsComplete(false);
    setCursorVisible(true);
  }, [text]);

  // Incrementally reveal characters until the full text is rendered.
  React.useEffect(() => {
    if (!start) {
      setVisibleChars(0);
      setIsComplete(false);
      return;
    }

    if (visibleChars >= text.length) {
      if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setVisibleChars((count) => count + 1);
    }, typingSpeedMs);

    return () => window.clearTimeout(timer);
  }, [start, visibleChars, text.length, typingSpeedMs, isComplete, onComplete]);

  // Start blinking cursor only after typing has finished.
  React.useEffect(() => {
    if (!isComplete) return;

    const timer = window.setInterval(() => {
      setCursorVisible((v) => !v);
    }, blinkIntervalMs);

    return () => window.clearInterval(timer);
  }, [isComplete, blinkIntervalMs]);

  React.useEffect(() => {
    if (!soundEnabled || !typingSoundSrc || !start || visibleChars === 0) return;

    const latestChar = text[visibleChars - 1];
    if (!latestChar || latestChar.trim() === "") return;

    const now = Date.now();
    if (now - lastSoundAtRef.current < typingSoundThrottleMs) return;

    lastSoundAtRef.current = now;

    const audio = typingAudioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Audio can be blocked until a user gesture.
    });
  }, [soundEnabled, typingSoundSrc, start, visibleChars, text, typingSoundThrottleMs]);

  return (
    <div className={className}>
      {text.slice(0, visibleChars)}
      {isComplete && (
        <span
          aria-hidden="true"
          className={cursorClassName}
          style={{ opacity: cursorVisible ? 1 : 0 }}
        >
          |
        </span>
      )}
    </div>
  );
}
