import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Le nom de l\'équipe est requis'],
        trim: true
    },
    pokemons: {
        type: [Number],
        validate: {
            validator: function(pokemons) {
                return pokemons.length <= 6;
            },
            message: 'Une équipe peut contenir maximum 6 Pokémon'
        },
        default: []
    }
}, {
    timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
