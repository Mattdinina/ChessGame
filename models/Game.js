import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    whitePlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blackPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'abandoned'],
        default: 'pending'
    },
    winner: {
        type: String,
        enum: ['white', 'black', 'draw', null],
        default: null
    },
    moves: [{
        from: String,
        to: String,
        piece: String,
        timestamp: Date
    }],
    currentPosition: {
        type: String,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // FEN initial
    },
    timeControl: {
        type: Number, // en minutes
        default: 10
    },
    whiteTimeRemaining: {
        type: Number, // en secondes
        default: 600
    },
    blackTimeRemaining: {
        type: Number, // en secondes
        default: 600
    },
    startTime: Date,
    endTime: Date
}, {
    timestamps: true
});

// Méthode pour ajouter un coup
gameSchema.methods.addMove = async function(move) {
    this.moves.push({
        ...move,
        timestamp: new Date()
    });
    await this.save();
};

// Méthode pour mettre à jour le temps restant
gameSchema.methods.updateTimeRemaining = async function(color, timeRemaining) {
    if (color === 'white') {
        this.whiteTimeRemaining = timeRemaining;
    } else {
        this.blackTimeRemaining = timeRemaining;
    }
    await this.save();
};

// Méthode pour terminer la partie
gameSchema.methods.endGame = async function(winner) {
    this.status = 'completed';
    this.winner = winner;
    this.endTime = new Date();
    
    // Mettre à jour les classements des joueurs
    const whitePlayer = await this.model('User').findById(this.whitePlayer);
    const blackPlayer = await this.model('User').findById(this.blackPlayer);
    
    if (winner === 'white') {
        await whitePlayer.updateRating(blackPlayer.rating, 1);
        await blackPlayer.updateRating(whitePlayer.rating, 0);
    } else if (winner === 'black') {
        await whitePlayer.updateRating(blackPlayer.rating, 0);
        await blackPlayer.updateRating(whitePlayer.rating, 1);
    } else {
        await whitePlayer.updateRating(blackPlayer.rating, 0.5);
        await blackPlayer.updateRating(whitePlayer.rating, 0.5);
    }
    
    await this.save();
};

const Game = mongoose.model('Game', gameSchema);

export default Game; 