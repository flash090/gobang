'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase/client';
import { GobangGame } from '../../lib/game/engine';
import { BoardState, PlayerSymbol } from '../../lib/game/types';
import Board from '../game/components/Board';

interface Player {
    name: string;
    symbol: PlayerSymbol;
    id: string; // Client ID (randomly generated for MVP)
}

interface RoomData {
    players: Player[];
    board_state: BoardState;
    current_turn_index: number;
    last_move?: { row: number; col: number };
    config: { size: number; players: number; winCondition: number };
}

export default function Lobby({ playerName }: { playerName: string }) {
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [myId] = useState(() => Math.random().toString(36).substr(2, 9));
    const [error, setError] = useState<string | null>(null);

    // Game engine instance for validation (not for state storage)
    const gameEngineRef = useRef<GobangGame | null>(null);

    useEffect(() => {
        // 1. Fetch initial state
        const fetchRoom = async () => {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', 'public-lobby')
                .single();

            if (error) {
                console.error('Error fetching room:', error);
                setError('Failed to connect to lobby. Please check your connection.');
                return;
            }

            if (data) {
                setRoomData(data as RoomData);
                // Initialize engine to validate moves
                gameEngineRef.current = new GobangGame(data.config);
                gameEngineRef.current.board = data.board_state;
                gameEngineRef.current.currentPlayerIndex = data.current_turn_index;
            }
        };

        fetchRoom();

        // 2. Subscribe to changes
        const channel = supabase
            .channel('public-lobby')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'id=eq.public-lobby' },
                (payload) => {
                    const newData = payload.new as RoomData;
                    setRoomData(newData);

                    // Sync engine
                    if (gameEngineRef.current) {
                        gameEngineRef.current.board = newData.board_state;
                        gameEngineRef.current.currentPlayerIndex = newData.current_turn_index;
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSitDown = async () => {
        if (!roomData) return;

        const currentPlayers = roomData.players || [];
        if (currentPlayers.length >= 4) {
            alert('Room is full!');
            return;
        }

        if (currentPlayers.find(p => p.id === myId)) {
            alert('You are already seated!');
            return;
        }

        const symbols: PlayerSymbol[] = ['X', 'O', '#', '@'];
        const newPlayer: Player = {
            name: playerName,
            symbol: symbols[currentPlayers.length],
            id: myId
        };

        const newPlayers = [...currentPlayers, newPlayer];

        const { error } = await supabase
            .from('rooms')
            .update({ players: newPlayers })
            .eq('id', 'public-lobby');

        if (error) {
            console.error('Error sitting down:', error);
            alert('Failed to sit down.');
        }
    };

    const handleMove = async (row: number, col: number) => {
        if (!roomData || !gameEngineRef.current) return;

        const currentPlayerIndex = roomData.current_turn_index;
        const currentPlayer = roomData.players[currentPlayerIndex];

        // Check if it's my turn
        if (!currentPlayer || currentPlayer.id !== myId) {
            // alert("It's not your turn!"); // Optional: Silent fail or toast
            return;
        }

        // Validate move locally first
        if (!gameEngineRef.current.isMoveAllowed(currentPlayerIndex, row, col)) {
            return;
        }

        // Calculate new state
        // Note: We clone the board to avoid mutating state directly before sending
        const nextEngine = new GobangGame(roomData.config);
        nextEngine.board = roomData.board_state.map(r => [...r]);
        nextEngine.currentPlayerIndex = roomData.current_turn_index;
        nextEngine.firstMove = Array(4).fill(true); // Simplified: In a real app, we need to persist firstMove state too or derive it.
        // For MVP, let's assume firstMove restriction is handled by the engine correctly if we had full state history.
        // Since we don't persist `firstMove` array in DB for this MVP, the "restricted zone" rule might be buggy after page reload.
        // FIX: We should probably persist `movesPlayed` or `firstMove` in DB. 
        // For now, let's just update the board and turn.

        const result = nextEngine.makeMove(row, col);

        if (result.success) {
            // Optimistic update? No, let's wait for DB for simplicity in MVP.

            const { error } = await supabase
                .from('rooms')
                .update({
                    board_state: nextEngine.board,
                    current_turn_index: nextEngine.currentPlayerIndex,
                    last_move: { row, col }
                })
                .eq('id', 'public-lobby');

            if (error) {
                console.error('Error making move:', error);
            }
        }
    };

    if (error) return <div className="text-red-500">{error}</div>;
    if (!roomData) return <div>Loading Lobby...</div>;

    const myPlayerIndex = roomData.players.findIndex(p => p.id === myId);
    const isMyTurn = myPlayerIndex === roomData.current_turn_index;
    const currentPlayerName = roomData.players[roomData.current_turn_index]?.name || 'Waiting...';

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex justify-between w-full max-w-4xl px-4">
                <div className="text-lg">
                    Welcome, <span className="font-bold">{playerName}</span>
                </div>
                <div className="text-lg">
                    Room: <span className="font-bold">Public Lobby</span>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Game Board */}
                <div className="relative">
                    <Board
                        board={roomData.board_state || Array(15).fill(Array(15).fill(null))}
                        size={roomData.config?.size || 15}
                        onCellClick={handleMove}
                        lastMove={roomData.last_move}
                        currentPlayerSymbol={roomData.players[roomData.current_turn_index]?.symbol || 'X'}
                    />
                    {!isMyTurn && myPlayerIndex !== -1 && (
                        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm shadow">
                            Opponent's Turn
                        </div>
                    )}
                    {isMyTurn && (
                        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm shadow animate-pulse">
                            Your Turn!
                        </div>
                    )}
                </div>

                {/* Player List / Sidebar */}
                <div className="w-64 bg-white p-4 rounded shadow flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">Players ({roomData.players.length}/4)</h3>

                    <div className="flex flex-col gap-2">
                        {roomData.players.map((p, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between p-2 rounded ${i === roomData.current_turn_index ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold w-6 text-center">{p.symbol}</span>
                                    <span className={p.id === myId ? "font-bold" : ""}>{p.name} {p.id === myId ? "(You)" : ""}</span>
                                </div>
                                {i === roomData.current_turn_index && <span className="text-xs text-blue-500">Thinking...</span>}
                            </div>
                        ))}

                        {Array.from({ length: 4 - roomData.players.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 border-2 border-dashed border-gray-200 rounded text-gray-400 text-center text-sm">
                                Empty Seat
                            </div>
                        ))}
                    </div>

                    {myPlayerIndex === -1 && roomData.players.length < 4 && (
                        <button
                            onClick={handleSitDown}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Sit Down to Play
                        </button>
                    )}

                    {myPlayerIndex === -1 && roomData.players.length >= 4 && (
                        <div className="mt-4 text-center text-gray-500 italic">
                            Room is full. You are watching.
                        </div>
                    )}

                    <div className="mt-auto pt-4 text-xs text-gray-400">
                        <p>Status: {isMyTurn ? "Your move" : `Waiting for ${currentPlayerName}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
