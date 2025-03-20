// Générer l'échiquier avec des IDs uniques
const chessboard = document.getElementById('chessboard');

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        
        // Ajouter un ID unique basé sur la position
        square.id = `square-${row}-${col}`;
        
        // Ajouter les classes 'white' ou 'black'
        if ((row + col) % 2 === 0) {
            square.classList.add('white');
        } else {
            square.classList.add('black');
        }
        
        // Ajouter la classe 'square' pour styliser les cases
        square.classList.add('square');
        
        // Ajouter la case à l'échiquier
        chessboard.appendChild(square);
    }
}

// Configuration initiale des pièces
const initialBoard = [
    ['R', 'N', 'B', 'K', 'Q', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['rb', 'nb', 'bb', 'kb', 'qb', 'bb', 'nb', 'rb']
];

const pieceNames = {
    R: "Tour blanche", N: "Cavalier blanc", B: "Fou blanc", Q: "Reine blanche",
    K: "Roi blanc", P: "Pion blanc",
    rb: "Tour noire", nb: "Cavalier noir", bb: "Fou noir", qb: "Reine noire",
    kb: "Roi noir", p: "Pion noir"
};

const pieceImages = {
    R: "./images/rook_white.png", N: "./images/knight_white.png", B: "./images/bishop_white.png",
    Q: "./images/queen_white.png", K: "./images/king_white.png", P: "./images/pawn_white.png",
    rb: "./images/rook_black.png", nb: "./images/knight_black.png", bb: "./images/bishop_black.png",
    qb: "./images/queen_black.png", kb: "./images/king_black.png", p: "./images/pawn_black.png"
};

// Placer les pièces sur l'échiquier
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.getElementById(`square-${row}-${col}`);
        const piece = initialBoard[row][col];
        
        if (piece) {
            const pieceImg = document.createElement('img');
            pieceImg.src = pieceImages[piece];  // Associer l'image correcte
            pieceImg.alt = pieceNames[piece];  // Description textuelle
            pieceImg.classList.add('piece');   // Classe pour styliser l'image
            
            square.appendChild(pieceImg);      // Ajouter l'image dans la case
        }
    }
}

let selectedSquare = null;
let currentPlayer = 'white';  // Le joueur actuel (blanc ou noir), à changer selon le tour

