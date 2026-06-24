import Link from "next/link";
import { AlertTriangle, Copy, Edit, MessageCircle, Plus, Target, type LucideIcon } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { NeedStatusForm } from "@/features/player-needs/need-status-form";
import { duplicateClubNeedAction } from "@/features/player-needs/actions";
import { CLUB_POSITION_LABELS, CLUB_STATUS_LABELS, clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { requireClubUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { PlayerNeed } from "@/types/domain";

export default async function ClubDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = clubCopy[locale].dashboard;
  const positionLabels = CLUB_POSITION_LABELS[locale];
  const params = await searchParams;

  const { data: needs = [] } = await supabase
    .from("player_needs")
    .select("*")
    .eq("club_id", profile.club_id!)
    .neq("status", "archiviert")
    .order("needed_from_date", { ascending: true });

  const typedNeeds = needs as PlayerNeed[];
  const openCount = typedNeeds.filter((need) => need.status === "offen").length;
  const talksCount = typedNeeds.filter((need) => need.status === "in_gespraechen").length;
  const highCount = typedNeeds.filter((need) => need.priority === "hoch").length;

  const club = profile.clubs ?? null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const clubLogoUrl =
    club?.logo_path && supabaseUrl
      ? `${supabaseUrl}/storage/v1/object/public/club-logos/${club.logo_path}`
      : null;

  return (
    <div className="space-y-6">
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-l-2 border-brand-500 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {clubLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clubLogoUrl}
                alt=""
                className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
              />
            ) : null}
            <div className="min-w-0">
              <p className="eyebrow">{club?.name || t.eyebrowFallback}</p>
              <h1 className="kw-title mt-1.5 text-[2rem] leading-[0.95] sm:text-[2.75rem]">{t.title}</h1>
              {profile.name ? (
                <p className="mt-1 text-sm text-neutral-600">
                  {t.greeting}, <span className="font-semibold text-navy-950">{profile.name}</span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/club/needs/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.newNeed}
            </LinkButton>
          </div>
        </div>
      </div>

      {params.error === "status" ? (
        <div className="alert-error">{t.statusError}</div>
      ) : null}
      {params.error === "duplicate" ? (
        <div className="alert-error">{t.duplicateError}</div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Target} label={t.open} value={openCount} />
        <Metric icon={MessageCircle} label={t.talks} value={talksCount} />
        <Metric icon={AlertTriangle} label={t.highPriority} value={highCount} tone="danger" />
      </section>

      {typedNeeds.length === 0 ? (
        <EmptyState
          title={t.emptyTitle}
          body={t.emptyBody}
          action={
            <LinkButton href="/club/needs/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.newNeed}
            </LinkButton>
          }
        />
      ) : (
        <section className="panel overflow-hidden">
          <div className="table-header hidden grid-cols-[0.7fr_0.7fr_0.8fr_1.35fr_auto] gap-4 lg:grid">
            <span>{t.position}</span>
            <span>{t.season}</span>
            <span>{t.neededFrom}</span>
            <span>{t.status}</span>
            <span className="text-right">{t.action}</span>
          </div>

          <div className="divide-y divide-slate-200">
            {typedNeeds.map((need) => {
              const stale = isStaleNeed(need.last_confirmed_at);

              return (
                <article
                  key={need.id}
                  className="data-row grid gap-4 lg:grid-cols-[0.7fr_0.7fr_0.8fr_1.35fr_auto] lg:items-center"
                >
                  <div>
                    <p className="text-base font-bold text-navy-950">{positionLabels[need.position]}</p>
                    <p className="mt-1 text-sm text-slate-500 lg:hidden">{need.season}</p>
                    {stale ? (
                      <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        {t.updateHint}
                      </p>
                    ) : null}
                  </div>
                  <p className="hidden text-sm font-medium text-slate-700 lg:block">{need.season}</p>
                  <p className="text-sm text-slate-700">{formatDate(need.needed_from_date, locale)}</p>
                  <div className="space-y-3">
                    <NeedBadges need={need} locale={locale} />
                    {need.status_note ? <p className="text-xs text-slate-500">{need.status_note}</p> : null}
                    <NeedStatusForm need={need} locale={locale} />
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <form action={duplicateClubNeedAction}>
                      <input type="hidden" name="id" value={need.id} />
                      <Button type="submit" variant="secondary" className="px-3 shadow-sm" title={t.copyTitle}>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        {t.copy}
                      </Button>
                    </form>
                    <Link
                      href={`/club/needs/${need.id}/edit`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-navy-900 hover:bg-slate-50"
                      title={t.editTitle}
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{t.editSr}</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel-muted px-5 py-4 text-sm leading-6 text-slate-600">
        {t.footer} {t.statusFilter}: {CLUB_STATUS_LABELS[locale].offen}, {CLUB_STATUS_LABELS[locale].in_gespraechen},{" "}
        {CLUB_STATUS_LABELS[locale].besetzt}.
      </section>
    </div>
  );
}

function isStaleNeed(lastConfirmedAt: string) {
  const lastConfirmed = new Date(lastConfirmedAt).getTime();
  if (Number.isNaN(lastConfirmed)) return false;

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - lastConfirmed > thirtyDays;
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "default"
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "default" | "danger";
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="metric-kicker">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        <span
          className={
            tone === "danger"
              ? "flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-700"
              : "flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700"
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
