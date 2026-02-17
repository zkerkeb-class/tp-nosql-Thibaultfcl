import express from 'express';
import Pokemon from '../models/pokemon.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// READ - Récupérer tous les Pokémons avec filtres, tri et pagination
router.get('/', async (req, res) => {
    try {
        const filter = {};

        if (req.query.type) {
            filter.type = req.query.type;
        }

        if (req.query.name) {
            filter['name.english'] = { 
                $regex: req.query.name, 
                $options: 'i' 
            };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || 'id';

        const pokemons = await Pokemon.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Pokemon.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.json({
            data: pokemons,
            page,
            limit,
            total,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Récupérer un Pokémon par ID (numéro du Pokédex)
router.get('/:id', async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.id);
        const pokemon = await Pokemon.findOne({ id: pokemonId });
        
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        res.json(pokemon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE - Créer un nouveau Pokémon (protégé)
router.post('/', auth, async (req, res) => {
    try {
        const newPokemon = await Pokemon.create(req.body);
        res.status(201).json(newPokemon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE - Mettre à jour un Pokémon (protégé)
router.put('/:id', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.id);
        const updatedPokemon = await Pokemon.findOneAndUpdate(
            { id: pokemonId },
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        
        if (!updatedPokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        res.json(updatedPokemon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Supprimer un Pokémon (protégé)
router.delete('/:id', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.id);
        const deletedPokemon = await Pokemon.findOneAndDelete({ id: pokemonId });
        
        if (!deletedPokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
