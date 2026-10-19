import { NextResponse } from 'next/server';
import { isMoodId, type MoodId } from '@/app/lib/moods';

// Token cache
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });
  const { access_token, expires_in } = await res.json();
  cachedToken = access_token;
  tokenExpiry = Date.now() + expires_in * 1000 - 60000;
  return cachedToken;
}

// Mood to IGDB query mapping, keyed by MoodId. Adding a mood to
// app/lib/moods.ts without giving it a query here is a compile error.
const moodQueries: Record<MoodId, string> = {
  cozy:
    "rating_count > 20 & keywords = (1387,1430,2084,17495,19396,23931,24685,45515,46955,47482,57715) & rating > 75",
  intense: "rating_count > 20 & genres = (4,5,10,25) & rating > 75",
  spooky: "rating_count > 20 & themes = (19,20,21,43) & rating > 75",
  story:
    "rating_count > 20 & (genres = (2,12,31,34) | themes = (17,18,22,31,43)) & themes != 42 & rating > 75",
  social: "rating_count > 20 & game_modes = (2,3,5,6) & rating > 75",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('mood');
  const mood: MoodId = isMoodId(requested) ? requested : 'cozy';

  const token = await getAccessToken();
  const headers = {
    'Client-ID': process.env.TWITCH_CLIENT_ID!,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'text/plain',
  };

  const whereClause = moodQueries[mood];

  // Fetch games
  const gamesRes = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers,
    // Expanded fields return names instead of IDs, so the detail screen
    // needs no extra lookups: rating, first_release_date, involved_companies,
    // platforms.
    body: `fields name, rating, summary, cover, first_release_date, platforms.abbreviation, platforms.name, involved_companies.developer, involved_companies.company.name; where ${whereClause}; limit 10; sort rating desc;`,
  });
  const games = await gamesRes.json();
  if (!Array.isArray(games)) {
    return NextResponse.json([]);
  }

  // Fetch covers
  const coverIds = games.map((g: any) => g.cover).filter(Boolean);
  let coverMap: Record<number, string> = {};

  if (coverIds.length > 0) {
    const coversRes = await fetch('https://api.igdb.com/v4/covers', {
      method: 'POST',
      headers,
      body: `fields id, url; where id = (${coverIds.join(',')});`,
    });
    const covers = await coversRes.json();
    coverMap = Object.fromEntries(
      covers.map((c: any) => [
        c.id,
        c.url.replace('t_thumb', 't_cover_big').replace('//', 'https://'),
      ])
    );
  }

  // Merge cover URLs and flatten the Game Info fields
  const enriched = games.map((g: any) => ({
    id: g.id,
    name: g.name,
    summary: g.summary,
    rating: g.rating,
    coverUrl: g.cover ? coverMap[g.cover] : null,
    year: g.first_release_date
      ? new Date(g.first_release_date * 1000).getUTCFullYear()
      : null,
    developer:
      g.involved_companies?.find((c: any) => c.developer)?.company?.name ?? null,
    platformNames: (g.platforms ?? []).map(
      (p: any) => p.abbreviation ?? p.name
    ),
  }));

  return NextResponse.json(enriched);
}