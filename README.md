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
9. Reale Clubs für 2026/27 mit `supabase/clubs-2026-27.sql` laden.
10. Optional Beispielbedarfe mit `supabase/seed.sql` laden.
11. Optional alte Demo-Vereine mit `supabase/remove-old-demo-clubs.sql` entfernen.
12. Ersten Auth-User in Supabase Auth erstellen.
13. `supabase/bootstrap-admin.sql` mit der Auth-User-UUID ausführen.
14. Danach können weitere Club, Agency und Admin User im Admin-Bereich angelegt oder eingeladen werden.

Wenn `0001_init.sql` frisch aus dieser Version ausgeführt wird, sind die vier 3.-Liga-Staffeln, die internationalen Erstliga-Enums und die Agency-Rolle bereits enthalten. `0002_add_third_league_staffeln.sql`, `0005_add_international_top_leagues.sql` und `0007_agency_access.sql` sind vor allem für bestehende Supabase-Projekte gedacht.

Für Einladungen muss Supabase Auth die App-URLs als Redirect URLs erlauben, inklusive `/auth/confirm`. Für Vercel Previews sollte z.B. `https://*.vercel.app/**` erlaubt sein.

## Sicherheit

- `public.clubs`, `public.users` und `public.player_needs` haben RLS aktiviert.
- `public.admin_notes` und `public.audit_logs` haben ebenfalls RLS aktiviert.
- Club User sehen nur ihren eigenen Verein.
- Club User sehen, erstellen und bearbeiten nur `player_needs` mit ihrer eigenen `club_id`.
- Agency User sehen alle Clubs und alle `player_needs` mit Details nur lesend.
- Agency User haben keinen Zugriff auf Admin-Notizen, Audit Logs, Exporte, Nutzerverwaltung, Club-Verwaltung oder Bedarf-Erstellung/-Bearbeitung.
- Admins dürfen alle Clubs, Nutzer, Bedarfe, Notizen und Audit Logs sehen bzw. bearbeiten.
- Geschützte Next.js-Routen prüfen serverseitig das Profil aus `public.users`.
- CSV- und Excel-Export prüfen ebenfalls serverseitig die Admin-Rolle.

## Produktivitätserweiterungen

- Admin Visual Summary mit Positionen, Ligen, Prioritäten, Saisons, Status und Datenfrische.
- Admin Filter nach Land, Liga, Saison, Position, Status und Priorität.
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