document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', () => {
        const piece = square.querySelector('img');
        
        // Si aucune pièce n'est sélectionnée
        if (!selectedSquare) {
            // Vérifier si la pièce appartient au joueur actuel
            if (piece && 
                ((currentPlayer === 'white' && piece.src.includes('white')) || 
                (currentPlayer === 'black' && piece.src.includes('black')))) {
                selectedSquare = square;
                selectedSquare.classList.add('selected');
            } else {
                console.log('Sélection invalide: Vous devez cliquer sur une pièce de votre couleur.');
            }
            return;
        }

        // Si une pièce est déjà sélectionnée
        if (selectedSquare === square) {
            // Si la même case est cliquée, désélectionner
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            return;
        }

        // Si la nouvelle case contient une pièce de la même couleur, la sélectionner
        if (piece && 
            ((currentPlayer === 'white' && piece.src.includes('white')) || 
            (currentPlayer === 'black' && piece.src.includes('black')))) {
            selectedSquare.classList.remove('selected');
            selectedSquare = square;
            selectedSquare.classList.add('selected');
            return;
        }

        // Tenter le déplacement
        const startRow = parseInt(selectedSquare.id.split('-')[1]);
        const startCol = parseInt(selectedSquare.id.split('-')[2]);
        const endRow = parseInt(square.id.split('-')[1]);
        const endCol = parseInt(square.id.split('-')[2]);
        const selectedPiece = selectedSquare.querySelector('img');
        const pieceType = selectedPiece.alt;

        // Si le roi est en échec, vérifier d'abord si nous sommes en échec
        if (isCheck()) {
            // Simuler le mouvement pour voir s'il sort de l'échec
            const originalDestPiece = square.querySelector('img');
            
            // Sauvegarder l'état actuel
            selectedSquare.removeChild(selectedPiece);
            if (originalDestPiece) {
                square.removeChild(originalDestPiece);
            }
            square.appendChild(selectedPiece); 

            // Si le roi est toujours en échec après le mouvement
            if (isCheck()) {
                // Annuler le mouvement simulé
                square.removeChild(selectedPiece);
                selectedSquare.appendChild(selectedPiece);
                if (originalDestPiece) {
                    square.appendChild(originalDestPiece);
                }
                console.log("Ce mouvement ne sort pas de l'échec !");
                selectedSquare.classList.remove('selected');
                selectedSquare = null;
                return;
            }

            // Remettre les pièces en place pour la vérification normale du mouvement
            square.removeChild(selectedPiece);
            selectedSquare.appendChild(selectedPiece);
            if (originalDestPiece) {
                square.appendChild(originalDestPiece);
            }
        }

        // Vérifier si le mouvement est valide pour la pièce
        let isValid = false;
        switch (pieceType) {
            case 'Roi blanc':
            case 'Roi noir':
                isValid = isValidKingMove(startRow, startCol, endRow, endCol);
                break;
            case 'Reine blanche':
            case 'Reine noire':
                isValid = isValidQueenMove(startRow, startCol, endRow, endCol);
                break;
            case 'Tour blanche':
            case 'Tour noire':
                isValid = isValidRookMove(startRow, startCol, endRow, endCol);
                break;
            case 'Fou blanc':
            case 'Fou noir':
                isValid = isValidBishopMove(startRow, startCol, endRow, endCol);
                break;
            case 'Cavalier blanc':
            case 'Cavalier noir':
                isValid = isValidKnightMove(startRow, startCol, endRow, endCol);
                break;
            case 'Pion blanc':
                isValid = isValidPawnMove(1, startRow, startCol, endRow, endCol);
                break;
            case 'Pion noir':
                isValid = isValidPawnMove(-1, startRow, startCol, endRow, endCol);
                break;
        }

        if (isValid) {
            // Simuler le mouvement pour vérifier s'il met ou laisse le roi en échec
            const originalDestPiece = square.querySelector('img');
            
            // Sauvegarder l'état actuel
            selectedSquare.removeChild(selectedPiece);
            if (originalDestPiece) {
                square.removeChild(originalDestPiece);
            }
            square.appendChild(selectedPiece);

            // Vérifier si le roi est en échec après le mouvement
            if (isCheck()) {
                // Annuler le mouvement simulé
                square.removeChild(selectedPiece);
                selectedSquare.appendChild(selectedPiece);
                if (originalDestPiece) {
                    square.appendChild(originalDestPiece);
                }
                console.log("Ce mouvement n'est pas permis car il met ou laisse votre roi en échec!");
                selectedSquare.classList.remove('selected');
                selectedSquare = null;
                return;
            }

            // Si le mouvement ne met pas le roi en échec, le valider
            if (originalDestPiece) {
                console.log(`Pièce capturée : ${originalDestPiece.alt}`);
            }

            // Changer de joueur
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            console.log(`C'est au tour des ${currentPlayer === 'white' ? 'blancs' : 'noirs'}.`);

            // Vérifier si le nouveau joueur est en échec
            if (isCheck()) {
                console.log(`Le roi ${currentPlayer} est en échec !`);
            }
        } else {
            console.log('Mouvement invalide.');
            // Remettre la pièce à sa position d'origine si nécessaire
            square.removeChild(selectedPiece);
            selectedSquare.appendChild(selectedPiece);
        }

        // Réinitialiser la sélection
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
    });
});

// Fonction pour vérifier si une case est occupée
function isOccupied(row, col) {
    const square = document.getElementById(`square-${row}-${col}`);
    return square.querySelector('img') !== null;
}

// Fonction pour vérifier si une case est occupée par une pièce adverse
function isOccupiedByOpponent(row, col, opponentColor) {
    const square = document.getElementById(`square-${row}-${col}`);
    const piece = square.querySelector('img');
    if (piece) {
        return piece.src.includes(opponentColor);
    }
    return false;
}

// Vérification du mouvement du roi
function isValidKingMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);

    // Le roi se déplace d'une seule case dans toutes les directions (vertical, horizontal ou diagonal)
    if (rowDiff > 1 || colDiff > 1) {
        console.log('Le roi se déplace d\'une seule case dans toutes les directions.');
        return false;
    }

    // Vérifier si la case de destination est occupée par une pièce de la même couleur
    const destinationSquare = document.getElementById(`square-${endRow}-${endCol}`);
    const piece = destinationSquare.querySelector('img');
    if (piece && piece.src.includes(currentPlayer === 'white' ? 'white' : 'black')) {
        console.log('La case de destination est occupée par une pièce de la même couleur.');
        return false;
    }

    console.log('Mouvement valide pour le roi.');
    return true;
}


