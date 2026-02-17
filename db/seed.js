import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Pokemon from '../models/pokemon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB !');

        const pokemonsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', 'data', 'pokemons.json'), 'utf-8')
        );

        await Pokemon.deleteMany({});
        console.log('Collection vidée.');

        const cleanedData = pokemonsData.map(pokemon => {
            const { image, ...rest } = pokemon;
            return rest;
        });

        const result = await Pokemon.insertMany(cleanedData);
        console.log(`${result.length} Pokémon insérés avec succès !`);

        await mongoose.connection.close();
        console.log('Connexion fermée.');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors du seed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
