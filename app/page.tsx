import CardClient from "./_client/CardClient";

export default function Page() {
  return (
    <main className="min-h-[100svh] w-full px-4 py-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[430px]">
        <CardClient />
      </div>
    </main>
  );
}
