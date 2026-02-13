import InteractiveLoveCard from "@/components/InteractiveLoveCard";

export default function Page() {
  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(circle_at_20%_10%,rgba(255,210,230,0.55),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(255,240,200,0.6),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,0.65),rgba(255,255,255,0.9))]">
      <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-6 py-10">
        <InteractiveLoveCard />
      </div>
    </main>
  );
}
