import { db } from "@/app/config/firebase";
import { ref, get, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomId, username, songData } = await req.json();

    if (!roomId || !username || !songData) {
      return NextResponse.json(
        { error: "Room ID, username, and song data are required" },
        { status: 400 }
      );
    }

    const playerRef = ref(db, `rooms/${roomId}/players/${username}`);

    // Get the current player's data
    const snapshot = await get(playerRef);
    let currentSongs: any[] = [];

    if (snapshot.exists()) {
      const playerData = snapshot.val();

      // Ensure `currentSongs` is always an array
      currentSongs = Array.isArray(playerData.selectedSongs)
        ? playerData.selectedSongs
        : playerData.selectedSongs
        ? Object.values(playerData.selectedSongs) // if somehow stored as object, convert to array
        : [];
    }

    // Check if song is already selected
    const alreadySelected = currentSongs.some(
      (song: any) => song.id === songData.id
    );

    if (alreadySelected) {
      return NextResponse.json(
        { error: "Song already selected" },
        { status: 400 }
      );
    }

    // Add the new song to the array
    const updatedSongs = [...currentSongs, songData];

    // Save back to Firebase under "selectedSongs" (always an array now)
    await update(playerRef, {
      selectedSongs: updatedSongs,
    });

    return NextResponse.json(
      { message: "Song added successfully", selectedSongs: updatedSongs },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error selecting song:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
