import random

class Gobang:
    def __init__(self, size=15, players=1, win_condition=5):
        self.size = size  # Board size (15x15 by default)
        self.board = [['.' for _ in range(size)] for _ in range(size)]  # Empty board
        self.players = players  # Ensure at least one player
        self.symbols = ['X', 'O', '#', '@'][:self.players]  # Unique symbols for each player
        self.current_player = 0  # Index of the current player
        self.moves_played = 0  # Count of moves played
        self.is_ai = []  # AI status for each player
        self.ai_levels = []  # AI difficulty levels (now only Standard & Advanced)
        self.win_condition = win_condition  # 4-in-a-row or 5-in-a-row
        self.column_labels = [chr(i) for i in range(ord('A'), ord('A') + self.size)]  # A-O columns
        self.first_move = [True] * self.players  # First move restriction tracking
        self.player_limits = {}  # Move restrictions for the first turn
        self.set_player_limits()  # Initialize move limits

    def display_board(self):
        print("   " + " ".join(self.column_labels))  # Column labels A-O
        for i, row in enumerate(self.board, start=1):
            print(str(i).rjust(2) + " " + " ".join(row))  # Row numbers from 1 to 15
    
    def set_player_limits(self):
        if self.players == 3:
            self.player_limits[0] = (8, 15, 8, 15)
            self.player_limits[1] = (5, 15, 5, 15)
            self.player_limits[2] = (0, 15, 0, 15)
        elif self.players == 4:
            self.player_limits[0] = (8, 15, 8, 15)
            self.player_limits[1] = (6, 15, 6, 15)
            self.player_limits[2] = (4, 15, 4, 15)
            self.player_limits[3] = (0, 15, 0, 15)
    
    def check_winner(self, row, col):
        symbol = self.board[row][col]
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]  # Vertical, Horizontal, Diagonal-right, Diagonal-left
        
        for dr, dc in directions:
            count = 1
            for step in range(1, self.win_condition):
                r, c = row + dr * step, col + dc * step
                if 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == symbol:
                    count += 1
                else:
                    break
            for step in range(1, self.win_condition):
                r, c = row - dr * step, col - dc * step
                if 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == symbol:
                    count += 1
                else:
                    break
            if count >= self.win_condition:
                return True
        return False
    
    def get_ai_move(self, level):
        def check_line_win(symbol):
            for r in range(self.size):
                for c in range(self.size):
                    if self.board[r][c] == '.':
                        self.board[r][c] = symbol
                        if self.check_winner(r, c):
                            self.board[r][c] = '.'
                            return (r, c)
                        self.board[r][c] = '.'
            return None
        
        win_move = check_line_win(self.symbols[self.current_player])
        if win_move:
            return win_move
        
        for i in range(self.players):
            if i != self.current_player:
                block_move = check_line_win(self.symbols[i])
                if block_move:
                    return block_move
        
        empty_cells = [(r, c) for r in range(self.size) for c in range(self.size) if self.board[r][c] == '.']
        return self.pick_valid_move(empty_cells)
    
    def pick_valid_move(self, empty_cells):
        if self.first_move[self.current_player]:
            row_min, row_max, col_min, col_max = self.player_limits.get(self.current_player, (0, 15, 0, 15))
            empty_cells = [(r, c) for r, c in empty_cells if row_min <= r < row_max and col_min <= c < col_max]
        return random.choice(empty_cells) if empty_cells else None
    
    def make_move(self, row, col):
        row -= 1  # Convert to 0-based index
        col = ord(col.upper()) - ord('A')  # Convert letter to index
        
        if not (0 <= row < self.size and 0 <= col < self.size) or self.board[row][col] != '.':
            return False
        
        self.board[row][col] = self.symbols[self.current_player]
        self.moves_played += 1
        self.display_board()
        
        if self.check_winner(row, col):
            print(f"Player {self.symbols[self.current_player]} wins!")
            exit()
        
        self.first_move[self.current_player] = False
        self.current_player = (self.current_player + 1) % self.players
        return True
    
    def start_game(self):
        print("Welcome to Multiplayer Gobang (1-4 players)")
        self.players = int(input("Enter number of players (1-4): "))
        self.symbols = ['X', 'O', '#', '@'][:self.players]
        self.first_move = [True] * self.players
        
        for i in range(self.players):
            ai_choice = input(f"Is player {self.symbols[i]} an AI? (yes/no): ").strip().lower()
            self.is_ai.append(ai_choice == 'yes')
            if ai_choice == 'yes':
                level = int(input(f"Choose AI difficulty for {self.symbols[i]} (1=Standard, 2=Advanced): "))
                self.ai_levels.append(level)
            else:
                self.ai_levels.append(None)
        
        self.display_board()
        while True:
            print(f"Player {self.symbols[self.current_player]}'s turn")
            if self.is_ai[self.current_player]:
                row, col = self.get_ai_move(self.ai_levels[self.current_player])
                row += 1
                col = self.column_labels[col]
                print(f"AI chooses: {col}{row}")
            else:
                move = input("Enter your move (e.g., D5): ").strip().upper()
                col, row = move[0], int(move[1:])
            
            if self.make_move(row, col):
                continue
            else:
                print("Invalid move! Try again.")

# Start the game
game = Gobang()
game.start_game()
