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
        self.ai_levels = []  # AI difficulty levels
        self.win_condition = win_condition  # 4-in-a-row or 5-in-a-row
        self.column_labels = [chr(i) for i in range(ord('A'), ord('A') + self.size)]  # A-O columns
        self.player_limits = {}  # To track player-specific move limits
        self.first_move = [True] * self.players  # Track if it's the player's first move

    def display_board(self):
        print("   " + " ".join(self.column_labels))  # Column labels A-O
        for i, row in enumerate(self.board, start=1):
            print(str(i).rjust(2) + " " + " ".join(row))  # Row numbers from 1 to 15
    
    def check_winner(self, row, col):
        symbol = self.board[row][col]
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]  # Vertical, Horizontal, Diagonal-right, Diagonal-left
        
        for dr, dc in directions:
            count = 1
            for step in range(1, self.win_condition):  # Check forward
                r, c = row + dr * step, col + dc * step
                if 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == symbol:
                    count += 1
                else:
                    break
            for step in range(1, self.win_condition):  # Check backward
                r, c = row - dr * step, col - dc * step
                if 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == symbol:
                    count += 1
                else:
                    break
            if count >= self.win_condition:
                return True  # Winning condition met
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
        
        # Try to win
        win_move = check_line_win(self.symbols[self.current_player])
        if win_move:
            return win_move
        
        # Try to block opponent from winning
        for i in range(self.players):
            if i != self.current_player:
                block_move = check_line_win(self.symbols[i])
                if block_move:
                    return block_move
        
        # Otherwise, pick an empty cell which is better
        empty_cells = [(r, c) for r in range(self.size) for c in range(self.size) if self.board[r][c] == '.']
        return self.pick_valid_move(empty_cells)

    def evaluate_move(self, row, col, player_symbol):
        """
        评估该位置的优先级，评分规则如下：
        1. 优先选择自己棋子多的地方。
        2. 优先选择中心位置。
        3. 避免对方棋子多的地方。
        4. 优先形成2-in-a-row或3-in-a-row的潜力。
        """
        score = 0
        
        # 中心位置加分
        center = self.size // 2
        if abs(row - center) <= 1 and abs(col - center) <= 1:
            score += 5  # 靠近中心增加优先级

        # 检查当前位置周围的棋子数，优先选择自己棋子多的地方
        for direction in [(1, 0), (0, 1), (1, 1), (1, -1)]:
            count_self = 0
            count_opponent = 0
            for step in range(1, 3):  # 检查2个相邻位置
                r, c = row + direction[0] * step, col + direction[1] * step
                if 0 <= r < self.size and 0 <= c < self.size:
                    if self.board[r][c] == player_symbol:
                        count_self += 1
                    elif self.board[r][c] != '.':
                        count_opponent += 1
            # 如果自己棋子多的地方，增加分数
            if count_self > count_opponent:
                score += 3  # 自己棋子更多的地方加分

        # 避免对方棋子多的地方
        for direction in [(1, 0), (0, 1), (1, 1), (1, -1)]:
            count_opponent = 0
            for step in range(1, 3):
                r, c = row + direction[0] * step, col + direction[1] * step
                if 0 <= r < self.size and 0 <= c < self.size:
                    if self.board[r][c] != '.' and self.board[r][c] != player_symbol:
                        count_opponent += 1
            # 如果对方棋子较多，降低分数
            if count_opponent >= 2:
                score -= 3  # 对方棋子更多的地方扣分

        # 检查是否有2-in-a-row或者3-in-a-row的潜力
        count_self = self.check_line_potential(row, col, player_symbol)
        score += count_self

        return score

    def check_line_potential(self, row, col, player_symbol):
        """
        检查是否能在指定位置形成2-in-a-row或3-in-a-row的潜力。
        """
        potential_score = 0
        for direction in [(1, 0), (0, 1), (1, 1), (1, -1)]:
            # 对每个方向检查潜力
            for step in range(1, self.win_condition):
                r, c = row + direction[0] * step, col + direction[1] * step
                if 0 <= r < self.size and 0 <= c < self.size:
                    if self.board[r][c] == player_symbol:
                        potential_score += 1
                    else:
                        break
                else:
                    break
            for step in range(1, self.win_condition):
                r, c = row - direction[0] * step, col - direction[1] * step
                if 0 <= r < self.size and 0 <= c < self.size:
                    if self.board[r][c] == player_symbol:
                        potential_score += 1
                    else:
                        break
                else:
                    break
        return potential_score

    def pick_valid_move(self, empty_cells):
        """
        从可用的空位置中选择最佳位置。
        """
        best_move = None
        best_score = -float('inf')  # 初始化为极小的值

        # 评估每个空位置的分数
        for row, col in empty_cells:
            score = self.evaluate_move(row, col, self.symbols[self.current_player])
            if score > best_score:
                best_score = score
                best_move = (row, col)

        return best_move

    def is_move_allowed(self, player, row, col):
        limit = self.player_limits.get(player, None)
        if limit:
            row_min, row_max, col_min, col_max = limit
            return row_min <= row < row_max and col_min <= col < col_max
        return True  # No limitation, player can move anywhere

    def set_player_limits(self):
        if self.players == 3:
            self.player_limits[0] = (8, 15, 8, 15)  # Player 1's restricted area
            self.player_limits[1] = (5, 15, 5, 15)  # Player 2's restricted area
            self.player_limits[2] = (0, 15, 0, 15)  # Player 3 has no restriction
        elif self.players == 4:
            self.player_limits[0] = (8, 15, 8, 15)  # Player 1's restricted area
            self.player_limits[1] = (6, 15, 6, 15)  # Player 2's restricted area
            self.player_limits[2] = (4, 15, 4, 15)  # Player 3's restricted area
            self.player_limits[3] = (0, 15, 0, 15)  # Player 4 has no restriction

    def make_move(self, row, col):
        row -= 1  # Convert to 0-based index
        col = ord(col.upper()) - ord('A')  # Convert letter to index
        
        if not (0 <= row < self.size and 0 <= col < self.size) or self.board[row][col] != '.':
            return False
        
        self.board[row][col] = self.symbols[self.current_player]  # Place player's symbol
        self.moves_played += 1
        self.display_board()
        
        if self.check_winner(row, col):
            print(f"Player {self.symbols[self.current_player]} wins!")
            exit()
        
        if self.moves_played == self.size * self.size:
            print("It's a draw!")
            exit()
        
        self.first_move[self.current_player] = False  # After the first move, no more restrictions
        self.current_player = (self.current_player + 1) % self.players  # Switch to next player
        return True
    
    def start_game(self):
        print("Welcome to Multiplayer Gobang (1-4 players)")
        while True:
            try:
                self.players = int(input("Enter number of players (1-4): "))
                if 1 <= self.players <= 4:
                    self.symbols = ['X', 'O', '#', '@'][:self.players]
                    break
                else:
                    print("Invalid input! Please enter 1, 2, 3, or 4.")
            except ValueError:
                print("Invalid input! Please enter a number.")
        
        for i in range(self.players):
            while True:
                ai_choice = input(f"Is player {self.symbols[i]} an AI? (yes/no): ").strip().lower()
                if ai_choice in ['yes', 'no']:
                    self.is_ai.append(ai_choice == 'yes')
                    if ai_choice == 'yes':
                        while True:
                            try:
                                level = int(input(f"Choose AI difficulty for {self.symbols[i]} (1=Easy, 2=Medium, 3=Hard): "))
                                if 1 <= level <= 3:
                                    self.ai_levels.append(level)
                                    break
                                else:
                                    print("Invalid input! Choose 1, 2, or 3.")
                            except ValueError:
                                print("Invalid input! Please enter a number.")
                    else:
                        self.ai_levels.append(None)
                    break
                else:
                    print("Invalid input! Please enter 'yes' or 'no'.")
        
        self.set_player_limits()  # Set player-specific move limits
        
        while True:
            try:
                self.win_condition = int(input("Choose victory condition (4-in-a-row or 5-in-a-row): "))
                if self.win_condition in [4, 5]:
                    break
                else:
                    print("Invalid input! Choose 4 or 5.")
            except ValueError:
                print("Invalid input! Please enter a number.")
        
        self.display_board()
        while True:
            print(f"Player {self.symbols[self.current_player]}'s turn")
            if self.is_ai[self.current_player]:
                row, col = self.get_ai_move(self.ai_levels[self.current_player])
                row += 1  # Convert back to 1-based index
                col = self.column_labels[col]  # Convert index to letter
                print(f"AI chooses: {col}{row}")
            else:
                try:
                    move = input("Enter your move (e.g., D5): ").strip().upper()
                    col, row = move[0], int(move[1:])
                except (ValueError, IndexError):
                    print("Invalid input! Use letter + number format (e.g., D5).")
                    continue
            
            if self.make_move(row, col):
                continue
            else:
                print("Invalid move! Try again.")

# Start the game
game = Gobang(players=3)  # Change this number to 1-4 based on the number of players
game.start_game()
