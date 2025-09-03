"use client";

import { db } from "@/app/config/firebase";
import { onValue, ref } from "firebase/database";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Track = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  popularity: number;
  duration_ms: number;
  danceability?: number;
  energy?: number;
  tempo?: number;
  valence?: number;
  acousticness?: number;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch room data in real-time from Firebase
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setCurrentUser(storedUser);

    if (!roomId) {
      setLoading(false);
      return;
    }

    const roomRef = ref(db, `rooms/${roomId}`);
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

  // Search songs via API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${searchQuery}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed");

      setSearchResults(data);
    } catch (error) {
      console.error("Failed to search songs:", error);
      alert("Failed to search for songs.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select a song and save in Firebase
  const handleSelectSong = async (track: Track) => {
    if (!currentUser) {
      alert("Could not identify user. Please try rejoining the room.");
      return;
    }

    try {
      const res = await fetch("/api/rooms/select-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          username: currentUser,
          songData: track,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to select song");

      alert("Song added!");
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error selecting song:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-xl">Loading Room...</p>
      </div>
    );
  }

  // Room not found
  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500">
        <p className="text-xl">Error: Room not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-4 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">🎵 Welcome to Room</h1>
        <p className="mt-2 text-lg text-gray-400">Room ID: {roomId}</p>
      </div>

      {/* Search Songs */}
      <div className="w-full max-w-md">
        <h3 className="text-2xl font-semibold mb-2">Select Your Song</h3>
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded-l-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter song name..."
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-green-600 px-4 py-2 rounded-r-md hover:bg-green-700 disabled:bg-gray-500 font-semibold"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>

        {/* Search Results */}
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-2 bg-gray-900 rounded-md"
            >
              <div className="flex items-center overflow-hidden">
                <img
                  src={track.imageUrl}
                  alt={track.name}
                  className="w-12 h-12 rounded-md flex-shrink-0"
                />
                <div className="ml-3 truncate">
                  <p className="font-bold truncate">{track.name}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  <p className="text-xs text-gray-500">Popularity: {track.popularity}</p>
                </div>
              </div>
              <button
                onClick={() => handleSelectSong(track)}
                className="bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 text-sm font-semibold flex-shrink-0"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Players Section */}
      <div className="w-full max-w-md p-4 border rounded-lg bg-gray-900">
        <h2 className="text-xl font-semibold mb-4">Players in Room</h2>
        <ul className="space-y-4">
          {Object.keys(roomData?.players || {}).map((player) => {
            const playerData = roomData.players[player];

            // Always ensure selectedSongs is an array
            const selectedSongs: Track[] = Array.isArray(playerData.selectedSongs)
              ? playerData.selectedSongs
              : playerData.selectedSongs
              ? Object.values(playerData.selectedSongs)
              : [];

            return (
              <li key={player} className="border-b border-gray-700 pb-3">
                <span className="font-bold">{player}</span> — Score: {playerData.score}
                {selectedSongs.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedSongs.map((song: Track) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg"
                      >
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          className="w-10 h-10 rounded-md"
                        />
                        <div className="truncate">
                          <p className="text-sm font-semibold truncate">{song.name}</p>
                          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                          <p className="text-xs text-gray-500">Popularity: {song.popularity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">No songs selected yet</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
