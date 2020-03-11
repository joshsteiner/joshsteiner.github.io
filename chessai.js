let searchDepth = 4;
let chooseBestMove = chooseBestMoveMinimax(minimaxWithAlphaBetaPruning);
let counter;

const
  WHITE=1,
  BLACK=2;

const
  PAWN=1,
  KNIGHT=2,
  BISHOP=3,
  ROOK=4,
  QUEEN=5,
  KING=6;

function switchColor(color) {
  return color === WHITE ? BLACK : WHITE;
}

function piece_at_pos(board, pos) {
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

  standardNotation() {
    return String.fromCharCode('a'.codePointAt(0) + this.column) + (this.row + 1);
  }
}

class Move {
  constructor(o) {
    this.from = o.from;
    this.to = o.to;
  }

  standardNotation() {
    return this.from.standardNotation() + '-' + this.to.standardNotation()
  }
}

function occupiedBySameColorOrOffBoard(board, pos, color) {
  return (
    pos.column < 0 ||
    pos.row < 0 ||
    pos.row >= board.length ||
    pos.column >= board[0].length ||
    (
      piece_at_pos(board, pos) !== null &&
      piece_at_pos(board, pos).color === color
    )
  );
}

function occupiedByOpposite(board, pos, color) {
  return (
    pos.column >= 0 &&
    pos.row >= 0 &&
    pos.row < board.length &&
    pos.column <= board[0].length &&
    piece_at_pos(board, pos) !== null &&
    piece_at_pos(board, pos).color !== color
  );
}

function possibleMoves(board, color) {
  let moves = [];

  for (let r = 0; r < board.length; ++r) {
    for (let c = 0; c < board[0].length; ++c) {
      const position = new Position({ column: c, row: r });

      moves = moves.concat(possibleMovesFromPosition(board, color, position));
    }
  }

  return moves;
}

function* possiblePositions(board, color) {
  for (let move in possibleMoves(board, color)) {
    const piece = applyMove(move, board);
    yield board;
    board[move.to.row][move.to.column] = piece;
  }
}

function possibleMovesFromPosition(board, color, position) {
  let dest = [];
  const piece = piece_at_pos(board, position);
  if (piece === null || piece.color !== color) {
    return [];
  }
  switch (piece.piece_type) {
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

function pieceValue(piece_type) {
  switch (piece_type) {
    case PAWN:   return 1;
    case KNIGHT: return 3;
    case BISHOP: return 3;
    case ROOK:   return 5;
    case QUEEN:  return 9;
    case KING:   return 150;
  }
}

function scorePosition(board) {
  let score = 0;
  for (let i = 0; i < 8; ++i) {
    for (let j = 0; j < 8; ++j) {
      const piece = board[i][j];
      if (piece === null) {
        continue;
      }
      score += pieceValue(piece.piece_type) * (piece.color === WHITE ? +1 : -1);
    }
  }
  return score;
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
      let p = repr[board[r][c].piece_type];
      if (board[r][c].color === WHITE) {
        p = p.toLowerCase();
      }
      rowRepr += p;
    }
    console.log(rowRepr);
  }
}

function reverseMove(move) {
  return new Move({
    from: move.to,
    to: move.from,
  });
}

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

let currentColor = WHITE;
let board = [
  [
    {color: WHITE, piece_type: ROOK},
    {color: WHITE, piece_type: KNIGHT},
    {color: WHITE, piece_type: BISHOP},
    {color: WHITE, piece_type: QUEEN},
    {color: WHITE, piece_type: KING},
    {color: WHITE, piece_type: BISHOP},
    {color: WHITE, piece_type: KNIGHT},
    {color: WHITE, piece_type: ROOK},
  ],
  [
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
    {color: WHITE, piece_type: PAWN},
  ],
  [ null, null, null, null, null, null, null, null, ],
  [ null, null, null, null, null, null, null, null, ],
  [ null, null, null, null, null, null, null, null, ],
  [ null, null, null, null, null, null, null, null, ],
  [
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
    {color: BLACK, piece_type: PAWN},
  ],
  [
    {color: BLACK, piece_type: ROOK},
    {color: BLACK, piece_type: KNIGHT},
    {color: BLACK, piece_type: BISHOP},
    {color: BLACK, piece_type: QUEEN},
    {color: BLACK, piece_type: KING},
    {color: BLACK, piece_type: BISHOP},
    {color: BLACK, piece_type: KNIGHT},
    {color: BLACK, piece_type: ROOK},
  ],
];

function minimaxWithAlphaBetaPruning(board, color, depth, alpha, beta) {
  ++counter;
  if (depth === 1) {
    return scorePosition(board);
  }

  if (color === WHITE) {
    let bestMove = -Infinity;
    for (let move of possibleMoves(board, color)) {
      const removedPiece = applyMove(move, board);
      bestMove = Math.max(
        bestMove,
        minimaxWithAlphaBetaPruning(
          board,
          switchColor(color),
          depth - 1,
          alpha,
          beta
        )
      );
      applyMove(reverseMove(move), board);
      board[move.to.row][move.to.column] = removedPiece;
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) {
        return bestMove
      }
    }
    return bestMove;
  } else {
    let bestMove = Infinity;
    for (let move of possibleMoves(board, color)) {
      const removedPiece = applyMove(move, board);
      bestMove = Math.min(
        bestMove,
        minimaxWithAlphaBetaPruning(
          board,
          switchColor(color),
          depth - 1,
          alpha,
          beta,
        )
      );
      applyMove(reverseMove(move), board);
      board[move.to.row][move.to.column] = removedPiece;
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) {
        return bestMove
      }
    }
    return bestMove;
  }
}

function minimax(board, color, depth) {
  ++counter;
  if (depth === 1) {
    return scorePosition(board);
  }

  if (color === WHITE) {
    let bestMove = -Infinity;
    for (let move of possibleMoves(board, color)) {
      const removedPiece = applyMove(move, board);
      bestMove = Math.max(
        bestMove,
        minimax(board, switchColor(color), depth - 1)
      );
      applyMove(reverseMove(move), board);
      board[move.to.row][move.to.column] = removedPiece;
    }
    return bestMove;
  } else {
    let bestMove = Infinity;
    for (let move of possibleMoves(board, color)) {
      const removedPiece = applyMove(move, board);
      bestMove = Math.min(
        bestMove,
        minimax(board, switchColor(color), depth - 1)
      );
      applyMove(reverseMove(move), board);
      board[move.to.row][move.to.column] = removedPiece;
    }
    return bestMove;
  }
}

function chooseBestMoveMinimax(algorithm) {
  return function(board, color) {
    counter = 0;
    let f, bestScore;
    let bestMoves = [];
    if (color === WHITE) {
      f = Math.max;
      bestScore = -Infinity;
    } else {
      f = Math.min;
      bestScore = Infinity;
    }
    for (let move of possibleMoves(board, color)) {
      const removedPiece = applyMove(move, board);
      const childScore = algorithm(board, switchColor(color), searchDepth, -Infinity, Infinity);
      applyMove(reverseMove(move), board);
      board[move.to.row][move.to.column] = removedPiece;
      if (f(childScore, bestScore) === childScore) {
        if (childScore === bestScore) {
          bestMoves.push(move);
        } else {
          bestMoves = [move];
        }
        bestScore = childScore;
      }
    }
    return bestMoves[Math.floor(Math.random() * 1000) % bestMoves.length];
  }
}

function chooseRandomMove(board, color) {
  counter = 0;
  const moves = possibleMoves(board, color);
  return moves[Math.floor(Math.random() * 1000) % moves.length];
}
