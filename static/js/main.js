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
        position: "all",
        country: "all"  // Added country filter
    }
};



// Initialize global variable to store the pie chart API
let pieChartAPI = null;

// Modify the initDashboard function to store the pie chart API reference
async function initDashboard() {
    try {
        console.log("Starting dashboard initialization...");
        
        // Load all necessary data
        const dataLoaded = await loadData();
        
        if (!dataLoaded) {
            console.error("Failed to load data, cannot initialize dashboard");
            return;
        }
        
        // Initialize UI elements
        initializeFilters();
        
        // Initialize visualizations
        initializeWorldMap();
        initializePCP();
        initializeBiplot();
        initializePlayerProfile();
        console.log(globalData.countries);
        
        
		// To:
pieChartAPI = PieChartFromJSON(globalData.countries, 'country', 'percentage_of_players', '#piechart', {
  width: 700,      // Wider container
  height: 500,     // Taller container
  pieSize: 350,    // Larger pie chart
  // You would need to add these custom options to the function:
  pieX: 250,       // Custom X position
  pieY: 200   // Custom Y position
});
		
		
		
		
        // Initialize bar chart
        initBarChart('#Bar-Chart', globalData.matrix_data);
        
        // Add event listeners for dashboard coordination
        setupEventListeners();
        
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
}







// Main initialization function
/* async function initDashboard() {
    try {
        console.log("Starting dashboard initialization...");
        
        // Load all necessary data
        const dataLoaded = await loadData();
        
        if (!dataLoaded) {
            console.error("Failed to load data, cannot initialize dashboard");
            return;
        }
        
        // Initialize UI elements
        initializeFilters();
        
        // Initialize visualizations
        initializeWorldMap();
        initializePCP();
        initializeBiplot();
        initializePlayerProfile();
		console.log(globalData.countries);
		//PieChartFromJSON(globalData.countries, 'country', 'percentage_of_players', '#piechart', { title: 'Players by Country' });
		// In main.js, change:

// To:
window.pieChartInstance = PieChartFromJSON(globalData.countries, 'country', 'percentage_of_players', '#piechart', {
  width: 700,      // Wider container
  height: 500,     // Taller container
  pieSize: 350,    // Larger pie chart
  // You would need to add these custom options to the function:
  pieX: 250,       // Custom X position
  pieY: 200   // Custom Y position
});
		
		initBarChart('#Bar-Chart', globalData.matrix_data);
		
        // Add event listeners for dashboard coordination
        setupEventListeners();
        
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
} */

// Load data from the API with error handling
async function loadData() {
    try {
        console.log("Starting data loading...");
        
        // Load countries and leagues for the world map
        console.log("Fetching countries data...");
        const countriesResponse = await fetch('/api/countries');
        if (!countriesResponse.ok) {
            throw new Error(`Countries API error: ${countriesResponse.status}`);
        }
        const countriesData = await countriesResponse.json();
        console.log(`Countries data received: ${countriesData.length} items`);
        globalData.countries = countriesData;
        
        console.log("Fetching leagues data...");
        const leaguesResponse = await fetch('/api/leagues');
        if (!leaguesResponse.ok) {
            throw new Error(`Leagues API error: ${leaguesResponse.status}`);
        }
        const leaguesData = await leaguesResponse.json();
        console.log(`Leagues data received: ${leaguesData.length} items`);
        globalData.leagues = leaguesData;
        
        // Load club average data for parallel coordinates
        console.log("Fetching clubs data...");
        const clubsResponse = await fetch('/api/clubs');
        if (!clubsResponse.ok) {
            throw new Error(`Clubs API error: ${clubsResponse.status}`);
        }
        const clubsData = await clubsResponse.json();
        console.log(`Clubs data received: ${clubsData.length} items`);
        globalData.clubs = clubsData;
        
        // Load player data
        console.log("Fetching players data...");
        const playersResponse = await fetch('/api/players');
        if (!playersResponse.ok) {
            throw new Error(`Players API error: ${playersResponse.status}`);
        }
        const playersData = await playersResponse.json();
        console.log(`Players data received: ${playersData.length} items`);
        globalData.players = playersData;

        // --- NEW: Load country nationality matrix data ---
        console.log("Fetching country matrix data...");
        const matrixResponse = await fetch('/api/country_matrix');
        if (!matrixResponse.ok) {
            throw new Error(`Country Matrix API error: ${matrixResponse.status}`);
        }
        const matrixData = await matrixResponse.json();
        console.log(`Country matrix data received: ${matrixData.length} rows`);
        globalData.matrix_data = matrixData;

        console.log("All data loaded successfully!");
        return true;
    } catch (error) {
        console.error("Error loading data:", error);
        
        // Show error to user
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.style.backgroundColor = '#ffebee';
            errorDiv.style.color = '#b71c1c';
            errorDiv.style.padding = '20px';
            errorDiv.style.borderRadius = '5px';
            errorDiv.style.margin = '20px';
            errorDiv.innerHTML = `
                <h3>Data Loading Error</h3>
                <p>${error.message}</p>
                <p>Please check that the server is running and try again.</p>
            `;
            dashboardContainer.prepend(errorDiv);
        }
        
        return false;
    }
}

