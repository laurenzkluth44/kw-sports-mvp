import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { needHeadline, needProfileLabels } from "@/features/player-needs/need-summary";
import { NeedFacts, NeedHero, chips } from "@/features/player-needs/need-hero";
import { agencyCopy } from "@/lib/agency-i18n";
import { requireAgency } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Country, PlayerNeedWithClub } from "@/types/domain";

export default async function AgencyNeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAgency();
  const locale = await getClubLocale();
  const t = agencyCopy[locale].detail;

  const { data } = await supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,logo_path,created_at,updated_at)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const need = data as PlayerNeedWithClub;
  const labels = needProfileLabels(need, locale);
  const isCoach = need.need_type === "trainer";
  const countryLabel = agencyCopy[locale].dashboard.countries[need.clubs.country as Country] ?? need.clubs.country;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: agencyCopy[locale].app.navNeeds, href: "/agency" }, { label: need.clubs.name }, { label: needHeadline(need, locale) }]} />
      <NeedHero
        need={need}
        locale={locale}
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

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <NeedFacts
          title={t.profile}
          empty={t.profileEmpty}
          rows={[
            { label: t.description, value: need.description, wide: true },
            ...(isCoach
              ? [{ label: t.coachRole, value: labels.coachRole }]
              : [
                  { label: t.attackPositions, value: chips(labels.attackPositions) },
                  { label: t.defensePositions, value: chips(labels.defensePositions) },
                  { label: t.playerType, value: chips(labels.playerTypes) },
                  { label: t.targetRoles, value: chips(labels.targetRoles) },
                  { label: t.age, value: formatRange(need.age_min, need.age_max, t) },
                  { label: t.heightMin, value: need.height_min ? `${need.height_min} cm` : null },
                  { label: t.playerTypeNote, value: need.player_type, wide: true }
                ]),
            { label: t.languages, value: chips(labels.languages) },
            { label: t.nationality, value: need.nationality_preference },
            { label: t.leagueExperience, value: need.league_experience },
            { label: t.contractStatus, value: need.contract_status_preference }
          ]}
        />
        <NeedFacts
          title={t.conditions}
          empty={t.conditionsEmpty}
          rows={[
            { label: t.country, value: countryLabel },
            { label: t.budget, value: need.budget_amount ? formatCurrency(need.budget_amount, need.budget_currency, locale) : null },
            { label: t.budgetNote, value: need.budget_note, wide: true },
            { label: t.statusNote, value: need.status_note, wide: true },
            { label: t.closedAt, value: need.closed_at ? formatDate(need.closed_at, locale) : null }
          ]}
        />
      </section>
    </div>
  );
}

function formatRange(min: number | null, max: number | null, copy: { rangeFrom: string; rangeTo: string }) {
  if (min && max) return `${min}–${max}`;
  if (min) return `${copy.rangeFrom} ${min}`;
  if (max) return `${copy.rangeTo} ${max}`;
  return null;
}
