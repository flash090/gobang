import tkinter as tk
import random

class Gobang:
    def __init__(self, size=15, players=1, win_condition=5):
        self.size = size  # Board size (15x15 by default)
        self.board = [['.' for _ in range(size)] for _ in range(size)]  # Empty board
        self.players = players  # Ensure at least one player
        self.symbols = ['X', 'O', '#', '@'][:self.players]  # Unique symbols for each player
        self.current_player = 0  # Index of the current player
        self.moves_played = 0  # Count of moves played
        self.is_ai = [False] * self.players  # AI status for each player
        self.ai_levels = [None] * self.players  # AI difficulty levels
        self.win_condition = win_condition  # 4-in-a-row or 5-in-a-row
        self.column_labels = [chr(i) for i in range(ord('A'), ord('A') + self.size)]  # A-O columns
        self.player_limits = {}  # To track player-specific move limits
        self.first_move = [True] * self.players  # Track if it's the player's first move
        self.set_player_limits()  # Initialize move limits
        self.init_ui()  # Initialize the UI
        self.game_over = False  # Track if the game is over

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

    def update_message(self, message):
        self.message_label.config(text=message)

    def get_ai_move(self, level):
        # 获取当前玩家的范围限制
        row_min, row_max, col_min, col_max = self.player_limits.get(self.current_player, (0, 15, 0, 15))
        
        # 如果是第一回合，只考虑允许范围内的空位置
        if self.first_move[self.current_player]:
            empty_cells = [(r, c) for r in range(row_min, row_max) 
                          for c in range(col_min, col_max) 
                          if self.board[r][c] == '.']
        else:
            empty_cells = [(r, c) for r in range(self.size) 
                          for c in range(self.size) 
                          if self.board[r][c] == '.']
            
        return random.choice(empty_cells) if empty_cells else None

    def make_move(self, row, col):
        if self.game_over:
            return False

        row -= 1  # Convert to 0-based index
        col = ord(col.upper()) - ord('A')  # Convert letter to index

        if not (0 <= row < self.size and 0 <= col < self.size) or self.board[row][col] != '.':
            self.update_message("Invalid move! Try again.")
            return False

        # 第一回合范围限制检查
        if self.first_move[self.current_player]:
            row_min, row_max, col_min, col_max = self.player_limits.get(self.current_player, (0, 15, 0, 15))
            if not (row_min <= row < row_max and col_min <= col < col_max):
                self.update_message("Move out of allowed first-move area! Try again.")
                return False

        self.board[row][col] = self.symbols[self.current_player]  # Place player's symbol
        self.moves_played += 1
        self.display_board()

        if self.check_winner(row, col):
            self.update_message(f"Player {self.symbols[self.current_player]} wins!")
            self.game_over = True
            self.canvas.unbind("<Button-1>")  # Disable clicking on the canvas
            return True

        if self.moves_played == self.size * self.size:
            self.update_message("It's a draw!")
            self.game_over = True
            self.canvas.unbind("<Button-1>")  # Disable clicking on the canvas
            return True

        self.first_move[self.current_player] = False  # 只在合法落子后取消限制
        self.current_player = (self.current_player + 1) % self.players  # Switch to next player
        self.update_message(f"Player {self.symbols[self.current_player]}'s turn")
        return True

    def check_winner(self, row, col):
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
        for dr, dc in directions:
            count = 1
            for direction in [1, -1]:
                r, c = row + direction * dr, col + direction * dc
                while 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == self.symbols[self.current_player]:
                    count += 1
                    if count >= self.win_condition:
                        return True
                    r += direction * dr
                    c += direction * dc
        return False

    def start_game(self):
        print("Welcome to Multiplayer Gobang (1-4 players)")
        while True:
            try:
                self.players = int(input("Enter number of players (1-4): "))
                if 1 <= self.players <= 4:
                    self.symbols = ['X', 'O', '#', '@'][:self.players]
                    self.first_move = [True] * self.players  # 确保 first_move 正确初始化
                    self.is_ai = [False] * self.players  # Reinitialize AI status list
                    self.ai_levels = [None] * self.players  # Reinitialize AI levels list
                    self.set_player_limits()  # 重新设置玩家限制
                    break
                else:
                    print("Invalid input! Please enter 1, 2, 3, or 4.")
            except ValueError:
                print("Invalid input! Please enter a number.")

        while True:
            try:
                self.win_condition = int(input("Choose victory condition (4-in-a-row or 5-in-a-row): "))
                if self.win_condition in [4, 5]:
                    break
                else:
                    print("Invalid input! Choose 4 or 5.")
            except ValueError:
                print("Invalid input! Please enter a number.")

        for i in range(self.players):
            while True:
                ai_choice = input(f"Is player {self.symbols[i]} an AI? (yes/no): ").strip().lower()
                if ai_choice in ['yes', 'no']:
                    self.is_ai[i] = ai_choice == 'yes'
                    if ai_choice == 'yes':
                        while True:
                            try:
                                level = int(input(f"Choose AI difficulty for {self.symbols[i]} (1=Standard, 2=Advanced): "))
                                if 1 <= level <= 2:
                                    self.ai_levels[i] = level
                                    break
                                else:
                                    print("Invalid input! Choose 1 or 2.")
                            except ValueError:
                                print("Invalid input! Please enter a number.")
                    else:
                        self.ai_levels[i] = None
                    break
                else:
                    print("Invalid input! Please enter 'yes' or 'no'.")

        self.display_board()
        self.run_ui()

    def init_ui(self):
        self.root = tk.Tk()
        self.root.title("Gobang Game")
        self.message_label = tk.Label(self.root, text="", font=("Helvetica", 14))
        self.message_label.pack()
        self.canvas = tk.Canvas(self.root, width=self.size * 40, height=self.size * 40)
        self.canvas.pack()
        self.canvas.bind("<Button-1>", self.click_event)
        self.draw_board()

    def draw_board(self):
        for i in range(self.size):
            for j in range(self.size):
                x0 = i * 40
                y0 = j * 40
                x1 = x0 + 40
                y1 = y0 + 40
                self.canvas.create_rectangle(x0, y0, x1, y1, outline="black")
                if self.board[j][i] != '.':
                    self.canvas.create_text((x0 + x1) // 2, (y0 + y1) // 2, text=self.board[j][i], font=("Helvetica", 20))

    def update_board(self):
        self.canvas.delete("all")
        self.draw_board()

    def click_event(self, event):
        col = event.x // 40
        row = event.y // 40
        click_x = event.x % 40
        click_y = event.y % 40
        if 10 <= click_x <= 30 and 10 <= click_y <= 30:  # Ensure the click is within the vicinity of the grid point
            if self.make_move(row + 1, chr(col + ord('A'))):
                self.update_board()

    def run_ui(self):
        self.root.after(100, self.check_ai_move)
        self.root.mainloop()

    def check_ai_move(self):
        if self.is_ai[self.current_player] and not self.game_over:
            move = self.get_ai_move(self.ai_levels[self.current_player])
            if move:
                row, col = move
                self.make_move(row + 1, chr(col + ord('A')))
                self.update_board()
        self.root.after(100, self.check_ai_move)

# Start the game
game = Gobang()
game.start_game()
