import { NextResponse } from 'next/server';

export async function GET() {
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID!,
            client_secret: process.env.TWITCH_CLIENT_SECRET!,
            grant_type: 'client_credentials',
        }),
    });

    console.log('Client ID:', process.env.TWITCH_CLIENT_ID);
    console.log('Secret exists:', !!process.env.TWITCH_CLIENT_SECRET);

    const { access_token } = await tokenRes.json();

    const gamesRes = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID!,
            'Authorization': `Bearer ${access_token}`,
        },
        body: 'fields name, genres, rating, summary; limit 5;',
    });

    const games = await gamesRes.json();
    return NextResponse.json(games);
}