/*
  Chess game implementation and position generation
*/

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const WHITE = 1;
const BLACK = 2;

const PAWN = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK = 4;
const QUEEN = 5;
const KING = 6;

let currentColor = WHITE;
let searchDepth
let chooseBestMove;
let scoreBoard;
let counter;

let board = [
  [
    { color: WHITE, pieceType: ROOK },
    { color: WHITE, pieceType: KNIGHT },
    { color: WHITE, pieceType: BISHOP },
    { color: WHITE, pieceType: QUEEN },
    { color: WHITE, pieceType: KING },
    { color: WHITE, pieceType: BISHOP },
    { color: WHITE, pieceType: KNIGHT },
    { color: WHITE, pieceType: ROOK },
  ],
  [
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
    { color: WHITE, pieceType: PAWN },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
    { color: BLACK, pieceType: PAWN },
  ],
  [
    { color: BLACK, pieceType: ROOK },
    { color: BLACK, pieceType: KNIGHT },
    { color: BLACK, pieceType: BISHOP },
    { color: BLACK, pieceType: QUEEN },
    { color: BLACK, pieceType: KING },
    { color: BLACK, pieceType: BISHOP },
    { color: BLACK, pieceType: KNIGHT },
    { color: BLACK, pieceType: ROOK },
  ],
];

function switchColor(color) {
  return color === WHITE ? BLACK : WHITE;
}

function pieceAtPos(board, pos) {
  const p = board[pos.row][pos.column];
  return p ? p : null;
}

class Position {
  constructor(o) {
    this.row = o.row;
    this.column = o.column;
  }

  offset(dr, dc) {
    return new Position({
      row: this.row + dr,
      column: this.column + dc,
    });
  }

  // return analogous square from the point of view of the opposite color
  mirror() {
    return new Position({
      row: BOARD_HEIGHT - this.row - 1,
      column: BOARD_WIDTH - this.column - 1,
    });
  }

  // return algebraic notation representation
  toAN() {
    return String.fromCharCode('a'.codePointAt(0) + this.column) + (this.row + 1);
  }

  static fromAN(pos) {
    const row = Number(pos[1]) - 1;
    const column = pos[0].codePointAt(0) - 'a'.codePointAt(0);
    return new Position({ row, column });
  }
}

class Move {
  constructor(o) {
    this.from = o.from;
    this.to = o.to;
  }

  toAN() {
    return this.from.toAN() + '-' + this.to.toAN()
  }

  reverse() {
    return new Move({
      from: this.to,
      to: this.from,
    });
  }
}

function occupiedBySameColorOrOffBoard(board, pos, color) {
  return (
    pos.column < 0 ||
    pos.row < 0 ||
    pos.row >= BOARD_HEIGHT ||
    pos.column >= BOARD_WIDTH ||
    (
      pieceAtPos(board, pos) !== null &&
      pieceAtPos(board, pos).color === color
    )
  );
}

function occupiedByOpposite(board, pos, color) {
  return (
    pos.column >= 0 &&
    pos.row >= 0 &&
    pos.row < BOARD_HEIGHT &&
    pos.column < BOARD_WIDTH &&
    pieceAtPos(board, pos) !== null &&
    pieceAtPos(board, pos).color !== color
  );
}

function possibleMoves(board, color) {
  let moves = [];
  for (let row = 0; row < BOARD_HEIGHT; ++row) {
    for (let column = 0; column < BOARD_WIDTH; ++column) {
      const position = new Position({ column, row });
      moves = moves.concat(possibleMovesFromPosition(board, color, position));
    }
  }
  return moves;
}