// Initialize filter UI components
function initializeFilters() {
    // League selector
    const leagueSelector = document.getElementById('league-selector');
    if (!leagueSelector) {
        console.error("League selector element not found");
        return;
    }
    
    // Clear existing options
    leagueSelector.innerHTML = '<option value="all">All Leagues</option>';
    
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
    
    // Add country selector (new)
    const countrySelector = document.createElement('select');
    countrySelector.id = 'country-selector';
    countrySelector.className = 'filter-selector';
    
    // Create label for country selector
    const countryLabel = document.createElement('label');
    countryLabel.htmlFor = 'country-selector';
    countryLabel.textContent = 'Country:';
    
    // Create container for country filter
    const countryFilterSection = document.createElement('div');
    countryFilterSection.className = 'filter-section';
    countryFilterSection.appendChild(countryLabel);
    countryFilterSection.appendChild(countrySelector);
    
    // Add to filters container (before club selector)
    const filtersContainer = document.getElementById('filters');
    if (filtersContainer) {
        const clubSection = document.querySelector('.filter-section:nth-child(2)');
        if (clubSection) {
            filtersContainer.insertBefore(countryFilterSection, clubSection);
        } else {
            filtersContainer.appendChild(countryFilterSection);
        }
    }
    
    // Populate country options
    countrySelector.innerHTML = '<option value="all">All Countries</option>';
    
    // Get unique countries from players data
    const countries = [...new Set(globalData.players
        .filter(player => player.country) // Filter out undefined countries
        .map(player => player.country))];
    
    countries.sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelector.appendChild(option);
    });
    
    // Position selector
    const positionSelector = document.getElementById('position-selector');
    if (!positionSelector) {
        console.error("Position selector element not found");
        return;
    }
    
    // Clear existing options
    positionSelector.innerHTML = '<option value="all">All Positions</option>';
    
    try {
        const positions = [...new Set(globalData.players
            .filter(player => player.player_positions) // Ensure player_positions exists
            .map(player => player.player_positions.split(', '))
            .flat())];
        
        positions.sort().forEach(position => {
            const option = document.createElement('option');
            option.value = position;
            option.textContent = position;
            positionSelector.appendChild(option);
        });
    } catch (error) {
        console.error("Error processing positions:", error);
    }
    
    // Club selector - will be updated when a league is selected
    updateClubSelector();
    
    // Initial state display
    updateSelectionDetails();
}

// Update club selector based on selected league and country
function updateClubSelector() {
    const clubSelector = document.getElementById('club-selector');
    if (!clubSelector) {
        console.error("Club selector element not found");
        return;
    }
    
    clubSelector.innerHTML = '<option value="all">All Clubs</option>';
    
    let filteredClubs = globalData.clubs;
    
    // Filter clubs by selected league
    if (dashboardState.filters.league !== "all") {
        filteredClubs = filteredClubs.filter(club => club.league_name === dashboardState.filters.league);
    }
    
    // Filter clubs by selected country
    if (dashboardState.filters.country !== "all") {
        filteredClubs = filteredClubs.filter(club => club.country === dashboardState.filters.country);
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
    if (!selectionDetails) {
        console.error("Selection details element not found");
        return;
    }
    
    let html = '';
    
    if (dashboardState.filters.country !== "all") {
        html += `<p><strong>Country:</strong> ${dashboardState.filters.country}</p>`;
    }
    
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

// Map GeoJSON country names to data country names
function mapCountryName(geoJSONCountry) {
    const mapping = {
        'United Kingdom': 'England',
        'United States of America': 'United States',
        'Russian Federation': 'Russia',
        'South Korea': 'Korea Republic',
        // Add more mappings as needed
    };
    
    return mapping[geoJSONCountry] || geoJSONCountry;
}

// Filter data based on current state
function filterData() {
    let filteredPlayers = globalData.players;
    
    // Apply country filter
    if (dashboardState.filters.country !== "all") {
        filteredPlayers = filteredPlayers.filter(player => 
            player.country === dashboardState.filters.country);
    }
    
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
            player.player_positions && player.player_positions.includes(dashboardState.filters.position));
    }
    
    return filteredPlayers;
}

