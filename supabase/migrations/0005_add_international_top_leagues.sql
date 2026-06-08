alter type public.club_league add value if not exists 'Starligue';
alter type public.club_league add value if not exists 'Håndboldligaen';
alter type public.club_league add value if not exists 'Liga ASOBAL';
alter type public.club_league add value if not exists 'Quickline Handball League';

create index if not exists clubs_country_idx on public.clubs (country);
