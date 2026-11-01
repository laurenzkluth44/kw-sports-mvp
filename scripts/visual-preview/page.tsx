// CI-only preview of the Squad, needs overview and need form screens with fictional sample data.
// .github/workflows/visual-preview.yml copies this file to src/app/visual-preview/[screen]/page.tsx
// for the screenshot build only. It is never part of the deployed app.
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusScreen } from "@/components/layout/status-screen";
import { LinkButton } from "@/components/ui/button";
import { guideCopy } from "@/lib/guide-i18n";
import { normalizeAdminNeedFilters } from "@/features/admin/filters";
import { NeedsOverview, parseOverviewView } from "@/features/needs-overview/needs-overview";
import { createClubNeedAction } from "@/features/player-needs/actions";
import { NeedForm } from "@/features/player-needs/need-form";
import { createKwPlayerAction } from "@/features/kw-players/actions";
import { KwPlayerCard } from "@/features/kw-players/kw-player-card";
import { KwPlayerForm } from "@/features/kw-players/kw-player-form";
import { AdminNeedMatchesView } from "@/features/matching/admin-need-matches";
import { AdminInboxView, type InboxTab } from "@/features/matching/admin-inbox";
import { ClubSuggestionsView } from "@/features/matching/club-suggestions";
import { ClubCockpit } from "@/features/club/cockpit";
import { ClubNeedCard, NewNeedTile } from "@/features/club/club-need-card";
import { ClubNeedView } from "@/features/club/club-need-view";
import { buildKwInfo } from "@/features/matching/kw-queue";
import { KwQueueBanner } from "@/features/matching/kw-queue-banner";
import { NeedFacts, NeedHero, chips } from "@/features/player-needs/need-hero";
import { needProfileLabels } from "@/features/player-needs/need-summary";
import { planningSeasons } from "@/features/squad/squad-model";
import { scorePlayerForNeed } from "@/features/matching/engine";
import { buildAnswerEmail, buildNewNeedEmail, buildReminderEmail, buildSuggestionEmail } from "@/lib/email/notifications";
import { buildInviteEmail, buildResetEmail } from "@/lib/email/auth-emails";
import { createRosterPlayerAction } from "@/features/squad/actions";
import { PlayerForm } from "@/features/squad/player-form";
import { SquadScreen } from "@/features/squad/squad-screen";
import { commitSquadImportAction, previewSquadImportAction, type SquadImportState } from "@/features/squad/import-actions";
import { SquadImportScreen } from "@/features/squad/import-screen";
import { squadImportCopy } from "@/lib/squad-import-i18n";
import { parseClubLocale } from "@/lib/club-i18n";
import { seasonEndDate, seasonForDate, seasonLabel, seasonStartYear } from "@/lib/constants";
import { clubCopy } from "@/lib/club-i18n";
import { overviewCopy } from "@/lib/overview-i18n";
import { squadCopy } from "@/lib/squad-i18n";
import type { AttackPosition, Club, DefensePosition, KwPlayer, NeedMatch, PlayerNeedWithClub, Priority, Profile, RosterPlayer } from "@/types/domain";

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

// ---- KW player fixtures (fictional) ----
function kwPlayer(index: number, extra: Partial<KwPlayer>): KwPlayer {
  return {
    id: `00000000-0000-0000-0000-0000000003${String(index).padStart(2, "0")}`,
    kind: "spieler",
    first_name: "",
    last_name: "",
    birth_date: null,
    nationality: null,
    attack_positions: [],
    defense_positions: [],
    coach_roles: [],
    handedness: null,
    height_cm: null,
    current_club: null,
    current_league: null,
    contract_until: null,
    available_from: null,
    languages: [],
    player_types: [],
    league_experience: null,
    profile: null,
    video_url: null,
    photo_path: null,
    cv_path: null,
    consent_at: "2026-10-01",
    visible_to_clubs: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: daysAgo(12),
    ...extra
  };
}

