import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/user.js';
import Pokemon from '../models/pokemon.js';

const router = express.Router();

// POST /api/favorites/:pokemonId - Ajouter un favori
router.post('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);

        const pokemon = await Pokemon.findOne({ id: pokemonId });
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { favorites: pokemonId } },
            { returnDocument: 'after' }
        ).select('-password');

        res.json({ 
            message: 'Pokémon ajouté aux favoris',
            favorites: user.favorites 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/favorites/:pokemonId - Retirer un favori
router.delete('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { favorites: pokemonId } },
            { returnDocument: 'after' }
        ).select('-password');

        res.json({ 
            message: 'Pokémon retiré des favoris',
            favorites: user.favorites 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/favorites - Lister mes Pokémon favoris
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('favorites');

        const favoritePokemons = await Pokemon.find({ 
            id: { $in: user.favorites } 
        });

        res.json({
            count: favoritePokemons.length,
            favorites: user.favorites,
            pokemons: favoritePokemons
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
