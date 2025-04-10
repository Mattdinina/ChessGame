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

// Configuration des stats des pièces
const pieceStats = {
    chasseur: {
        hp: 50,
        attack: 10,
        moveRange: 1
    },
    tortue: {
        hp: 80,
        attack: 8,
        moveRange: 1
    },
    tigre: {
        hp: 70,
        attack: 25,
        moveRange: 3
    },
    elephant: {
        hp: 150,
        attack: 30,
        moveRange: 1
    },
    aigle: {
        hp: 60,
        attack: 20,
        moveRange: 4
    },
    serpent: {
        hp: 45,
        attack: 15,
        moveRange: 2,
        poisonDamage: 5,  // Dégâts de poison par tour
        poisonDuration: 4  // Durée du poison en tours
    }
};

// Configuration des images
const pieceImages = {
    C: "./images/archer.png",          // Chasseur (blanc)
    t: "./images/turtle.jpg",          // Tortue (blanche)
    T: "./images/tiger Trident_0.png", // Tigre (blanc)
    E: "./images/elephant.jpg",         // Éléphant (blanc)
    A: "./images/eagle.jpg",           // Aigle (blanc)
    S: "./images/snake.jpg",           // Serpent (blanc)
    
    Cb: "./images/archer.png",         // Chasseur (noir)
    tb: "./images/turtle.jpg",         // Tortue (noire)
    Tb: "./images/tiger Trident_0.png",// Tigre (noir)
    Eb: "./images/elephant.jpg",        // Éléphant (noir)
    Ab: "./images/eagle.jpg",          // Aigle (noir)
    Sb: "./images/snake.jpg"           // Serpent (noir)
};

// Configuration des noms
const pieceNames = {
    C: "Chasseur blanc", 
    t: "Tortue blanche",
    T: "Tigre blanc", 
    E: "Éléphant blanc", 
    A: "Aigle blanc",
    S: "Serpent blanc",
    
    Cb: "Chasseur noir",
    tb: "Tortue noire",
    Tb: "Tigre noir",
    Eb: "Éléphant noir",
    Ab: "Aigle noir",
    Sb: "Serpent noir"
};

// Configuration initiale du plateau
const initialBoard = [
    ['T', 'E', 'A', 'C', 'S', 'A', 'E', 'T'],
    ['t', 't', 't', 't', 't', 't', 't', 't'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['tb', 'tb', 'tb', 'tb', 'tb', 'tb', 'tb', 'tb'],
    ['Tb', 'Eb', 'Ab', 'Cb', 'Sb', 'Ab', 'Eb', 'Tb']
];

// Placer les pièces sur l'échiquier
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.getElementById(`square-${row}-${col}`);
        const piece = initialBoard[row][col];
        
        if (piece) {
            const pieceContainer = createPiece(piece, pieceImages[piece], pieceNames[piece]);
            square.appendChild(pieceContainer);
        }
    }
}

let selectedSquare = null;
let currentPlayer = 'white';  // Le joueur actuel (blanc ou noir), à changer selon le tour
let gameOver = false;
let lastPawnMove = null; // Stockera la dernière position du pion qui a avancé de deux cases

