"use client";

import { useState } from "react";
import { Track } from "@/app/room/[roomId]/page";
import { Crown, LoaderCircle, Music, Search, Send, Users, Check, Sparkles, Volume2 } from "lucide-react";

const PlayerCard = ({ name, data, isHost, isCurrentUser }: { name: string, data: any, isHost: boolean, isCurrentUser: boolean }) => {
    const songsPicked = data.selectedSongs?.length || 0;
    return (
        <div className={`p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 transition-all duration-300 hover:scale-105 ${isCurrentUser ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-700'} relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {isHost && <Crown size={20} className="text-yellow-400 animate-pulse" />}
                        <p className="font-bold text-lg font-orbitron tracking-wide">{name}{isCurrentUser && " (YOU)"}</p>
                    </div>
                    {data.isReady ? (
                         <span className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg">
                            <Check size={16}/> READY FOR BATTLE
                         </span>
                      ) : (
                         <span className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full animate-pulse">
                            <LoaderCircle size={16} className="animate-spin"/> SELECTING TRACKS
                         </span>
                      )}
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-exo">BATTLE TRACKS</span>
                        <span className="text-green-400 font-bold font-orbitron">{songsPicked} / 6</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-green-500/25"
                            style={{ width: `${(songsPicked / 6) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchResultCard = ({ track, onSelect, isSelected }: { track: Track, onSelect: (track: Track) => void, isSelected: boolean }) => (
     <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105 group ${
         isSelected ? 'bg-green-500/20 border-2 border-green-500' : 'bg-gray-800/50 hover:bg-gray-700/70'
     }`}>
        <div className="flex items-center gap-4 overflow-hidden flex-1">
            <div className="relative">
                <img src={track.imageUrl} alt={track.name} className="w-16 h-16 rounded-lg flex-shrink-0 shadow-lg" />
                {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                        <Check size={12} className="text-white" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate font-exo group-hover:text-green-400 transition-colors">{track.name}</p>
                <p className="text-sm text-gray-300 truncate">{track.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-full">
                        <Volume2 size={12} className="text-green-400" />
                        <span className="text-xs text-gray-300 font-exo">POWER</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-sm font-orbitron">{track.popularity}</span>
                </div>
            </div>
        </div>
        <button
            onClick={() => onSelect(track)}
            disabled={isSelected}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                isSelected 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-green-500/25'
            }`}
        >
            {isSelected ? <Check size={20} className="text-white" /> : <Check size={20} className="text-white" />}
        </button>
    </div>
)

export default function Lobby({ roomData, currentUser, roomId }: { roomData: any, currentUser: string | null, roomId: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSettingReady, setIsSettingReady] = useState(false);
    
    const me = currentUser ? roomData.players[currentUser] : null;
    const amIReady = me?.isReady || false;
    const mySongs = me?.selectedSongs || [];

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/spotify/search?q=${searchQuery}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleSelectSong = async (track: Track) => {
        if (!currentUser || mySongs.length >= 6) return;
        try {
            const res = await fetch("/api/rooms/select-song", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, username: currentUser, songData: track }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSearchResults([]);
            setSearchQuery("");
        } catch (error) {
            console.error("Error selecting song:", error);
            alert(error instanceof Error ? error.message : "An error occurred.");
        }
    };

    const handleReady = async () => {
        if (!currentUser || mySongs.length < 6) {
            return alert("You need 6 battle tracks to enter the arena!");
        }
        setIsSettingReady(true);
        try {
            await fetch("/api/rooms/set-ready", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, username: currentUser }),
            });
        } catch (error) {
            console.error("Error setting ready status:", error);
        } finally {
            setIsSettingReady(false);
        }
    };

    const allReady = Object.values(roomData.players || {}).every((p: any) => p.isReady);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute bottom-32 left-32 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-2000"></div>
            </div>

            <div className="relative z-10">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold font-audiowide bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
                            BATTLE LOBBY
                        </h1>
                        <p className="text-gray-400 font-exo mt-2">
                            Arena Code: <span className="font-mono bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700 font-orbitron tracking-widest">{roomId}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-700">
                        <Music size={28} className="text-green-400 animate-pulse"/>
                        <h1 className="text-2xl font-bold font-audiowide">Traxx</h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Players */}
                    <div className="lg:col-span-1 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 font-orbitron tracking-wide">
                            <Users size={24} className="text-green-400"/> WARRIORS
                        </h2>
                        <div className="space-y-4">
                            {Object.keys(roomData.players).map(name => (
                                <PlayerCard 
                                    key={name}
                                    name={name} 
                                    data={roomData.players[name]}
                                    isHost={roomData.host === name}
                                    isCurrentUser={currentUser === name}
                                />
                            ))}
                        </div>

                        {/* Ready Status */}
                        {allReady && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-center animate-pulse">
                                <p className="font-bold font-orbitron tracking-wide text-white">ALL WARRIORS READY!</p>
                                <p className="text-sm text-white/80 font-exo mt-1">Battle starting soon...</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Your Actions */}
                    <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl space-y-8">
                        {/* Your Battle Tracks */}
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 font-orbitron tracking-wide">
                                <Music size={24} className="text-green-400"/> YOUR BATTLE DECK ({mySongs.length}/6)
                            </h2>
                            {mySongs.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                    {mySongs.map((song: Track, index: number) => (
                                        <div key={song.id} className="relative group">
                                            <div className="aspect-square rounded-xl overflow-hidden shadow-2xl border-2 border-green-500/50 transition-all duration-300 group-hover:scale-110 group-hover:border-green-400">
                                                <img 
                                                    src={song.imageUrl} 
                                                    alt={song.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                                                    <div className="text-center w-full">
                                                        <p className="text-white text-xs font-bold font-exo leading-tight">{song.name}</p>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <span className="text-yellow-400 text-xs font-bold font-orbitron">{song.popularity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                                <span className="text-white text-xs font-bold">{index + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600">
                                    <Music size={48} className="mx-auto text-gray-500 mb-4" />
                                    <p className="text-gray-400 font-exo">Search for tracks to build your battle deck</p>
                                    <p className="text-gray-500 text-sm mt-2">You need 6 tracks to enter the arena</p>
                                </div>
                            )}
                        </div>

                        {/* Search Section */}
                        {!amIReady && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 font-orbitron tracking-wide">
                                    <Search size={24} className="text-green-400"/> DISCOVER TRACKS
                                </h2>
                                <div className="flex gap-3 mb-6">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for battle tracks or artists..."
                                        className="flex-1 p-4 bg-gray-700/50 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-exo placeholder-gray-400"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button 
                                        onClick={handleSearch} 
                                        disabled={isSearching}
                                        className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-400 hover:to-green-500 disabled:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                                    >
                                        {isSearching ? <LoaderCircle className="animate-spin" size={24}/> : <Search size={24}/>}
                                    </button>
                                </div>
                                
                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {searchResults.map(track => (
                                            <SearchResultCard 
                                                key={track.id} 
                                                track={track} 
                                                onSelect={handleSelectSong}
                                                isSelected={mySongs.some((s: Track) => s.id === track.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ready Button */}
                        <div className="pt-6 border-t border-gray-700/50">
                           <button
                             onClick={handleReady}
                             disabled={amIReady || isSettingReady || mySongs.length < 6}
                             className="w-full flex items-center justify-center gap-4 p-5 text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-500 hover:to-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 group font-orbitron tracking-wide"
                           >
                             {amIReady ? (
                                 <>
                                     <Check size={24} className="text-white"/>
                                     <span>READY FOR BATTLE!</span>
                                     <Sparkles size={20} className="text-yellow-400 animate-pulse"/>
                                 </>
                             ) : (
                                 <>
                                     <Send size={24} className="group-hover:animate-pulse"/>
                                     <span>LOCK IN & ENTER ARENA</span>
                                 </>
                             )}
                           </button>
                           {mySongs.length < 6 && !amIReady && (
                               <p className="text-center text-yellow-400 mt-3 font-exo">
                                   Need {6 - mySongs.length} more tracks to battle
                               </p>
                           )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(34, 197, 94, 0.5);
                    border-radius: 10px;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
}