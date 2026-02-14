"use client";

import dynamic from "next/dynamic";

const InteractiveLoveCard = dynamic(() => import("@/components/InteractiveLoveCard"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[28px] bg-white/70 ring-1 ring-black/5 p-6">
      <div className="text-sm text-black/60">Loading…</div>
    </div>
  ),
});

export default function CardClient() {
  return <InteractiveLoveCard />;
}
