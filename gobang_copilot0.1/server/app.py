from flask import Flask, request, jsonify
from flask_cors import CORS  # 允许跨域请求

app = Flask(__name__)
CORS(app)

BOARD_SIZE = 15
EMPTY_CELL = '.'
board = [[EMPTY_CELL] * BOARD_SIZE for _ in range(BOARD_SIZE)]

@app.route("/", methods=["GET"])
def home():
    return "Flask server is running!"

@app.route('/move', methods=['POST'])
def move():
    data = request.json
    row = data.get('row')
    col = data.get('col')
    symbol = data.get('symbol')

    if board[row][col] != EMPTY_CELL:
        return jsonify(success=False, message="Cell already taken")

    board[row][col] = symbol
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)
