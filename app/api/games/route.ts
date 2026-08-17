import { NextResponse } from 'next/server';

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

// Mood to IGDB query mapping
const moodQueries: Record<string, string> = {
  cozy:        'rating_count > 20 & keywords = (4725,399,3489) & rating > 75',
  intense:     'rating_count > 20 & genres = (5) & rating > 75',   // genre 5 = shooter
  indie:       'rating_count > 20 & genres = (32) & rating > 80',
  multiplayer: 'rating_count > 20 & game_modes = (2,3) & rating > 75',
  story:       'rating_count > 20 & genres = (12) & rating > 85',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood') || 'cozy';

  const token = await getAccessToken();
  const headers = {
    'Client-ID': process.env.TWITCH_CLIENT_ID!,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'text/plain',
  };

  const whereClause = moodQueries[mood] || moodQueries.cozy;

  // Fetch games
  const gamesRes = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers,
    body: `fields name, genres, rating, summary, cover; where ${whereClause}; limit 10; sort rating desc;`,
  });
  const games = await gamesRes.json();

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

  // Merge cover URLs into games
  const enriched = games.map((g: any) => ({
    ...g,
    coverUrl: g.cover ? coverMap[g.cover] : null,
  }));

  return NextResponse.json(enriched);
}