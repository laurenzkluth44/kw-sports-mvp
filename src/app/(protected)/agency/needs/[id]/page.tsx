import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { agencyCopy } from "@/lib/agency-i18n";
import { requireAgency } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { CLUB_POSITION_LABELS, CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS } from "@/lib/club-i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Country, PlayerNeedWithClub } from "@/types/domain";

export default async function AgencyNeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAgency();
  const locale = await getClubLocale();
  const t = agencyCopy[locale].detail;
  const positionLabels = CLUB_POSITION_LABELS[locale];
  const priorityLabels = CLUB_PRIORITY_LABELS[locale];
  const statusLabels = CLUB_STATUS_LABELS[locale];

  const { data } = await supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,logo_path,created_at,updated_at)")
    .eq("id", id)
    .single();

  if (!data) redirect("/agency");

  const need = data as PlayerNeedWithClub;
  const countryLabel = agencyCopy[locale].dashboard.countries[need.clubs.country as Country] ?? need.clubs.country;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={need.clubs.name}
        title={`${positionLabels[need.position]} · ${need.season}`}
        description={`${need.clubs.league} · ${need.clubs.city} · ${t.neededFrom} ${formatDate(need.needed_from_date, locale)}`}
        actions={
          <LinkButton href="/agency" variant="secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t.back}
          </LinkButton>
        }
      />

      <div className="alert-success flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
        <span>{t.readOnlyAlert}</span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryItem label={t.club} value={need.clubs.name} />
        <SummaryItem label={t.position} value={positionLabels[need.position]} />
        <SummaryItem label={t.season} value={need.season} />
        <SummaryItem label={t.status} value={statusLabels[need.status]} />
        <SummaryItem label={t.priority} value={priorityLabels[need.priority]} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel p-5">
          <div className="flex flex-wrap gap-2">
            <NeedBadges need={need} locale={locale} />
          </div>
          <dl className="mt-5 space-y-4">
            <InfoRow label={t.club} value={need.clubs.name} />
            <InfoRow label={t.country} value={countryLabel} />
            <InfoRow label={t.league} value={need.clubs.league} />
            <InfoRow label={t.city} value={need.clubs.city} />
            <InfoRow label={t.position} value={positionLabels[need.position]} />
            <InfoRow label={t.season} value={need.season} />
            <InfoRow label={t.neededFrom} value={formatDate(need.needed_from_date, locale)} />
            <InfoRow label={t.budget} value={formatCurrency(need.budget_amount, need.budget_currency, locale)} />
            <InfoRow label={t.closedAt} value={need.closed_at ? formatDate(need.closed_at, locale) : "-"} />
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="section-heading">{t.profile}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoRow label={t.description} value={need.description || "-"} wide />
            <InfoRow label={t.age} value={formatRange(need.age_min, need.age_max, t)} />
            <InfoRow label={t.heightMin} value={need.height_min ? `${need.height_min} cm` : "-"} />
            <InfoRow label={t.nationality} value={need.nationality_preference || "-"} />
            <InfoRow label={t.leagueExperience} value={need.league_experience || "-"} />
            <InfoRow label={t.playerType} value={need.player_type || "-"} />
            <InfoRow label={t.contractStatus} value={need.contract_status_preference || "-"} />
            <InfoRow label={t.statusNote} value={need.status_note || "-"} wide />
            <InfoRow label={t.budgetNote} value={need.budget_note || "-"} wide />
          </dl>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="metric-card px-4 py-3">
      <p className="metric-kicker">{label}</p>
      <p className="mt-1 truncate text-base font-black text-navy-950">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-navy-950">{value}</dd>
    </div>
  );
}

function formatRange(min: number | null, max: number | null, copy: { rangeFrom: string; rangeTo: string }) {
  if (min && max) return `${min}-${max}`;
  if (min) return `${copy.rangeFrom} ${min}`;
  if (max) return `${copy.rangeTo} ${max}`;
  return "-";
}
