import { db } from "@/app/config/firebase";
import { ref, update, get } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { roomId } = await req.json();

        const roomRef = ref(db, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) return NextResponse.json({ error: "Room not found" }, { status: 404 });
        
        const roomData = snapshot.val();
        const lastWinner = roomData.currentRound?.result?.winner;
        const host = roomData.host;

        const updates: any = {};
        updates['/currentRound'] = { playedCards: {} }; // Reset the round
        updates['/roundNumber'] = (roomData.roundNumber || 1) + 1;
        
        // The winner of the last round goes first in the next, or host on a draw
        updates['/currentPlayerTurn'] = (lastWinner !== 'draw' ? lastWinner : host); 

        await update(roomRef, updates);

        return NextResponse.json({ message: "Next round started" });

    } catch (error: any) {
        console.error("Next round error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}