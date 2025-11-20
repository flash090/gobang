'use client';

import React, { useState, useEffect } from 'react';
import { GobangGame } from '../../lib/game/engine';
import { BoardState, PlayerSymbol } from '../../lib/game/types';
import Board from './components/Board';

export default function GamePage() {
    const [game, setGame] = useState<GobangGame | null>(null);
    const [board, setBoard] = useState<BoardState>([]);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerSymbol>('X');
    const [winner, setWinner] = useState<PlayerSymbol | null>(null);
    const [lastMove, setLastMove] = useState<{ row: number; col: number } | undefined>(undefined);
    const [playerCount, setPlayerCount] = useState(2);

    useEffect(() => {
        startNewGame(2);
    }, []);

    const startNewGame = (players: number) => {
        const newGame = new GobangGame({
            size: 15,
            players: players,
            winCondition: 5
        });
        setGame(newGame);
        setBoard([...newGame.board.map(row => [...row])]);
        setCurrentPlayer(newGame.symbols[newGame.currentPlayerIndex]);
        setWinner(null);
        setLastMove(undefined);
        setPlayerCount(players);
    };

    const handleCellClick = (row: number, col: number) => {
        if (!game || winner) return;

        const result = game.makeMove(row, col);
        if (result.success) {
            setBoard([...game.board.map(r => [...r])]);
            setLastMove({ row, col });

            if (result.winner) {
                setWinner(result.winner);
            } else if (result.draw) {
                alert("It's a draw!");
            } else {
                setCurrentPlayer(game.symbols[game.currentPlayerIndex]);
            }
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-stone-100 p-8">
            <h1 className="text-3xl font-bold mb-4 text-stone-800">Gobang Online (Local Test)</h1>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => startNewGame(2)}
                    className={`px-4 py-2 rounded ${playerCount === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    2 Players
                </button>
                <button
                    onClick={() => startNewGame(3)}
                    className={`px-4 py-2 rounded ${playerCount === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    3 Players
                </button>
                <button
                    onClick={() => startNewGame(4)}
                    className={`px-4 py-2 rounded ${playerCount === 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    4 Players
                </button>
            </div>

            <div className="mb-4 text-xl font-semibold">
                {winner ? (
                    <span className="text-green-600">Winner: Player {winner}!</span>
                ) : (
                    <span>Current Turn: Player {currentPlayer}</span>
                )}
            </div>

            {game && (
                <Board
                    board={board}
                    size={game.size}
                    onCellClick={handleCellClick}
                    lastMove={lastMove}
                    currentPlayerSymbol={currentPlayer}
                />
            )}

            <div className="mt-8 max-w-md text-sm text-gray-600">
                <h3 className="font-bold mb-2">Rules:</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Win Condition: 5 in a row</li>
                    <li>3 Players: Player 1 (8-15, 8-15), Player 2 (5-15, 5-15), Player 3 (Anywhere)</li>
                    <li>4 Players: Player 1 (8-15, 8-15), Player 2 (6-15, 6-15), Player 3 (4-15, 4-15), Player 4 (Anywhere)</li>
                    <li>Restricted zones only apply to the <strong>first move</strong> of each player.</li>
                </ul>
            </div>
        </div>
    );
}
