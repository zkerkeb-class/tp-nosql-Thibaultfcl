import express from 'express';
import auth from '../middleware/auth.js';
import Team from '../models/team.js';
import Pokemon from '../models/pokemon.js';

const router = express.Router();

// POST /api/teams - Créer une équipe
router.post('/', auth, async (req, res) => {
    try {
        const { name, pokemons = [] } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Le nom de l\'équipe est requis' });
        }

        if (pokemons.length > 0) {
            const pokemonCount = await Pokemon.countDocuments({ 
                id: { $in: pokemons } 
            });
            if (pokemonCount !== pokemons.length) {
                return res.status(400).json({ 
                    error: 'Un ou plusieurs Pokémon n\'existent pas' 
                });
            }
        }

        const team = await Team.create({
            user: req.user.id,
            name,
            pokemons
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/teams - Lister mes équipes
router.get('/', auth, async (req, res) => {
    try {
        const teams = await Team.find({ user: req.user.id });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/teams/:id - Détail d'une équipe avec les données complètes des Pokémon
router.get('/:id', auth, async (req, res) => {
    try {
        const team = await Team.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }

        const pokemonsDetails = await Pokemon.find({ 
            id: { $in: team.pokemons } 
        });

        res.json({
            _id: team._id,
            name: team.name,
            user: team.user,
            pokemons: pokemonsDetails,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/teams/:id - Modifier une équipe
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, pokemons } = req.body;

        if (pokemons && pokemons.length > 0) {
            const pokemonCount = await Pokemon.countDocuments({ 
                id: { $in: pokemons } 
            });
            if (pokemonCount !== pokemons.length) {
                return res.status(400).json({ 
                    error: 'Un ou plusieurs Pokémon n\'existent pas' 
                });
            }
        }

        const team = await Team.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name, pokemons },
            { returnDocument: 'after', runValidators: true }
        );

        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }

        res.json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/teams/:id - Supprimer une équipe
router.delete('/:id', auth, async (req, res) => {
    try {
        const team = await Team.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
