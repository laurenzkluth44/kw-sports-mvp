// CI-only preview of the Squad, needs overview and need form screens with fictional sample data.
// .github/workflows/visual-preview.yml copies this file to src/app/visual-preview/[screen]/page.tsx
// for the screenshot build only. It is never part of the deployed app.
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { normalizeAdminNeedFilters } from "@/features/admin/filters";
import { NeedsOverview, parseOverviewView } from "@/features/needs-overview/needs-overview";
import { createClubNeedAction } from "@/features/player-needs/actions";
import { NeedForm } from "@/features/player-needs/need-form";
import { createRosterPlayerAction } from "@/features/squad/actions";
import { PlayerForm } from "@/features/squad/player-form";
import { SquadScreen } from "@/features/squad/squad-screen";
import { parseClubLocale } from "@/lib/club-i18n";
import { seasonEndDate, seasonForDate, seasonLabel, seasonStartYear } from "@/lib/constants";
import { clubCopy } from "@/lib/club-i18n";
import { overviewCopy } from "@/lib/overview-i18n";
import { squadCopy } from "@/lib/squad-i18n";
import type { AttackPosition, Club, DefensePosition, PlayerNeedWithClub, Priority, Profile, RosterPlayer } from "@/types/domain";

const profile: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  club_id: "00000000-0000-0000-0000-0000000000c1",
  name: "Maria Beispiel",
  email: "preview@example.com",
  role: "club",
  agency_name: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  clubs: {
    id: "00000000-0000-0000-0000-0000000000c1",
    name: "HSG Musterstadt",
    country: "Deutschland",
    league: "2. Bundesliga",
    city: "Musterstadt",
    website: null,
    logo_path: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z"
  }
};

const start = seasonStartYear(seasonForDate());
const until = (offset: number) => seasonEndDate(seasonLabel(start + offset));

