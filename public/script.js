// ===== CONFIGURATION =====
const API_URL = 'http://localhost:3000/api';

// ===== STATE =====
let currentPage = 1;
let currentType = '';
let userFavorites = [];
let userTeams = [];
let currentSelectedTeam = null;

// ===== CONSTANTS =====
const types = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 
    'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadPokemons();
    initTypeFilters();
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPokemons();
        }
    });

    // Close modal on outside click
    document.getElementById('pokemonModal').addEventListener('click', (e) => {
        if (e.target.id === 'pokemonModal') {
            closeModal();
        }
    });
});

// ===== TYPE FILTERS =====
function initTypeFilters() {
    const container = document.getElementById('typeFilters');
    container.innerHTML = types.map(type => 
        `<div class="type-badge type-${type}" onclick="filterByType('${type}')">${type}</div>`
    ).join('');
}

function filterByType(type) {
    if (currentType === type) {
        currentType = '';
        document.querySelectorAll('.type-badge').forEach(badge => badge.classList.remove('active'));
    } else {
        currentType = type;
        document.querySelectorAll('.type-badge').forEach(badge => badge.classList.remove('active'));
        document.querySelector(`.type-badge.type-${type}`).classList.add('active');
    }
    currentPage = 1;
    loadPokemons();
}

// ===== POKEMON LOADING & DISPLAY =====
async function loadPokemons() {
    const grid = document.getElementById('pokemonGrid');
    grid.innerHTML = '<div class="loading">Chargement des Pokémon</div>';

    try {
        const sort = document.getElementById('sortSelect').value;
        const limit = document.getElementById('limitSelect').value;
        const searchTerm = document.getElementById('searchInput').value;

        let url = `${API_URL}/pokemons?page=${currentPage}&limit=${limit}&sort=${sort}`;
        if (currentType) url += `&type=${currentType}`;
        if (searchTerm) url += `&name=${searchTerm}`;

        const response = await fetch(url);
        const data = await response.json();

        displayPokemons(data.data, grid);
        updatePagination(data);
    } catch (error) {
        grid.innerHTML = '<div class="error-message">Erreur lors du chargement des Pokémon</div>';
        console.error(error);
    }
}

