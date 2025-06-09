import connectDB from './config/database.js';
import User from './models/User.js';

async function testDatabase() {
    try {
        // Connexion à la base de données
        await connectDB();
        console.log('Connexion à la base de données réussie !');

        // Création d'un utilisateur test
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });

        // Sauvegarde de l'utilisateur
        await testUser.save();
        console.log('Utilisateur créé avec succès !');
        console.log('Détails de l\'utilisateur:', {
            username: testUser.username,
            email: testUser.email,
            rating: testUser.rating,
            wins: testUser.wins,
            losses: testUser.losses,
            draws: testUser.draws
        });

        // Vérification de la récupération de l'utilisateur
        const foundUser = await User.findOne({ email: 'test@example.com' });
        console.log('Utilisateur trouvé dans la base de données:', foundUser ? 'Oui' : 'Non');

        // Test de la méthode comparePassword
        const isPasswordValid = await testUser.comparePassword('password123');
        console.log('Mot de passe valide:', isPasswordValid);

    } catch (error) {
        console.error('Erreur lors du test:', error);
    } finally {
        // Fermer la connexion à la base de données
        process.exit(0);
    }
}

testDatabase(); 