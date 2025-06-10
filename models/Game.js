import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    player1SocketId: {
        type: String,
        required: true
    },
    player2SocketId: {
        type: String
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting'
    },
    moves: [{
        from: {
            row: Number,
            col: Number
        },
        to: {
            row: Number,
            col: Number
        },
        piece: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    result: {
        type: String,
        enum: ['white', 'black', 'draw', null],
        default: null
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date
}, {
    timestamps: true
});

// Méthode pour mettre à jour les classements des joueurs
gameSchema.methods.updateRatings = async function() {
    if (this.status !== 'finished' || !this.result) return;

    const player1 = await this.model('User').findById(this.player1);
    const player2 = await this.model('User').findById(this.player2);

    if (!player1 || !player2) return;

    let player1Result, player2Result;

    switch (this.result) {
        case 'white':
            player1Result = 1;
            player2Result = 0;
            break;
        case 'black':
            player1Result = 0;
            player2Result = 1;
            break;
        case 'draw':
            player1Result = 0.5;
            player2Result = 0.5;
            break;
    }

    await player1.updateRating(player2.rating, player1Result);
    await player2.updateRating(player1.rating, player2Result);
};

// Middleware pour mettre à jour les classements avant de sauvegarder
gameSchema.pre('save', async function(next) {
    if (this.isModified('status') && this.status === 'finished' && !this.endTime) {
        this.endTime = new Date();
        await this.updateRatings();
    }
    next();
});

const Game = mongoose.model('Game', gameSchema);

export default Game; 