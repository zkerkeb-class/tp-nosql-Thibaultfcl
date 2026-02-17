import express from 'express';
import Pokemon from '../models/pokemon.js';

const router = express.Router();

// GET /api/stats - Statistiques
router.get('/', async (req, res) => {
    try {
        const statsByType = await Pokemon.aggregate([
            { $unwind: '$type' },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgHP: { $avg: '$base.HP' },
                    avgAttack: { $avg: '$base.Attack' },
                    avgDefense: { $avg: '$base.Defense' },
                    avgSpecialAttack: { $avg: '$base.SpecialAttack' },
                    avgSpecialDefense: { $avg: '$base.SpecialDefense' },
                    avgSpeed: { $avg: '$base.Speed' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const strongestAttack = await Pokemon.find()
            .sort({ 'base.Attack': -1 })
            .limit(1);

        const strongestSpecialAttack = await Pokemon.find()
            .sort({ 'base.SpecialAttack': -1 })
            .limit(1);

        const mostHP = await Pokemon.find()
            .sort({ 'base.HP': -1 })
            .limit(1);

        const strongestDefense = await Pokemon.find()
            .sort({ 'base.Defense': -1 })
            .limit(1);

        const strongestSpecialDefense = await Pokemon.find()
            .sort({ 'base.SpecialDefense': -1 })
            .limit(1);

        const fastest = await Pokemon.find()
            .sort({ 'base.Speed': -1 })
            .limit(1);

        const totalPokemon = await Pokemon.countDocuments();

        res.json({
            totalPokemon,
            statsByType,
            champions: {
                strongestAttack: strongestAttack[0],
                strongestSpecialAttack: strongestSpecialAttack[0],
                mostHP: mostHP[0],
                strongestDefense: strongestDefense[0],
                strongestSpecialDefense: strongestSpecialDefense[0],
                fastest: fastest[0]
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
