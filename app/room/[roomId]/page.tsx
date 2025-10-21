"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { onValue, ref } from "firebase/database";
import { db } from "@/app/config/firebase";

import Lobby from "@/components/Lobby";
import Battle from "@/components/Battle";
import { LoaderCircle, Music4 } from "lucide-react";

export type Track = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  popularity: number;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setCurrentUser(storedUser);

    if (!roomId) {
      setLoading(false);
      return;
    }

    const roomRef = ref(db, `rooms/${roomId as string}`);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRoomData(snapshot.val());
        } else {
          setRoomData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase data error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);
  
  const gameState = useMemo(() => {
    if (!roomData) return "loading";

    const players = Object.values(roomData.players || {});
    const allReady = players.length >= 2 && players.every((p: any) => p.isReady);
    
    if (allReady && roomData.status === 'battling') {
      return "battle";
    }
    
    if(roomData.status === 'finished'){
        return 'finished'
    }

    return "lobby";
  }, [roomData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="relative">
          <Music4 size={64} className="text-green-400 animate-pulse" />
          <div className="absolute -inset-4 bg-green-400/20 rounded-full animate-ping"></div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-audiowide mb-2">ENTERING BATTLE ARENA</p>
          <p className="text-gray-400 font-exo">Preparing your music showdown...</p>
        </div>
        <LoaderCircle className="animate-spin text-green-400" size={32} />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-8 text-center">
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold font-audiowide text-red-400 mb-4">ARENA NOT FOUND</h1>
          <p className="text-gray-300 font-exo">
            This battle arena has been closed or doesn't exist. Return to the main menu to create a new battle.
          </p>
        </div>
      </div>
    );
  }

  switch (gameState) {
    case "lobby":
      return <Lobby roomData={roomData} currentUser={currentUser} roomId={roomId as string} />;
    case "battle":
    case "finished":
      return <Battle roomData={roomData} currentUser={currentUser} roomId={roomId as string} />;
    default:
      return null;
  }
}