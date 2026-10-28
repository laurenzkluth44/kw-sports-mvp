# KW Sports Kaderbedarf MVP

Interne B2B-Webplattform für KW Sports GmbH. Vereine tragen offene Kaderbedarfe ein, KW Sports Admins sehen, filtern und exportieren alle Suchaufträge.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- PostgreSQL mit Row Level Security
- CSV- und Excel-Export über geschützte Routen

## Projektstruktur

```txt
src/app
  (auth)/login                  Login
  (auth)/set-password           Einladung annehmen und Passwort setzen
  auth/callback                 Supabase Auth Callback
  (protected)/club              Club Dashboard
  (protected)/club/needs        Bedarf erstellen/bearbeiten
  (protected)/club/squad        Interner Kader mit Taktiktafel (nur für den eigenen Verein)
  (protected)/agency            Agency Dashboard mit Read-only Zugriff
  (protected)/agency/needs      Agency Bedarf Detail
  (protected)/admin             Admin Dashboard
  (protected)/admin/needs       Bedarf Detail/Edit
  (protected)/admin/clubs       Vereinsdetail
  (protected)/admin/users       Nutzer und Einladungen verwalten
  (protected)/admin/export      CSV Export
src/components                  UI und Layout
src/features                    Auth, Admin, PlayerNeed Logik
src/lib                         Supabase Clients, Auth Guards, Utils
src/types                       Domain- und Supabase-Typen
supabase/migrations             Schema, RLS, Policies
supabase/tests/access.sql       Zugriffstests (wer sieht/ändert was), laufen in CI
scripts/test-db-local.sh        Migrationen + Zugriffstests gegen lokales Postgres
supabase/seed.sql               Beispielvereine und Beispielbedarfe
supabase/clubs-2026-27.sql      Reale Clubs der Ziel-Ligen für 2026/27
supabase/remove-old-demo-clubs.sql Sicheres Entfernen alter Demo-Vereine
```

## Lokales Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=...
```

`NEXT_PUBLIC_SITE_URL` ist lokal hilfreich. Auf Vercel kann die App automatisch `VERCEL_PROJECT_PRODUCTION_URL` oder `VERCEL_URL` verwenden, wenn System Environment Variables aktiviert sind.

`SUPABASE_SERVICE_ROLE_KEY` wird nur serverseitig für `Admin > Nutzer anlegen`, `Einladung senden`, `Zugang revoken` und `Verein löschen` verwendet.

## Supabase Setup

1. Supabase-Projekt erstellen.
2. SQL aus `supabase/migrations/0001_init.sql` ausführen.
3. SQL aus `supabase/migrations/0002_add_third_league_staffeln.sql` ausführen.
4. SQL aus `supabase/migrations/0003_admin_productivity.sql` ausführen.
5. SQL aus `supabase/migrations/0004_remove_saved_admin_filters.sql` ausführen.
6. SQL aus `supabase/migrations/0005_add_international_top_leagues.sql` ausführen.
7. SQL aus `supabase/migrations/0006_club_logos.sql` ausführen.
8. SQL aus `supabase/migrations/0007_agency_access.sql` ausführen.
9. SQL aus `supabase/migrations/0008_need_profile_v2.sql` ausführen.
10. SQL aus `supabase/migrations/0009_drop_legacy_position.sql` ausführen.
10a. `0010_security_hardening.sql`, `0011_flexible_seasons.sql` und `0012_roster_players.sql` ausführen.
11. Reale Clubs für 2026/27 mit `supabase/clubs-2026-27.sql` laden.
12. Optional Beispielbedarfe mit `supabase/seed.sql` laden.
13. Optional alte Demo-Vereine mit `supabase/remove-old-demo-clubs.sql` entfernen.
14. Ersten Auth-User in Supabase Auth erstellen.
15. `supabase/bootstrap-admin.sql` mit der Auth-User-UUID ausführen.
16. Danach können weitere Club, Agency und Admin User im Admin-Bereich angelegt oder eingeladen werden.

Wenn `0001_init.sql` frisch aus dieser Version ausgeführt wird, sind die vier 3.-Liga-Staffeln, die internationalen Erstliga-Enums und die Agency-Rolle bereits enthalten. `0002_add_third_league_staffeln.sql`, `0005_add_international_top_leagues.sql` und `0007_agency_access.sql` sind vor allem für bestehende Supabase-Projekte gedacht. `0008` und `0009` sind für alle Projekte nötig.

`0008_need_profile_v2.sql` und `0009_drop_legacy_position.sql` ersetzen die Einzelposition durch Angriffspositionen und Abwehrpositionen 1–6 und werden in zwei Schritten ausgerollt:

1. `0008` vor dem Deployment ausführen. Die Migration ist rückwärtskompatibel: Die alte Spalte `position` bleibt bestehen und wird per Trigger mit den neuen Spalten synchron gehalten, sodass der bisher deployte App-Stand weiterläuft. Bestehende Bedarfe mit TW/LA/RL/RM/RR/RA/KM werden übernommen. Bedarfe mit `Universalspieler` oder `Abwehrspezialist` haben danach keine Position und werden in der App als „Position fehlt“ markiert; Abwehrspezialisten erhalten den Spielertyp „Abwehrstark“.
2. Den neuen App-Stand deployen.
3. Erst danach `0009` ausführen. Sie entfernt `position` und den Sync-Trigger; ältere App-Stände laufen danach nicht mehr.

Für Einladungen muss Supabase Auth die App-URLs als Redirect URLs erlauben, inklusive `/auth/confirm`. Für Vercel Previews sollte z.B. `https://*.vercel.app/**` erlaubt sein.

