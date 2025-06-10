import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import initDatabase from './config/initDb.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Game from './models/Game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configuration CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5500',
        'http://localhost:5501',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        'http://192.168.1.42:5500',
        'http://192.168.1.42:5501'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Gérer les requêtes OPTIONS pour le CORS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour servir les fichiers statiques
app.use(express.static(join(__dirname, 'public')));

// Routes API
app.post('/api/auth/register', async (req, res) => {
    console.log('Route /api/auth/register appelée avec le body:', req.body);
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('Utilisateur existant trouvé:', existingUser.email);
            return res.json({ 
                success: false, 
                message: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' 
            });
        }

        // Créer le nouvel utilisateur
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        console.log('Nouvel utilisateur créé avec succès:', user.email);

        res.json({ 
            success: true, 
            message: 'Compte créé avec succès' 
        });
    } catch (error) {
        console.error('Erreur détaillée lors de l\'inscription:', error);
        res.status(500).json({ 
            success: false, 
            message: `Erreur lors de la création du compte: ${error.message}` 
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    console.log('Route /api/auth/login appelée avec le body:', req.body);
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur et inclure le mot de passe
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
        );

        // Mettre à jour le statut de l'utilisateur
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        res.json({
            success: true,
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la connexion' 
        });
    }
});

// Route par défaut
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'game.html'));
});

// Initialisation de la base de données
initDatabase().then(() => {
    console.log('Base de données initialisée');
}).catch(error => {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
});

