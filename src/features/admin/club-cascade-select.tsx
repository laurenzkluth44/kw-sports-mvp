"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, Select } from "@/components/ui/form";
import { COUNTRIES, LEAGUES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ClubCascadeOption = {
  id: string;
  name: string;
  country: string;
  league: string;
};

export function ClubCascadeSelect({
  clubs,
  fieldName,
  defaultClubId,
  required = false,
  emptyClubLabel = "Kein Verein",
  countryLabel = "Land",
  leagueLabel = "Liga",
  clubLabel = "Verein",
  idPrefix = "club",
  className,
  clubClassName
}: {
  clubs: ClubCascadeOption[];
  fieldName: string;
  defaultClubId?: string | null;
  required?: boolean;
  emptyClubLabel?: string;
  countryLabel?: string;
  leagueLabel?: string;
  clubLabel?: string;
  idPrefix?: string;
  className?: string;
  clubClassName?: string;
}) {
  const defaultClub = clubs.find((club) => club.id === defaultClubId);
  const [country, setCountry] = useState(defaultClub?.country || "");
  const [league, setLeague] = useState(defaultClub?.league || "");
  const [clubId, setClubId] = useState(defaultClub?.id || "");

  const countries = useMemo(() => sortByKnownOrder(unique(clubs.map((club) => club.country)), COUNTRIES), [clubs]);
  const leagues = useMemo(
    () =>
      sortByKnownOrder(
        unique(clubs.filter((club) => !country || club.country === country).map((club) => club.league)),
        LEAGUES
      ),
    [clubs, country]
  );
  const filteredClubs = useMemo(
    () =>
      clubs
        .filter((club) => (!country || club.country === country) && (!league || club.league === league))
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    [clubs, country, league]
  );

  useEffect(() => {
    if (league && !leagues.includes(league)) setLeague("");
  }, [league, leagues]);

  useEffect(() => {
    if (clubId && !filteredClubs.some((club) => club.id === clubId)) setClubId("");
  }, [clubId, filteredClubs]);

  return (
    <>
      <Field label={countryLabel} htmlFor={`${idPrefix}_country`} className={className}>
        <Select
          id={`${idPrefix}_country`}
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setLeague("");
            setClubId("");
          }}
        >
          <option value="">Land auswählen</option>
          {countries.map((countryOption) => (
            <option key={countryOption} value={countryOption}>
              {countryOption}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={leagueLabel} htmlFor={`${idPrefix}_league`} className={className}>
        <Select
          id={`${idPrefix}_league`}
          value={league}
          onChange={(event) => {
            setLeague(event.target.value);
            setClubId("");
          }}
          disabled={!country}
        >
          <option value="">{country ? "Liga auswählen" : "Erst Land auswählen"}</option>
          {leagues.map((leagueOption) => (
            <option key={leagueOption} value={leagueOption}>
              {leagueOption}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={clubLabel} htmlFor={`${idPrefix}_id`} className={cn(className, clubClassName)}>
        <Select
          id={`${idPrefix}_id`}
          name={fieldName}
          value={clubId}
          onChange={(event) => setClubId(event.target.value)}
          required={required}
          disabled={!country || !league}
        >
          {!required ? <option value="">{emptyClubLabel}</option> : null}
          {required ? <option value="">Team auswählen</option> : null}
          {filteredClubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sortByKnownOrder<T extends readonly string[]>(values: string[], order: T) {
  return values.sort((a, b) => {
    const aIndex = (order as readonly string[]).indexOf(a);
    const bIndex = (order as readonly string[]).indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b, "de");
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}
