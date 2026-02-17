import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import pokemonsRouter from './routes/pokemons.js';
import authRouter from './routes/auth.js';
import favoritesRouter from './routes/favorites.js';
import statsRouter from './routes/stats.js';
import teamsRouter from './routes/teams.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/assets', express.static('assets'));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: '.' });
});

app.use('/api/pokemons', pokemonsRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/teams', teamsRouter);

// Connexion à MongoDB puis démarrage du serveur
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});