document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', () => {
        if (gameOver) {
            console.log("La partie est terminée !");
            return;
        }
        
        const pieceContainer = square.querySelector('.piece-container');
        const piece = pieceContainer ? pieceContainer.querySelector('img') : null;
        
        // Si aucune pièce n'est sélectionnée
        if (!selectedSquare) {
            // Vérifier si la pièce appartient au joueur actuel
            if (piece) {
                const isWhitePiece = piece.alt.toLowerCase().includes('blanc');
                if ((currentPlayer === 'white' && isWhitePiece) || 
                    (currentPlayer === 'black' && !isWhitePiece)) {
                    selectedSquare = square;
                    selectedSquare.classList.add('selected');
                    console.log("Pièce sélectionnée:", piece.alt);
                } else {
                    console.log('Sélection invalide: Vous devez cliquer sur une pièce de votre couleur.');
                }
            }
            return;
        }

        // Si une pièce est déjà sélectionnée
        if (selectedSquare === square) {
            // Désélectionner si on clique sur la même case
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            return;
        }

        // Si on clique sur une autre pièce de notre couleur, la sélectionner
        if (piece) {
            const isWhitePiece = piece.alt.toLowerCase().includes('blanc');
            if ((currentPlayer === 'white' && isWhitePiece) || 
                (currentPlayer === 'black' && !isWhitePiece)) {
                selectedSquare.classList.remove('selected');
                selectedSquare = square;
                selectedSquare.classList.add('selected');
                return;
            }
        }

        // Tenter le déplacement
        const startRow = parseInt(selectedSquare.id.split('-')[1]);
        const startCol = parseInt(selectedSquare.id.split('-')[2]);
        const endRow = parseInt(square.id.split('-')[1]);
        const endCol = parseInt(square.id.split('-')[2]);

        if (isValidMove(startRow, startCol, endRow, endCol)) {
            console.log("Mouvement valide");
            const movingPieceContainer = selectedSquare.querySelector('.piece-container');
            const targetPieceContainer = square.querySelector('.piece-container');
            const attackingPiece = movingPieceContainer.querySelector('img');
            const pieceName = attackingPiece.alt.toLowerCase();
            
            if (targetPieceContainer) {
                // Combat
                const defendingPiece = targetPieceContainer.querySelector('img');
                
                // Vérifier si c'est un aigle qui attaque
                if (pieceName.includes('aigle')) {
                    console.log("Attaque d'aigle à distance");
                    
                    // Calculer la position d'atterrissage de l'aigle
                    const landingPosition = calculateEagleLandingPosition(startRow, startCol, endRow, endCol);
                    
                    if (landingPosition) {
                        // Déplacer l'aigle à la position d'atterrissage
                        const landingSquare = document.getElementById(`square-${landingPosition.row}-${landingPosition.col}`);
                        
                        // Créer une copie du conteneur pour éviter les problèmes de référence
                        const pieceContainerClone = movingPieceContainer.cloneNode(true);
                        
                        // Supprimer l'ancien conteneur
                        selectedSquare.removeChild(movingPieceContainer);
                        
                        // Ajouter le nouveau conteneur à la case d'atterrissage
                        landingSquare.appendChild(pieceContainerClone);
                        
                        // Attendre un court instant pour simuler le déplacement
                        setTimeout(() => {
                            // Infliger les dégâts à la cible
                            combat(attackingPiece, defendingPiece);
                            if (gameOver) return;
                            
                            // Changer de joueur
                            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                            console.log("Tour de:", currentPlayer);
                        }, 500);
                    } else {
                        console.log("Position d'atterrissage invalide pour l'aigle");
                    }
                } 
                // Vérifier si c'est un tigre qui attaque
                else if (pieceName.includes('tigre')) {
                    console.log("Attaque de tigre");
                    
                    // Vérifier si le tigre reste sur place
                    if (startRow === endRow && startCol === endCol) {
                        // Le tigre attaque un ennemi adjacent sans se déplacer
                        combat(attackingPiece, defendingPiece);
                        if (gameOver) return;
                        
                        // Changer de joueur
                        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                        console.log("Tour de:", currentPlayer);
                    } else {
                        // Le tigre bondit sur une pièce ennemie
                        // Vérifier si la case de destination contient un ennemi
                        if (targetPieceContainer) {
                            // Le tigre attaque l'ennemi sans se déplacer à sa position
                            // Calculer la position d'arrivée (une case avant la cible)
                            let landingRow = endRow;
                            let landingCol = endCol;
                            
                            // Déterminer la direction du mouvement
                            if (startRow < endRow) landingRow = endRow - 1; // Mouvement vers le bas
                            else if (startRow > endRow) landingRow = endRow + 1; // Mouvement vers le haut
                            
                            if (startCol < endCol) landingCol = endCol - 1; // Mouvement vers la droite
                            else if (startCol > endCol) landingCol = endCol + 1; // Mouvement vers la gauche
                            
                            // Vérifier que la position d'atterrissage est valide
                            if (landingRow >= 0 && landingRow < 8 && landingCol >= 0 && landingCol < 8) {
                                // Trouver la case d'atterrissage
                                const landingSquare = document.getElementById(`square-${landingRow}-${landingCol}`);
                                
                                // Créer une copie du conteneur pour éviter les problèmes de référence
                                const pieceContainerClone = movingPieceContainer.cloneNode(true);
                                
                                // Supprimer l'ancien conteneur
                                selectedSquare.removeChild(movingPieceContainer);
                                
                                // Ajouter le nouveau conteneur à la case d'atterrissage
                                landingSquare.appendChild(pieceContainerClone);
                                
                                // Attendre un court instant pour simuler le bond
                                setTimeout(() => {
                                    // Infliger les dégâts à la cible
                                    combat(attackingPiece, defendingPiece);
                                    if (gameOver) return;
                                    
                                    // Changer de joueur
                                    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                                    console.log("Tour de:", currentPlayer);
                                }, 500);
                            } else {
                                console.log("Position d'atterrissage invalide pour le tigre");
                            }
                        } else {
                            // Le tigre se déplace vers une case vide
                            // Créer une copie du conteneur pour éviter les problèmes de référence
                            const pieceContainerClone = movingPieceContainer.cloneNode(true);
                            
                            // Supprimer l'ancien conteneur
                            selectedSquare.removeChild(movingPieceContainer);
                            
                            // Ajouter le nouveau conteneur à la case de destination
                            square.appendChild(pieceContainerClone);
                            
                            // Changer de joueur
                            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                            console.log("Tour de:", currentPlayer);
                        }
                    }
                } else {
                    // Combat normal pour les autres pièces
                    combat(attackingPiece, defendingPiece);
                    if (gameOver) return;
                    
                    // Ne pas déplacer la pièce après un combat
                    // La pièce reste sur sa case d'origine
                    
                    // Changer de joueur
                    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                    console.log("Tour de:", currentPlayer);
                    
                    // Appliquer les dégâts de poison au début du tour
                    applyPoisonDamage();
                }
            } else {
                // Déplacement normal (sans combat)
                // Créer une copie du conteneur pour éviter les problèmes de référence
                const pieceContainerClone = movingPieceContainer.cloneNode(true);
                
                // Supprimer l'ancien conteneur
                selectedSquare.removeChild(movingPieceContainer);
                
                // Ajouter le nouveau conteneur à la case de destination
                square.appendChild(pieceContainerClone);
                
                // Changer de joueur
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                console.log("Tour de:", currentPlayer);
                
                // Appliquer les dégâts de poison au début du tour
                applyPoisonDamage();
            }
        } else {
            console.log("Mouvement invalide");
        }

        // Réinitialiser la sélection
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
    });
});

