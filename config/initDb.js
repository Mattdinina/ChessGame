import connectDB from './database.js';
import User from '../models/User.js';
import Game from '../models/Game.js';

async function initDatabase() {
    try {
        // Synchroniser les modèles avec la base de données
        await connectDB();
        console.log('Base de données synchronisée avec succès');

        // Créer un utilisateur admin par défaut si nécessaire
        const adminExists = await User.findOne({ email: 'admin@chess.com' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                email: 'admin@chess.com',
                password: process.env.ADMIN_PASSWORD,
                rating: 2000
            });
            console.log('Utilisateur admin créé avec succès');
        }

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        process.exit(1);
    }
}

export default initDatabase; 