import mongoose from 'mongoose';

const VALID_TYPES = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 
    'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const pokemonSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: [true, 'L\'ID du Pokémon est requis'],
        unique: true,
        min: [1, 'L\'ID doit être un entier positif']
    },
    name: {
        english: {
            type: String,
            required: [true, 'Le nom anglais est requis']
        },
        japanese: String,
        chinese: String,
        french: {
            type: String,
            required: [true, 'Le nom français est requis']
        }
    },
    type: {
        type: [String],
        required: [true, 'Le type du Pokémon est requis'],
        validate: {
            validator: function(types) {
                return types.length > 0 && types.every(t => VALID_TYPES.includes(t));
            },
            message: props => `Type invalide. Types autorisés : ${VALID_TYPES.join(', ')}`
        }
    },
    base: {
        HP: {
            type: Number,
            required: [true, 'Les HP sont requis'],
            min: [1, 'Les HP doivent être entre 1 et 255'],
            max: [255, 'Les HP doivent être entre 1 et 255']
        },
        Attack: {
            type: Number,
            required: [true, 'L\'Attaque est requise'],
            min: [1, 'L\'Attaque doit être entre 1 et 255'],
            max: [255, 'L\'Attaque doit être entre 1 et 255']
        },
        Defense: {
            type: Number,
            required: [true, 'La Défense est requise'],
            min: [1, 'La Défense doit être entre 1 et 255'],
            max: [255, 'La Défense doit être entre 1 et 255']
        },
        SpecialAttack: {
            type: Number,
            min: [1, 'L\'Attaque Spéciale doit être entre 1 et 255'],
            max: [255, 'L\'Attaque Spéciale doit être entre 1 et 255']
        },
        SpecialDefense: {
            type: Number,
            min: [1, 'La Défense Spéciale doit être entre 1 et 255'],
            max: [255, 'La Défense Spéciale doit être entre 1 et 255']
        },
        Speed: {
            type: Number,
            min: [1, 'La Vitesse doit être entre 1 et 255'],
            max: [255, 'La Vitesse doit être entre 1 et 255']
        }
    }
}, {
    collection: 'pokemons',
    timestamps: true
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
