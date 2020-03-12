/*
  Search algorithms
*/

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
      applyMove(move.reverse(), board);
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
      applyMove(move.reverse(), board);
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
      applyMove(move.reverse(), board);
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
      applyMove(move.reverse(), board);
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
      applyMove(move.reverse(), board);
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