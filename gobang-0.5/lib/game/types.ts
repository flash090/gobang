export type PlayerSymbol = 'X' | 'O' | '#' | '@';

export interface Player {
  id: string; // Could be socket ID or user ID
  symbol: PlayerSymbol;
  isAi: boolean;
  aiLevel?: 1 | 2 | 3;
  index: number; // 0-3
}

export interface GameConfig {
  size: number;
  players: number;
  winCondition: number;
}

export type CellValue = PlayerSymbol | null;
export type BoardState = CellValue[][];

export interface Move {
  row: number;
  col: number;
  playerIndex: number;
}

export interface PlayerLimit {
  rowMin: number;
  rowMax: number;
  colMin: number;
  colMax: number;
}