function displayPokemons(pokemons, container) {
    if (pokemons.length === 0) {
        container.innerHTML = '<div class="loading">Aucun Pokémon trouvé</div>';
        return;
    }

    container.innerHTML = pokemons.map(pokemon => {
        const isFavorite = userFavorites.includes(pokemon.id);
        return `
            <div class="pokemon-card" onclick="showPokemonDetails(${pokemon.id})">
                <div class="pokemon-card-header">
                    <span class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</span>
                    ${getToken() ? `
                        <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${pokemon.id})" title="Ajouter aux favoris">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    ` : ''}
                </div>
                <img src="/assets/pokemons/${pokemon.id}.png" 
                     alt="${pokemon.name.english}" 
                     class="pokemon-image"
                     onerror="this.src='/assets/pokemons/0.png'">
                <div class="pokemon-info">
                    <h3 class="pokemon-name">${pokemon.name.english}</h3>
                    <div class="pokemon-types">
                        ${pokemon.type.map(type => 
                            `<span class="type-badge type-${type}">${type}</span>`
                        ).join('')}
                    </div>
                    <div class="pokemon-stats">
                        <div class="stat">
                            <div class="stat-label">PV</div>
                            <div class="stat-value">${pokemon.base.HP}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">ATK</div>
                            <div class="stat-value">${pokemon.base.Attack}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">DEF</div>
                            <div class="stat-value">${pokemon.base.Defense}</div>
                        </div>
                    </div>
                    ${getToken() && currentSelectedTeam ? `
                        <button class="btn btn-primary" onclick="event.stopPropagation(); addPokemonToTeam(${pokemon.id}, '${pokemon.name.english}')" 
                                style="width: 100%; margin-top: 0.8rem; padding: 0.5rem; font-size: 0.85rem;">
                            ➕ Ajouter à l'équipe
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===== PAGINATION =====
function updatePagination(data) {
    document.getElementById('pageInfo').textContent = 
        `Page ${data.page} sur ${data.totalPages} (${data.total} Pokémon)`;
    document.getElementById('prevBtn').disabled = data.page === 1;
    document.getElementById('nextBtn').disabled = data.page === data.totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPokemons();
        window.scrollTo(0, 0);
    }
}

function nextPage() {
    currentPage++;
    loadPokemons();
    window.scrollTo(0, 0);
}

function searchPokemons() {
    currentPage = 1;
    loadPokemons();
}

// ===== POKEMON DETAILS MODAL =====
async function showPokemonDetails(id) {
    const modal = document.getElementById('pokemonModal');
    const content = document.getElementById('modalContent');
    
    modal.classList.add('active');
    content.innerHTML = '<div class="loading">Chargement</div>';

    try {
        const response = await fetch(`${API_URL}/pokemons/${id}`);
        const pokemon = await response.json();

        content.innerHTML = `
            <div class="modal-header">
                <img src="/assets/pokemons/${pokemon.id}.png" 
                     alt="${pokemon.name.english}" 
                     class="modal-pokemon-image"
                     onerror="this.src='/assets/pokemons/0.png'">
                <div class="modal-pokemon-info">
                    <h2>${pokemon.name.english}</h2>
                    <p style="color: var(--text-secondary);">#${String(pokemon.id).padStart(3, '0')}</p>
                    <div class="pokemon-types">
                        ${pokemon.type.map(type => 
                            `<span class="type-badge type-${type}">${type}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <h3 style="margin-bottom: 1rem;">Statistiques détaillées</h3>
            <div class="detailed-stats">
                <div class="detailed-stat">
                    <div class="detailed-stat-label">Points de Vie</div>
                    <div class="detailed-stat-value">${pokemon.base.HP}</div>
                </div>
                <div class="detailed-stat">
                    <div class="detailed-stat-label">Attaque</div>
                    <div class="detailed-stat-value">${pokemon.base.Attack}</div>
                </div>
                <div class="detailed-stat">
                    <div class="detailed-stat-label">Défense</div>
                    <div class="detailed-stat-value">${pokemon.base.Defense}</div>
                </div>
                <div class="detailed-stat">
                    <div class="detailed-stat-label">Attaque Spé.</div>
                    <div class="detailed-stat-value">${pokemon.base.SpecialAttack || 'N/A'}</div>
                </div>
                <div class="detailed-stat">
                    <div class="detailed-stat-label">Défense Spé.</div>
                    <div class="detailed-stat-value">${pokemon.base.SpecialDefense || 'N/A'}</div>
                </div>
                <div class="detailed-stat">
                    <div class="detailed-stat-label">Vitesse</div>
                    <div class="detailed-stat-value">${pokemon.base.Speed}</div>
                </div>
            </div>

            <div style="margin-top: 1.5rem;">
                <h4>Noms internationaux</h4>
                <p><strong>Français:</strong> ${pokemon.name.french || 'N/A'}</p>
                <p><strong>Japonais:</strong> ${pokemon.name.japanese || 'N/A'}</p>
                <p><strong>Chinois:</strong> ${pokemon.name.chinese || 'N/A'}</p>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Erreur lors du chargement des détails</div>';
        console.error(error);
    }
}

function closeModal() {
    document.getElementById('pokemonModal').classList.remove('active');
}

// ===== AUTHENTICATION =====
function getToken() {
    return localStorage.getItem('token');
}

async function checkAuth() {
    const token = getToken();
    const username = localStorage.getItem('username');
    
    if (token && username) {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('username').textContent = username;
        document.getElementById('favoritesLink').style.display = 'block';
        document.getElementById('teamsLink').style.display = 'block';
        document.getElementById('teamSelector').style.display = 'block';
        await loadUserFavorites();
        await loadUserTeamsForSelector();
    } else {
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('favoritesLink').style.display = 'none';
        document.getElementById('teamsLink').style.display = 'none';
        document.getElementById('teamSelector').style.display = 'none';
        userFavorites = [];
        userTeams = [];
        currentSelectedTeam = null;
    }
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            errorDiv.innerHTML = '<div class="success-message">Connexion réussie !</div>';
            setTimeout(async () => {
                await checkAuth();
                showSection('pokedex');
                loadPokemons();
            }, 1000);
        } else {
            errorDiv.innerHTML = `<div class="error-message">${data.error}</div>`;
        }
    } catch (error) {
        errorDiv.innerHTML = '<div class="error-message">Erreur de connexion</div>';
        console.error(error);
    }
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            errorDiv.innerHTML = '<div class="success-message">Compte créé ! Redirection vers la connexion...</div>';
            setTimeout(() => showSection('login'), 1500);
        } else {
            errorDiv.innerHTML = `<div class="error-message">${data.error}</div>`;
        }
    } catch (error) {
        errorDiv.innerHTML = '<div class="error-message">Erreur lors de l\'inscription</div>';
        console.error(error);
    }
}

async function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    userFavorites = [];
    await checkAuth();
    showSection('pokedex');
    loadPokemons();
}

// ===== FAVORITES =====
async function loadUserFavorites() {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            userFavorites = data.favorites || [];
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

async function toggleFavorite(pokemonId) {
    const token = getToken();
    if (!token) {
        alert('Vous devez être connecté pour ajouter des favoris');
        return;
    }

    try {
        const isFavorite = userFavorites.includes(pokemonId);
        const method = isFavorite ? 'DELETE' : 'POST';
        
        const response = await fetch(`${API_URL}/favorites/${pokemonId}`, {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            userFavorites = data.favorites;
            loadPokemons();
            if (document.getElementById('favorites').classList.contains('active')) {
                loadFavorites();
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

async function loadFavorites() {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '<div class="loading">Chargement de vos favoris</div>';

    try {
        const response = await fetch(`${API_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const data = await response.json();
            displayPokemons(data.pokemons, grid);
        } else {
            grid.innerHTML = '<div class="error-message">Erreur lors du chargement</div>';
        }
    } catch (error) {
        grid.innerHTML = '<div class="error-message">Erreur lors du chargement</div>';
        console.error(error);
    }
}

// ===== TEAMS =====
async function loadUserTeamsForSelector() {
    try {
        const response = await fetch(`${API_URL}/teams`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            userTeams = await response.json();
            updateTeamSelector();
        }
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

function updateTeamSelector() {
    const select = document.getElementById('currentTeamSelect');
    const countSpan = document.getElementById('teamPokemonCount');
    
    select.innerHTML = '<option value="">-- Aucune équipe sélectionnée --</option>' +
        userTeams.map(team => 
            `<option value="${team._id}">${team.name} (${team.pokemons?.length || 0}/6)</option>`
        ).join('');
    
    select.onchange = async (e) => {
        currentSelectedTeam = e.target.value ? userTeams.find(t => t._id === e.target.value) : null;
        updateTeamPokemonCount();
        loadPokemons();
    };
    
    updateTeamPokemonCount();
}

function updateTeamPokemonCount() {
    const countSpan = document.getElementById('teamPokemonCount');
    if (currentSelectedTeam) {
        const count = currentSelectedTeam.pokemons?.length || 0;
        countSpan.textContent = `${count}/6 Pokémon dans l'équipe`;
        countSpan.style.color = count >= 6 ? 'var(--pokemon-red)' : 'var(--text-secondary)';
    } else {
        countSpan.textContent = '';
    }
}

async function addPokemonToTeam(pokemonId, pokemonName) {
    if (!currentSelectedTeam) {
        alert('Veuillez sélectionner une équipe');
        return;
    }

    const currentPokemons = currentSelectedTeam.pokemons || [];
    
    if (currentPokemons.includes(pokemonId)) {
        alert(`${pokemonName} est déjà dans cette équipe !`);
        return;
    }

    if (currentPokemons.length >= 6) {
        alert('Cette équipe contient déjà 6 Pokémon (maximum)');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/teams/${currentSelectedTeam._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                name: currentSelectedTeam.name,
                pokemons: [...currentPokemons, pokemonId]
            })
        });

        if (response.ok) {
            const updatedTeam = await response.json();
            const index = userTeams.findIndex(t => t._id === currentSelectedTeam._id);
            if (index !== -1) {
                userTeams[index] = updatedTeam;
                currentSelectedTeam = updatedTeam;
            }
            updateTeamSelector();
            alert(`${pokemonName} a été ajouté à l'équipe !`);
        } else {
            const data = await response.json();
            alert(`Erreur : ${data.error}`);
        }
    } catch (error) {
        console.error('Error adding pokemon to team:', error);
        alert('Erreur lors de l\'ajout du Pokémon');
    }
}

async function createTeam(event) {
    event.preventDefault();
    const name = document.getElementById('teamName').value;
    const errorDiv = document.getElementById('teamError');

    try {
        const response = await fetch(`${API_URL}/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name, pokemons: [] })
        });

        const data = await response.json();

        if (response.ok) {
            errorDiv.innerHTML = '<div class="success-message">Équipe créée avec succès !</div>';
            document.getElementById('teamName').value = '';
            setTimeout(() => {
                errorDiv.innerHTML = '';
                loadUserTeams();
                loadUserTeamsForSelector();
            }, 1500);
        } else {
            errorDiv.innerHTML = `<div class="error-message">${data.error}</div>`;
        }
    } catch (error) {
        errorDiv.innerHTML = '<div class="error-message">Erreur lors de la création de l\'équipe</div>';
        console.error(error);
    }
}

async function loadUserTeams() {
    const grid = document.getElementById('teamsGrid');
    grid.innerHTML = '<div class="loading">Chargement de vos équipes</div>';

    try {
        const response = await fetch(`${API_URL}/teams`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const teams = await response.json();
            
            if (teams.length === 0) {
                grid.innerHTML = '<p>Vous n\'avez pas encore d\'équipe. Créez-en une ci-dessus !</p>';
                return;
            }

            const teamsWithDetails = await Promise.all(
                teams.map(async team => {
                    const detailResponse = await fetch(`${API_URL}/teams/${team._id}`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    });
                    return detailResponse.json();
                })
            );

            grid.innerHTML = teamsWithDetails.map(team => `
                <div class="team-card">
                    <div class="team-header">
                        <h3 class="team-name">${team.name}</h3>
                        <button class="btn btn-secondary" onclick="deleteTeam('${team._id}')" style="padding: 0.4rem 1rem;">Supprimer</button>
                    </div>
                    ${team.pokemons && team.pokemons.length > 0 ? `
                        <div class="team-pokemons">
                            ${team.pokemons.map(p => `
                                <div style="position: relative; display: inline-block;">
                                    <img src="/assets/pokemons/${p.id}.png" 
                                         alt="${p.name.english}" 
                                         class="team-pokemon-mini"
                                         title="${p.name.english}"
                                         onerror="this.src='/assets/pokemons/0.png'">
                                    <button onclick="removePokemonFromTeam('${team._id}', ${p.id})" 
                                            style="position: absolute; top: -5px; right: -5px; background: var(--pokemon-red); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"
                                            title="Retirer ${p.name.english}">×</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-secondary); margin-top: 1rem;">Aucun Pokémon dans cette équipe. Ajoutez-en depuis le Pokédex !</p>'}
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<div class="error-message">Erreur lors du chargement</div>';
        }
    } catch (error) {
        grid.innerHTML = '<div class="error-message">Erreur lors du chargement</div>';
        console.error(error);
    }
}

async function removePokemonFromTeam(teamId, pokemonId) {
    if (!confirm('Retirer ce Pokémon de l\'équipe ?')) {
        return;
    }

    try {
        const detailResponse = await fetch(`${API_URL}/teams/${teamId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!detailResponse.ok) {
            alert('Erreur lors du chargement de l\'équipe');
            return;
        }

        const team = await detailResponse.json();
        const updatedPokemons = team.pokemons.filter(p => p.id !== pokemonId).map(p => p.id);

        const response = await fetch(`${API_URL}/teams/${teamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                name: team.name,
                pokemons: updatedPokemons
            })
        });

        if (response.ok) {
            await loadUserTeams();
            await loadUserTeamsForSelector();
        } else {
            alert('Erreur lors du retrait du Pokémon');
        }
    } catch (error) {
        console.error('Error removing pokemon from team:', error);
        alert('Erreur lors du retrait du Pokémon');
    }
}

