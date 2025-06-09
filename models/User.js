import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
    },
    rating: {
        type: Number,
        default: 1500
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    draws: {
        type: Number,
        default: 0
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware pour hasher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
    // Ne hasher le mot de passe que s'il a été modifié
    if (!this.isModified('password')) return next();
    
    try {
        // Augmenter le nombre de rounds pour plus de sécurité
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Erreur lors de la comparaison des mots de passe');
    }
};

// Méthode pour mettre à jour le classement (système Elo)
userSchema.methods.updateRating = async function(opponentRating, result) {
    const K = 32; // Facteur K pour le système Elo
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - this.rating) / 400));
    const actualScore = result; // 1 pour victoire, 0.5 pour nul, 0 pour défaite
    const newRating = this.rating + K * (actualScore - expectedScore);
    
    this.rating = Math.round(newRating);
    if (result === 1) this.wins++;
    else if (result === 0) this.losses++;
    else this.draws++;
    
    await this.save();
};

const User = mongoose.model('User', userSchema);

export default User; 