// Vérification du mouvement de la dame
function isValidQueenMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);

    // La reine se déplace en ligne droite (horizontale/verticale) ou en diagonale
    if (rowDiff === colDiff || startRow === endRow || startCol === endCol) {
        // Vérification du chemin dégagé
        const pathIsClear = isClearPath(startRow, startCol, endRow, endCol);

        // Vérification si la case de destination est valide
        const destinationSquare = document.getElementById(`square-${endRow}-${endCol}`);
        const pieceAtDestination = destinationSquare.querySelector('img');

        if (pathIsClear) {
            if (pieceAtDestination) {
                // Si la case de destination est occupée par une pièce ennemie
                const isOpponentPiece = pieceAtDestination.src.includes(currentPlayer === 'white' ? 'black' : 'white');
                if (isOpponentPiece) {
                    return true; // Le mouvement est valide car c'est une prise
                } else {
                    console.log("La case de destination est occupée par une pièce de la même couleur.");
                    return false;
                }
            }
            return true; // La case de destination est libre, le mouvement est valide
        }
    }

    console.log('La reine se déplace en ligne droite ou en diagonale.');
    return false;
}


// Vérification du mouvement de la tour
function isValidRookMove(startRow, startCol, endRow, endCol) {
    // La tour doit se déplacer en ligne droite, soit horizontalement soit verticalement
    if (startRow !== endRow && startCol !== endCol) {
        console.log('La tour se déplace en ligne droite.');
        return false;
    }

    // Vérifier que le chemin est dégagé (s'il y a des cases entre la position de départ et d'arrivée)
    if (!isClearPath(startRow, startCol, endRow, endCol)) {
        console.log('Le chemin de la tour est obstrué.');
        return false;
    }

    // Vérifier si la case de destination est occupée par une pièce de la même couleur
    const square = document.getElementById(`square-${endRow}-${endCol}`);
    const piece = square.querySelector('img');
    
    if (piece) {
        const pieceColor = piece.src.includes('white') ? 'white' : 'black';
        if (pieceColor === currentPlayer) {
            console.log('La case de destination est occupée par une pièce de la même couleur.');
            return false;  // On ne peut pas se déplacer sur une case occupée par une pièce de la même couleur
        }
    }

    return true;  // Le mouvement est valide si le chemin est dégagé et la case n'est pas occupée par une pièce alliée
}


// Vérification du mouvement du fou
function isValidBishopMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    
    // Vérifie si le déplacement est strictement en diagonale
    if (rowDiff !== colDiff) {
        console.log(`Le fou doit se déplacer en diagonale. Déplacement invalide: rowDiff=${rowDiff}, colDiff=${colDiff}`);
        return false;
    }

    // Vérifie si le chemin est dégagé
    const pathClear = isClearPath(startRow, startCol, endRow, endCol);
    if (!pathClear) {
        console.log('Le chemin du fou n\'est pas dégagé.');
        return false;
    }

    // Vérifie si la case d'arrivée est occupée par une pièce de la même couleur
    const destinationSquare = document.getElementById(`square-${endRow}-${endCol}`);
    const pieceAtDestination = destinationSquare.querySelector('img');
    if (pieceAtDestination) {
        const pieceColor = pieceAtDestination.src.includes('white') ? 'white' : 'black';
        if (currentPlayer === pieceColor) {
            console.log('La destination est occupée par une pièce de la même couleur.');
            return false;
        }
    }

    // Si toutes les conditions sont remplies, le mouvement est valide
    console.log('Mouvement valide pour le fou.');
    return true;
}



// Vérification du mouvement du cavalier
function isValidKnightMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        return true;
    }
    
    console.log('Le cavalier se déplace en "L".');
    return false;
}

// Vérification du mouvement du pion
// Vérification du mouvement du pion
function isValidPawnMove(direction, startRow, startCol, endRow, endCol) {
    const rowDiff = endRow - startRow; // Différence de rangée (sens compte)
    const colDiff = Math.abs(startCol - endCol); // Différence absolue de colonne

    // Mouvements de base
    // Avancer d'une case
    if (colDiff === 0 && rowDiff === direction && !isOccupied(endRow, endCol)) {
        return true;
    }

    // Avancer de deux cases depuis la rangée initiale
    if (
        colDiff === 0 &&
        rowDiff === direction * 2 && // Déplacement doit suivre la direction
        !isOccupied(endRow, endCol) &&
        !isOccupied(startRow + direction, startCol) && // Case intermédiaire doit être libre
        ((direction === 1 && startRow === 1) || (direction === -1 && startRow === 6)) // Correct start rows
    ) {
        return true;
    }

    // Capturer une pièce en diagonale
    if (colDiff === 1 && rowDiff === direction && isOccupiedByOpponent(endRow, endCol, direction === 1 ? 'black' : 'white')) {
        return true;
    }

    console.log(`Mouvement du pion : startRow=${startRow}, startCol=${startCol}, endRow=${endRow}, endCol=${endCol}`);
    console.log(`rowDiff=${rowDiff}, colDiff=${colDiff}, direction=${direction}`);
    console.log('Mouvement invalide. Le pion se déplace d\'une case (ou deux cases pour un premier mouvement ou capture en diagonale).');
    return false;
}




