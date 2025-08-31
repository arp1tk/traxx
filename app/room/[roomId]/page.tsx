"use client";

import { db } from "@/app/config/firebase";
import { onValue, ref } from "firebase/database";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
 
    const roomRef = ref(db, `rooms/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoomData(snapshot.val());
      } else {
        setRoomData(null);
      }
  })
   return () => unsubscribe();
   setLoading(false);
},);

 

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-bold">🎵 Welcome to Room</h1>
      <p className="mt-2 text-lg">Room ID: {roomId}</p>

      <div className="mt-6 p-4 border rounded-lg bg-gray-900 w-96">
        <h2 className="text-xl font-semibold mb-2">Room Details</h2>
        <p><strong>Host:</strong> {roomData?.host}</p>
        <p><strong>Status:</strong> {roomData?.status}</p>
        <p><strong>Created At:</strong> {new Date(roomData?.createdAt).toLocaleString()}</p>
        <p><strong>Players:</strong></p>
        <ul className="list-disc pl-5">
          {Object.keys(roomData?.players || {}).map((player) => (
            <li key={player}>
              {player} — Score: {roomData.players[player].score}, songs:{roomData.players[player].selectedsongs}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
