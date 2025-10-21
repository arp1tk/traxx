import { db } from "@/app/config/firebase";
import { ref, set, get, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomId, username } = await req.json();
    if (!roomId || !username) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    
    // Set player to ready
    await set(ref(db, `rooms/${roomId}/players/${username}/isReady`), true);
    
    // Check if ALL players are now ready
    const roomData = snapshot.val();
    const players = roomData.players;
    players[username].isReady = true; // Manually update for the check
    
    const allPlayersReady = Object.values(players).every((p: any) => p.isReady);
    const playerCount = Object.keys(players).length;

    // If 2 players are in and all are ready, start the game
    if (playerCount === 2 && allPlayersReady) {
        const updates: any = {};
        updates[`/status`] = "battling";
        updates[`/roundNumber`] = 1;
        updates[`/currentPlayerTurn`] = roomData.host; // Host goes first
        updates[`/currentRound`] = { playedCards: {} };
        
        // Copy selectedSongs to remainingSongs for the battle
        Object.keys(players).forEach(playerName => {
            updates[`/players/${playerName}/remainingSongs`] = players[playerName].selectedSongs || [];
        });

        await update(roomRef, updates);
    }

    return NextResponse.json({ message: "Player is ready" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}