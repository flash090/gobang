import { GobangGame } from './engine';

const game = new GobangGame({ size: 15, players: 3, winCondition: 5 });

console.log('Testing 3-player limits...');
// Player 0 is restricted to 8-15, 8-15
const validMove = game.isMoveAllowed(0, 9, 9);
const invalidMove = game.isMoveAllowed(0, 2, 2);

console.log(`Player 0 move (9,9) allowed? ${validMove} (Expected: true)`);
console.log(`Player 0 move (2,2) allowed? ${invalidMove} (Expected: false)`);

if (validMove && !invalidMove) {
    console.log('✅ Player limits check passed');
} else {
    console.error('❌ Player limits check failed');
}

console.log('\nTesting Win Condition...');
// Mock a win
game.board[0][0] = 'X';
game.board[0][1] = 'X';
game.board[0][2] = 'X';
game.board[0][3] = 'X';
game.board[0][4] = 'X';

const isWin = game.checkWinner(0, 0);
console.log(`Check winner at (0,0)? ${isWin} (Expected: true)`);

if (isWin) {
    console.log('✅ Win check passed');
} else {
    console.error('❌ Win check failed');
}
