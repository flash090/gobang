'use client';

import React, { useEffect, useRef } from 'react';
import { BoardState, CellValue, PlayerSymbol } from '../../../lib/game/types';

interface BoardProps {
    board: BoardState;
    size: number;
    onCellClick: (row: number, col: number) => void;
    lastMove?: { row: number; col: number };
    currentPlayerSymbol: PlayerSymbol;
}

const Board: React.FC<BoardProps> = ({ board, size, onCellClick, lastMove, currentPlayerSymbol }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cellSize = 40;
    const padding = 20;
    const boardPixelSize = size * cellSize + padding * 2;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = '#DEB887'; // Burlywood color for board
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        for (let i = 0; i < size; i++) {
            // Horizontal lines
            ctx.moveTo(padding + cellSize / 2, padding + cellSize / 2 + i * cellSize);
            ctx.lineTo(padding + cellSize / 2 + (size - 1) * cellSize, padding + cellSize / 2 + i * cellSize);

            // Vertical lines
            ctx.moveTo(padding + cellSize / 2 + i * cellSize, padding + cellSize / 2);
            ctx.lineTo(padding + cellSize / 2 + i * cellSize, padding + cellSize / 2 + (size - 1) * cellSize);
        }
        ctx.stroke();

        // Draw pieces
        board.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    drawPiece(ctx, r, c, cell);
                }
            });
        });

        // Highlight last move
        if (lastMove) {
            drawHighlight(ctx, lastMove.row, lastMove.col);
        }

    }, [board, size, lastMove]);

    const drawPiece = (ctx: CanvasRenderingContext2D, row: number, col: number, symbol: CellValue) => {
        const x = padding + col * cellSize + cellSize / 2;
        const y = padding + row * cellSize + cellSize / 2;
        const radius = cellSize * 0.4;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        if (symbol === 'X') {
            ctx.fillStyle = 'black';
        } else if (symbol === 'O') {
            ctx.fillStyle = 'white';
        } else if (symbol === '#') {
            ctx.fillStyle = 'blue';
        } else if (symbol === '@') {
            ctx.fillStyle = 'red';
        }

        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    const drawHighlight = (ctx: CanvasRenderingContext2D, row: number, col: number) => {
        const x = padding + col * cellSize + cellSize / 2;
        const y = padding + row * cellSize + cellSize / 2;

        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.1, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - padding;
        const y = e.clientY - rect.top - padding;

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        if (row >= 0 && row < size && col >= 0 && col < size) {
            onCellClick(row, col);
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <canvas
                ref={canvasRef}
                width={boardPixelSize}
                height={boardPixelSize}
                onClick={handleClick}
                className="cursor-pointer shadow-lg rounded-sm"
            />
        </div>
    );
};

export default Board;
