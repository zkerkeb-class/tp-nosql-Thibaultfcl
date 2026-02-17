import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Le nom d\'utilisateur et le mot de passe sont requis' 
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Ce nom d\'utilisateur est déjà pris' 
            });
        }

        const user = await User.create({ username, password });

        res.status(201).json({ 
            message: 'Utilisateur créé avec succès',
            username: user.username 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Le nom d\'utilisateur et le mot de passe sont requis' 
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                error: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Connexion réussie',
            token 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
