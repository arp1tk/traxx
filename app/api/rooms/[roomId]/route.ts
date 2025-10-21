import { db } from "@/app/config/firebase";
import { get, ref } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

// ✅ Use the correct Next.js types
interface RoomParams {
  roomId: string;
}

// ✅ Proper typing for Next.js 14+
type RouteContext = {
  params: RoomParams;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<RoomParams> }
) {
  try {
    // ✅ Await the params in Next.js 14+
    const { roomId } = await context.params;

    if (!roomId) {
      return NextResponse.json(
        { error: "No room ID provided" },
        { status: 400 }
      );
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Fetched successfully",
      room: snapshot.val(),
    });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}