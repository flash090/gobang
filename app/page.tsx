'use client'

import React, { useState, useEffect } from 'react'
import supabase from './utils/supabase'

const BOARD_SIZE = 15
const ROW_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1)
const COL_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i))
const CELL_SIZE = 40 // 恢复为原始大小

// 修改内联样式为纯白背景
const InlineStyles = () => (
  <style jsx global>{`
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: white;
    }
    
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      background-color: white;
    }
    
    .row {
      display: flex;
    }
    
    .cell-label {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      color: #333;
      font-size: 0.875rem;
    }
    
    .board-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: 1px solid #ccc;
      cursor: pointer;
      font-size: 1.25rem;
      font-weight: bold;
    }
    
    .board-cell:hover {
      background-color: #f9f9f9;
    }
    
    .room-info {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: white;
    }
    
    .room-details {
      background-color: white;
      padding: 0.75rem 1rem;
      border: 1px solid #eee;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    
    .copy-button {
      background-color: #3b82f6;
      color: white;
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
    }
    
    .copy-button:hover {
      background-color: #2563eb;
    }
    
    .turn-indicator {
      margin-top: 0.5rem;
      text-align: center;
      font-weight: 500;
      background-color: white;
    }
    
    .your-turn {
      color: #16a34a;
    }
    
    .waiting {
      color: #6b7280;
    }
    
    .error-message {
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #b91c1c;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }
    
    .join-container {
      margin-bottom: 1.5rem;
      width: 20rem;
      max-width: 100%;
      background-color: white;
    }
    
    .join-form {
      display: flex;
      margin-bottom: 1rem;
    }
    
    .join-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-right: none;
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
    }
    
    .join-button {
      background-color: #3b82f6;
      color: white;
      padding: 0.5rem 1rem;
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
      border: none;
      cursor: pointer;
    }
    
    .join-button:disabled {
      background-color: #d1d5db;
      cursor: not-allowed;
    }
    
    .create-button {
      width: 100%;
      background-color: #10b981;
      color: white;
      padding: 0.5rem 0;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
    }
    
    .create-button:hover {
      background-color: #059669;
    }
  `}</style>
)