// Fonction pour vérifier si une case est occupée
function isOccupied(row, col) {
    const square = document.getElementById(`square-${row}-${col}`);
    return square.querySelector('.piece-container') !== null;
}

// Fonction pour vérifier si une case est occupée par une pièce adverse
function isOccupiedByOpponent(row, col, opponentColor) {
    const square = document.getElementById(`square-${row}-${col}`);
    const piece = square.querySelector('.piece-container img');
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
        // console.log('Le roi se déplace d\'une seule case dans toutes les directions.');
        return false;
    }

    // Vérifier si la case de destination est occupée par une pièce de la même couleur
    const destinationSquare = document.getElementById(`square-${endRow}-${endCol}`);
    const piece = destinationSquare.querySelector('img');
    if (piece && piece.src.includes(currentPlayer === 'white' ? 'white' : 'black')) {
        // console.log('La case de destination est occupée par une pièce de la même couleur.');
        return false;
    }

    // console.log('Mouvement valide pour le roi.');
    return true;
}


// Vérification du mouvement de la dame
function isValidQueenMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);

    // La reine se déplace en ligne droite (horizontale/verticale) ou en diagonale
    if (!(rowDiff === colDiff || startRow === endRow || startCol === endCol)) {
        // console.log('La reine se déplace en ligne droite ou en diagonale.');
        return false;
    }

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
                // console.log("La case de destination est occupée par une pièce de la même couleur.");
                    return false;
                }
            }
            return true; // La case de destination est libre, le mouvement est valide
    }

    return false;
}


// Vérification du mouvement de la tour
function isValidRookMove(startRow, startCol, endRow, endCol) {
    // La tour doit se déplacer en ligne droite, soit horizontalement soit verticalement
    if (startRow !== endRow && startCol !== endCol) {
        // console.log('La tour se déplace en ligne droite.');
        return false;
    }

    // Vérifier que le chemin est dégagé (s'il y a des cases entre la position de départ et d'arrivée)
    if (!isClearPath(startRow, startCol, endRow, endCol)) {
        // console.log('Le chemin de la tour est obstrué.');
        return false;
    }

    // Vérifier si la case de destination est occupée par une pièce de la même couleur
    const square = document.getElementById(`square-${endRow}-${endCol}`);
    const piece = square.querySelector('img');
    
    if (piece) {
        const pieceColor = piece.src.includes('white') ? 'white' : 'black';
        if (pieceColor === currentPlayer) {
            // console.log('La case de destination est occupée par une pièce de la même couleur.');
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
        // console.log(`Le fou doit se déplacer en diagonale. Déplacement invalide: rowDiff=${rowDiff}, colDiff=${colDiff}`);
        return false;
    }

    // Vérifie si le chemin est dégagé
    const pathClear = isClearPath(startRow, startCol, endRow, endCol);
    if (!pathClear) {
        // console.log('Le chemin du fou n\'est pas dégagé.');
        return false;
    }

    // Vérifie si la case d'arrivée est occupée par une pièce de la même couleur
    const destinationSquare = document.getElementById(`square-${endRow}-${endCol}`);
    const pieceAtDestination = destinationSquare.querySelector('img');
    if (pieceAtDestination) {
        const pieceColor = pieceAtDestination.src.includes('white') ? 'white' : 'black';
        if (currentPlayer === pieceColor) {
            // console.log('La destination est occupée par une pièce de la même couleur.');
            return false;
        }
    }

    // Si toutes les conditions sont remplies, le mouvement est valide
    // console.log('Mouvement valide pour le fou.');
    return true;
}



// Vérification du mouvement du cavalier
function isValidKnightMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        return true;
    }
    
    // console.log('Le cavalier se déplace en "L".');
    return false;
}

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

    // Capture normale en diagonale
    if (colDiff === 1 && rowDiff === direction && isOccupiedByOpponent(endRow, endCol, direction === 1 ? 'black' : 'white')) {
        return true;
    }

    // Prise en passant
    if (lastPawnMove && colDiff === 1 && Math.abs(rowDiff) === 1) {
        const [lastRow, lastCol] = lastPawnMove.end;
        const [prevRow, prevCol] = lastPawnMove.start;
        
        // Vérifier si le pion adverse est adjacent et a avancé de deux cases au dernier coup
        if (
            startRow === lastRow && // Même rangée que le pion adverse
            Math.abs(startCol - lastCol) === 1 && // Colonne adjacente
            Math.abs(prevRow - lastRow) === 2 && // Le pion adverse a avancé de deux cases
            endCol === lastCol // La capture se fait sur la colonne du pion adverse
        ) {
            return true;
        }
    }

    // console.log(`rowDiff=${rowDiff}, colDiff=${colDiff}, direction=${direction}`);
    // console.log('Mouvement invalide. Le pion se déplace d\'une case (ou deux cases pour un premier mouvement ou capture en diagonale).');
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
            // console.log('Il y a une pièce sur le chemin.');
            return false;
        }
        row += rowStep;
        col += colStep;
    }
    
    return true;
}


