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

// Add initialization flags to track which visualizations have been initialized
const visualizationStatus = {
    worldMapInitialized: false,
    pcpInitialized: false,
    biplotInitialized: false,
    playerProfileInitialized: false
};

// Main initialization function
async function initDashboard() {
    try {
        console.log("Starting dashboard initialization...");
        
        // Load all necessary data
        const dataLoaded = await loadData();
        
        if (!dataLoaded) {
            console.error("Failed to load data, cannot initialize dashboard");
            return;
        }
        
        // Initialize UI elements only once
        initializeFilters();
        
        // Initialize visualizations only if they haven't been initialized already
        initializeVisualizations();
        
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

// Modified loadData function with extensive debugging
async function loadData() {
    try {
        console.log("%cStarting data loading...", "color: blue; font-weight: bold");
        
        // Add global flag to track data loading status
        window.dataLoadingStatus = {
            countries: false,
            leagues: false,
            clubs: false,
            players: false,
            errors: []
        };
        
        // --------------------------------
        // Load countries and leagues for the world map
        // --------------------------------
        console.log("Fetching countries data...");
        try {
            const countriesResponse = await fetch('/api/countries');
            
            if (!countriesResponse.ok) {
                throw new Error(`HTTP error! Status: ${countriesResponse.status}`);
            }
            
            const countriesData = await countriesResponse.json();
            console.log(`Countries data received: ${countriesData.length} items`);
            
            if (!Array.isArray(countriesData) || countriesData.length === 0) {
                console.warn("Countries data is empty or not an array!");
                console.log("Sample of received data:", JSON.stringify(countriesData).substring(0, 200));
            } else {
                console.log("First country sample:", countriesData[0]);
            }
            
            globalData.countries = countriesData;
            window.dataLoadingStatus.countries = true;
        } catch (countriesError) {
            console.error("Failed to load countries data:", countriesError);
            window.dataLoadingStatus.errors.push(`Countries: ${countriesError.message}`);
        }
        
        // --------------------------------
        // Load leagues data
        // --------------------------------
        console.log("Fetching leagues data...");
        try {
            const leaguesResponse = await fetch('/api/leagues');
            
            if (!leaguesResponse.ok) {
                throw new Error(`HTTP error! Status: ${leaguesResponse.status}`);
            }
            
            const leaguesData = await leaguesResponse.json();
            console.log(`Leagues data received: ${leaguesData.length} items`);
            
            if (!Array.isArray(leaguesData) || leaguesData.length === 0) {
                console.warn("Leagues data is empty or not an array!");
                console.log("Sample of received data:", JSON.stringify(leaguesData).substring(0, 200));
            } else {
                console.log("First league sample:", leaguesData[0]);
            }
            
            globalData.leagues = leaguesData;
            window.dataLoadingStatus.leagues = true;
        } catch (leaguesError) {
            console.error("Failed to load leagues data:", leaguesError);
            window.dataLoadingStatus.errors.push(`Leagues: ${leaguesError.message}`);
        }
        
        // --------------------------------
        // Load club average data for parallel coordinates
        // --------------------------------
        console.log("Fetching clubs data...");
        try {
            const clubsResponse = await fetch('/api/clubs');
            
            if (!clubsResponse.ok) {
                throw new Error(`HTTP error! Status: ${clubsResponse.status}`);
            }
            
            const clubsData = await clubsResponse.json();
            console.log(`Clubs data received: ${clubsData.length} items`);
            
            if (!Array.isArray(clubsData) || clubsData.length === 0) {
                console.warn("Clubs data is empty or not an array!");
                console.log("Sample of received data:", JSON.stringify(clubsData).substring(0, 200));
            } else {
                console.log("First club sample:", clubsData[0]);
            }
            
            globalData.clubs = clubsData;
            window.dataLoadingStatus.clubs = true;
        } catch (clubsError) {
            console.error("Failed to load clubs data:", clubsError);
            window.dataLoadingStatus.errors.push(`Clubs: ${clubsError.message}`);
        }
        
        // --------------------------------
        // Load player data
        // --------------------------------
        console.log("Fetching players data...");
        try {
            const playersResponse = await fetch('/api/players');
            
            if (!playersResponse.ok) {
                throw new Error(`HTTP error! Status: ${playersResponse.status}`);
            }
            
            const playersData = await playersResponse.json();
            console.log(`Players data received: ${playersData.length} items`);
            
            if (!Array.isArray(playersData) || playersData.length === 0) {
                console.warn("Players data is empty or not an array!");
                console.log("Sample of received data:", JSON.stringify(playersData).substring(0, 200));
            } else {
                console.log("First player sample:", playersData[0]);
            }
            
            globalData.players = playersData;
            window.dataLoadingStatus.players = true;
        } catch (playersError) {
            console.error("Failed to load players data:", playersError);
            window.dataLoadingStatus.errors.push(`Players: ${playersError.message}`);
        }
        
        // --------------------------------
        // Summary of data loading status
        // --------------------------------
        console.log("%cData loading summary:", "color: blue; font-weight: bold");
        console.log(`Countries: ${window.dataLoadingStatus.countries ? "Success" : "Failed"}`);
        console.log(`Leagues: ${window.dataLoadingStatus.leagues ? "Success" : "Failed"}`);
        console.log(`Clubs: ${window.dataLoadingStatus.clubs ? "Success" : "Failed"}`);
        console.log(`Players: ${window.dataLoadingStatus.players ? "Success" : "Failed"}`);
        
        if (window.dataLoadingStatus.errors.length > 0) {
            console.error("Errors encountered during data loading:", window.dataLoadingStatus.errors);
        }
        
        // Check if any data was successfully loaded
        const anyDataLoaded = window.dataLoadingStatus.countries || 
                            window.dataLoadingStatus.leagues || 
                            window.dataLoadingStatus.clubs || 
                            window.dataLoadingStatus.players;
        
        if (!anyDataLoaded) {
            console.error("No data was successfully loaded!");
            displayDataLoadingError();
            return false;
        }
        
        // Continue even if some data failed to load
        console.log("%cData loading completed with available data", "color: green; font-weight: bold");
        return true;
        
    } catch (error) {
        console.error("Unhandled error in data loading:", error);
        displayDataLoadingError();
        return false;
    }
}

// Display a helpful error message when data loading fails
function displayDataLoadingError() {
    // Create a visible error message on the page
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.style.backgroundColor = '#ffebee';
        errorDiv.style.color = '#b71c1c';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.margin = '20px';
        errorDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        let errorHTML = `
            <h3>Data Loading Error</h3>
            <p>There was a problem loading the FIFA player data. This could be due to:</p>
            <ul>
                <li>API endpoints not returning data</li>
                <li>Server not running correctly</li>
                <li>Database connection issues</li>
            </ul>
            <p>Check these possible solutions:</p>
            <ol>
                <li>Make sure Flask server is running</li>
                <li>Check if the data files exist in the data directory</li>
                <li>Verify the database connection</li>
                <li>Check browser console for specific error messages</li>
            </ol>
        `;
        
        // Add specific errors if available
        if (window.dataLoadingStatus && window.dataLoadingStatus.errors.length > 0) {
            errorHTML += `<p><strong>Specific errors:</strong></p><ul>`;
            window.dataLoadingStatus.errors.forEach(err => {
                errorHTML += `<li>${err}</li>`;
            });
            errorHTML += `</ul>`;
        }
        
        errorDiv.innerHTML = errorHTML;
        
        // Add a refresh button
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Refresh Page';
        refreshButton.style.backgroundColor = '#b71c1c';
        refreshButton.style.color = 'white';
        refreshButton.style.padding = '10px 15px';
        refreshButton.style.border = 'none';
        refreshButton.style.borderRadius = '4px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.style.marginTop = '10px';
        refreshButton.onclick = () => window.location.reload();
        
        errorDiv.appendChild(refreshButton);
        dashboardContainer.prepend(errorDiv);
    }
}

// Modified processCountryData function with better error handling
function processCountryData() {
    try {
        console.log("Processing country data for map visualization...");
        
        // First, check if we have player data
        if (!globalData.players || !Array.isArray(globalData.players) || globalData.players.length === 0) {
            console.error("No player data available for processing");
            
            // Check what globalData contains
            console.log("globalData content:", {
                countriesLength: globalData.countries ? globalData.countries.length : 'undefined',
                leaguesLength: globalData.leagues ? globalData.leagues.length : 'undefined',
                clubsLength: globalData.clubs ? globalData.clubs.length : 'undefined',
                playersLength: globalData.players ? globalData.players.length : 'undefined'
            });
            
            // Check for country property in the player data
            if (globalData.players && globalData.players.length > 0) {
                console.log("First player has country property:", globalData.players[0].hasOwnProperty('country'));
                console.log("First player data sample:", globalData.players[0]);
            }
            
            worldMap.svg.select('.loading-text')
                .text('No player data available. Please check the data source.');
            return;
        }
        
        console.log(`Processing ${globalData.players.length} players for country data`);
        
        // Check if players have the 'country' property
        const samplePlayers = globalData.players.slice(0, 5);
        const playersWithCountry = samplePlayers.filter(p => p.country);
        
        if (playersWithCountry.length === 0) {
            console.error("Players do not have 'country' property. Sample player:", samplePlayers[0]);
            
            // Try to extract country from league if available
            console.log("Attempting to extract country from league_name instead...");
            
            // Rest of the function continues as normal...
        }
        
        // Continue with normal processing...
    } catch (error) {
        console.error("Error processing country data:", error);
        worldMap.svg.select('.loading-text')
            .text('Error processing data. Please check console for details.');
    }
}

// Function to check API endpoints directly
async function checkApiEndpoints() {
    const endpoints = [
        '/api/countries',
        '/api/leagues',
        '/api/clubs',
        '/api/players'
    ];
    
    console.log("Checking API endpoints...");
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Checking endpoint: ${endpoint}`);
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                console.error(`Endpoint ${endpoint} returned status: ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                console.log(`Endpoint ${endpoint} returned array with ${data.length} items`);
                if (data.length > 0) {
                    console.log("First item sample:", data[0]);
                }
            } else {
                console.log(`Endpoint ${endpoint} returned:`, data);
            }
        } catch (error) {
            console.error(`Error checking endpoint ${endpoint}:`, error);
        }
    }
}

// Add a button to check API endpoints
function addDebugTools() {
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.zIndex = '9999';
    
    const checkApiButton = document.createElement('button');
    checkApiButton.textContent = 'Check API Endpoints';
    checkApiButton.style.padding = '8px 12px';
    checkApiButton.style.backgroundColor = '#333';
    checkApiButton.style.color = 'white';
    checkApiButton.style.border = 'none';
    checkApiButton.style.borderRadius = '4px';
    checkApiButton.style.cursor = 'pointer';
    
    checkApiButton.onclick = checkApiEndpoints;
    
    debugDiv.appendChild(checkApiButton);
    document.body.appendChild(debugDiv);
}

// Call this after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add debug tools to the page
    setTimeout(addDebugTools, 1000);
    
    // Original initialization code follows...
    initDashboard();
});

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