function possibleMovesFromPosition(board, color, position) {
  let dest = [];
  const piece = pieceAtPos(board, position);
  if (piece === null || piece.color !== color) {
    return [];
  }
  switch (piece.pieceType) {
    case PAWN:
      {
        let pawn_position = [];
        const dir = (piece.color === WHITE) ? +1 : -1;
        let firstRow = false;
        if ((piece.color === WHITE && position.row === 1) ||
            (piece.color === BLACK && position.row === 6)) {
          firstRow = true;
        }
        if (!occupiedBySameColorOrOffBoard(board, position.offset(1 * dir, 0), color) &&
            !occupiedByOpposite(board, position.offset(1 * dir, 0), color)) {
          pawn_position.push(position.offset(1 * dir, 0));
          if (firstRow && !occupiedBySameColorOrOffBoard(board, position.offset(2 * dir, 0), color) &&
              !occupiedByOpposite(board, position.offset(1 * dir, 0), color) &&
              !occupiedByOpposite(board, position.offset(2 * dir, 0), color)) {
            pawn_position.push(position.offset(2 * dir, 0));
          }
        }
        if (occupiedByOpposite(board, position.offset(1 * dir, -1), color)) {
          pawn_position.push(position.offset(1 * dir, -1));
        }
        if (occupiedByOpposite(board, position.offset(1 * dir, +1), color)) {
          pawn_position.push(position.offset(1 * dir, +1));
        }
        dest = pawn_position;
      }
      break;
    case KNIGHT:
      {
        const knight_postitions = [
          position.offset(-2, -1),
          position.offset(-2, +1),
          position.offset(-1, -2),
          position.offset(-1, +2),
          position.offset(+1, -2),
          position.offset(+1, +2),
          position.offset(+2, -1),
          position.offset(+2, +1),
        ].filter((pos) => !occupiedBySameColorOrOffBoard(board, pos, color));
        dest = knight_postitions;
      }
      break;
    case BISHOP:
      {
        let bishop_positions = [];
        const move_directions = [
          [-1, -1], [-1, +1], [+1, -1], [+1, +1],
        ];
        move_directions.forEach(dir => {
          for (let i = 1; ; ++i) {
            const bp = position.offset(i * dir[0], i * dir[1]);
            if (occupiedBySameColorOrOffBoard(board, bp, color)) {
              break;
            } else if (occupiedByOpposite(board, bp, color)) {
              bishop_positions.push(bp);
              break;
            } else {
              bishop_positions.push(bp);
            }
          }
        });
        dest = bishop_positions;
      }
      break;
    case ROOK:
      {
        let rook_positions = [];
        const move_directions = [
          [-1, 0], [+1, 0], [0, -1], [0, +1],
        ];
        move_directions.forEach(dir => {
          for (let i = 1; ; ++i) {
            const bp = position.offset(i * dir[0], i * dir[1]);
            if (occupiedBySameColorOrOffBoard(board, bp, color)) {
              break;
            } else if (occupiedByOpposite(board, bp, color)) {
              rook_positions.push(bp);
              break;
            } else {
              rook_positions.push(bp);
            }
          }
        });
        dest = rook_positions;
      }
      break;
    case QUEEN:
      {
        let queen_positions = [];
        const move_directions = [
          [-1, -1], [-1, +1], [+1, -1], [+1, +1],
          [-1, 0], [+1, 0], [0, -1], [0, +1],
        ];
        move_directions.forEach(dir => {
          for (let i = 1; ; ++i) {
            const bp = position.offset(i * dir[0], i * dir[1]);
            if (occupiedBySameColorOrOffBoard(board, bp, color)) {
              break;
            } else if (occupiedByOpposite(board, bp, color)) {
              queen_positions.push(bp);
              break;
            } else {
              queen_positions.push(bp);
            }
          }
        });
        dest = queen_positions;
      }
      break;
    case KING:
      {
        const king_positions = [
          position.offset(-1, -1),
          position.offset( 0, -1),
          position.offset(+1, -1),
          position.offset(-1,  0),
          position.offset(+1,  0),
          position.offset(-1, +1),
          position.offset( 0, +1),
          position.offset(+1, +1),
        ].filter((pos) => !occupiedBySameColorOrOffBoard(board, pos, color));
        dest = king_positions;
      }
      break;
  }

  return dest.map(d => {
    return new Move({
      from: position,
      to: d,
    })
  });
}

function printBoard(board) {
  const repr = [null, 'P', 'N', 'B', 'R', 'Q', 'K'];
  for (let r = 0; r < board.length; ++r) {
    let rowRepr = '';
    for (let c = 0; c < board[0].length; ++c) {
      if (board[r][c] === null) {
        rowRepr += '.';
        continue;
      }
      let p = repr[board[r][c].pieceType];
      if (board[r][c].color === WHITE) {
        p = p.toLowerCase();
      }
      rowRepr += p;
    }
    console.log(rowRepr);
  }
}

// returns piece if capture occured
function applyMove(move, board) {
  const piece = board[move.to.row][move.to.column];
  board[move.to.row][move.to.column] = board[move.from.row][move.from.column];
  board[move.from.row][move.from.column] = null;
  return piece;
}

function applyMoveCopy(move, board) {
  let newBoard = [];
  for (let r = 0; r < board.length; ++r) {
    newBoard.push([]);
    for (let c = 0; c < board[0].length; ++c) {
      newBoard[r][c] = board[r][c];
    }
  }
  applyMove(move, newBoard);
  return newBoard;
}
