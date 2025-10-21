import { db } from "@/app/config/firebase";
import { ref, get, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { roomId, username } = await req.json();
        if (!roomId || !username) {
            return NextResponse.json({ error: "Room ID and username are required" }, { status: 400 });
        }

        const roomRef = ref(db, `rooms/${roomId}`);
        
        // 1. Set the current player's 'wantsRematch' flag to true
        await update(ref(db, `rooms/${roomId}/players/${username}`), {
             wantsRematch: true 
        });

        // 2. Check if the other player also wants a rematch
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const roomData = snapshot.val();
        const players = roomData.players;

        const allPlayersWantRematch = Object.values(players).every((p: any) => p.wantsRematch === true);

        // 3. If all players (assuming 2) want a rematch, reset the game
        if (Object.keys(players).length === 2 && allPlayersWantRematch) {
            
            const updates: any = {};
            
            // Reset top-level game state
            updates['/status'] = 'lobby'; // This will send players back to the Lobby component
            updates['/currentRound'] = null;
            updates['/currentPlayerTurn'] = null;
            updates['/roundNumber'] = null;

            // Reset each player's state to the default
            Object.keys(players).forEach(playerName => {
                updates[`/players/${playerName}/score`] = 0;
                updates[`/players/${playerName}/selectedSongs`] = [];
                updates[`/players/${playerName}/remainingSongs`] = [];
                updates[`/players/${playerName}/isReady`] = false;
                updates[`/players/${playerName}/wantsRematch`] = false; // Reset the flag
            });

            // Apply all updates at once
            await update(roomRef, updates);
            
            return NextResponse.json({ message: "Rematch starting!" });
        }

        // If only one player has requested, just confirm and wait
        return NextResponse.json({ message: "Waiting for opponent to accept rematch." });

    } catch (error: any) {
        console.error("Rematch error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}