## Tests und CI

Jeder Pull Request durchläuft automatisch (`.github/workflows/ci.yml`):

- Typecheck, Lint und Production Build
- Alle Migrationen auf einem echten lokalen Supabase-Stack (`supabase db start`) plus `supabase/tests/access.sql`. Die Zugriffstests prüfen u.a., dass Verein A den Kader von Verein B weder sehen noch ändern kann und dass Agenturen und Admins keinen Kader sehen.

Lokal ohne Docker: `PGHOST=... PGUSER=postgres scripts/test-db-local.sh` gegen einen beliebigen Postgres-Server.

`.github/workflows/visual-preview.yml` rendert die Kader-Seiten mit fiktiven Beispieldaten und legt Screenshots im Branch `visual-previews` ab.

## Kader (intern)

- Tab „Kader“ für Club User: Spieler mit Name, Rückennummer, Haupt- und Nebenpositionen, Abwehrpositionen 1–6 und Vertragsende (Saisonende, 30.06.).
- Taktiktafel (Angriff und Abwehr 6:0) zeigt pro Saison, wie viele Spieler je Position unter Vertrag stehen: Besetzt (2+), Dünn (1 oder nur Aushilfe), Lücke.
- „Handlungsbedarf“ listet Lücken der gewählten Saison; „Bedarf anlegen“ öffnet das Bedarfsformular mit Position und Saison vorausgefüllt.
- Saisonplanung: Positionen × aktuelle und nächste zwei Saisons.
- Datenschutz: `public.roster_players` ist ausschließlich für Nutzer des eigenen Vereins lesbar und schreibbar. Es gibt bewusst keine Policy für Admins oder Agenturen und keinen Audit-Trigger (Audit Logs sind für Admins lesbar). Alle Nutzer eines Vereins sehen und bearbeiten denselben Kader.

## Sicherheit

- `public.clubs`, `public.users` und `public.player_needs` haben RLS aktiviert.
- `public.admin_notes` und `public.audit_logs` haben ebenfalls RLS aktiviert.
- `public.roster_players` (Kader) ist nur für Nutzer des eigenen Vereins sichtbar, nicht für KW Sports Admins oder Agenturen.
- `public.player_need_confidential` (vertrauliche Info pro Bedarf) ist nur für Admins und den eigenen Verein lesbar und schreibbar. Agency User haben keine Policy und sehen das Feld nicht.
- `public.agency_count()` liefert Clubs und Admins nur die aggregierte Anzahl der Agenturen, ohne Zugriff auf `public.users`.
- Club User sehen nur ihren eigenen Verein.
- Club User sehen, erstellen und bearbeiten nur `player_needs` mit ihrer eigenen `club_id`.
- Agency User sehen alle Clubs und alle `player_needs` mit Details nur lesend.
- Agency User haben keinen Zugriff auf Admin-Notizen, Audit Logs, Exporte, Nutzerverwaltung, Club-Verwaltung oder Bedarf-Erstellung/-Bearbeitung.
- Admins dürfen alle Clubs, Nutzer, Bedarfe, Notizen und Audit Logs sehen bzw. bearbeiten.
- Geschützte Next.js-Routen prüfen serverseitig das Profil aus `public.users`.
- CSV- und Excel-Export prüfen ebenfalls serverseitig die Admin-Rolle.