async function deleteTeam(teamId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/teams/${teamId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            if (currentSelectedTeam && currentSelectedTeam._id === teamId) {
                currentSelectedTeam = null;
                document.getElementById('currentTeamSelect').value = '';
            }
            await loadUserTeams();
            await loadUserTeamsForSelector();
        }
    } catch (error) {
        console.error('Error deleting team:', error);
    }
}

// ===== STATS =====
async function loadStats() {
    const container = document.getElementById('statsContent');
    container.innerHTML = '<div class="loading">Chargement des statistiques</div>';

    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Informations générales</h3>
                    <div class="stat-item">
                        <strong>Total de Pokémon :</strong> ${stats.totalPokemon}
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Champions - Attaque</h3>
                    <div class="stat-item">
                        <strong>Plus grande attaque physique :</strong><br>
                        ${stats.champions.strongestAttack.name.english} (${stats.champions.strongestAttack.base.Attack})
                    </div>
                    <div class="stat-item">
                        <strong>Plus grande attaque spéciale :</strong><br>
                        ${stats.champions.strongestSpecialAttack.name.english} (${stats.champions.strongestSpecialAttack.base.SpecialAttack || 'N/A'})
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Champions - Défense</h3>
                    <div class="stat-item">
                        <strong>Plus grande défense physique :</strong><br>
                        ${stats.champions.strongestDefense.name.english} (${stats.champions.strongestDefense.base.Defense})
                    </div>
                    <div class="stat-item">
                        <strong>Plus grande défense spéciale :</strong><br>
                        ${stats.champions.strongestSpecialDefense.name.english} (${stats.champions.strongestSpecialDefense.base.SpecialDefense || 'N/A'})
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Autres Champions</h3>
                    <div class="stat-item">
                        <strong>Plus de PV :</strong><br>
                        ${stats.champions.mostHP.name.english} (${stats.champions.mostHP.base.HP})
                    </div>
                    <div class="stat-item">
                        <strong>Plus rapide :</strong><br>
                        ${stats.champions.fastest.name.english} (${stats.champions.fastest.base.Speed})
                    </div>
                </div>
            </div>

            <div style="margin-top: 2rem;">
                <h2 style="margin-bottom: 1.5rem; color: var(--pokemon-red);">Statistiques par type</h2>
                <div class="type-stats-grid">
                    ${stats.statsByType.map(type => `
                        <div class="type-stat-card">
                            <div class="type-stat-header">
                                <span class="type-badge type-${type._id}">${type._id}</span>
                                <span class="type-count">${type.count} Pokémon</span>
                            </div>
                            <div class="type-stats-list">
                                <div class="type-stat-item">
                                    <span class="stat-icon">❤️</span>
                                    <span class="stat-name">PV</span>
                                    <span class="stat-bar">
                                        <span class="stat-fill" style="width: ${(Math.round(type.avgHP) / 255) * 100}%"></span>
                                    </span>
                                    <span class="stat-number">${Math.round(type.avgHP)}</span>
                                </div>
                                <div class="type-stat-item">
                                    <span class="stat-icon">⚔️</span>
                                    <span class="stat-name">ATK</span>
                                    <span class="stat-bar">
                                        <span class="stat-fill" style="width: ${(Math.round(type.avgAttack) / 190) * 100}%"></span>
                                    </span>
                                    <span class="stat-number">${Math.round(type.avgAttack)}</span>
                                </div>
                                <div class="type-stat-item">
                                    <span class="stat-icon">🛡️</span>
                                    <span class="stat-name">DEF</span>
                                    <span class="stat-bar">
                                        <span class="stat-fill" style="width: ${(Math.round(type.avgDefense) / 230) * 100}%"></span>
                                    </span>
                                    <span class="stat-number">${Math.round(type.avgDefense)}</span>
                                </div>
                                <div class="type-stat-item">
                                    <span class="stat-icon">✨</span>
                                    <span class="stat-name">ATK SPÉ</span>
                                    <span class="stat-bar">
                                        <span class="stat-fill" style="width: ${(Math.round(type.avgSpecialAttack || 0) / 194) * 100}%"></span>
                                    </span>
                                    <span class="stat-number">${Math.round(type.avgSpecialAttack || 0)}</span>
                                </div>
                                <div class="type-stat-item">
                                    <span class="stat-icon">🌟</span>
                                    <span class="stat-name">DEF SPÉ</span>
                                    <span class="stat-bar">
                                        <span class="stat-fill" style="width: ${(Math.round(type.avgSpecialDefense || 0) / 230) * 100}%"></span>
                                    </span>
                                    <span class="stat-number">${Math.round(type.avgSpecialDefense || 0)}</span>
                                </div>
                                <div class="type-stat-item">
                                    <span class="stat-icon">⚡</span>
                                    <span class="stat-name">VIT</span>
                                    <span class="stat-bar">
                                        <span class="stat-fill" style="width: ${(Math.round(type.avgSpeed || 0) / 180) * 100}%"></span>
                                    </span>
                                    <span class="stat-number">${Math.round(type.avgSpeed || 0)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="error-message">Erreur lors du chargement des statistiques</div>';
        console.error(error);
    }
}

// ===== SECTION NAVIGATION =====
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
        
        // Load data based on section
        if (sectionName === 'favorites') {
            loadFavorites();
        } else if (sectionName === 'teams') {
            loadUserTeams();
        } else if (sectionName === 'stats') {
            loadStats();
        } else if (sectionName === 'pokedex') {
            loadPokemons();
        }
    }
}
