"use client";

import { useParams } from "next/navigation";

export default function RoomPage() {
  const { roomId } = useParams();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-bold">🎵 Welcome to Room</h1>
      <p className="mt-2 text-lg">Room ID: {roomId}</p>
    </div>
  );
}
