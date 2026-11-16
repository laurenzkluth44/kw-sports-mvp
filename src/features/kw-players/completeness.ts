/**
 * How complete a KW player's profile is. Pure (used by the admin list, the edit page and the tests).
 * Goalkeepers don't need throwing hand, defence positions or a player type; coaches have their own list.
 */
type ProfileFields = {
  kind: "spieler" | "trainer";
  photo_path: string | null;
  cv_path: string | null;
  birth_date: string | null;
  nationality: string | null;
  height_cm: number | null;
  handedness: string | null;
  attack_positions: string[];
  defense_positions: number[];
  coach_roles?: string[] | null;
  player_types: string[];
  languages: string[];
  league_experience: string | null;
  contract_until: string | null;
  profile: string | null;
  video_url: string | null;
};

export type Completeness = { percent: number; missing: string[]; total: number };

const filled = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;

export function profileCompleteness(player: ProfileFields): Completeness {
  const keeper = player.attack_positions.length > 0 && player.attack_positions.every((position) => position === "TW");
  const checks: [string, unknown][] =
    player.kind === "trainer"
      ? [
          ["Foto", player.photo_path],
          ["CV", player.cv_path],
          ["Geburtsdatum", player.birth_date],
          ["Nationalität", player.nationality],
          ["Trainerrolle", player.coach_roles ?? []],
          ["Sprachen", player.languages],
          ["Ligaerfahrung", player.league_experience],
          ["Vertrag bis", player.contract_until],
          ["Profiltext", player.profile]
        ]
      : [
          ["Foto", player.photo_path],
          ["CV", player.cv_path],
          ["Geburtsdatum", player.birth_date],
          ["Nationalität", player.nationality],
          ["Größe", player.height_cm],
          ["Position", player.attack_positions],
          ...(keeper
            ? []
            : ([
                ["Wurfhand", player.handedness],
                ["Abwehrpositionen", player.defense_positions],
                ["Spielertyp", player.player_types]
              ] as [string, unknown][])),
          ["Sprachen", player.languages],
          ["Ligaerfahrung", player.league_experience],
          ["Vertrag bis", player.contract_until],
          ["Profiltext", player.profile],
          ["Video", player.video_url]
        ];
  const missing = checks.filter(([, value]) => !filled(value)).map(([label]) => label);
  return { percent: Math.round(((checks.length - missing.length) / checks.length) * 100), missing, total: checks.length };
}
