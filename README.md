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
  (protected)/admin             Admin Dashboard
  (protected)/admin/needs       Bedarf Detail/Edit
  (protected)/admin/clubs       Vereinsdetail
  (protected)/admin/users       Vereinsnutzer verwalten
  (protected)/admin/export      CSV Export
src/components                  UI und Layout
src/features                    Auth, Admin, PlayerNeed Logik
src/lib                         Supabase Clients, Auth Guards, Utils
src/types                       Domain- und Supabase-Typen
supabase/migrations             Schema, RLS, Policies
supabase/seed.sql               Beispielvereine und Beispielbedarfe
supabase/real-clubs-2025-26.sql Reale Clubs der 1., 2. und 3. Liga 2025/26
supabase/international-clubs-2025-26.sql Reale Erstliga-Clubs aus FR, DK, ES und CH 2025/26
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
7. Reale deutsche Clubs mit `supabase/real-clubs-2025-26.sql` laden.
8. Reale internationale Clubs mit `supabase/international-clubs-2025-26.sql` laden.
9. Optional Beispielbedarfe mit `supabase/seed.sql` laden.
10. Optional alte Demo-Vereine mit `supabase/remove-old-demo-clubs.sql` entfernen.
11. Ersten Auth-User in Supabase Auth erstellen.
12. `supabase/bootstrap-admin.sql` mit der Auth-User-UUID ausführen.
13. Danach können weitere Club User im Admin-Bereich angelegt oder eingeladen werden.

Wenn `0001_init.sql` frisch aus dieser Version ausgeführt wird, sind die vier 3.-Liga-Staffeln und die internationalen Erstliga-Enums bereits enthalten. `0002_add_third_league_staffeln.sql` und `0005_add_international_top_leagues.sql` sind vor allem für bestehende Supabase-Projekte gedacht.

## Sicherheit

- `public.clubs`, `public.users` und `public.player_needs` haben RLS aktiviert.
- `public.admin_notes` und `public.audit_logs` haben ebenfalls RLS aktiviert.
- Club User sehen nur ihren eigenen Verein.
- Club User sehen, erstellen und bearbeiten nur `player_needs` mit ihrer eigenen `club_id`.
- Admins dürfen alle Clubs, Nutzer, Bedarfe, Notizen und Audit Logs sehen bzw. bearbeiten.
- Geschützte Next.js-Routen prüfen serverseitig das Profil aus `public.users`.
- CSV- und Excel-Export prüfen ebenfalls serverseitig die Admin-Rolle.

## Produktivitätserweiterungen

- Admin Visual Summary mit Positionen, Ligen, Prioritäten, Saisons, Status und Datenfrische.
- Admin Filter nach Land, Liga, Saison, Position, Status und Priorität.
- Interne Admin-Notizen pro Bedarf.
- Audit Log für Bedarf-Erstellungen, Änderungen und Löschungen.
- Club Dashboard mit Duplizieren, Statusnotiz und Pflegehinweis.
- Club Detailseite mit KPIs, Profil-Vollständigkeit und letzter Aktualisierung.
- Excel Export mit fixierter Kopfzeile, Autofilter und Spaltenbreiten.
- Supabase-Einladungen für Vereinsnutzer, sofern Auth E-Mail/SMTP konfiguriert ist.
- Admins können Vereinszugänge widerrufen und Vereine inklusive Zugängen löschen.

## Wichtige Routen

- `/login`
- `/set-password`
- `/auth/callback`
- `/club`
- `/club/needs/new`
- `/club/needs/[id]/edit`
- `/admin`
- `/admin/needs/[id]`
- `/admin/needs/[id]/edit`
- `/admin/clubs/[id]`
- `/admin/users`
- `/admin/export`
- `/admin/export/xlsx`

## Reale Clubdaten

`supabase/real-clubs-2025-26.sql` enthält:

- 18 Teams der 1. Bundesliga
- 18 Teams der 2. Bundesliga
- 64 Teams der 3. Liga
- 3. Liga aufgeteilt in Nord-West, Nord-Ost, Süd-West und Süd

Die Datei ist idempotent: Sie kann erneut ausgeführt werden und aktualisiert vorhandene Club-Zeilen über feste UUIDs.

`supabase/international-clubs-2025-26.sql` enthält:

- 16 Teams der französischen Starligue
- 14 Teams der dänischen Håndboldligaen
- 16 Teams der spanischen Liga ASOBAL
- 10 Teams der Schweizer Quickline Handball League

Auch diese Datei ist idempotent und kann bei Bedarf erneut ausgeführt werden.

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
- `real-clubs-2025-26.sql` ausführen.
- `international-clubs-2025-26.sql` ausführen.
- Admin-Auth-User erstellen und `bootstrap-admin.sql` ausführen.
- In Supabase Auth die Produktionsdomain als Site URL und Redirect URL eintragen, inklusive `/set-password` und `/auth/callback`.
- Service Role Key nur als Server-Environment-Variable im Hosting speichern.

## MVP-Grenzen

Dieses MVP ist bewusst keine Spielerplattform, kein Marktplatz und kein Matching-System. Es speichert ausschließlich Vereinsbedarfe und macht diese intern für KW Sports auswertbar.
