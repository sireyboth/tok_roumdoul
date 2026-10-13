export const metadata = { title: "Tok Staff" };

/** Kitchen, waiter and cashier screens arrive in Step 1 (live orders via Reverb). */
export default function StaffHome() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-semibold">Staff screens</h1>
      <p className="text-[var(--muted)]">Kitchen, waiter and cashier screens are coming in Step 1.</p>
    </main>
  );
}
