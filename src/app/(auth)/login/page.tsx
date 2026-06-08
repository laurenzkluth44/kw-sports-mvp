import { redirect } from "next/navigation";
import Image from "next/image";
import { Database, LockKeyhole, LogIn } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { getCurrentProfile, getRoleHome } from "@/lib/auth";

const errorMessages: Record<string, string> = {
  missing: "Bitte E-Mail und Passwort eingeben.",
  invalid: "Die Zugangsdaten stimmen nicht.",
  session: "Die Sitzung konnte nicht erstellt werden.",
  profile: "Für diesen Account fehlt ein Rollenprofil.",
  "missing-club": "Dieser Club User ist keinem Verein zugeordnet."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const context = await getCurrentProfile();
  if (context) redirect(getRoleHome(context.profile.role));

  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="grid min-h-screen bg-[#f6f8fb] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-navy-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex w-64 items-center justify-center rounded-md bg-white px-5 py-4">
            <Image
              src="/kw-sports-logo.png"
              alt="KW Sports"
              width={1000}
              height={326}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
          <p className="mt-10 text-xs font-black uppercase tracking-wide text-brand-300">
            KW Sports GmbH · Internal Platform
          </p>
          <h1 className="mt-3 max-w-xl text-5xl font-black uppercase leading-none">Club Needs Database</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Eine ruhige, zentrale Arbeitsfläche für Kaderbedarfe nach Verein, Liga, Saison, Position und Status.
          </p>
          <div className="mt-8 grid max-w-lg gap-3">
            <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
              <Database className="mb-3 h-5 w-5 text-brand-300" aria-hidden="true" />
              <p className="text-sm font-black uppercase">Zentrale Datenbasis</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">Alle Club-Bedarfe sauber in Supabase gesichert.</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
              <LockKeyhole className="mb-3 h-5 w-5 text-brand-300" aria-hidden="true" />
              <p className="text-sm font-black uppercase">Rollenbasiert geschützt</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">Clubs sehen nur eigene Daten, Admins die Gesamtübersicht.</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400">Internes MVP für Club User und KW Sports Admins</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-12 w-36 items-center justify-center rounded-md bg-white px-3 py-2 shadow-soft">
              <Image
                src="/kw-sports-logo.png"
                alt="KW Sports"
                width={1000}
                height={326}
                className="h-full w-full object-contain"
                priority
              />
            </span>
            <span>
              <span className="block font-black uppercase text-navy-950">Club Needs</span>
              <span className="block text-sm text-neutral-500">Kaderbedarf Datenbank</span>
            </span>
          </div>

          <form action={loginAction} className="panel space-y-5 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand-700">KW Sports Portal</p>
              <h2 className="mt-1 text-2xl font-black uppercase text-navy-950">Login</h2>
              <p className="mt-1 text-sm text-neutral-600">Mit E-Mail und Passwort anmelden.</p>
            </div>

            {error ? (
              <div className="alert-error">{error}</div>
            ) : null}

            <Field label="E-Mail" htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>

            <Field label="Passwort" htmlFor="password">
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>

            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Einloggen
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
