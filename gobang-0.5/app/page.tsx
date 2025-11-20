'use client';

import React, { useState } from 'react';
import Lobby from './components/Lobby';

export default function Home() {
    const [nickname, setNickname] = useState('');
    const [joined, setJoined] = useState(false);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            setJoined(true);
        }
    };

    if (joined) {
        return (
            <main className="min-h-screen bg-stone-100 p-8">
                <Lobby playerName={nickname} />
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-24">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-2 text-stone-800">Gobang Online</h1>
                <p className="text-gray-500 mb-8">Simple Multiplayer Gomoku</p>

                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="nickname" className="block text-left text-sm font-medium text-gray-700 mb-1">
                            Enter your nickname
                        </label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g. Master Go"
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200"
                    >
                        Enter Lobby
                    </button>
                </form>

                <div className="mt-6 text-xs text-gray-400">
                    <p>No registration required.</p>
                    <p>Just enter a name and start playing.</p>
                </div>
            </div>
        </main>
    );
}