// Fonction pour vérifier si le roi est en échec
function isCheck() {
    // Trouver la position du roi du joueur actuel
    const king = document.querySelector(`img[src*="${currentPlayer === 'white' ? 'king_white.png' : 'king_black.png'}"]`);

    if (!king) {
        console.error("Le roi n'a pas été trouvé.");
        return false;
    }

    const kingPosition = king.parentNode.id.split('-').slice(1).map(Number);
    const kingRow = kingPosition[0];
    const kingCol = kingPosition[1];
    
    // Trouver toutes les pièces adverses
    const opponentPieces = Array.from(document.querySelectorAll('img'))
        .filter(img => img.src.includes(currentPlayer === 'white' ? 'black' : 'white'));
    
    // Sauvegarder le joueur actuel
    const originalPlayer = currentPlayer;
    // Changer temporairement le joueur pour vérifier les mouvements des pièces adverses
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    let isInCheck = false;

    
    // Vérifier si une pièce adverse peut atteindre le roi
    for (const piece of opponentPieces) {
        const pieceSquare = piece.parentNode;
        const pieceRow = parseInt(pieceSquare.id.split('-')[1]);
        const pieceCol = parseInt(pieceSquare.id.split('-')[2]);

        // Ajouter un log pour voir quelle pièce on vérifie
        // console.log('Vérification de la pièce:', piece.alt, 'en position:', pieceRow, pieceCol);
        
        let isValidMove = false;
        
        // Utiliser piece.alt au lieu de piece.src pour la vérification
        if (piece.alt.toLowerCase().includes('reine')) {
            isValidMove = isValidQueenMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.alt.toLowerCase().includes('tour')) {
            isValidMove = isValidRookMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.alt.toLowerCase().includes('fou')) {
            isValidMove = isValidBishopMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.alt.toLowerCase().includes('cavalier')) {
            isValidMove = isValidKnightMove(pieceRow, pieceCol, kingRow, kingCol);
        } else if (piece.alt.toLowerCase().includes('pion')) {
            const direction = piece.alt.includes('blanc') ? 1 : -1;
            isValidMove = isValidPawnMove(direction, pieceRow, pieceCol, kingRow, kingCol);
        }
        else {
            console.log('Quelle piece est-ce');
        }
        if (isValidMove) {
            isInCheck = true;
            console.log('La piece peut attaquer le roi');
            break;
        }
    }
    
    // Restaurer le joueur original
    currentPlayer = originalPlayer;

    if (isInCheck) {
        console.log(`Le roi ${currentPlayer} est en échec !`);
    }
    
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

function isCheckmate() {
    // D'abord, vérifier si le roi est en échec
    if (!isCheck()) {
        return false;  // Si le roi n'est pas en échec, ce n'est pas un échec et mat
    }

    // Trouver toutes les pièces du joueur en échec
    const playerPieces = Array.from(document.querySelectorAll('img'))
        .filter(img => img.src.includes(currentPlayer === 'white' ? 'white' : 'black'));
    
    // Pour chaque pièce, essayer tous les mouvements possibles
    for (const piece of playerPieces) {
        const startSquare = piece.parentNode;
        const startRow = parseInt(startSquare.id.split('-')[1]);
        const startCol = parseInt(startSquare.id.split('-')[2]);

        // Essayer toutes les destinations possibles
        for (let endRow = 0; endRow < 8; endRow++) {
            for (let endCol = 0; endCol < 8; endCol++) {
                // Ne pas tester la position actuelle de la pièce
                if (startRow === endRow && startCol === endCol) continue;

                const endSquare = document.getElementById(`square-${endRow}-${endCol}`);
                const destPiece = endSquare.querySelector('img');

                // Vérifier si le mouvement serait valide selon les règles de la pièce
                let isValidMove = false;
                switch (piece.alt) {
                    case 'Roi blanc':
                    case 'Roi noir':
                        isValidMove = isValidKingMove(startRow, startCol, endRow, endCol);
                        break;
                    case 'Reine blanche':
                    case 'Reine noire':
                        isValidMove = isValidQueenMove(startRow, startCol, endRow, endCol);
                        break;
                    case 'Tour blanche':
                    case 'Tour noire':
                        isValidMove = isValidRookMove(startRow, startCol, endRow, endCol);
                        break;
                    case 'Fou blanc':
                    case 'Fou noir':
                        isValidMove = isValidBishopMove(startRow, startCol, endRow, endCol);
                        break;
                    case 'Cavalier blanc':
                    case 'Cavalier noir':
                        isValidMove = isValidKnightMove(startRow, startCol, endRow, endCol);
                        break;
                    case 'Pion blanc':
                        isValidMove = isValidPawnMove(1, startRow, startCol, endRow, endCol);
                        break;
                    case 'Pion noir':
                        isValidMove = isValidPawnMove(-1, startRow, startCol, endRow, endCol);
                        break;
                }

                if (!isValidMove) continue;

                // Simuler le mouvement
                startSquare.removeChild(piece);
                if (destPiece) {
                    endSquare.removeChild(destPiece);
                }
                endSquare.appendChild(piece);

                // Vérifier si ce mouvement sort de l'échec
                const stillInCheck = isCheck();

                // Annuler la simulation
                endSquare.removeChild(piece);
                startSquare.appendChild(piece);
                if (destPiece) {
                    endSquare.appendChild(destPiece);
                }

                // Si on trouve un mouvement qui sort de l'échec
                if (!stillInCheck) {
                    console.log(`${piece.alt} peut sauver le roi en se déplaçant en ${endRow},${endCol}`);
                    return false; // Ce n'est pas un échec et mat
                }
            }
        }
    }

    // Si on arrive ici, aucun mouvement ne peut sortir de l'échec
    console.log('Échec et mat !');
    return true;
}

// Ajouter cette fonction pour gérer la promotion du pion
function promotePawn(pawn, row, col) {
    // Créer un menu de sélection
    const promotionMenu = document.createElement('div');
    promotionMenu.style.position = 'absolute';
    promotionMenu.style.display = 'flex';
    promotionMenu.style.flexDirection = 'row';
    promotionMenu.style.backgroundColor = 'white';
    promotionMenu.style.border = '1px solid #ccc';
    promotionMenu.style.borderRadius = '4px';
    promotionMenu.style.padding = '2px';
    promotionMenu.style.zIndex = '1000';
    
    // Définir les pièces disponibles pour la promotion
    const pieces = ['queen', 'rook', 'bishop', 'knight'];
    const color = currentPlayer === 'white' ? 'white' : 'black';
    
    pieces.forEach(piece => {
        const pieceOption = document.createElement('div');
        pieceOption.style.width = '30px';
        pieceOption.style.height = '30px';
        pieceOption.style.cursor = 'pointer';
        pieceOption.style.display = 'flex';
        pieceOption.style.alignItems = 'center';
        pieceOption.style.justifyContent = 'center';
        
        const pieceImg = document.createElement('img');
        pieceImg.src = `./images/${piece}_${color}.png`;
        pieceImg.style.width = '25px';
        pieceImg.style.height = '25px';
        pieceImg.alt = piece === 'queen' ? `Reine ${color === 'white' ? 'blanche' : 'noire'}` :
                      piece === 'rook' ? `Tour ${color === 'white' ? 'blanche' : 'noire'}` :
                      piece === 'bishop' ? `Fou ${color === 'white' ? 'blanc' : 'noir'}` :
                      `Cavalier ${color === 'white' ? 'blanc' : 'noir'}`;
        
        pieceOption.addEventListener('click', () => {
            pawn.src = pieceImg.src;
            pawn.alt = pieceImg.alt;
            document.body.removeChild(promotionMenu);
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            console.log(`C'est au tour des ${currentPlayer === 'white' ? 'blancs' : 'noirs'}.`);
        });
        
        pieceOption.appendChild(pieceImg);
        promotionMenu.appendChild(pieceOption);
    });
    
    // Positionner le menu près du pion
    const square = document.getElementById(`square-${row}-${col}`);
    const rect = square.getBoundingClientRect();
    
    promotionMenu.style.left = `${rect.right}px`;
    promotionMenu.style.top = `${rect.top}px`;
    
    // Ajouter le menu à la page
    document.body.appendChild(promotionMenu);
}

// Fonction pour créer une pièce avec sa barre de vie
function createPiece(pieceType, pieceImage, pieceName) {
    const container = document.createElement('div');
    container.classList.add('piece-container');

    const pieceImg = document.createElement('img');
    pieceImg.src = pieceImage;
    pieceImg.alt = pieceName;
    pieceImg.classList.add('piece');
    
    // Déterminer le type de base pour les stats
    let baseType = pieceType.toLowerCase().replace('b', '');
    switch(baseType) {
        case 'c': baseType = 'chasseur'; break;
        case 't': baseType = 'tortue'; break;
        case 'T': baseType = 'tigre'; break;
        case 'e': baseType = 'elephant'; break;
        case 'a': baseType = 'aigle'; break;
        case 's': baseType = 'serpent'; break;
    }

    const stats = pieceStats[baseType];
    pieceImg.dataset.maxHp = stats.hp;
    pieceImg.dataset.currentHp = stats.hp;
    pieceImg.dataset.attack = stats.attack;

    container.appendChild(pieceImg);
    container.appendChild(createHealthBar(pieceImg));
    
    return container;
}

// Fonction pour mettre à jour la barre de vie
function updateHealthBar(piece) {
    const container = piece.parentElement;
    const healthBar = container.querySelector('.health-fill');
    const currentHp = parseInt(piece.dataset.currentHp);
    const maxHp = parseInt(piece.dataset.maxHp);
    
    // S'assurer que les valeurs sont valides
    if (isNaN(currentHp) || isNaN(maxHp) || maxHp <= 0) {
        console.error("Valeurs de PV invalides:", currentHp, maxHp);
        return;
    }
    
    // Calculer le pourcentage de vie restant
    const healthPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    
    // Mettre à jour la largeur de la barre de vie
    healthBar.style.width = `${healthPercentage}%`;
    
    // Mettre à jour la couleur en fonction du pourcentage de vie
    if (healthPercentage <= 25) {
        healthBar.style.backgroundColor = '#e74c3c'; // Rouge
    } else if (healthPercentage <= 50) {
        healthBar.style.backgroundColor = '#f1c40f'; // Jaune
    } else {
        healthBar.style.backgroundColor = '#2ecc71'; // Vert
    }
    
    // Ajouter un effet visuel pour indiquer les dégâts
    healthBar.classList.add('damage-effect');
    setTimeout(() => {
        healthBar.classList.remove('damage-effect');
    }, 300);
}

// Fonction de combat
function combat(attacker, defender) {
    console.log("Combat entre:", attacker.alt, "et", defender.alt);
    
    // Calculer les dégâts
    const damage = parseInt(attacker.dataset.attack);
    const defenderCurrentHp = parseInt(defender.dataset.currentHp);
    
    // Appliquer les dégâts au défenseur
    defender.dataset.currentHp = Math.max(0, defenderCurrentHp - damage);
    console.log(`${defender.alt} prend ${damage} dégâts, PV restants: ${defender.dataset.currentHp}`);
    
    // Mettre à jour la barre de vie du défenseur
    updateHealthBar(defender);
    
    // Vérifier si c'est un serpent qui attaque
    if (attacker.alt.toLowerCase().includes('serpent')) {
        // Appliquer l'effet de poison
        applyPoison(defender);
    }
    
    // Vérifier si le défenseur est vaincu
    if (parseInt(defender.dataset.currentHp) <= 0) {
        console.log(`${defender.alt} est vaincu !`);
        defender.parentElement.remove();
        
        // Vérifier si c'était un chasseur
        if (defender.alt.includes('Chasseur')) {
            gameOver = true;
            const winner = defender.alt.includes('blanc') ? 'noirs' : 'blancs';
            alert(`Partie terminée ! Les ${winner} ont gagné !`);
        }
    }
}

// Fonction pour appliquer l'effet de poison
function applyPoison(defender) {
    // Vérifier si la pièce est déjà empoisonnée
    if (defender.dataset.poisoned === 'true') {
        // Si déjà empoisonnée, réinitialiser le compteur de tours
        defender.dataset.poisonTurnsLeft = pieceStats.serpent.poisonDuration;
        console.log(`${defender.alt} est déjà empoisonné, le poison est renouvelé pour ${pieceStats.serpent.poisonDuration} tours.`);
    } else {
        // Sinon, appliquer le poison
        defender.dataset.poisoned = 'true';
        defender.dataset.poisonTurnsLeft = pieceStats.serpent.poisonDuration;
        defender.dataset.poisonDamage = pieceStats.serpent.poisonDamage;
        
        // Ajouter un indicateur visuel de poison
        const poisonIndicator = document.createElement('div');
        poisonIndicator.classList.add('poison-indicator');
        poisonIndicator.textContent = '☠️';
        defender.parentElement.appendChild(poisonIndicator);
        
        console.log(`${defender.alt} est empoisonné pour ${pieceStats.serpent.poisonDuration} tours.`);
    }
}

// Fonction pour appliquer les dégâts de poison au début du tour
function applyPoisonDamage() {
    // Trouver toutes les pièces empoisonnées
    const poisonedPieces = document.querySelectorAll('img[data-poisoned="true"]');
    
    poisonedPieces.forEach(piece => {
        // Récupérer les informations de poison
        const poisonTurnsLeft = parseInt(piece.dataset.poisonTurnsLeft);
        const poisonDamage = parseInt(piece.dataset.poisonDamage);
        
        // Appliquer les dégâts de poison
        const currentHp = parseInt(piece.dataset.currentHp);
        piece.dataset.currentHp = Math.max(0, currentHp - poisonDamage);
        
        // Mettre à jour la barre de vie
        updateHealthBar(piece);
        
        // Réduire le nombre de tours restants
        piece.dataset.poisonTurnsLeft = poisonTurnsLeft - 1;
        
        console.log(`${piece.alt} subit ${poisonDamage} dégâts de poison. Il reste ${piece.dataset.poisonTurnsLeft} tours de poison.`);
        
        // Vérifier si le poison est terminé
        if (parseInt(piece.dataset.poisonTurnsLeft) <= 0) {
            // Supprimer l'effet de poison
            piece.dataset.poisoned = 'false';
            
            // Supprimer l'indicateur visuel de poison
            const poisonIndicator = piece.parentElement.querySelector('.poison-indicator');
            if (poisonIndicator) {
                poisonIndicator.remove();
            }
            
            console.log(`${piece.alt} n'est plus empoisonné.`);
        }
        
        // Vérifier si la pièce est vaincue
        if (parseInt(piece.dataset.currentHp) <= 0) {
            console.log(`${piece.alt} est vaincu par le poison !`);
            piece.parentElement.remove();
            
            // Vérifier si c'était un chasseur
            if (piece.alt.includes('Chasseur')) {
                gameOver = true;
                const winner = piece.alt.includes('blanc') ? 'noirs' : 'blancs';
                alert(`Partie terminée ! Les ${winner} ont gagné !`);
            }
        }
    });
}

// Améliorer l'affichage des barres de vie
function createHealthBar(piece) {
    const healthBar = document.createElement('div');
    healthBar.classList.add('health-bar');
    
    const healthFill = document.createElement('div');
    healthFill.classList.add('health-fill');
    healthFill.style.width = '100%';
    
    healthBar.appendChild(healthFill);
    return healthBar;
}

// Mettre à jour le CSS pour positionner correctement les barres de vie
const styles = `
    #chessboard {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(8, 1fr);
        width: 100%;
        height: 100%;
        max-width: 800px;
        max-height: 800px;
        margin: 0 auto;
    }

    .square {
        aspect-ratio: 1 / 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }

    .white {
        background-color: #f0d9b5;
    }

    .black {
        background-color: #b58863;
    }

    .selected {
        background-color: #7b61ff;
    }

    .piece-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        overflow: hidden;
    }

    .piece {
        width: 80%;
        height: 80%;
        object-fit: contain;
        position: relative;
        z-index: 1;
        max-width: 100%;
        max-height: 100%;
    }

    .health-bar {
        position: absolute;
        bottom: 2px;
        left: 10%;
        width: 80%;
        height: 4px;
        background: #444;
        border-radius: 2px;
        overflow: hidden;
        z-index: 2;
    }

    .health-fill {
        height: 100%;
        background: #2ecc71;
        transition: width 0.3s ease, background-color 0.3s ease;
    }
    
    .damage-effect {
        animation: damage-flash 0.3s ease;
    }
    
    @keyframes damage-flash {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); background-color: #ff0000; }
        100% { transform: scale(1); }
    }
`;

// Ajouter les styles au document
if (!document.querySelector('#game-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'game-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Ajouter les styles pour l'indicateur de poison
const poisonStyles = `
    .poison-indicator {
        position: absolute;
        top: 5px;
        right: 5px;
        font-size: 16px;
        z-index: 10;
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
    }
`;

// Ajouter les styles de poison au document
if (!document.querySelector('#poison-styles')) {
    const poisonStyleSheet = document.createElement('style');
    poisonStyleSheet.id = 'poison-styles';
    poisonStyleSheet.textContent = poisonStyles;
    document.head.appendChild(poisonStyleSheet);
}

function isValidMove(startRow, startCol, endRow, endCol) {
    const startSquare = document.getElementById(`square-${startRow}-${startCol}`);
    const piece = startSquare.querySelector('.piece-container img');
    const pieceName = piece.alt.toLowerCase();
    
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);

    console.log("Vérification du mouvement pour:", pieceName);
    console.log("De:", startRow, startCol, "À:", endRow, endCol);
    console.log("Différences:", rowDiff, colDiff);
    
    // Chasseur
    if (pieceName.includes('chasseur')) {
        console.log("Mouvement de chasseur");
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    // Tortue
    if (pieceName.includes('tortue')) {
        console.log("Mouvement de tortue");
        const direction = pieceName.includes('blanche') ? 1 : -1;
        
        // Mouvement normal vers l'avant
        if (colDiff === 0) {
            return (endRow - startRow) === direction;
        }
        
        // Mouvement latéral (droite ou gauche)
        if (rowDiff === 0 && colDiff === 1) {
            // Vérifier que la case de destination est vide
            const targetSquare = document.getElementById(`square-${endRow}-${endCol}`);
            return targetSquare.querySelector('.piece-container') === null;
        }
        
        // Capture en diagonale
        if (colDiff === 1 && (endRow - startRow) === direction) {
            const targetSquare = document.getElementById(`square-${endRow}-${endCol}`);
            return targetSquare.querySelector('.piece-container') !== null;
        }
        
        return false;
    }
    
    // Tigre
    if (pieceName.includes('tigre')) {
        console.log("Mouvement de tigre");
        
        // Vérifier si le tigre se déplace en ligne droite (avant/arrière)
        const isStraightMove = colDiff === 0;
        
        // Vérifier si le tigre se déplace latéralement (gauche/droite)
        const isLateralMove = rowDiff === 0;
        
        // Vérifier si le tigre se déplace en diagonale
        const isDiagonalMove = rowDiff === colDiff;
        
        // Vérifier si le tigre reste sur place (pour attaquer un ennemi adjacent)
        const isStationary = rowDiff === 0 && colDiff === 0;
        
        // Si le tigre reste sur place, vérifier s'il y a un ennemi adjacent
        if (isStationary) {
            // Vérifier les cases adjacentes (haut, bas, gauche, droite)
            const adjacentSquares = [
                { row: startRow - 1, col: startCol }, // Haut
                { row: startRow + 1, col: startCol }, // Bas
                { row: startRow, col: startCol - 1 }, // Gauche
                { row: startRow, col: startCol + 1 }  // Droite
            ];
            
            // Vérifier si l'une des cases adjacentes contient un ennemi
            for (const square of adjacentSquares) {
                // Vérifier que la case est dans les limites du plateau
                if (square.row >= 0 && square.row < 8 && square.col >= 0 && square.col < 8) {
                    const targetSquare = document.getElementById(`square-${square.row}-${square.col}`);
                    const targetPiece = targetSquare.querySelector('.piece-container img');
                    
                    if (targetPiece) {
                        // Vérifier si la pièce est un ennemi
                        const isWhitePiece = targetPiece.alt.toLowerCase().includes('blanc');
                        const isBlackPiece = targetPiece.alt.toLowerCase().includes('noir');
                        
                        if ((currentPlayer === 'white' && isBlackPiece) || 
                            (currentPlayer === 'black' && isWhitePiece)) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        }
        
        // Vérifier si le déplacement est valide (ligne droite, latéral ou diagonal)
        if (!isStraightMove && !isLateralMove && !isDiagonalMove) {
            return false;
        }
        
        // Vérifier la distance du déplacement (maximum 3 cases)
        // Pour une attaque, on permet une distance de 4 cases (3 cases de déplacement + 1 case de la cible)
        const maxDistance = 3;
        
        // Vérifier si la case de destination contient une pièce ennemie
        const targetSquare = document.getElementById(`square-${endRow}-${endCol}`);
        const targetPiece = targetSquare.querySelector('.piece-container img');
        const isAttack = targetPiece !== null && 
                        ((currentPlayer === 'white' && targetPiece.alt.toLowerCase().includes('noir')) || 
                         (currentPlayer === 'black' && targetPiece.alt.toLowerCase().includes('blanc')));
        
        // Si c'est une attaque, on permet une distance de 4 cases
        if (isAttack) {
            // Pour une attaque, on permet une distance de 4 cases (3 cases de déplacement + 1 case de la cible)
            if (rowDiff > 4 || colDiff > 4) {
                return false;
            }
        } else {
            // Si ce n'est pas une attaque, on limite à 3 cases
            if (rowDiff > maxDistance || colDiff > maxDistance) {
                return false;
            }
        }
        
        // Vérifier si le chemin est dégagé
        return isClearPath(startRow, startCol, endRow, endCol);
    }
    
    // Éléphant
    if (pieceName.includes('éléphant') || pieceName.includes('Éléphant')) {
        console.log("Mouvement d'éléphant");
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    // Aigle
    if (pieceName.includes('aigle')) {
        console.log("Mouvement d'aigle");
        // L'aigle peut se déplacer en ligne droite (horizontale/verticale) ou en diagonale
        // Mais pour l'attaque, il doit être à une case adjacente par le haut ou par le bas
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);
    }
    
    // Serpent
    if (pieceName.includes('serpent')) {
        console.log("Mouvement de serpent");
        
        // Le serpent se déplace comme un cavalier (en L)
        // Il peut se déplacer de 2 cases dans une direction puis 1 case perpendiculairement
        const isKnightMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        
        // Vérifier si la case de destination est vide ou contient un ennemi
        const targetSquare = document.getElementById(`square-${endRow}-${endCol}`);
        const targetPiece = targetSquare.querySelector('.piece-container img');
        
        // Si la case est vide ou contient un ennemi, le mouvement est valide
        if (isKnightMove) {
            if (!targetPiece) {
                // Case vide, mouvement valide
                return true;
            } else {
                // Vérifier si la pièce est un ennemi
                const isWhitePiece = targetPiece.alt.toLowerCase().includes('blanc');
                const isBlackPiece = targetPiece.alt.toLowerCase().includes('noir');
                
                return (currentPlayer === 'white' && isBlackPiece) || 
                       (currentPlayer === 'black' && isWhitePiece);
            }
        }
        
        return false;
    }

    console.log("Type de pièce non reconnu");
    return false;
}

// Fonction pour calculer la position d'arrivée de l'aigle
function calculateEagleLandingPosition(startRow, startCol, targetRow, targetCol) {
    // Déterminer si l'aigle doit atterrir au-dessus ou en-dessous de la cible
    const rowDiff = targetRow - startRow;
    
    // Si l'aigle est au-dessus de la cible, il doit atterrir en-dessous
    // Si l'aigle est en-dessous de la cible, il doit atterrir au-dessus
    // Si l'aigle est à la même hauteur, il doit atterrir au-dessus
    let landingRow;
    if (rowDiff > 0) {
        // L'aigle est au-dessus de la cible, il doit atterrir en-dessous
        landingRow = targetRow - 1;
    } else {
        // L'aigle est en-dessous de la cible ou à la même hauteur, il doit atterrir au-dessus
        landingRow = targetRow + 1;
    }
    
    // Vérifier que la position d'atterrissage est valide (dans les limites du plateau)
    if (landingRow < 0 || landingRow > 7) {
        // Si la position d'atterrissage est hors limites, essayer l'autre option
        landingRow = (rowDiff > 0) ? targetRow + 1 : targetRow - 1;
        
        // Si toujours hors limites, retourner null
        if (landingRow < 0 || landingRow > 7) {
            return null;
        }
    }
    
    // Retourner la position d'atterrissage
    return { row: landingRow, col: targetCol };
}