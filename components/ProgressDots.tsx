// components/ProgressDots.tsx
"use client";

export default function ProgressDots({
  total,
  active,
}: {
  total: number;
  active: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "h-2 rounded-full transition-all",
            i === active ? "w-8 bg-black/50" : "w-2 bg-black/15",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
