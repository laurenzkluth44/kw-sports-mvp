import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, Info, Send } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { CopyValue } from "./copy-value";
import type { Check, ResendDomainRecord } from "./go-live";

export type GoLiveData = {
  app: Check[];
  email: Check[];
  records: ResendDomainRecord[];
  auth: { siteUrl: string; redirects: string[] };
  adminEmail: string;
  counts: { players: number; photo: number; cv: number; released: number; clubUsers: number; openNeeds: number };
  test: { state: "sent" | "failed"; detail?: string } | null;
  onSendTest?: () => Promise<void>;
};

const ICON = {
  ok: <CheckCircle2 className="h-5 w-5 text-brand-600" aria-label="Erledigt" />,
  todo: <Circle className="h-5 w-5 text-amber-600" aria-label="Offen" />,
  warn: <AlertTriangle className="h-5 w-5 text-amber-600" aria-label="Bitte prüfen" />,
  info: <Info className="h-5 w-5 text-slate-500" aria-label="Hinweis" />
};

function Section({ id, step, title, intro, children, aside }: { id: string; step: string; title: string; intro: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section id={id} className="panel min-w-0 scroll-mt-28 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{step}</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none text-navy-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{intro}</p>
        </div>
        {aside}
      </div>
      <div className="min-w-0 px-5 py-4">{children}</div>
    </section>
  );
}

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {checks.map((check) => (
        <li key={check.id} className="grid gap-1 py-3 sm:grid-cols-[auto_minmax(0,14rem)_minmax(0,1fr)] sm:items-start sm:gap-4">
          <span className="hidden pt-0.5 sm:block">{ICON[check.state]}</span>
          <p className="flex items-center gap-2 text-sm font-bold text-navy-950">
            <span className="sm:hidden">{ICON[check.state]}</span>
            {check.label}
          </p>
          <div className="min-w-0 pl-7 sm:pl-0">
            {check.value ? <p className="break-words text-sm text-navy-950">{check.value}</p> : null}
            {check.hint ? <p className={cn("text-xs leading-5", check.state === "todo" || check.state === "warn" ? "text-amber-800" : "text-slate-500")}>{check.hint}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Count({ label, value, sub, href }: { label: string; value: string | number; sub?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-4xl leading-none text-navy-950">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="block border-l-2 border-brand-500 bg-slate-50 px-4 py-3 hover:bg-brand-50">
      {body}
    </Link>
  ) : (
    <div className="border-l-2 border-brand-500 bg-slate-50 px-4 py-3">{body}</div>
  );
}

const TEST_STEPS: { title: string; body: string; href?: string; link?: string }[] = [
  { title: "Test-Verein einladen", body: "Unter Nutzer einen Club User für einen Test-Verein mit einer zweiten eigenen E-Mail-Adresse einladen (z. B. dein Name+test@…).", href: "/admin/users", link: "Nutzer" },
  { title: "Einladung annehmen", body: "E-Mail öffnen, „Zugang einrichten“, Passwort festlegen. Am besten in einem privaten Browserfenster, damit du als Admin eingeloggt bleibst." },
  { title: "Kader und Bedarf anlegen", body: "Als Verein ein paar Spieler eintragen oder die Excel-Vorlage nutzen, dann einen Bedarf anlegen. Bei KW kommt eine E-Mail „Neuer Bedarf“ an." },
  { title: "Spieler vorschlagen", body: "Als Admin den Bedarf öffnen, einen passenden KW-Spieler freigeben. Der Test-Verein bekommt die Vorschlags-E-Mail.", href: "/admin", link: "Bedarfe" },
  { title: "Als Verein antworten", body: "Im Test-Verein „Interessiert“ klicken. Bei KW kommt die Antwort per E-Mail und unter Antworten an.", href: "/admin/inbox", link: "Antworten" },
  { title: "Passwort vergessen testen", body: "Ausloggen, „Passwort vergessen“, Link aus der E-Mail öffnen, neues Passwort setzen." },
  { title: "Aufräumen", body: "Bedarf als besetzt markieren oder archivieren und den Test-Zugang unter Nutzer wieder entfernen." }
];

export function GoLiveView({ data }: { data: GoLiveData }) {
  const { counts } = data;
  return (
    <div className="space-y-5">
      <Section
        id="email"
        step="1 · E-Mail-Versand"
        title="E-Mails an Vereine und KW"
        intro="Einladungen, Passwort-Links, Spielervorschläge, Antworten und die monatliche Erinnerung gehen über Resend mit dem Absender kwsports.de raus."
        aside={
          <form action={data.onSendTest}>
            <SubmitButton pendingLabel="Wird gesendet …" disabled={!data.onSendTest}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Test-E-Mail an mich
            </SubmitButton>
          </form>
        }
      >
        {data.test?.state === "sent" ? (
          <p role="status" className="alert-success mb-3">Test-E-Mail an {data.adminEmail} ist raus. Kommt sie an (auch im Spam-Ordner nachsehen), ist der Versand bereit.</p>
        ) : null}
        {data.test?.state === "failed" ? (
          <p role="alert" className="alert-error mb-3">Test-E-Mail fehlgeschlagen: {data.test.detail}</p>
        ) : null}
        <CheckList checks={data.email} />
        {data.records.length ? (
          <div className="mt-4">
            <p className="text-sm font-bold text-navy-950">DNS-Einträge für kwsports.de</p>
            <p className="text-xs text-slate-500">Beim Anbieter der Domain (z. B. IONOS, Strato, Cloudflare) unter DNS eintragen. Bereits erkannte Einträge sind markiert.</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-xs">
                <thead className="text-[0.7rem] uppercase tracking-[0.1em] text-slate-500">
                  <tr><th className="py-2 pr-3">Typ</th><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Wert</th><th className="py-2 pr-3">Priorität</th><th className="py-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 align-top">
                  {data.records.map((record, index) => (
                    <tr key={`${record.type}-${record.name}-${index}`}>
                      <td className="py-2 pr-3 font-bold text-navy-950">{record.type}</td>
                      <td className="max-w-[12rem] py-2 pr-3"><CopyValue value={record.name} label="Name" /></td>
                      <td className="max-w-[22rem] py-2 pr-3"><CopyValue value={record.value} label="Wert" /></td>
                      <td className="py-2 pr-3">{record.priority ?? "–"}</td>
                      <td className="py-2">{record.status === "verified" ? <span className="font-bold text-brand-600">erkannt</span> : <span className="text-amber-800">fehlt</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Section>

      <Section
        id="auth"
        step="2 · Login-Links"
        title="Supabase-Einstellungen"
        intro="Einmal in Supabase unter Authentication › URL Configuration eintragen. Hier nicht automatisch prüfbar, deshalb einfach abgleichen."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-bold text-navy-950">Site URL</p>
            <CopyValue value={data.auth.siteUrl} label="Site URL" />
            <p className="pt-2 text-sm font-bold text-navy-950">Redirect URLs (alle drei hinzufügen)</p>
            {data.auth.redirects.map((url) => <CopyValue key={url} value={url} />)}
          </div>
          <ul className="space-y-3 text-sm leading-6 text-slate-700">
            <li className="flex gap-2"><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />Die E-Mails selbst kommen von KW (Resend), Supabase liefert nur den Link. Deshalb gelten Supabase-Limits für E-Mails hier nicht.</li>
            <li className="flex gap-2"><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />Empfohlen: unter Authentication › Sign In / Providers › Email die Option „Prevent use of leaked passwords“ einschalten (je nach Supabase-Tarif verfügbar).</li>
            <li className="flex gap-2"><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />Wechselt die Adresse später auf eine eigene Domain, hier einfach die neuen Werte übernehmen.</li>
          </ul>
        </div>
      </Section>

      <Section id="app" step="3 · Plattform" title="Technik" intro="Grundeinstellungen auf Vercel.">
        <CheckList checks={data.app} />
      </Section>

      <Section id="data" step="4 · Inhalte" title="Bereit für Vereine?" intro="Was Vereine zu sehen bekommen. Fehlende Fotos und CVs am schnellsten über den Sammel-Upload.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Count label="KW-Spieler" value={counts.players} href="/admin/players" />
          <Count label="Mit Foto" value={counts.photo} sub={`von ${counts.players}`} href="/admin/players/upload" />
          <Count label="Mit CV" value={counts.cv} sub={`von ${counts.players}`} href="/admin/players/upload" />
          <Count label="Für Vereine freigegeben" value={counts.released} href="/admin/players" />
          <Count label="Vereins-Zugänge" value={counts.clubUsers} href="/admin/users?role=club" />
          <Count label="Offene Bedarfe" value={counts.openNeeds} href="/admin" />
        </div>
      </Section>

      <Section id="test" step="5 · Testlauf" title="Einmal komplett durchspielen" intro="Mit einem Test-Verein und einer zweiten E-Mail-Adresse, bevor echte Vereine eingeladen werden. Dauert etwa 15 Minuten.">
        <ol className="grid gap-3 md:grid-cols-2">
          {TEST_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3 border border-slate-200 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-navy-950 font-display text-lg leading-none text-white">{index + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-950">{step.title}</p>
                <p className="text-sm leading-6 text-slate-600">{step.body}</p>
                {step.href ? (
                  <Link href={step.href} className="mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-brand-600 hover:text-brand-700">
                    {step.link} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