export default function HomePage() {
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerRole, setPlayerRole] = useState<'X' | 'O'>('X')
  const [error, setError] = useState<string | null>(null)
  const [isDbReady, setIsDbReady] = useState<boolean | null>(null)
  const [joinRoomId, setJoinRoomId] = useState<string>('')
  const [joining, setJoining] = useState<boolean>(false)

  // Check if Supabase is set up correctly
  useEffect(() => {
    async function checkDatabase() {
      try {
        // Try to query the Supabase database directly to check if the table exists
        const { error } = await supabase
          .from('rooms')
          .select('id')
          .limit(1)
        
        if (error) {
          console.error("Table check error:", error);
          setIsDbReady(false);
          setError(`Database error: ${error.message}. Please set up the Supabase 'rooms' table first.`);
        } else {
          console.log("Supabase tables exist and are accessible");
          setIsDbReady(true);
        }
      } catch (err: any) {
        console.error("Database check failed:", err);
        setIsDbReady(false);
        setError(`Database connection error: ${err.message}. Please check your Supabase configuration.`);
      }
    }

    checkDatabase();
  }, []);

  // Create a new room directly in Supabase
  useEffect(() => {
    async function createRoomDirectly() {
      if (!isDbReady) return;
      
      try {
        console.log("Creating room directly in Supabase");
        
        // Insert a new room directly
        const { data, error } = await supabase
          .from('rooms')
          .insert([
            { 
              board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
              current_player: 'X',
              status: 'active'
            }
          ])
          .select()

        if (error) {
          console.error("Room creation error:", error);
          setError(`Failed to create room: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          setError("No room data returned after creation");
          return;
        }

        console.log("Room created:", data[0]);
        setRoomId(data[0].id);

        // Add room ID to URL for easy sharing
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('roomId', data[0].id);
          window.history.pushState({}, '', url);
        }

        // Subscribe to room changes
        const channel = supabase
          .channel(`room-${data[0].id}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'rooms',
            filter: `id=eq.${data[0].id}`
          }, (payload) => {
            console.log("Realtime update received:", payload);
            // Update the game state when the room is updated
            const roomData = payload.new
            setBoard(roomData.board)
            setCurrentPlayer(roomData.current_player)
          })
          .subscribe()

        console.log("Subscribed to room changes:", data[0].id);
        
        return () => {
          if (channel) supabase.removeChannel(channel);
        }
      } catch (err: any) {
        console.error('Error creating room directly:', err);
        setError(`Failed to create room: ${err.message}`);
      }
    }

    // Check URL for room ID parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomIdParam = params.get('roomId');
      
      if (roomIdParam) {
        // If there's a roomId in the URL, join that room instead of creating
        handleJoinRoom(roomIdParam);
      } else {
        // Only create a new room if no roomId in URL
        createRoomDirectly();
      }
    } else {
      createRoomDirectly();
    }
  }, [isDbReady]);

  // Join an existing room
  const handleJoinRoom = async (roomIdToJoin: string) => {
    if (!isDbReady || !roomIdToJoin) return;
    
    setJoining(true);
    setError(null);
    
    try {
      console.log("Joining room:", roomIdToJoin);
      
      // Check if room exists
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomIdToJoin)
        .single();
      
      if (error) {
        console.error("Error joining room:", error);
        setError(`Failed to join room: ${error.message}`);
        setJoining(false);
        return;
      }
      
      if (!data) {
        setError(`Room not found: ${roomIdToJoin}`);
        setJoining(false);
        return;
      }
      
      console.log("Joined room:", data);
      setRoomId(data.id);
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setPlayerRole('O'); // Joiner is O
      
      // Add room ID to URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('roomId', data.id);
        window.history.pushState({}, '', url);
      }
      
      // Subscribe to room changes
      const channel = supabase
        .channel(`room-${data.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'rooms',
          filter: `id=eq.${data.id}`
        }, (payload) => {
          console.log("Realtime update received:", payload);
          // Update the game state when the room is updated
          const roomData = payload.new;
          setBoard(roomData.board);
          setCurrentPlayer(roomData.current_player);
        })
        .subscribe();
    } catch (err: any) {
      console.error("Error joining room:", err);
      setError(`Failed to join room: ${err.message}`);
    } finally {
      setJoining(false);
    }
  };

  const handleClick = async (x: number, y: number) => {
    if (!roomId || board[y][x] || currentPlayer !== playerRole) {
      return
    }

    try {
      // Make move directly in Supabase
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[y][x] = playerRole;
      
      const { error } = await supabase
        .from('rooms')
        .update({ 
          board: newBoard, 
          current_player: playerRole === 'X' ? 'O' : 'X',
          last_move: { x, y, player: playerRole }
        })
        .eq('id', roomId)

      if (error) {
        console.error("Move update error:", error);
        setError(`Failed to make move: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Error making move:', err)
      setError(`Failed to make move: ${err.message}`)
    }
  }

  // Create a single row of the board
  const renderRow = (y: number) => {
    return (
      <div className="row" key={y} style={{display: 'flex'}}>
        {/* Row label */}
        <div 
          className="cell-label"
          style={{ 
            height: `${CELL_SIZE}px`, 
            width: `${CELL_SIZE}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          {ROW_LABELS[y]}
        </div>
        
        {/* Row cells */}
        {Array.from({ length: BOARD_SIZE }).map((_, x) => (
          <div
            key={`${x}-${y}`}
            className="board-cell"
            style={{ 
              height: `${CELL_SIZE}px`, 
              width: `${CELL_SIZE}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
            onClick={() => handleClick(x, y)}
          >
            {board[y][x]}
          </div>
        ))}
      </div>
    )
  }

  return (
    <main>
      <InlineStyles />
      
      {isDbReady === false && (
        <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          <h2 className="font-bold text-lg mb-2">Supabase Setup Required</h2>
          <p className="mb-2">You need to create the required tables in Supabase. Run this SQL in your Supabase SQL Editor:</p>
          <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-auto max-w-2xl">
{`-- Create the rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  board JSONB NOT NULL,
  current_player TEXT NOT NULL,
  status TEXT NOT NULL,
  last_move JSONB,
  winner TEXT
);

-- Enable realtime for the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Set up Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (for MVP)
CREATE POLICY "Allow all operations for rooms" ON public.rooms
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Grant access to the anon role
GRANT ALL ON public.rooms TO anon;
GRANT USAGE ON SCHEMA public TO anon;`}
          </pre>
          <p className="mt-2">Then go to Database → Replication and enable "Realtime" for the rooms table.</p>
        </div>
      )}
      
      {!roomId && isDbReady && (
        <div className="join-container">
          <h2 style={{fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem'}}>Join a Game</h2>
          <div className="join-form">
            <input 
              type="text" 
              value={joinRoomId} 
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Enter Room ID" 
              className="join-input"
            />
            <button 
              onClick={() => handleJoinRoom(joinRoomId)}
              disabled={joining || !joinRoomId} 
              className="join-button"
            >
              {joining ? 'Joining...' : 'Join'}
            </button>
          </div>
          <button 
            onClick={() => {
              // Only create a new room if no roomId in URL
              const createRoomDirectly = async () => {
                try {
                  console.log("Creating new room");
                  
                  // Insert a new room directly
                  const { data, error } = await supabase
                    .from('rooms')
                    .insert([
                      { 
                        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
                        current_player: 'X',
                        status: 'active'
                      }
                    ])
                    .select()

                  if (error) {
                    console.error("Room creation error:", error);
                    setError(`Failed to create room: ${error.message}`);
                    return;
                  }

                  if (!data || data.length === 0) {
                    setError("No room data returned after creation");
                    return;
                  }

                  console.log("Room created:", data[0]);
                  setRoomId(data[0].id);
                  setPlayerRole('X'); // Creator is X

                  // Add room ID to URL for easy sharing
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.set('roomId', data[0].id);
                    window.history.pushState({}, '', url);
                  }

                  // Subscribe to room changes
                  supabase
                    .channel(`room-${data[0].id}`)
                    .on('postgres_changes', { 
                      event: 'UPDATE', 
                      schema: 'public', 
                      table: 'rooms',
                      filter: `id=eq.${data[0].id}`
                    }, (payload) => {
                      console.log("Realtime update received:", payload);
                      // Update the game state when the room is updated
                      const roomData = payload.new
                      setBoard(roomData.board)
                      setCurrentPlayer(roomData.current_player)
                    })
                    .subscribe()
                } catch (err: any) {
                  console.error('Error creating room directly:', err);
                  setError(`Failed to create room: ${err.message}`);
                }
              };
              
              createRoomDirectly();
            }}
            className="create-button"
          >
            Create New Game
          </button>
        </div>
      )}
      
      {roomId && (
        <div className="room-info">
          <div className="room-details">
            <div style={{fontWeight: '500'}}>Room ID: <span style={{fontFamily: 'monospace'}}>{roomId}</span></div>
            <div>You: {playerRole} ({playerRole === 'X' ? 'Black' : 'White'})</div>
            <div>Current Turn: {currentPlayer} ({currentPlayer === 'X' ? 'Black' : 'White'})</div>
          </div>
          <button 
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('roomId', roomId);
              
              navigator.clipboard.writeText(url.toString())
                .then(() => {
                  alert("Invite link copied to clipboard!");
                })
                .catch(err => {
                  console.error("Could not copy link:", err);
                  alert(`Share this URL: ${url.toString()}`);
                });
            }} 
            className="copy-button"
          >
            Copy Invite Link
          </button>
          
          <div className={`turn-indicator ${currentPlayer === playerRole ? 'your-turn' : 'waiting'}`}>
            {currentPlayer === playerRole ? 'Your turn!' : 'Waiting for opponent...'}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        {/* Column labels row */}
        <div className="row" style={{display: 'flex'}}>
          {/* Top-left empty cell */}
          <div className="cell-label" style={{ 
            height: `${CELL_SIZE}px`, 
            width: `${CELL_SIZE}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }} />
          
          {/* Column labels */}
          {COL_LABELS.map((label) => (
            <div 
              key={label}
              className="cell-label"
              style={{ 
                height: `${CELL_SIZE}px`, 
                width: `${CELL_SIZE}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Board rows */}
        {Array.from({ length: BOARD_SIZE }).map((_, y) => renderRow(y))}
      </div>
    </main>
  )
} 