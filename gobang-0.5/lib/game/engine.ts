import { BoardState, CellValue, GameConfig, Move, PlayerLimit, PlayerSymbol } from './types';

export class GobangGame {
    size: number;
    board: BoardState;
    players: number;
    symbols: PlayerSymbol[];
    currentPlayerIndex: number;
    movesPlayed: number;
    winCondition: number;
    playerLimits: Record<number, PlayerLimit>;
    firstMove: boolean[];
    isAi: boolean[];
    aiLevels: (number | null)[];

    constructor(config: GameConfig, isAi: boolean[] = [], aiLevels: (number | null)[] = []) {
        this.size = config.size;
        this.players = config.players;
        this.winCondition = config.winCondition;
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.symbols = ['X', 'O', '#', '@'].slice(0, this.players) as PlayerSymbol[];
        this.currentPlayerIndex = 0;
        this.movesPlayed = 0;
        this.playerLimits = {};
        this.firstMove = Array(this.players).fill(true);
        this.isAi = isAi;
        this.aiLevels = aiLevels;

        this.setPlayerLimits();
    }

    private setPlayerLimits() {
        if (this.players === 3) {
            this.playerLimits[0] = { rowMin: 8, rowMax: 15, colMin: 8, colMax: 15 };
            this.playerLimits[1] = { rowMin: 5, rowMax: 15, colMin: 5, colMax: 15 };
            this.playerLimits[2] = { rowMin: 0, rowMax: 15, colMin: 0, colMax: 15 };
        } else if (this.players === 4) {
            this.playerLimits[0] = { rowMin: 8, rowMax: 15, colMin: 8, colMax: 15 };
            this.playerLimits[1] = { rowMin: 6, rowMax: 15, colMin: 6, colMax: 15 };
            this.playerLimits[2] = { rowMin: 4, rowMax: 15, colMin: 4, colMax: 15 };
            this.playerLimits[3] = { rowMin: 0, rowMax: 15, colMin: 0, colMax: 15 };
        }
    }

    isMoveAllowed(playerIndex: number, row: number, col: number): boolean {
        // Basic bounds check
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) return false;
        if (this.board[row][col] !== null) return false;

        // First move restriction logic
        if (this.firstMove[playerIndex]) {
            const limit = this.playerLimits[playerIndex];
            if (limit) {
                return (
                    row >= limit.rowMin &&
                    row < limit.rowMax &&
                    col >= limit.colMin &&
                    col < limit.colMax
                );
            }
        }
        return true;
    }

    makeMove(row: number, col: number): { success: boolean; winner?: PlayerSymbol; draw?: boolean } {
        if (!this.isMoveAllowed(this.currentPlayerIndex, row, col)) {
            return { success: false };
        }

        const symbol = this.symbols[this.currentPlayerIndex];
        this.board[row][col] = symbol;
        this.movesPlayed++;

        if (this.checkWinner(row, col)) {
            return { success: true, winner: symbol };
        }

        if (this.movesPlayed === this.size * this.size) {
            return { success: true, draw: true };
        }

        this.firstMove[this.currentPlayerIndex] = false;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players;

        return { success: true };
    }

    checkWinner(row: number, col: number): boolean {
        const symbol = this.board[row][col];
        if (!symbol) return false;

        const directions = [
            [1, 0],  // Vertical
            [0, 1],  // Horizontal
            [1, 1],  // Diagonal right
            [1, -1]  // Diagonal left
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check forward
            for (let step = 1; step < this.winCondition; step++) {
                const r = row + dr * step;
                const c = col + dc * step;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === symbol) {
                    count++;
                } else {
                    break;
                }
            }

            // Check backward
            for (let step = 1; step < this.winCondition; step++) {
                const r = row - dr * step;
                const c = col - dc * step;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === symbol) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= this.winCondition) {
                return true;
            }
        }
        return false;
    }

    // AI Logic
    getAiMove(level: number): Move | null {
        const symbol = this.symbols[this.currentPlayerIndex];

        // 1. Try to win
        const winMove = this.findWinningMove(symbol);
        if (winMove) return { ...winMove, playerIndex: this.currentPlayerIndex };

        // 2. Block opponent
        for (let i = 0; i < this.players; i++) {
            if (i !== this.currentPlayerIndex) {
                const blockMove = this.findWinningMove(this.symbols[i]);
                if (blockMove) return { ...blockMove, playerIndex: this.currentPlayerIndex };
            }
        }

        // 3. Evaluate empty cells
        const emptyCells: { row: number; col: number }[] = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === null && this.isMoveAllowed(this.currentPlayerIndex, r, c)) {
                    emptyCells.push({ row: r, col: c });
                }
            }
        }

        return this.pickValidMove(emptyCells, symbol);
    }

    private findWinningMove(symbol: PlayerSymbol): { row: number; col: number } | null {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === null) {
                    // Simulate move
                    this.board[r][c] = symbol;
                    const won = this.checkWinner(r, c);
                    // Undo move
                    this.board[r][c] = null;

                    if (won && this.isMoveAllowed(this.currentPlayerIndex, r, c)) {
                        return { row: r, col: c };
                    }
                }
            }
        }
        return null;
    }

    private pickValidMove(emptyCells: { row: number; col: number }[], playerSymbol: PlayerSymbol): Move | null {
        let bestMove: Move | null = null;
        let bestScore = -Infinity;

        for (const { row, col } of emptyCells) {
            const score = this.evaluateMove(row, col, playerSymbol);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row, col, playerIndex: this.currentPlayerIndex };
            }
        }
        return bestMove;
    }

    private evaluateMove(row: number, col: number, playerSymbol: PlayerSymbol): number {
        let score = 0;
        const center = Math.floor(this.size / 2);

        // Center preference
        if (Math.abs(row - center) <= 1 && Math.abs(col - center) <= 1) {
            score += 5;
        }

        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        // Check surrounding pieces (prefer own pieces)
        for (const [dr, dc] of directions) {
            let countSelf = 0;
            let countOpponent = 0;
            for (let step = 1; step <= 2; step++) {
                const r = row + dr * step;
                const c = col + dc * step;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                    if (this.board[r][c] === playerSymbol) {
                        countSelf++;
                    } else if (this.board[r][c] !== null) {
                        countOpponent++;
                    }
                }
            }
            if (countSelf > countOpponent) score += 3;
        }

        // Avoid opponent clusters
        for (const [dr, dc] of directions) {
            let countOpponent = 0;
            for (let step = 1; step <= 2; step++) {
                const r = row + dr * step;
                const c = col + dc * step;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                    if (this.board[r][c] !== null && this.board[r][c] !== playerSymbol) {
                        countOpponent++;
                    }
                }
            }
            if (countOpponent >= 2) score -= 3;
        }

        // Check line potential
        score += this.checkLinePotential(row, col, playerSymbol);

        return score;
    }

    private checkLinePotential(row: number, col: number, playerSymbol: PlayerSymbol): number {
        let potentialScore = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            // Forward
            for (let step = 1; step < this.winCondition; step++) {
                const r = row + dr * step;
                const c = col + dc * step;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                    if (this.board[r][c] === playerSymbol) {
                        potentialScore++;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            // Backward
            for (let step = 1; step < this.winCondition; step++) {
                const r = row - dr * step;
                const c = col - dc * step;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                    if (this.board[r][c] === playerSymbol) {
                        potentialScore++;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
        return potentialScore;
    }
}
