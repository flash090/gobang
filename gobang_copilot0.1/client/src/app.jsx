import React, { useState } from 'react';
import './App.css';

const BOARD_SIZE = 15;
const EMPTY_CELL = '.';

export default function App() {
  const [board, setBoard] = useState(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY_CELL))
  );
  const [currentPlayer, setCurrentPlayer] = useState('X');

  const handleClick = (row, col) => {
    if (board[row][col] !== EMPTY_CELL) return;

    fetch('http://localhost:5000/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row, col, symbol: currentPlayer }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = currentPlayer;
          setBoard(newBoard);
          setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        } else {
          alert(data.message || 'Invalid move');
        }
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Gobang Web</h1>
      <div className="grid grid-cols-15 gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleClick(rowIndex, colIndex)}
              className="w-6 h-6 bg-white border border-gray-400 flex items-center justify-center cursor-pointer text-sm"
            >
              {cell !== EMPTY_CELL ? cell : ''}
            </div>
          ))
        )}
      </div>
      <p className="mt-4">Current Player: {currentPlayer}</p>
    </div>
  );
}