// Setup event listeners for interactive filtering
function setupEventListeners() {
    // Country selector (new)
    const countrySelector = document.getElementById('country-selector');
    if (countrySelector) {
        countrySelector.addEventListener('change', function(event) {
            dashboardState.filters.country = event.target.value;
            
            // Auto-select league if only one league in the country
            if (dashboardState.filters.country !== "all") {
                const countryLeagues = globalData.leagues.filter(
                    league => league.country === dashboardState.filters.country
                );
                
                if (countryLeagues.length === 1) {
                    dashboardState.filters.league = countryLeagues[0].league_name;
                    const leagueSelector = document.getElementById('league-selector');
                    if (leagueSelector) {
                        leagueSelector.value = countryLeagues[0].league_name;
                    }
                }
            }
            
            // Update UI
            updateClubSelector();
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
            
            // Update selected country in world map
            const worldMapSvg = d3.select('#world-map svg');
            if (!worldMapSvg.empty()) {
                worldMapSvg.selectAll('path')
                    .attr('stroke', function(d) {
                        const mappedCountry = mapCountryName(d.properties.name);
                        return (dashboardState.filters.country !== "all" && 
                                mappedCountry === dashboardState.filters.country) ? '#000' : '#fff';
                    })
                    .attr('stroke-width', function(d) {
                        const mappedCountry = mapCountryName(d.properties.name);
                        return (dashboardState.filters.country !== "all" && 
                                mappedCountry === dashboardState.filters.country) ? 1.5 : 0.5;
                    });
            }
        });
    }
    
    // League selector
    const leagueSelector = document.getElementById('league-selector');
    if (leagueSelector) {
        leagueSelector.addEventListener('change', function(event) {
            dashboardState.filters.league = event.target.value;
            dashboardState.filters.club = "all"; // Reset club selection
            
            // If a league is selected, also select the corresponding country
            if (dashboardState.filters.league !== "all") {
                const selectedLeague = globalData.leagues.find(
                    league => league.league_name === dashboardState.filters.league
                );
                
                if (selectedLeague) {
                    dashboardState.filters.country = selectedLeague.country;
                    const countrySelector = document.getElementById('country-selector');
                    if (countrySelector) {
                        countrySelector.value = selectedLeague.country;
                    }
                }
            }
            
            // Update UI
            updateClubSelector();
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
        });
    }
    
    // Club selector
    const clubSelector = document.getElementById('club-selector');
    if (clubSelector) {
        clubSelector.addEventListener('change', function(event) {
            dashboardState.filters.club = event.target.value;
            
            // Update UI
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
        });
    }
    
    // Position selector
    const positionSelector = document.getElementById('position-selector');
    if (positionSelector) {
        positionSelector.addEventListener('change', function(event) {
            dashboardState.filters.position = event.target.value;
            
            // Update UI
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
        });
    }
    
    // Reset filters button
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset all filters
            dashboardState.filters.country = "all";
            dashboardState.filters.league = "all";
            dashboardState.filters.club = "all";
            dashboardState.filters.position = "all";
            
            // Update UI
            document.getElementById('country-selector').value = "all";
            document.getElementById('league-selector').value = "all";
            document.getElementById('position-selector').value = "all";
            updateClubSelector();
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
        });
    }
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

// Add a button to check API endpoints for debugging
function addDebugTools() {
    // Create debug button
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
    
    checkApiButton.onclick = async function() {
        // Function to check API endpoints
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
    };
    
    debugDiv.appendChild(checkApiButton);
    document.body.appendChild(debugDiv);
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add debug tools
    setTimeout(addDebugTools, 1000);
    
    // Initialize dashboard
    initDashboard();
});