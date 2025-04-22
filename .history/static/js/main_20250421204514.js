// Global variables for storing data and state
let globalData = {
    players: [],
    clubs: [],
    leagues: [],
    countries: [],
    selectedLeague: null,
    selectedClub: null,
    selectedPlayer: null,
    selectedCountry: null
};

// Dashboard state for visualization coordination
let dashboardState = {
    filters: {
        league: "all",
        club: "all",
        position: "all"
    }
};

// Main initialization function
async function initDashboard() {
    try {
        // Load all necessary data
        await loadData();
        
        // Initialize UI elements
        initializeFilters();
        
        // Initialize visualizations
        initializeWorldMap();
        initializePCP();
        initializeBiplot();
        initializePlayerProfile();
        
        // Add event listeners for dashboard coordination
        setupEventListeners();
        
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
}

// // Load data from the API
// async function loadData() {
//     try {


//         // Load countries and leagues for the world map
//         const countriesResponse = await fetch('/api/countries');
//         globalData.countries = await countriesResponse.json();
        
//         const leaguesResponse = await fetch('/api/leagues');
//         globalData.leagues = await leaguesResponse.json();
        
//         // Load club average data for parallel coordinates
//         const clubsResponse = await fetch('/api/clubs');
//         globalData.clubs = await clubsResponse.json();
        
//         // Load player data
//         const playersResponse = await fetch('/api/players');
//         globalData.players = await playersResponse.json();
        
//         console.log("Data loaded:", {
//             countries: globalData.countries.length,
//             leagues: globalData.leagues.length,
//             clubs: globalData.clubs.length,
//             players: globalData.players.length
//         });
        
//         return true;
//     } catch (error) {
//         console.error("Error loading data:", error);
//         return false;
//     }
// }

// Initialize filter UI components

// Load data from the API
// async function loadData() {
//     try {
//         console.log("Starting data loading...");
        
//         // Load countries and leagues for the world map
//         console.log("Fetching countries data...");
//         const countriesResponse = await fetch('/api/countries');
//         const countriesData = await countriesResponse.json();
//         console.log("Countries data received:", countriesData.length, "items");
//         globalData.countries = countriesData;
        
//         console.log("Fetching leagues data...");
//         const leaguesResponse = await fetch('/api/leagues');
//         const leaguesData = await leaguesResponse.json();
//         console.log("Leagues data received:", leaguesData.length, "items");
//         globalData.leagues = leaguesData;
        
//         // Load club average data for parallel coordinates
//         console.log("Fetching clubs data...");
//         const clubsResponse = await fetch('/api/clubs');
//         const clubsData = await clubsResponse.json();
//         console.log("Clubs data received:", clubsData.length, "items");
//         globalData.clubs = clubsData;
        
//         // Load player data
//         console.log("Fetching players data...");
//         const playersResponse = await fetch('/api/players');
//         const playersData = await playersResponse.json();
//         console.log("Players data received:", playersData.length, "items");
//         globalData.players = playersData;
        
//         console.log("All data loaded successfully!");
//         return true;
//     } catch (error) {
//         console.error("Error loading data:", error);
//         return false;
//     }
// }

function initializeFilters() {
    // League selector
    const leagueSelector = document.getElementById('league-selector');
    
    // Group leagues by country for better organization
    const leaguesByCountry = {};
    globalData.leagues.forEach(league => {
        if (!leaguesByCountry[league.country]) {
            leaguesByCountry[league.country] = [];
        }
        leaguesByCountry[league.country].push(league);
    });
    
    // Create option groups by country
    Object.entries(leaguesByCountry).sort().forEach(([country, leagues]) => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = country;
        
        leagues.sort((a, b) => a.league_name.localeCompare(b.league_name))
               .forEach(league => {
                   const option = document.createElement('option');
                   option.value = league.league_name;
                   option.textContent = league.league_name;
                   optGroup.appendChild(option);
               });
        
        leagueSelector.appendChild(optGroup);
    });
    
    // Position selector
    const positionSelector = document.getElementById('position-selector');
    const positions = [...new Set(globalData.players.map(player => player.player_positions.split(', ')).flat())];
    
    positions.sort().forEach(position => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        positionSelector.appendChild(option);
    });
    
    // Club selector - will be updated when a league is selected
    updateClubSelector();
    
    // Initial state display
    updateSelectionDetails();
}