const kwPlayers: KwPlayer[] = [
  kwPlayer(1, { first_name: "Jonas", last_name: "Brenner", birth_date: "2001-05-12", attack_positions: ["RR"], handedness: "links", height_cm: 192, current_club: "TV Beispielstadt", current_league: "2. Bundesliga", contract_until: `${start + 1}-06-30`, languages: ["de", "en"], player_types: ["wurfstark"], cv_path: "x/cv.pdf" }),
  kwPlayer(2, { first_name: "Mats", last_name: "Lindgren", birth_date: "2002-02-02", attack_positions: ["RR", "RA"], handedness: "links", height_cm: 188, current_club: "IK Exempel", current_league: "Håndboldligaen", available_from: `${start + 1}-07-01`, languages: ["en", "sv"], player_types: ["eins_gegen_eins"], cv_path: "x/cv.pdf" }),
  kwPlayer(3, { first_name: "Karim", last_name: "Haddad", birth_date: "1993-08-20", attack_positions: ["RR"], height_cm: 196, current_club: "HC Muster", current_league: "1. Bundesliga", contract_until: `${start + 2}-06-30`, languages: ["de", "fr"], player_types: ["wurfstark"], visible_to_clubs: false, consent_at: null }),
  kwPlayer(4, { first_name: "Tom", last_name: "Weber", birth_date: "2003-03-03", attack_positions: ["RL", "RM"], height_cm: 190, current_club: "SG Probe", current_league: "3. Liga Süd", contract_until: `${start}-06-30`, languages: ["de"], player_types: ["spielstark"], updated_at: daysAgo(120) }),
  kwPlayer(5, { kind: "trainer", first_name: "Marco", last_name: "Stein", birth_date: "1985-11-01", coach_roles: ["co_trainer", "athletiktrainer"], current_club: "HSV Beispiel", current_league: "2. Bundesliga", languages: ["de", "en"] })
];

const sampleMatches: NeedMatch[] = [
  {
    id: "00000000-0000-0000-0000-000000000401",
    need_id: needs[0].id,
    player_id: kwPlayers[1].id,
    status: "interessiert",
    score: 86,
    reasons: [],
    club_note: "Gerne Videos und Gehaltsvorstellung schicken.",
    released_at: daysAgo(6),
    released_by: null,
    responded_at: daysAgo(2),
    responded_by: null,
    handled_at: null,
    created_at: daysAgo(6),
    updated_at: daysAgo(2)
  }
];

// Club-side suggestions and KW inbox (fictional).
function released(index: number, needIndex: number, playerIndex: number, extra: Partial<NeedMatch>): NeedMatch {
  const result = scorePlayerForNeed(needs[needIndex], kwPlayers[playerIndex]);
  return {
    id: `00000000-0000-0000-0000-0000000005${String(index).padStart(2, "0")}`,
    need_id: needs[needIndex].id,
    player_id: kwPlayers[playerIndex].id,
    status: "freigegeben",
    score: result.score,
    reasons: result.reasons,
    club_note: null,
    released_at: daysAgo(3),
    released_by: null,
    responded_at: null,
    responded_by: null,
    handled_at: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    ...extra
  };
}

const suggestionPlayers: KwPlayer[] = kwPlayers.map((player, index) =>
  index === 0
    ? {
        ...player,
        nationality: "Deutschland",
        league_experience: "2. Bundesliga, EHF European League",
        video_url: "https://example.com/video",
        profile:
          "Linkshändiger Rückraum rechts mit starkem Wurf aus der zweiten Reihe. Stammspieler in der 2. Bundesliga, 6,1 Tore pro Spiel. Sucht den nächsten Schritt mit klarer Rolle."
      }
    : index === 1
      ? { ...player, nationality: "Schweden", profile: "Schneller, dynamischer Rechtshänder im 1-gegen-1. Spielt auch Rechtsaußen." }
      : player
);

const clubMatches: NeedMatch[] = [
  released(1, 0, 0, {}),
  released(2, 0, 1, { status: "interessiert", club_note: "Gerne Videos und Gehaltsvorstellung schicken.", responded_at: daysAgo(1) })
];

const inboxMatches: NeedMatch[] = [
  released(3, 0, 1, { status: "interessiert", club_note: "Gerne Videos und Gehaltsvorstellung schicken.", responded_at: daysAgo(1) }),
  released(4, 2, 0, { status: "interessiert", club_note: "Können wir nächste Woche telefonieren?", responded_at: daysAgo(0) }),
  released(5, 3, 3, { status: "interessiert", responded_at: daysAgo(2), handled_at: daysAgo(1) }),
  released(6, 2, 1, { released_at: daysAgo(9) }),
  released(7, 0, 2, { status: "kein_interesse", club_note: "Zu teuer für unser Budget.", responded_at: daysAgo(4) })
];

