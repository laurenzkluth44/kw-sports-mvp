import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth";
import { sendTestEmailAction } from "@/features/system/actions";
import { appChecks, emailChecks, summary, supabaseAuthUrls } from "@/features/system/go-live";
import { GoLiveView } from "@/features/system/go-live-view";
import { readEnv, resendStatus } from "@/features/system/server";

export const metadata = { title: "Go-Live-Check" };
export const dynamic = "force-dynamic";

export default async function GoLivePage({ searchParams }: { searchParams: Promise<{ test?: string; detail?: string }> }) {
  const { supabase, profile } = await requireAdmin();
  const params = await searchParams;
  const env = readEnv();

  const configured = (env.notifyEmails ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const [resend, admins, players, clubUsers, openNeeds] = await Promise.all([
    resendStatus(env),
    configured.length ? Promise.resolve({ data: [] as { email: string }[] }) : supabase.from("users").select("email").eq("role", "admin"),
    supabase.from("kw_players").select("photo_path, cv_path, visible_to_clubs"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "club"),
    supabase.from("player_needs").select("id", { count: "exact", head: true }).in("status", ["offen", "in_gespraechen"])
  ]);
  const recipients = configured.length ? configured : (admins.data ?? []).map((row) => row.email as string);

  const app = appChecks(env);
  const email = emailChecks(env, resend, recipients);
  const { todo, warn } = summary([...app, ...email]);
  const rows = players.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Go-Live-Check"
        description={
          todo === 0
            ? `Technisch ist alles bereit${warn ? ` (${warn} Hinweis${warn === 1 ? "" : "e"} zum Prüfen)` : ""}. Jetzt einmal den Testlauf unten durchspielen, dann können Vereine eingeladen werden.`
            : `Noch ${todo} offene${todo === 1 ? "r Punkt" : " Punkte"} bis zum Start. Werte in Vercel ändern sich erst nach dem nächsten Deployment (Vercel › Deployments › Redeploy).`
        }
      />
      <GoLiveView
        data={{
          app,
          email,
          records: resend.kind === "domain" ? resend.records : [],
          auth: supabaseAuthUrls(env.siteUrl),
          adminEmail: profile.email,
          counts: {
            players: rows.length,
            photo: rows.filter((row) => row.photo_path).length,
            cv: rows.filter((row) => row.cv_path).length,
            released: rows.filter((row) => row.visible_to_clubs).length,
            clubUsers: clubUsers.count ?? 0,
            openNeeds: openNeeds.count ?? 0
          },
          test: params.test === "sent" ? { state: "sent" } : params.test === "failed" ? { state: "failed", detail: params.detail } : null,
          onSendTest: sendTestEmailAction
        }}
      />
    </div>
  );
}