// Vérification du chemin pour les déplacements en ligne droite ou en diagonale
function isClearPath(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    
    let rowStep = 0, colStep = 0;
    if (rowDiff !== 0) rowStep = (endRow > startRow) ? 1 : -1;
    if (colDiff !== 0) colStep = (endCol > startCol) ? 1 : -1;
    
    let row = startRow + rowStep;
    let col = startCol + colStep;
    
    while (row !== endRow || col !== endCol) {
        if (isOccupied(row, col)) {
            console.log('Il y a une pièce sur le chemin.');
            return false;
        }
        row += rowStep;
        col += colStep;
    }
    
    return true;
}


// Fonction pour vérifier si le roi est en échec
function isCheck() {
    // Sauvegarder le joueur actuel car nous devons vérifier les attaques des pièces adverses
    const playerToCheck = currentPlayer;
    
    // Trouver la position du roi du joueur actuel
    const king = document.querySelector(`img[src*="${playerToCheck === 'white' ? 'king_white.png' : 'king_black.png'}"]`);
    
    if (!king) {
        console.error("Le roi n'a pas été trouvé.");
        return false;
    }
    
    const kingPosition = king.parentNode.id.split('-').slice(1).map(Number);
    const kingRow = kingPosition[0];
    const kingCol = kingPosition[1];
    
    // Temporairement changer le joueur actuel pour vérifier les mouvements des pièces adverses
    currentPlayer = playerToCheck === 'white' ? 'black' : 'white';
    
    // Trouver toutes les pièces adverses
    const opponentPieces = Array.from(document.querySelectorAll('img'))
        .filter(img => img.src.includes(currentPlayer === 'white' ? 'white' : 'black'));
    
    let isInCheck = false;
    
    // Vérifier si une pièce adverse peut atteindre le roi
    for (const piece of opponentPieces) {
        const pieceSquare = piece.parentNode;
        const pieceRow = parseInt(pieceSquare.id.split('-')[1]);
        const pieceCol = parseInt(pieceSquare.id.split('-')[2]);
        
        let isValidMove = false;
        
        // Vérifier le type de pièce et si elle peut atteindre le roi
        if (piece.src.includes('queen')) {
            isValidMove = isValidQueenMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.src.includes('rook')) {
            isValidMove = isValidRookMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.src.includes('bishop')) {
            isValidMove = isValidBishopMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.src.includes('knight')) {
            isValidMove = isValidKnightMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.src.includes('pawn')) {
            // Pour les pions, la direction dépend de leur couleur
            const direction = piece.src.includes('white') ? 1 : -1;
            isValidMove = isValidPawnMove(direction, pieceRow, pieceCol, kingRow, kingCol);
        }
        
        if (isValidMove) {
            isInCheck = true;
            break;
        }
    }
    
    // Restaurer le joueur actuel
    currentPlayer = playerToCheck;
    
    return isInCheck;
}


function canAttackKing(piece, startRow, startCol, kingRow, kingCol) {
    const pieceType = piece.src.split('/').pop().split('_')[0]; // Exemple: "king", "queen", "rook", etc.
    switch (pieceType) {
        case 'queen':
            return isValidQueenMove(startRow, startCol, kingRow, kingCol);
        case 'rook':
            return isValidRookMove(startRow, startCol, kingRow, kingCol);
        case 'bishop':
            return isValidBishopMove(startRow, startCol, kingRow, kingCol);
        case 'knight':
            return isValidKnightMove(startRow, startCol, kingRow, kingCol);
        case 'pawn':
            return isValidPawnMove(piece.src.includes('white') ? 1 : -1, startRow, startCol, kingRow, kingCol);
        default:
            return false;
    }
}

function roque() {
    const king = document.querySelector(`img[src*="${currentPlayer === 'white' ? './images/king_white.png' : './images/king_black.png'}"]`);
    const kingPosition = king.parentNode.id.split('-').slice(1).map(Number); // [row, col]
    const kingRow = kingPosition[0];
    const kingCol = kingPosition[1];
    
}