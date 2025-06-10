// Initialisation de la connexion Socket.IO
const socket = io();

// État du jeu
let gameState = {
    board: [
        ['black-tiger', 'black-elephant', 'black-eagle', 'black-archer', 'black-archer', 'black-eagle', 'black-elephant', 'black-tiger'],
        ['black-turtle', 'black-turtle', 'black-turtle', 'black-turtle', 'black-turtle', 'black-turtle', 'black-turtle', 'black-turtle'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['white-turtle', 'white-turtle', 'white-turtle', 'white-turtle', 'white-turtle', 'white-turtle', 'white-turtle', 'white-turtle'],
        ['white-tiger', 'white-elephant', 'white-eagle', 'white-archer', 'white-archer', 'white-eagle', 'white-elephant', 'white-tiger']
    ],
    selectedPiece: null,
    currentPlayer: 'white',
    gameStarted: false,
    playerColor: null,
    opponent: null
};

// Initialisation du plateau
function initializeBoard() {
    console.log('Initialisation du plateau...');
    const chessboard = document.getElementById('chessboard');
    if (!chessboard) {
        console.error('Élément chessboard non trouvé !');
        return;
    }
    console.log('Élément chessboard trouvé, création des cases...');
    chessboard.innerHTML = '';

    // Créer les cases du plateau
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            // Ajouter la pièce si elle existe
            const piece = gameState.board[row][col];
            if (piece) {
                console.log(`Ajout de la pièce ${piece} en position ${row},${col}`);
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece}`;
                square.appendChild(pieceElement);
            }

            square.addEventListener('click', handleSquareClick);
            chessboard.appendChild(square);
        }
    }
    console.log('Plateau initialisé avec succès !');
}

// Gestion des clics sur les cases
function handleSquareClick(event) {
    if (!gameState.gameStarted || gameState.currentPlayer !== gameState.playerColor) {
        return;
    }

    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = gameState.board[row][col];

    if (gameState.selectedPiece) {
        // Si une pièce est déjà sélectionnée, essayer de la déplacer
        const fromRow = gameState.selectedPiece.row;
        const fromCol = gameState.selectedPiece.col;
        
        // Vérifier si le mouvement est valide (à implémenter)
        if (isValidMove(fromRow, fromCol, row, col)) {
            // Envoyer le mouvement au serveur
            socket.emit('move', {
                from: { row: fromRow, col: fromCol },
                to: { row, col }
            });
        }

        // Désélectionner la pièce
        document.querySelector('.square.selected')?.classList.remove('selected');
        gameState.selectedPiece = null;
    } else if (piece && piece.startsWith(gameState.playerColor)) {
        // Sélectionner une pièce
        square.classList.add('selected');
        gameState.selectedPiece = { row, col, piece };
    }
}

// Vérification de la validité d'un mouvement (à implémenter)
function isValidMove(fromRow, fromCol, toRow, toCol) {
    // Logique de validation des mouvements à implémenter
    return true;
}

// Mise à jour du plateau après un mouvement
function updateBoard(move) {
    const { from, to } = move;
    const fromSquare = document.querySelector(`[data-row="${from.row}"][data-col="${from.col}"]`);
    const toSquare = document.querySelector(`[data-row="${to.row}"][data-col="${to.col}"]`);

    // Déplacer la pièce
    const piece = fromSquare.querySelector('.piece');
    if (piece) {
        toSquare.innerHTML = '';
        toSquare.appendChild(piece);
    }

    // Mettre à jour l'état du jeu
    gameState.board[to.row][to.col] = gameState.board[from.row][from.col];
    gameState.board[from.row][from.col] = null;

    // Changer le joueur actuel
    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
}

// Gestion des événements Socket.IO
socket.on('connect', () => {
    console.log('Connecté au serveur');
    // Authentification avec le token
    const token = localStorage.getItem('token');
    if (token) {
        socket.emit('authenticate', token);
    } else {
        window.location.href = '/login.html';
    }
});

socket.on('gameStart', (data) => {
    console.log('Début de la partie:', data);
    gameState.gameStarted = true;
    gameState.playerColor = data.color;
    gameState.opponent = data.opponent;

    // Mettre à jour l'interface
    document.getElementById('player1-name').textContent = data.color === 'white' ? 'Vous' : data.opponent;
    document.getElementById('player2-name').textContent = data.color === 'black' ? 'Vous' : data.opponent;
    document.getElementById('game-status').textContent = 'La partie a commencé !';
});

socket.on('move', (move) => {
    console.log('Mouvement reçu:', move);
    updateBoard(move);
});

socket.on('error', (error) => {
    console.error('Erreur:', error);
    document.getElementById('error-message').textContent = error;
});

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation du jeu...');
    initializeBoard();
}); 