import { db } from "@/app/config/firebase";
import { ref, get, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { roomId, username, songData } = await req.json();

        const roomRef = ref(db, `rooms/${roomId}`);
        let snapshot = await get(roomRef);
        if (!snapshot.exists()) return NextResponse.json({ error: "Room not found" }, { status: 404 });

        let roomData = snapshot.val();
        
        // 1. Play the card
        const updates: any = {};
        updates[`/currentRound/playedCards/${username}`] = songData;
        
        // 2. Remove card from player's hand
        const playerHand: any[] = roomData.players[username].remainingSongs || [];
        const newHand = playerHand.filter(song => song.id !== songData.id);
        updates[`/players/${username}/remainingSongs`] = newHand;

        // 3. Switch turns
        const playerNames = Object.keys(roomData.players);
        const otherPlayer = playerNames.find(p => p !== username) as string;
        updates[`/currentPlayerTurn`] = otherPlayer;
        
        await update(roomRef, updates);
        
        // 4. Check if the round is now complete and resolve it
        snapshot = await get(roomRef); // Re-fetch data after update
        roomData = snapshot.val();
        
        const playedCards = roomData.currentRound?.playedCards || {};
        if (Object.keys(playedCards).length === 2) {
            const myCard = playedCards[username];
            const opponentCard = playedCards[otherPlayer];

            let winner = 'draw';
            let winningCard = myCard;
            let losingCard = opponentCard;

            if (myCard.popularity > opponentCard.popularity) {
                winner = username;
            } else if (opponentCard.popularity > myCard.popularity) {
                winner = otherPlayer;
                winningCard = opponentCard;
                losingCard = myCard;
            }

            const roundResultUpdates: any = {};
            if(winner !== 'draw') {
                const winnerCurrentScore = roomData.players[winner].score || 0;
                roundResultUpdates[`/players/${winner}/score`] = winnerCurrentScore + 1;
            }
            roundResultUpdates[`/currentRound/result`] = { winner, winningCard, losingCard };
            
            // Check for game over
            const myRemainingCards = newHand.length;
            const opponentRemainingCards = roomData.players[otherPlayer].remainingSongs?.length || 0;
            if (myRemainingCards === 0 && opponentRemainingCards === 0) {
                 roundResultUpdates[`/status`] = 'finished';
            }

            await update(roomRef, roundResultUpdates);
        }

        return NextResponse.json({ message: "Card played successfully" });

    } catch (error: any) {
        console.error("Play card error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}