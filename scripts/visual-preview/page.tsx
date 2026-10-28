// CI-only preview of the Squad screens with fictional sample data.
// .github/workflows/visual-preview.yml copies this file to src/app/visual-preview/[screen]/page.tsx
// for the screenshot build only. It is never part of the deployed app.
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { createRosterPlayerAction } from "@/features/squad/actions";
import { PlayerForm } from "@/features/squad/player-form";
import { SquadScreen } from "@/features/squad/squad-screen";
import { parseClubLocale } from "@/lib/club-i18n";
import { seasonEndDate, seasonForDate, seasonLabel, seasonStartYear } from "@/lib/constants";
import { squadCopy } from "@/lib/squad-i18n";
import type { AttackPosition, DefensePosition, Profile, RosterPlayer } from "@/types/domain";

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

export default async function VisualPreview({
  params,
  searchParams
}: {
  params: Promise<{ screen: string }>;
  searchParams: Promise<{ lang?: string; view?: string; season?: string }>;
}) {
  const { screen } = await params;
  const query = await searchParams;
  const locale = parseClubLocale(query.lang);
  const t = squadCopy[locale];

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
