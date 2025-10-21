"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music4, Swords, Users, Sparkles } from "lucide-react";

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!username.trim()) return alert("Please enter a username.");
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        localStorage.setItem("user", username);
        router.push(`/room/${data.roomId}`);
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomId.trim()) {
      return alert("Please enter a username and Room ID.");
    }
    setIsJoining(true);
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roomId }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", username);
        router.push(`/room/${data.roomId}`);
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <Music4 size={80} className="mx-auto text-green-400 mb-4 animate-float" />
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-ping" size={20} />
          </div>
          <h1 className="text-6xl font-bold mt-4 bg-gradient-to-r from-green-400 via-purple-500 to-green-400 bg-clip-text text-transparent font-audiowide tracking-tighter">
            Traxx
          </h1>
          <p className="text-xl text-gray-300 mt-4 font-exo max-w-md mx-auto">
            Battle with your favorite tracks in the ultimate music showdown
          </p>
        </div>

        <div className="w-full max-w-md bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-green-400 font-orbitron tracking-wide">
              ENTER THE ARENA
            </h2>
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300 font-exo">YOUR NICKNAME</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your battle name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-exo placeholder-gray-400"
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating || !username.trim()}
                className="w-full flex items-center justify-center gap-3 p-4 font-bold bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25 font-orbitron tracking-wide group"
              >
                <Swords size={20} className="group-hover:animate-pulse" />
                {isCreating ? "CREATING BATTLE..." : "CREATE NEW ARENA"}
              </button>
            </div>

            <div className="flex items-center text-gray-500 my-6">
              <hr className="flex-grow border-gray-600"/>
              <span className="px-4 text-sm font-exo">OR JOIN EXISTING</span>
              <hr className="flex-grow border-gray-600"/>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="roomId" className="text-sm font-medium text-gray-300 font-exo">ARENA CODE</label>
                <input
                  id="roomId"
                  type="text"
                  placeholder="Enter battle code..."
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-exo placeholder-gray-400 tracking-wide"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || !username.trim() || !roomId.trim()}
                className="w-full flex items-center justify-center gap-3 p-4 font-bold bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl hover:from-blue-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 font-orbitron tracking-wide group"
              >
                <Users size={20} className="group-hover:animate-bounce" />
                {isJoining ? "ENTERING ARENA..." : "JOIN BATTLE"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm font-exo">
            Choose your tracks wisely. Popularity is power.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </main>
  );
}