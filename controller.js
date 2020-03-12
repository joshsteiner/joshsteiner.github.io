/*
  UI controller
*/

function setAlgorithm(value) {
  switch (value) {
    case "Random Move":
      chooseBestMove = chooseRandomMove;
      break;
    case "Minimax":
      chooseBestMove = chooseBestMoveMinimax(minimax);
      break;
    case "Minimax with α-β pruning":
      chooseBestMove = chooseBestMoveMinimax(minimaxWithAlphaBetaPruning);
      break;
  }
}

function setHeuristic(value) {
  switch (value) {
    case "Material":
      scoreBoard = scoreBoardMaterial;
      break;
    case "Material with position bias":
      scoreBoard = scoreBoardWithPositionBias;
      break;
  }
}

function setDepth(value) {
  if (typeof value === 'string') {
    value = parseInt(value);
  }
  searchDepth = value;
}

function getPieceRepr(piece) {
  let value = 0x2654;
  switch (piece.pieceType) {
    case KING:   value += 0; break;
    case QUEEN:  value += 1; break;
    case ROOK:   value += 2; break;
    case BISHOP: value += 3; break;
    case KNIGHT: value += 4; break;
    case PAWN:   value += 5; break;
  }
  if (piece.color === BLACK) {
    value += 6;
  }
  return String.fromCodePoint(value);
}

function initPieces() {
  for (let i = 0; i < 8; ++i) {
    for (let j = 0; j < 8; ++j) {
      const piece = board[i][j];
      const repr = piece === null ? ' ' : getPieceRepr(piece);
      const coord = String.fromCharCode('a'.codePointAt(0) + j) + (i + 1);
      document.getElementById(coord).textContent = repr;
    }
  }
}

function clearHighlights() {
  for (let iter = 0; iter < 64; ++iter) {
    document.getElementsByTagName('td')[iter].style.backgroundColor = 'white';
  }
}

let positionChosen = null;

function squareClicked(elem) {
  const positionClicked = Position.fromAN(elem.id);
  clearHighlights();
  // if position was already clicked
  if (positionChosen) {
    const pieceChosen = pieceAtPos(board, positionChosen);
    // if can move
    if (possibleMovesFromPosition(board, pieceChosen.color, positionChosen)
        .map(x => x.to)
        .some(pos => pos.row === positionClicked.row && pos.column === positionClicked.column)) {
      applyMove({
        from: positionChosen,
        to: positionClicked,
      }, board);
      currentColor = switchColor(currentColor);
      initPieces();

      // ai move
      const startTime = performance.now();
      const aiMove = chooseBestMove(board, currentColor);
      const endTime = performance.now();
      applyMove(aiMove, board);
      currentColor = switchColor(currentColor);
      initPieces();

      document.getElementById('evaluated-positions').innerText = counter;
      document.getElementById('computation time').innerText = ((endTime - startTime) / 1000) + ' s';
    }
    positionChosen = null;
  } else {
    const piece = pieceAtPos(board, positionClicked);
    if (piece === null || piece.color !== currentColor) {
      return;
    }
    elem.style.backgroundColor = 'orange';
    possibleMovesFromPosition(board, piece.color, positionClicked).forEach(m => {
      const ppos = m.to.toAN();
      document.getElementById(ppos).style.backgroundColor = 'orange';
    });
    positionChosen = positionClicked;
  }
}

initPieces();
setAlgorithm(document.getElementById('Algorithm').value);
setDepth(document.getElementById('SearchDepth').value);
setHeuristic(document.getElementById('HeuristicFunction').value);