function player(
  index: number,
  first: string,
  last: string,
  jersey: number | null,
  position: AttackPosition,
  contractOffset: number,
  secondary: AttackPosition[] = [],
  defense: DefensePosition[] = []
): RosterPlayer {
  return {
    id: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`,
    club_id: profile.club_id!,
    first_name: first,
    last_name: last,
    jersey_number: jersey,
    position,
    secondary_positions: secondary,
    defense_positions: defense,
    contract_until: until(contractOffset),
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z"
  };
}

// Fictional squad. Designed so the next season shows a gap (RR), thin spots and a flexible player.
const players: RosterPlayer[] = [
  player(1, "Jonas", "Keller", 1, "TW", 2),
  player(2, "Malte", "Brandt", 12, "TW", 0),
  player(3, "Tim", "Vogel", 16, "TW", 1),
  player(4, "Luca", "Hartmann", 7, "LA", 1, [], [1]),
  player(5, "Felix", "Busch", 21, "LA", 0, [], [1]),
  player(6, "Niklas", "Wolf", 23, "RL", 2, ["RM"], [2, 3]),
  player(7, "Paul", "Schreiber", 33, "RL", 1, [], [3]),
  player(8, "Erik", "Lindqvist", 10, "RM", 3, [], [2]),
  player(9, "Moritz", "Lange", 5, "RM", 0, ["RL"], [2]),
  player(10, "Simon", "Albers", 18, "RR", 0, [], [5]),
  player(11, "Ben", "Krüger", 25, "RR", 0, ["RA"], [5]),
  player(12, "David", "Roth", 4, "RA", 2, [], [6]),
  player(13, "Leon", "Becker", 77, "RA", 1, [], [6]),
  player(14, "Max", "Neumann", 19, "KM", 2, [], [3, 4]),
  player(15, "Hendrik", "Sauer", 9, "KM", 0, [], [4])
];

// ---- needs overview fixtures (fictional clubs) ----
function club(index: number, name: string, league: Club["league"], city: string, country = "Deutschland"): Club {
  return {
    id: `00000000-0000-0000-0000-0000000001${String(index).padStart(2, "0")}`,
    name,
    country,
    league,
    city,
    website: null,
    logo_path: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z"
  };
}

const nextSeasonLabel = seasonLabel(start + 1);
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

function need(
  index: number,
  owner: Club,
  attack: AttackPosition[],
  priority: Priority,
  extra: Partial<PlayerNeedWithClub> = {}
): PlayerNeedWithClub {
  return {
    id: `00000000-0000-0000-0000-0000000002${String(index).padStart(2, "0")}`,
    club_id: owner.id,
    season: nextSeasonLabel,
    need_type: "spieler",
    attack_positions: attack,
    defense_positions: [],
    coach_role: null,
    needed_from_date: `${start + 1}-07-01`,
    priority,
    status: "offen",
    description: null,
    age_min: null,
    age_max: null,
    height_min: null,
    nationality_preference: null,
    league_experience: null,
    player_type: null,
    player_types: [],
    target_roles: [],
    languages: [],
    contract_status_preference: null,
    budget_amount: null,
    budget_currency: null,
    budget_note: null,
    status_note: null,
    closed_at: null,
    last_confirmed_at: daysAgo(3),
    created_at: daysAgo(20),
    updated_at: daysAgo(3),
    clubs: owner,
    ...extra
  };
}

const needs: PlayerNeedWithClub[] = [
  need(1, club(1, "HSG Musterstadt", "2. Bundesliga", "Musterstadt"), ["RR"], "hoch", { age_min: 22, age_max: 28, player_types: ["wurfstark"], target_roles: ["stammspieler"] }),
  need(2, club(2, "SG Waldtal", "1. Bundesliga", "Waldtal"), ["TW"], "hoch", { status: "in_gespraechen", height_min: 190, target_roles: ["fuehrungsrolle"] }),
  need(3, club(3, "SC Lindenhof", "1. Bundesliga", "Lindenhof"), ["RR", "RA"], "hoch", { player_types: ["eins_gegen_eins"], target_roles: ["rotationsspieler"], updated_at: daysAgo(0) }),
  need(4, club(4, "HC Seeburg", "Starligue", "Seeburg", "Frankreich"), ["RL", "RM"], "mittel", { age_min: 20, age_max: 26, player_types: ["spielstark"], languages: ["fr"] }),
  need(5, club(5, "TV Nordhafen", "3. Liga Nord-Ost", "Nordhafen"), ["KM"], "mittel", { defense_positions: [3, 4], player_types: ["abwehrstark"], last_confirmed_at: daysAgo(40) }),
  need(6, club(6, "TSV Bergheim", "2. Bundesliga", "Bergheim"), [], "mittel", { need_type: "trainer", coach_role: "co_trainer" }),
  need(7, club(7, "VfL Kranichfeld", "3. Liga Süd", "Kranichfeld"), ["RM"], "mittel", { status: "in_gespraechen", defense_positions: [2, 5], target_roles: ["perspektivspieler"] }),
  need(8, club(8, "HSV Ostwall", "Håndboldligaen", "Ostwall", "Dänemark"), ["RA"], "niedrig"),
  need(9, club(9, "Handball Rheinau", "3. Liga Süd-West", "Rheinau"), ["LA"], "niedrig", { age_max: 24, target_roles: ["perspektivspieler"] })
];

const adminProfile: Profile = { ...profile, id: "00000000-0000-0000-0000-000000000002", role: "admin", club_id: null, clubs: null, name: "KW Admin" };
const agencyProfile: Profile = { ...profile, id: "00000000-0000-0000-0000-000000000003", role: "agency", club_id: null, clubs: null, name: "Agent", agency_name: "Beispiel Agentur" };

export default async function VisualPreview({
  params,
  searchParams
}: {
  params: Promise<{ screen: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { screen } = await params;
  const query = await searchParams;
  const locale = parseClubLocale(query.lang);
  const t = squadCopy[locale];

  if (screen === "needs" || screen === "agency") {
    const isAdmin = screen === "needs";
    const overviewLocale = isAdmin ? "de" : locale;
    return (
      <AppShell profile={isAdmin ? adminProfile : agencyProfile} locale={overviewLocale}>
        <NeedsOverview
          basePath={isAdmin ? "/admin" : "/agency"}
          locale={overviewLocale}
          copy={overviewCopy[overviewLocale]}
          eyebrow={isAdmin ? "KW Sports Admin · Alle Kaderbedarfe" : "Beispiel Agentur"}
          view={parseOverviewView(query.view)}
          needs={needs}
          filters={normalizeAdminNeedFilters(query)}
          agencyCount={isAdmin ? 2 : undefined}
          detailHref={(id) => `#${id}`}
          filterFields={<p className="text-sm text-slate-500">[Filterfelder]</p>}
          quickFilters={null}
          inbox={null}
          summary={<p className="text-sm text-slate-500">[Auswertung]</p>}
        />
      </AppShell>
    );
  }

  if (screen === "need-form") {
    const formCopy = clubCopy[locale].form;
    return (
      <AppShell profile={profile} locale={locale}>
        <div className="space-y-6">
          <PageHeader title={formCopy.newTitle} description={formCopy.newDescription} />
          <NeedForm
            action={createClubNeedAction}
            submitLabel={formCopy.submitCreate}
            prefill={{ attack_positions: ["RR"], season: nextSeasonLabel }}
            locale={locale}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile} locale={locale}>
      {screen === "form" ? (
        <div className="space-y-6">
          <PageHeader eyebrow={profile.clubs!.name} title={t.form.newTitle} description={t.form.newDescription} />
          <PlayerForm action={createRosterPlayerAction} defaultPosition="RR" t={t} locale={locale} />
        </div>
      ) : (
        <SquadScreen
          players={screen === "empty" ? [] : players}
          clubName={profile.clubs!.name}
          locale={locale}
          seasonParam={query.season}
          viewParam={query.view}
        />
      )}
    </AppShell>
  );
}