// Update club selector based on selected league
function updateClubSelector() {
    const clubSelector = document.getElementById('club-selector');
    clubSelector.innerHTML = '<option value="all">All Clubs</option>';
    
    let filteredClubs = globalData.clubs;
    
    // Filter clubs by selected league
    if (dashboardState.filters.league !== "all") {
        filteredClubs = filteredClubs.filter(club => club.league_name === dashboardState.filters.league);
    }
    
    // Add club options
    filteredClubs.sort((a, b) => a.club_name.localeCompare(b.club_name))
                .forEach(club => {
                    const option = document.createElement('option');
                    option.value = club.club_name;
                    option.textContent = club.club_name;
                    clubSelector.appendChild(option);
                });
}

// Update selection details panel
function updateSelectionDetails() {
    const selectionDetails = document.getElementById('selection-details');
    
    let html = '';
    
    if (dashboardState.filters.league !== "all") {
        html += `<p><strong>League:</strong> ${dashboardState.filters.league}</p>`;
    }
    
    if (dashboardState.filters.club !== "all") {
        html += `<p><strong>Club:</strong> ${dashboardState.filters.club}</p>`;
    }
    
    if (dashboardState.filters.position !== "all") {
        html += `<p><strong>Position:</strong> ${dashboardState.filters.position}</p>`;
    }
    
    if (globalData.selectedPlayer) {
        const player = globalData.selectedPlayer;
        html += `<p><strong>Player:</strong> ${player.short_name}</p>`;
        html += `<p><strong>Overall:</strong> ${player.player_overall}</p>`;
        html += `<p><strong>Value:</strong> €${player.value_millions_eur}M</p>`;
    }
    
    if (html === '') {
        html = '<p>No selection</p>';
    }
    
    selectionDetails.innerHTML = html;
}

// Filter data based on current state
function filterData() {
    let filteredPlayers = globalData.players;
    
    // Apply league filter
    if (dashboardState.filters.league !== "all") {
        filteredPlayers = filteredPlayers.filter(player => 
            player.league_name === dashboardState.filters.league);
    }
    
    // Apply club filter
    if (dashboardState.filters.club !== "all") {
        filteredPlayers = filteredPlayers.filter(player => 
            player.club_name === dashboardState.filters.club);
    }
    
    // Apply position filter
    if (dashboardState.filters.position !== "all") {
        filteredPlayers = filteredPlayers.filter(player => 
            player.player_positions.includes(dashboardState.filters.position));
    }
    
    return filteredPlayers;
}

// Setup event listeners for interactive filtering
function setupEventListeners() {
    // League selector
    document.getElementById('league-selector').addEventListener('change', function(event) {
        dashboardState.filters.league = event.target.value;
        dashboardState.filters.club = "all"; // Reset club selection
        
        // Update UI
        updateClubSelector();
        updateSelectionDetails();
        
        // Update visualizations
        updateAllVisualizations();
    });
    
    // Club selector
    document.getElementById('club-selector').addEventListener('change', function(event) {
        dashboardState.filters.club = event.target.value;
        
        // Update UI
        updateSelectionDetails();
        
        // Update visualizations
        updateAllVisualizations();
    });
    
    // Position selector
    document.getElementById('position-selector').addEventListener('change', function(event) {
        dashboardState.filters.position = event.target.value;
        
        // Update UI
        updateSelectionDetails();
        
        // Update visualizations
        updateAllVisualizations();
    });
}

// Update all visualizations based on current filters
function updateAllVisualizations() {
    // Get filtered data
    const filteredData = filterData();
    
    // Update each visualization
    updateWorldMap(filteredData);
    updatePCP(filteredData);
    updateBiplot(filteredData);
    
    // If no player is selected in the new filtered data, reset player profile
    if (globalData.selectedPlayer && !filteredData.some(p => p.player_id === globalData.selectedPlayer.player_id)) {
        globalData.selectedPlayer = null;
        updatePlayerProfile(null);
    }
}

// Helper function for creating tooltips
function createTooltip() {
    return d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

// Set player as selected and update relevant visualizations
function selectPlayer(player) {
    globalData.selectedPlayer = player;
    updateSelectionDetails();
    updatePlayerProfile(player);
    
    // Highlight player in other visualizations
    highlightPlayerInBiplot(player.player_id);
    highlightPlayerInPCP(player.player_id);
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);