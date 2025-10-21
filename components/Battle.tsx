"use client";

import { useMemo, useState, useEffect } from "react";
import { Track } from "@/app/room/[roomId]/page";
import { Crown, Swords, Shield, LoaderCircle, RotateCcw, Volume2, Music } from "lucide-react";

// Enhanced SongCard Component with 3D flip and better styling
const SongCard = ({ song, isRevealed, playerName }: { song: Track | null, isRevealed: boolean, playerName: string }) => {
    if (!song) {
        return (
            <div className="relative aspect-[3/4] w-full max-w-64 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-center p-4">
                    <Music className="mx-auto text-gray-500 mb-2" size={32} />
                    <p className="text-gray-500 font-exo">Waiting for {playerName}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="relative aspect-[3/4] w-full max-w-64 perspective-1000">
            <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isRevealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
                {/* Back of Card - Mysterious Design */}
                <div className="absolute w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 rounded-2xl backface-hidden flex flex-col items-center justify-center p-6 shadow-2xl border-2 border-white/20">
                    <div className="text-center">
                        <Swords size={48} className="text-white/80 mx-auto mb-4"/>
                        <div className="bg-black/30 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-white font-bold font-orbitron tracking-wide text-sm">SONG SCUFFLE</p>
                            <p className="text-white/60 text-xs font-exo mt-1">TRACK HIDDEN</p>
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-black/40 rounded-lg p-2 backdrop-blur-sm">
                        <p className="text-white/70 text-xs font-exo text-center">{playerName}</p>
                    </div>
                </div>
                
                {/* Front of Card - Revealed Track */}
                <div className="absolute w-full h-full bg-gray-800 rounded-2xl backface-hidden rotate-y-180 overflow-hidden shadow-2xl border-2 border-white/10">
                    {/* Album Art */}
                    <div className="relative h-2/3 overflow-hidden">
                        <img 
                            src={song.imageUrl} 
                            alt={song.name} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        
                        {/* Popularity Badge */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-2 shadow-lg">
                            <div className="flex items-center gap-1">
                                <Shield size={16} className="text-white"/>
                                <span className="font-bold text-white text-sm font-orbitron">{song.popularity}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Track Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/70 p-4 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                            <Volume2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate font-exo text-sm">{song.name}</p>
                                <p className="text-gray-300 text-xs truncate">{song.artist}</p>
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-exo">POWER LEVEL</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-bold text-sm font-orbitron">{song.popularity}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced PlayerDisplay Component
const PlayerDisplay = ({ name, data, isTurn, cards, onPlayCard, isCurrentUser, isOpponent = false }: any) => (
    <div className={`w-full p-6 flex flex-col gap-6 ${isOpponent ? 'items-start' : 'items-end'}`}>
        {/* Player Header */}
        <div className={`flex items-center gap-4 ${isOpponent ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`text-center ${isOpponent ? 'text-left' : 'text-right'}`}>
                <p className="font-bold text-2xl font-orbitron bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {name} {isCurrentUser && '(YOU)'}
                </p>
                <p className="text-gray-400 font-exo">Score: <span className="text-yellow-400 font-bold">{data.score}</span></p>
            </div>
            {isTurn && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-4 py-2 animate-pulse">
                    <p className="text-white font-bold text-sm font-orbitron tracking-wide">YOUR TURN!</p>
                </div>
            )}
        </div>

        {/* Cards Hand */}
        <div className={`flex gap-3 flex-wrap max-w-2xl ${isOpponent ? 'justify-start' : 'justify-end'}`}>
            {cards.map((song: Track) => (
                <button
                    key={song.id}
                    onClick={() => onPlayCard(song)}
                    disabled={!isTurn}
                    className="group relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50"
                >
                    <img 
                        src={song.imageUrl} 
                        alt={song.name} 
                        className="w-full h-full object-cover"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center p-2">
                            <p className="text-white text-xs font-bold font-exo leading-tight">{song.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <Shield size={10} className="text-yellow-400"/>
                                <span className="text-yellow-400 text-xs font-bold">{song.popularity}</span>
                            </div>
                        </div>
                    </div>
                    {/* Selected Song Name */}
                    {!isOpponent && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                            <p className="text-white text-xs truncate font-exo">{song.name}</p>
                        </div>
                    )}
                </button>
            ))}
        </div>
    </div>
);

export default function Battle({ roomData, currentUser, roomId }: { roomData: any, currentUser: string | null, roomId: string }) {
    const [isResolving, setIsResolving] = useState(false);
    const [isRequestingRematch, setIsRequestingRematch] = useState(false);

    const { me, opponent, amITurn, round, playedCards, result } = useMemo(() => {
        const playerNames = Object.keys(roomData.players);
        const myName = currentUser || "";
        const opponentName = playerNames.find(p => p !== myName) || "";
        
        const roundData = roomData.currentRound || { playedCards: {} };
        const resultData = roundData.result || null;

        const myPlayerData = roomData.players[myName] || { score: 0, remainingSongs: [], wantsRematch: false };
        const opponentPlayerData = roomData.players[opponentName] || { score: 0, remainingSongs: [], wantsRematch: false };

        return {
            me: { name: myName, ...myPlayerData },
            opponent: { name: opponentName, ...opponentPlayerData },
            amITurn: roomData.currentPlayerTurn === myName,
            round: roundData.roundNumber,
            playedCards: roundData.playedCards,
            result: resultData,
        };
    }, [roomData, currentUser]);
    
    const myCard = playedCards ? playedCards[me.name] : null;
    const opponentCard = playedCards ? playedCards[opponent.name] : null;
    const isRoundOver = !!result;

    useEffect(() => {
        if (isRoundOver) {
            const timer = setTimeout(() => {
                setIsResolving(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setIsResolving(false);
        }
    }, [isRoundOver]);

    const handlePlayCard = async (song: Track) => {
        if (!amITurn) return;
        try {
            await fetch("/api/rooms/play-card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, username: me.name, songData: song }),
            });
        } catch (error) {
            console.error("Error playing card:", error);
        }
    };

    const handleNextRound = async () => {
         try {
            await fetch("/api/rooms/next-round", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId }),
            });
        } catch (error) {
            console.error("Error starting next round:", error);
        }
    }
    
    const handleRematch = async () => {
        setIsRequestingRematch(true);
        try {
            await fetch("/api/rooms/rematch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, username: me.name }),
            });
        } catch (error) {
            console.error("Error requesting rematch:", error);
            alert("Failed to request rematch.");
            setIsRequestingRematch(false);
        }
    }
    
    // Game Over Screen
    if (roomData.status === 'finished') {
        const winner = me.score > opponent.score ? me.name : (opponent.score > me.score ? opponent.name : 'Draw');
        
        let rematchButton;
        const iWantRematch = me.wantsRematch;
        const theyWantRematch = opponent.wantsRematch;

        if (iWantRematch) {
            rematchButton = (
                <button disabled className="mt-6 w-full max-w-sm flex items-center justify-center gap-3 p-4 font-bold bg-gray-600 rounded-xl">
                    <LoaderCircle className="animate-spin"/> 
                    <span className="font-orbitron tracking-wide">WAITING FOR OPPONENT...</span>
                </button>
            );
        } else if (theyWantRematch) {
            rematchButton = (
                 <button 
                    onClick={handleRematch} 
                    disabled={isRequestingRematch}
                    className="mt-6 w-full max-w-sm flex items-center justify-center gap-3 p-4 font-bold bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-400 hover:to-green-500 animate-pulse transform hover:scale-105 transition-all duration-300 font-orbitron tracking-wide"
                >
                    <RotateCcw/> 
                    {opponent.name} WANTS REMATCH! (ACCEPT CHALLENGE)
                </button>
            );
        } else {
            rematchButton = (
                 <button 
                    onClick={handleRematch} 
                    disabled={isRequestingRematch}
                    className="mt-6 w-full max-w-sm flex items-center justify-center gap-3 p-4 font-bold bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:from-purple-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 font-orbitron tracking-wide"
                >
                    <RotateCcw/> 
                    {isRequestingRematch ? 'SENDING CHALLENGE...' : 'REQUEST REMATCH'}
                </button>
            );
        }

        return (
             <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-8 text-center relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
                
                <div className="relative z-10 space-y-6">
                    <Crown size={80} className="mx-auto text-yellow-400 animate-bounce"/>
                    <h1 className="text-6xl font-bold font-audiowide bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        BATTLE ENDED
                    </h1>
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <p className="text-3xl font-orbitron tracking-wide">
                            {winner === 'Draw' ? "EPIC DRAW!" : `${winner} VICTORIOUS!`}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-8 text-xl">
                            <div className="text-center">
                                <p className="font-exo text-gray-300">{me.name}</p>
                                <p className="text-yellow-400 font-bold font-orbitron text-2xl">{me.score}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-exo text-gray-300">{opponent.name}</p>
                                <p className="text-yellow-400 font-bold font-orbitron text-2xl">{opponent.score}</p>
                            </div>
                        </div>
                    </div>
                    {rematchButton}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            {/* Round Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-full px-6 py-2 border border-white/10">
                    <p className="font-orbitron tracking-wide text-sm">ROUND <span className="text-green-400">{round}</span></p>
                </div>
            </div>

            {/* Opponent */}
            <PlayerDisplay
                name={opponent.name}
                data={opponent}
                isTurn={!amITurn}
                cards={opponent.remainingSongs || []}
                onPlayCard={() => {}}
                isOpponent
            />

            {/* Battle Arena */}
            <div className="flex flex-col items-center justify-center gap-8 my-8 py-8">
                <div className="flex items-center justify-center gap-8 w-full max-w-4xl">
                    <SongCard song={opponentCard} isRevealed={isRoundOver} playerName={opponent.name} />
                    
                    {/* VS Badge */}
                    <div className="relative">
                        <div className={`bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-2 border-white/20 transition-all duration-500 ${isRoundOver ? 'scale-125 rotate-180' : ''}`}>
                            <Swords size={32} className="text-white" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 rounded-full px-3 py-1">
                            <p className="text-white font-bold text-xs font-orbitron tracking-widest">VS</p>
                        </div>
                    </div>

                    <SongCard song={myCard} isRevealed={!!myCard} playerName={me.name} />
                </div>

                {/* Round Result */}
                {isRoundOver && isResolving && result && (
                    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 animate-fade-in max-w-md text-center shadow-2xl">
                        <h2 className="text-3xl font-bold font-orbitron mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            {result.winner === 'draw' ? "CLASH ENDS IN DRAW!" : `${result.winner.toUpperCase()} WINS ROUND!`}
                        </h2>
                        <div className="space-y-3 text-left">
                            <div className="flex justify-between items-center p-3 bg-green-500/20 rounded-lg">
                                <span className="font-exo text-sm">{result.winningCard.name}</span>
                                <span className="font-bold text-green-400 font-orbitron">{result.winningCard.popularity}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg">
                                <span className="font-exo text-sm">{result.losingCard.name}</span>
                                <span className="font-bold text-red-400 font-orbitron">{result.losingCard.popularity}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleNextRound} 
                            className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 font-orbitron tracking-wide"
                        >
                            CONTINUE BATTLE
                        </button>
                    </div>
                )}
            </div>

            {/* Current Player */}
            <PlayerDisplay
                name={me.name}
                data={me}
                isTurn={amITurn}
                cards={me.remainingSongs || []}
                onPlayCard={handlePlayCard}
                isCurrentUser
            />

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}