const inboxContacts = new Map<string, Profile[]>([
  [needs[0].club_id, [{ ...profile, club_id: needs[0].club_id }]],
  [needs[2].club_id, [{ ...profile, id: "00000000-0000-0000-0000-000000000009", name: "Lars Lindner", email: "lars@example.com", club_id: needs[2].club_id }]]
]);

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
    const adminKw = buildKwInfo(needs, kwPlayers, sampleMatches);
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
          kwInfo={isAdmin ? adminKw.info : undefined}
          detailHref={(id) => `#${id}`}
          filterFields={<p className="text-sm text-slate-500">[Filterfelder]</p>}
          quickFilters={isAdmin ? <KwQueueBanner count={adminKw.queue.length} active={false} filtersQuery="" /> : null}
          inbox={null}
          summary={<p className="text-sm text-slate-500">[Auswertung]</p>}
        />
      </AppShell>
    );
  }

  if (screen === "players") {
    return (
      <AppShell profile={adminProfile} locale="de">
        <div className="space-y-6">
          <PageHeader eyebrow="KW Sports Admin" title="Spielerdatenbank" description="Beispieldaten" />
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {kwPlayers.map((player) => (
              <KwPlayerCard key={player.id} player={player} />
            ))}
          </section>
        </div>
      </AppShell>
    );
  }

  if (screen === "player-form") {
    return (
      <AppShell profile={adminProfile} locale="de">
        <div className="space-y-6">
          <PageHeader eyebrow="KW Sports Admin" title="Spieler anlegen" />
          <KwPlayerForm action={createKwPlayerAction} player={kwPlayers[0]} />
        </div>
      </AppShell>
    );
  }

  if (screen === "matches") {
    return (
      <AppShell profile={adminProfile} locale="de">
        <AdminNeedMatchesView need={needs[0]} players={kwPlayers} matches={sampleMatches} photos={new Map()} />
      </AppShell>
    );
  }

  if (screen === "suggestions") {
    const clubProfile: Profile = { ...profile, club_id: needs[0].club_id, clubs: needs[0].clubs };
    return (
      <AppShell profile={clubProfile} locale={locale} badge={1}>
        <ClubSuggestionsView
          locale={locale}
          needs={[needs[0]]}
          players={suggestionPlayers}
          matches={clubMatches}
          files={new Map()}
          done={query.done}
        />
      </AppShell>
    );
  }

  if (screen === "club-need" || screen === "club-need-filled") {
    const filled = screen === "club-need-filled";
    const clubProfile: Profile = { ...profile, club_id: needs[0].club_id, clubs: needs[0].clubs };
    const need = {
      ...needs[0],
      description: "Linkshänder für den rechten Rückraum, der sofort Spielanteile übernehmen kann.",
      budget_amount: 4500,
      budget_currency: "EUR",
      last_confirmed_at: filled ? daysAgo(2) : daysAgo(40),
      status: filled ? ("besetzt" as const) : needs[0].status,
      player_need_confidential: { note: "Unser RR verlässt uns im Sommer, bitte noch nicht öffentlich." }
    };
    return (
      <AppShell profile={clubProfile} locale={locale} badge={1}>
        <ClubNeedView
          need={need}
          matches={clubMatches}
          players={new Map(suggestionPlayers.map((player) => [player.id, player]))}
          files={new Map()}
          locale={locale}
          query={{ done: query.done }}
          filledVia={filled ? "kw_sports" : null}
        />
      </AppShell>
    );
  }

  if (screen === "cockpit" || screen === "cockpit-empty") {
    const empty = screen === "cockpit-empty";
    return (
      <AppShell profile={profile} locale={locale} badge={empty ? 0 : 2}>
        <ClubCockpit
          locale={locale}
          clubName="HSG Musterstadt"
          league="2. Bundesliga"
          personName="Maria"
          roster={empty ? [] : players}
          needs={empty ? [] : [needs[0], needs[4], needs[5]]}
          openSuggestions={empty ? 0 : 2}
          planningSeason={planningSeasons(1)[1]}
        />
        {empty ? null : (
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[needs[0], needs[4], needs[5]].map((need, index) => (
              <ClubNeedCard
                key={need.id}
                need={need}
                locale={locale}
                suggestions={index === 0 ? { total: 3, open: 2 } : undefined}
              />
            ))}
            <NewNeedTile locale={locale} />
          </section>
        )}
      </AppShell>
    );
  }

  if (screen === "need-detail") {
    const need = { ...needs[0], description: "Linkshänder für den rechten Rückraum, der sofort Spielanteile übernehmen kann.", budget_amount: 4500, budget_currency: "EUR" };
    const labels = needProfileLabels(need, "de");
    return (
      <AppShell profile={adminProfile} locale="de">
        <div className="space-y-6">
          <NeedHero need={need} locale="de" />
          <AdminNeedMatchesView need={need} players={kwPlayers} matches={sampleMatches} photos={new Map()} />
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <NeedFacts
              title="Anforderungsprofil"
              empty="-"
              rows={[
                { label: "Beschreibung", value: need.description, wide: true },
                { label: "Angriffspositionen", value: chips(labels.attackPositions) },
                { label: "Spielertyp", value: chips(labels.playerTypes) },
                { label: "Anvisierte Rolle", value: chips(labels.targetRoles) },
                { label: "Alter", value: "22–28 Jahre" }
              ]}
            />
            <NeedFacts title="Budget & Status" empty="-" rows={[{ label: "Budget", value: "4.500 € / Monat" }]} />
          </section>
        </div>
      </AppShell>
    );
  }

  if (screen === "inbox") {
    const tab = (query.tab as InboxTab | undefined) ?? "offen";
    return (
      <AppShell profile={adminProfile} locale="de" badge={2}>
        <AdminInboxView tab={tab} matches={inboxMatches} needs={needs} players={kwPlayers} contacts={inboxContacts} />
      </AppShell>
    );
  }

  if (screen === "email") {
    const site = "http://127.0.0.1:3000";
    const kind = query.kind ?? "suggestion";
    const frenchNeed = needs[3];
    const email =
      kind === "invite"
        ? buildInviteEmail({ name: "Maria", organisation: "HSG Musterstadt", link: `${site}/auth/confirm`, locale: "de" }, site)
        : kind === "reset"
          ? buildResetEmail({ link: `${site}/auth/confirm`, locale: "en" }, site)
          : kind === "need"
        ? buildNewNeedEmail(needs[0], site)
        : kind === "answer"
          ? buildAnswerEmail(needs[2], suggestionPlayers[0], inboxMatches[1], ["lars@example.com"], site)
          : kind === "reminder"
            ? buildReminderEmail([needs[4], { ...needs[4], id: "x", attack_positions: ["RL"], season: "2027/28" }], site)
            : kind === "suggestion-fr"
              ? buildSuggestionEmail(frenchNeed, suggestionPlayers[3], 78, site)
              : buildSuggestionEmail(needs[0], suggestionPlayers[0], 100, site);
    return (
      <div style={{ background: "#e5e7eb", padding: 16 }}>
        <p style={{ font: "600 13px system-ui", margin: "0 0 8px" }}>Betreff: {email.subject}</p>
        <iframe title="email" srcDoc={email.html} style={{ width: "100%", height: 1000, border: 0, background: "#fff" }} />
      </div>
    );
  }

  if (screen === "error") {
    const errorCopy = guideCopy[locale].error;
    return (
      <AppShell profile={profile} locale={locale}>
        <StatusScreen
          ghost="!"
          eyebrow={errorCopy.eyebrow}
          title={errorCopy.title}
          body={errorCopy.body}
          actions={
            <>
              <LinkButton href="#" variant="accent">{errorCopy.retry}</LinkButton>
              <LinkButton href="/" variant="secondary">{errorCopy.home}</LinkButton>
            </>
          }
        />
      </AppShell>
    );
  }

  if (screen === "need-form") {
    const formCopy = clubCopy[locale].form;
    return (
      <AppShell profile={profile} locale={locale}>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: clubCopy[locale].app.navNeeds, href: "/club" }, { label: formCopy.newTitle }]} />
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

  if (screen === "import" || screen === "import-preview") {
    const ti = squadImportCopy[locale];
    const contract = (years: number) => `${start + years}-06-30`;
    const previewState: SquadImportState = {
      status: "preview",
      fileName: "Kaderliste_2026-27.xlsx",
      rows: [
        { line: 4, row: { first_name: "Lukas", last_name: "Beispiel", jersey_number: 1, position: "TW", secondary_positions: [], defense_positions: [], contract_until: contract(2), notes: null } },
        { line: 5, row: { first_name: "Jonas", last_name: "Muster", jersey_number: 7, position: "RR", secondary_positions: ["RA"], defense_positions: [3, 4], contract_until: contract(1), notes: null } },
        { line: 6, row: { first_name: "Felix", last_name: "Probe", jersey_number: 11, position: "RM", secondary_positions: [], defense_positions: [3], contract_until: contract(3), notes: null } },
        { line: 7, row: { first_name: "Ben", last_name: "Vorlage", jersey_number: 18, position: "KM", secondary_positions: [], defense_positions: [3, 4], contract_until: contract(1), notes: null } },
        { line: 8, row: { first_name: "Paul", last_name: "Exempel", jersey_number: 23, position: "LA", secondary_positions: [], defense_positions: [1], contract_until: contract(2), notes: null } }
      ],
      skipped: [
        { line: 9, label: "Tim Sample", issue: "duplicate" },
        { line: 10, label: "Nico Test", issue: "contract", value: "verlängert?" }
      ]
    };
    return (
      <AppShell profile={profile} locale={locale}>
        <div className="space-y-6">
          <PageHeader eyebrow={profile.clubs!.name} title={ti.title} description={ti.intro} />
          <SquadImportScreen
            t={ti}
            locale={locale}
            previewAction={previewSquadImportAction}
            commitAction={commitSquadImportAction}
            initialState={screen === "import-preview" ? previewState : undefined}
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
