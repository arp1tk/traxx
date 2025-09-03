import { NextRequest, NextResponse } from "next/server";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

if (!client_id || !client_secret) {
  throw new Error("Missing Spotify credentials in .env.local");
}

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const SEARCH_ENDPOINT = `https://api.spotify.com/v1/search`;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  return response.json();
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const { access_token } = await getAccessToken();

    const searchResponse = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
        console.error("Spotify Search API Error:", searchData);
        throw new Error(searchData.error?.message || "Failed to search for tracks");
    }
    
    if (!searchData.tracks || searchData.tracks.items.length === 0) {
        return NextResponse.json([]);
    }

    // Simplify the track data without calling the audio features endpoint
    const simplifiedTracks = searchData.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((_artist: any) => _artist.name).join(", "),
        imageUrl: track.album.images[0]?.url,
        popularity: track.popularity, // Popularity is available from the search endpoint
    }));

    return NextResponse.json(simplifiedTracks);

  } catch (error: any) {
    console.error("!!! CRASH IN /api/spotify/search:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}