import { db } from "@/app/config/firebase";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    if (!username) return Response.json({ error: "Username is required" }, { status: 400 });

    const roomId = uuidv4().slice(0, 6).toUpperCase();
    await set(ref(db, `rooms/${roomId}`), {
      host: username,
      players: {
        [username]: { 
          score: 0, 
          selectedSongs: [], 
          remainingSongs: [], // Will hold the hand during battle
          isReady: false 
        },
      },
      status: "lobby",
      createdAt: Date.now(),
    });

    return Response.json({ roomId, message: "Room created" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}