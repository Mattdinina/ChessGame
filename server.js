import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import initDatabase from './config/initDb.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    res.sendFile(join(__dirname, 'public', 'index.html'));
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

    socket.on('disconnect', () => {
        console.log('Déconnexion:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 