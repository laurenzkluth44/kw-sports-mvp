import { redirect } from "next/navigation";
import Image from "next/image";
import { LogIn } from "lucide-react";
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
    <main className="grid min-h-screen bg-[#f4f3ee] lg:grid-cols-[0.9fr_1.1fr]">
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
          <p className="mt-8 text-xs font-black uppercase text-brand-300">KW Sports GmbH Düsseldorf, Deutschland</p>
          <h1 className="mt-3 max-w-xl text-5xl font-black uppercase leading-none">
            Where champions are made
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
            Vereine pflegen ihre offenen Positionen, KW Sports behält Liga, Saison, Priorität und Status im Blick.
          </p>
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
              <h2 className="text-2xl font-black uppercase text-navy-950">Login</h2>
              <p className="mt-1 text-sm text-neutral-600">Mit E-Mail und Passwort anmelden.</p>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
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