// Configuration Socket.IO
io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    // Stocker les informations du joueur
    let playerInfo = null;

    // Authentification du joueur
    socket.on('authenticate', async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
            const user = await User.findById(decoded.userId);
            
            if (user) {
                playerInfo = {
                    id: user._id,
                    username: user.username,
                    socketId: socket.id
                };
                
                // Mettre à jour le statut de l'utilisateur
                user.isOnline = true;
                user.lastSeen = new Date();
                await user.save();

                // Confirmer l'authentification
                socket.emit('authenticated');
                console.log('Joueur authentifié:', playerInfo.username);
            } else {
                socket.emit('error', 'Utilisateur non trouvé');
            }
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
            socket.emit('error', 'Erreur d\'authentification');
        }
    });

    // Création d'une nouvelle partie
    socket.on('createGame', async (username) => {
        if (!playerInfo) {
            socket.emit('error', 'Vous devez être authentifié pour créer une partie');
            return;
        }

        try {
            // Générer un ID unique pour la partie
            const gameId = Math.random().toString(36).substring(2, 15);
            
            // Créer une nouvelle partie
            const newGame = new Game({
                gameId,
                player1: playerInfo.id,
                player1SocketId: socket.id,
                status: 'waiting'
            });
            await newGame.save();

            // Informer le créateur de la partie
            socket.emit('gameCreated', { gameId });
            console.log('Nouvelle partie créée:', gameId, 'par', playerInfo.username);
        } catch (error) {
            console.error('Erreur lors de la création de la partie:', error);
            socket.emit('error', 'Erreur lors de la création de la partie');
        }
    });

    // Rejoindre une partie existante
    socket.on('joinGame', async ({ gameId, username }) => {
        if (!playerInfo) {
            socket.emit('error', 'Vous devez être authentifié pour rejoindre une partie');
            return;
        }

        try {
            const game = await Game.findOne({ gameId, status: 'waiting' });
            
            if (!game) {
                socket.emit('error', 'Partie non trouvée ou déjà commencée');
                return;
            }

            if (game.player1.toString() === playerInfo.id) {
                socket.emit('error', 'Vous ne pouvez pas rejoindre votre propre partie');
                return;
            }

            // Mettre à jour la partie
            game.player2 = playerInfo.id;
            game.player2SocketId = socket.id;
            game.status = 'active';
            await game.save();

            // Informer les deux joueurs
            const player1 = await User.findById(game.player1);
            io.to(game.player1SocketId).emit('gameStart', {
                color: 'white',
                opponent: playerInfo.username
            });
            socket.emit('gameStart', {
                color: 'black',
                opponent: player1.username
            });
            console.log('Partie rejointe:', gameId, 'par', playerInfo.username);
        } catch (error) {
            console.error('Erreur lors de la connexion à la partie:', error);
            socket.emit('error', 'Erreur lors de la connexion à la partie');
        }
    });

    // Gestion des mouvements
    socket.on('move', async (move) => {
        if (!playerInfo) return;

        const game = await Game.findOne({
            $or: [
                { player1: playerInfo.id },
                { player2: playerInfo.id }
            ],
            status: 'active'
        });

        if (game) {
            // Vérifier si c'est le tour du joueur
            const isPlayer1 = game.player1.toString() === playerInfo.id;
            const isPlayer2 = game.player2.toString() === playerInfo.id;
            const isWhiteTurn = game.moves.length % 2 === 0;

            if ((isPlayer1 && isWhiteTurn) || (isPlayer2 && !isWhiteTurn)) {
                // Enregistrer le mouvement
                game.moves.push(move);
                await game.save();

                // Envoyer le mouvement à l'autre joueur
                const opponentSocketId = isPlayer1 ? game.player2SocketId : game.player1SocketId;
                io.to(opponentSocketId).emit('move', move);
            }
        }
    });

    // Gestion du chat
    socket.on('chat', (message) => {
        if (!playerInfo) return;

        const game = io.sockets.adapter.rooms.get(gameId);
        if (game) {
            io.to(gameId).emit('chat', {
                username: playerInfo.username,
                message: message
            });
        }
    });

    // Gestion de l'abandon
    socket.on('resign', async () => {
        if (!playerInfo) return;

        const game = await Game.findOne({
            $or: [
                { player1: playerInfo.id },
                { player2: playerInfo.id }
            ],
            status: 'active'
        });

        if (game) {
            game.status = 'finished';
            game.winner = game.player1.toString() === playerInfo.id ? game.player2 : game.player1;
            await game.save();

            // Informer les joueurs
            const opponentSocketId = game.player1.toString() === playerInfo.id ? 
                game.player2SocketId : game.player1SocketId;
            
            io.to(opponentSocketId).emit('gameOver', {
                reason: 'L\'adversaire a abandonné'
            });
            socket.emit('gameOver', {
                reason: 'Vous avez abandonné'
            });
        }
    });

    // Gestion de la proposition de nulle
    socket.on('drawOffer', async () => {
        if (!playerInfo) return;

        const game = await Game.findOne({
            $or: [
                { player1: playerInfo.id },
                { player2: playerInfo.id }
            ],
            status: 'active'
        });

        if (game) {
            const opponentSocketId = game.player1.toString() === playerInfo.id ? 
                game.player2SocketId : game.player1SocketId;
            
            io.to(opponentSocketId).emit('drawOffer', {
                username: playerInfo.username
            });
        }
    });

    // Gestion de la réponse à la proposition de nulle
    socket.on('drawResponse', async (accepted) => {
        if (!playerInfo) return;

        const game = await Game.findOne({
            $or: [
                { player1: playerInfo.id },
                { player2: playerInfo.id }
            ],
            status: 'active'
        });

        if (game) {
            if (accepted) {
                game.status = 'finished';
                game.result = 'draw';
                await game.save();

                const opponentSocketId = game.player1.toString() === playerInfo.id ? 
                    game.player2SocketId : game.player1SocketId;
                
                io.to(opponentSocketId).emit('gameOver', {
                    reason: 'Partie nulle par accord'
                });
                socket.emit('gameOver', {
                    reason: 'Partie nulle par accord'
                });
            } else {
                const opponentSocketId = game.player1.toString() === playerInfo.id ? 
                    game.player2SocketId : game.player1SocketId;
                
                io.to(opponentSocketId).emit('drawRejected', {
                    username: playerInfo.username
                });
            }
        }
    });

    // Gestion de la déconnexion
    socket.on('disconnect', async () => {
        console.log('Déconnexion:', socket.id);
        
        if (playerInfo) {
            // Mettre à jour le statut de l'utilisateur
            const user = await User.findById(playerInfo.id);
            if (user) {
                user.isOnline = false;
                user.lastSeen = new Date();
                await user.save();
            }

            // Gérer la partie en cours
            const game = await Game.findOne({
                $or: [
                    { player1: playerInfo.id },
                    { player2: playerInfo.id }
                ],
                status: 'active'
            });

            if (game) {
                game.status = 'finished';
                game.winner = game.player1.toString() === playerInfo.id ? game.player2 : game.player1;
                await game.save();

                const opponentSocketId = game.player1.toString() === playerInfo.id ? 
                    game.player2SocketId : game.player1SocketId;
                
                io.to(opponentSocketId).emit('gameOver', {
                    reason: 'L\'adversaire s\'est déconnecté'
                });
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 