## Produktivitätserweiterungen

- Bedarfe für Spieler oder Trainer, mit mehreren Angriffspositionen, Abwehrpositionen 1–6, Spielertyp, anvisierter Rolle und Sprachkenntnissen.
- Admin Visual Summary mit Angriffs- und Abwehrpositionen, Ligen, Prioritäten, Saisons, Status und Datenfrische.
- Admin Filter nach Land, Liga, Saison, Art, Angriffsposition, Abwehrbereich, Status und Priorität.
- Anzahl Agenturen mit Zugriff im Club- und Admin-Dashboard.
- Agency Dashboard mit denselben Filtern, Kennzahlen und Detailansichten im Read-only Modus.
- Interne Admin-Notizen pro Bedarf.
- Audit Log für Bedarf-Erstellungen, Änderungen und Löschungen.
- Club Dashboard mit Duplizieren, Statusnotiz und Pflegehinweis.
- Club Detailseite mit KPIs, Profil-Vollständigkeit und letzter Aktualisierung.
- Excel Export mit fixierter Kopfzeile, Autofilter und Spaltenbreiten.
- Supabase-Einladungen für Club, Agency und Admin User, sofern Auth E-Mail/SMTP konfiguriert ist.
- Admins können Vereinszugänge widerrufen und Vereine inklusive Zugängen löschen.

## Wichtige Routen

- `/login`
- `/set-password`
- `/auth/confirm`
- `/auth/callback`
- `/club`
- `/club/needs/new`
- `/club/needs/[id]/edit`
- `/agency`
- `/agency/needs/[id]`
- `/admin`
- `/admin/needs/[id]`
- `/admin/needs/[id]/edit`
- `/admin/clubs/[id]`
- `/admin/users`
- `/admin/export`
- `/admin/export/xlsx`

## Reale Clubdaten

`supabase/clubs-2026-27.sql` enthält:

- 18 Teams der 1. Bundesliga
- 18 Teams der 2. Bundesliga
- 64 Teams der 3. Liga
- 3. Liga aufgeteilt in Nord-West, Nord-Ost, Süd-West und Süd
- 16 Teams der französischen Starligue
- 14 Teams der dänischen Håndboldligaen
- 16 Teams der spanischen Liga ASOBAL
- 10 Teams der Schweizer Quickline Handball League

Die Datei ist idempotent: Sie kann erneut ausgeführt werden und aktualisiert vorhandene Club-Zeilen über feste UUIDs.

Wichtig: Clubs werden dabei nicht gelöscht. Weil `player_needs.club_id` in der Datenbank per `on delete cascade` auf `clubs` zeigt, setzt die Datei Vereine, die aus den Ziel-Ligen herausfallen, nur auf die Liga `Andere`. Dadurch bleiben echte Bedarfe und Nutzerzuordnungen erhalten.

## Deployment

Die App ist für Vercel oder jedes Next.js-kompatible Hosting vorbereitet.

```bash
npm run build
npm run start
```

Für Vercel:

1. Repository importieren.
2. Supabase-Umgebungsvariablen setzen.
3. In Vercel `Settings > Environment Variables` die Option `Automatically expose System Environment Variables` aktivieren.
4. Optional `NEXT_PUBLIC_SITE_URL` auf die finale Produktionsdomain setzen. Ohne diese Variable nutzt die App automatisch Vercel-Systemvariablen.
5. Supabase Auth URL Configuration auf die Produktionsdomain setzen.
6. Build Command: `npm run build`
7. Output: Next.js Standard

Produktionsvariablen:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=https://deine-domain.de # optional auf Vercel
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Vor dem Go-live:

- Alle Migrationen im Production-Supabase-Projekt ausführen.
- `clubs-2026-27.sql` ausführen.
- Admin-Auth-User erstellen und `bootstrap-admin.sql` ausführen.
- In Supabase Auth die Produktionsdomain als Site URL und Redirect URL eintragen, inklusive `/set-password` und `/auth/callback`.
- Service Role Key nur als Server-Environment-Variable im Hosting speichern.

## MVP-Grenzen

Dieses MVP ist bewusst keine Spielerplattform, kein Marktplatz und kein Matching-System. Es speichert ausschließlich Vereinsbedarfe und macht diese intern für KW Sports auswertbar.
