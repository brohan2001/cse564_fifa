// Global variables for world map
let worldMap = {
    svg: null,
    width: 0,
    height: 0,
    projection: null,
    path: null,
    tooltip: null,
    worldData: null,
    colorScale: null,
    legendContainer: null,
    countriesWithData: new Set() // Add this to track countries with data
};

// Initialize the world map visualization
function initializeWorldMap() {
    console.log("Initializing world map...");
    
    // Set dimensions
    const container = document.getElementById('world-map');
    
    // Check if container exists
    if (!container) {
        console.error("World map container not found!");
        return;
    }
    
    worldMap.width = container.clientWidth;
    worldMap.height = container.clientHeight;
    
    console.log(`World map dimensions: ${worldMap.width} x ${worldMap.height}`);
    
    // Create SVG
    worldMap.svg = d3.select('#world-map')
        .append('svg')
        .attr('width', worldMap.width)
        .attr('height', worldMap.height)
        .attr('viewBox', `0 0 ${worldMap.width} ${worldMap.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create tooltip
    worldMap.tooltip = createTooltip();
    
    // Add a group for the map
    worldMap.g = worldMap.svg.append('g');
    
    // Create projection for the map
    worldMap.projection = d3.geoNaturalEarth1()
        .scale((worldMap.width) / 6)
        .translate([worldMap.width / 2, worldMap.height / 1.8]);
    
    // Create path generator
    worldMap.path = d3.geoPath()
        .projection(worldMap.projection);
    
    // Create color scale for countries
    worldMap.colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 100]); // Will be updated with actual data
    
    // Add legend container
    worldMap.legendContainer = worldMap.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(20, ${worldMap.height - 40})`);
    
    // Add loading indicator
    worldMap.svg.append('text')
        .attr('class', 'loading-text')
        .attr('x', worldMap.width / 2)
        .attr('y', worldMap.height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .text('Loading world map data...');
    
    // Load world map data with retry mechanism
    loadWorldMapData()
        .catch(error => {
            console.error("Error loading world map:", error);
            worldMap.svg.select('.loading-text')
                .text('Error loading map data. Please refresh the page.');
        });
}

// Function to map league names to country names more robustly
function getCountryForLeague(leagueName) {
    // Try to extract country from league name
    if (leagueName.includes('England') || leagueName.includes('Premier League') || leagueName.includes('EFL')) 
        return 'United Kingdom';
    if (leagueName.includes('Spain') || leagueName.includes('La Liga')) 
        return 'Spain';
    if (leagueName.includes('Italy') || leagueName.includes('Serie A')) 
        return 'Italy';
    if (leagueName.includes('Germany') || leagueName.includes('Bundesliga')) 
        return 'Germany';
    if (leagueName.includes('France') || leagueName.includes('Ligue 1')) 
        return 'France';
    if (leagueName.includes('Portugal') || leagueName.includes('Liga Portugal')) 
        return 'Portugal';
    if (leagueName.includes('Netherlands') || leagueName.includes('Eredivisie')) 
        return 'Netherlands';
    if (leagueName.includes('Brazil') || leagueName.includes('Brasileiro')) 
        return 'Brazil';
    if (leagueName.includes('Argentina') || leagueName.includes('Primera')) 
        return 'Argentina';
    if (leagueName.includes('USA') || leagueName.includes('MLS') || leagueName.includes('United States')) 
        return 'United States of America'; // GeoJSON may use full name
    if (leagueName.includes('Belgium')) 
        return 'Belgium';
    if (leagueName.includes('Scotland') || leagueName.includes('Scottish')) 
        return 'United Kingdom';
    if (leagueName.includes('Russia') || leagueName.includes('Premier League Russia')) 
        return 'Russia';
    if (leagueName.includes('Switzerland') || leagueName.includes('Super League')) 
        return 'Switzerland';
    if (leagueName.includes('Turkey') || leagueName.includes('Super Lig')) 
        return 'Turkey';
    if (leagueName.includes('Saudi') || leagueName.includes('Pro League')) 
        return 'Saudi Arabia';
    
    // Return null if no match
    return null;
}

// Function to normalize country names between GeoJSON and our data
function normalizeCountryName(name) {
    const nameMap = {
        'United Kingdom': ['United Kingdom', 'UK', 'Great Britain', 'England', 'Scotland', 'Wales', 'Northern Ireland'],
        'United States of America': ['United States', 'United States of America', 'USA', 'US'],
        'Russia': ['Russia', 'Russian Federation'],
        'Korea, Republic of': ['South Korea', 'Korea, Republic of'],
        // Add more mappings as needed
    };
    
    // Check if the name is in any of the arrays
    for (const [normalized, variants] of Object.entries(nameMap)) {
        if (variants.includes(name)) {
            return normalized;
        }
    }
    
    // Return the original name if no mapping found
    return name;
}

// Load GeoJSON data for the world map with improved error handling
async function loadWorldMapData() {
    try {
        console.log("Loading world map GeoJSON data...");
        
        // Try to load the data with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Failed to load GeoJSON: ${response.status} ${response.statusText}`);
        }
        
        worldMap.worldData = await response.json();
        console.log("GeoJSON data loaded successfully");
        
        // Process player data to create country statistics
        processCountryData();
        
    } catch (error) {
        console.error("Error loading world map data:", error);
        
        // Show error message on the map
        worldMap.svg.select('.loading-text')
            .text('Failed to load map data. Please check your connection and refresh.');
        
        throw error; // Re-throw to be caught by the caller
    }
}

// Process player data to create country statistics with improved error handling
function processCountryData() {
    try {
        console.log("Processing country data for map visualization...");
        
        // Create FIFA league to country mapping
        const leagueCountryMap = {
            'Premier League': 'United Kingdom',
            'La Liga': 'Spain',
            'Serie A': 'Italy',
            'Bundesliga': 'Germany',
            'Ligue 1': 'France',
            'Eredivisie': 'Netherlands',
            'Liga Portugal': 'Portugal',
            'Super Lig': 'Turkey',
            'Saudi Pro League': 'Saudi Arabia',
            'Primera División': 'Argentina',
            'Campeonato Brasileiro Série A': 'Brazil',
            'MLS': 'United States of America',
            'Belgian Pro League': 'Belgium',
            'Scottish Premiership': 'United Kingdom',
            'Russian Premier League': 'Russia',
            'Super League': 'Switzerland'
        };
        
        // First, check if we have player data
        if (!globalData.players || !Array.isArray(globalData.players) || globalData.players.length === 0) {
            console.error("No player data available for processing");
            worldMap.svg.select('.loading-text')
                .text('No player data available. Please check the data source.');
            return;
        }
        
        console.log(`Processing ${globalData.players.length} players for country data`);
        
        // Group player data by league and then map to countries
        const leaguePlayerCounts = {};
        globalData.players.forEach(player => {
            if (player.league_name) {
                if (!leaguePlayerCounts[player.league_name]) {
                    leaguePlayerCounts[player.league_name] = {
                        count: 0,
                        totalOverall: 0,
                        totalValue: 0
                    };
                }
                
                leaguePlayerCounts[player.league_name].count += 1;
                leaguePlayerCounts[player.league_name].totalOverall += player.player_overall || 0;
                leaguePlayerCounts[player.league_name].totalValue += player.value_millions_eur || 0;
            }
        });
        
        console.log(`Grouped players into ${Object.keys(leaguePlayerCounts).length} leagues`);
        
        // Create country data from league data
        const countryDataMap = {};
        Object.entries(leaguePlayerCounts).forEach(([league, data]) => {
            // Try to find the country for this league
            let country = leagueCountryMap[league];
            
            // If not found in the primary mapping, try the fallback function
            if (!country) {
                country = getCountryForLeague(league);
                if (country) {
                    console.log(`Mapped league "${league}" to country "${country}" using fallback method`);
                } else {
                    console.warn(`Could not map league "${league}" to any country`);
                    return; // Skip this league
                }
            }
            
            // Normalize the country name to match GeoJSON
            country = normalizeCountryName(country);
            
            // Track this country as having data
            worldMap.countriesWithData.add(country);
            
            if (!countryDataMap[country]) {
                countryDataMap[country] = {
                    numPlayers: 0,
                    totalOverall: 0,
                    totalValue: 0,
                    leagues: []
                };
            }
            
            countryDataMap[country].numPlayers += data.count;
            countryDataMap[country].totalOverall += data.totalOverall;
            countryDataMap[country].totalValue += data.totalValue;
            countryDataMap[country].leagues.push({
                name: league,
                count: data.count,
                avgOverall: data.totalOverall / data.count,
                avgValue: data.totalValue / data.count
            });
        });
        
        console.log(`Created data for ${Object.keys(countryDataMap).length} countries`);
        
        // Calculate averages
        Object.keys(countryDataMap).forEach(country => {
            countryDataMap[country].avgOverall = countryDataMap[country].totalOverall / countryDataMap[country].numPlayers;
            countryDataMap[country].avgValue = countryDataMap[country].totalValue / countryDataMap[country].numPlayers;
        });
        
        // Find min and max for color scaling
        const playerCounts = Object.values(countryDataMap).map(c => c.numPlayers);
        const maxPlayers = d3.max(playerCounts) || 100;
        console.log(`Maximum players per country: ${maxPlayers}`);
        
        // Update color scale domain
        worldMap.colorScale.domain([0, maxPlayers]);
        
        // Remove loading text
        worldMap.svg.select('.loading-text').remove();
        
        // Create the map with improved error handling for country matching
        renderWorldMap(countryDataMap);
        
    } catch (error) {
        console.error("Error processing country data:", error);
        worldMap.svg.select('.loading-text')
            .text('Error processing data. Please check console for details.');
    }
}

// Render the world map with country data
function renderWorldMap(countryDataMap) {
    try {
        console.log("Rendering world map...");
        
        // Check if we have both map data and country data
        if (!worldMap.worldData || !worldMap.worldData.features) {
            console.error("GeoJSON data not available for rendering");
            return;
        }
        
        // Debug: log countries that don't match
        const geoCountries = new Set(worldMap.worldData.features.map(f => f.properties.name));
        const dataCountries = new Set(Object.keys(countryDataMap));
        
        console.log("Countries in data that aren't found in GeoJSON:");
        dataCountries.forEach(country => {
            if (!geoCountries.has(country)) {
                console.warn(`Country in data not found in GeoJSON: ${country}`);
            }
        });
        
        // Create the map
        worldMap.g.selectAll('path')
            .data(worldMap.worldData.features)
            .enter()
            .append('path')
            .attr('d', worldMap.path)
            .attr('fill', function(d) {
                // Get country name from GeoJSON
                const geoCountryName = d.properties.name;
                
                // Try to find matching country data with normalization
                const normalizedName = normalizeCountryName(geoCountryName);
                const countryData = countryDataMap[normalizedName];
                
                // Return color based on player count or default color
                return countryData ? worldMap.colorScale(countryData.numPlayers) : '#f0f0f0';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .on('mouseover', function(event, d) {
                // Highlight country
                d3.select(this)
                    .attr('stroke', '#000')
                    .attr('stroke-width', 1.5);
                
                // Get country name
                const geoCountryName = d.properties.name;
                const normalizedName = normalizeCountryName(geoCountryName);
                
                // Find matching country data
                const countryData = countryDataMap[normalizedName];
                
                // Show tooltip
                if (countryData) {
                    const leaguesText = countryData.leagues
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3)
                        .map(l => `${l.name} (${l.count})`)
                        .join('<br>');
                    
                    worldMap.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    
                    worldMap.tooltip.html(`
                        <strong>${geoCountryName}</strong><br>
                        Players: ${countryData.numPlayers}<br>
                        Avg. Rating: ${countryData.avgOverall.toFixed(1)}<br>
                        Top Leagues:<br>${leaguesText}
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
                } else {
                    // Show tooltip with no data message
                    worldMap.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    
                    worldMap.tooltip.html(`
                        <strong>${geoCountryName}</strong><br>
                        No player data available
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
                }
            })
            .on('mouseout', function() {
                // Remove highlight
                d3.select(this)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 0.5);
                
                // Hide tooltip
                worldMap.tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            })
            .on('click', function(event, d) {
                // Get country name
                const geoCountryName = d.properties.name;
                const normalizedName = normalizeCountryName(geoCountryName);
                
                // Find leagues in this country
                const countryData = countryDataMap[normalizedName];
                
                if (countryData && countryData.leagues.length > 0) {
                    // If there's only one league in the country, select it directly
                    if (countryData.leagues.length === 1) {
                        const leagueName = countryData.leagues[0].name;
                        
                        // Update dashboard state
                        dashboardState.filters.league = leagueName;
                        dashboardState.filters.club = "all"; // Reset club selection
                        
                        // Update UI
                        const leagueSelector = document.getElementById('league-selector');
                        if (leagueSelector) {
                            leagueSelector.value = leagueName;
                        } else {
                            console.warn("League selector element not found");
                        }
                        
                        updateClubSelector();
                        updateSelectionDetails();
                        
                        // Update visualizations
                        updateAllVisualizations();
                        
                        console.log(`Selected league "${leagueName}" from country "${geoCountryName}"`);
                    } else {
                        // If multiple leagues, show a popup to select
                        showLeagueSelectionForCountry(geoCountryName, countryData.leagues);
                    }
                } else {
                    console.log(`No leagues found for country "${geoCountryName}"`);
                }
            });
        
        // Add country labels for countries with data
        addCountryLabels(countryDataMap);
        
        // Create legend
        createMapLegend();
        
        console.log("World map rendered successfully");
        
    } catch (error) {
        console.error("Error rendering world map:", error);
        worldMap.svg.append('text')
            .attr('x', worldMap.width / 2)
            .attr('y', worldMap.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .text('Error rendering map. Please check console.');
    }
}

// Add labels for countries with significant number of players
function addCountryLabels(countryDataMap) {
    try {
        console.log("Adding country labels...");
        
        // Filter countries with enough players to label
        const significantCountries = Object.entries(countryDataMap)
            .filter(([_, data]) => data.numPlayers > 20)
            .map(([country, data]) => ({
                country,
                numPlayers: data.numPlayers
            }));
        
        console.log(`Adding labels for ${significantCountries.length} significant countries`);
        
        // Find centroid for each country
        significantCountries.forEach(countryData => {
            // Find matching feature in the world data
            const feature = worldMap.worldData.features.find(f => 
                normalizeCountryName(f.properties.name) === countryData.country);
            
            if (feature) {
                // Calculate centroid
                const centroid = worldMap.path.centroid(feature);
                
                // Only add label if centroid is valid
                if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
                    // Add label background for better readability
                    worldMap.g.append('text')
                        .attr('class', 'country-label-bg')
                        .attr('x', centroid[0])
                        .attr('y', centroid[1])
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '8px')
                        .attr('stroke', 'white')
                        .attr('stroke-width', 4)
                        .attr('paint-order', 'stroke')
                        .text(feature.properties.name);
                    
                    // Add country label
                    worldMap.g.append('text')
                        .attr('class', 'country-label')
                        .attr('x', centroid[0])
                        .attr('y', centroid[1])
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '8px')
                        .attr('fill', '#333')
                        .text(feature.properties.name);
                }
            } else {
                console.warn(`Could not find feature for country: ${countryData.country}`);
            }
        });
    } catch (error) {
        console.error("Error adding country labels:", error);
    }
}

// Create a legend for the map
function createMapLegend() {
    try {
        console.log("Creating map legend...");
        
        // Clear existing legend
        worldMap.legendContainer.selectAll('*').remove();
        
        // Legend title
        worldMap.legendContainer.append('text')
            .attr('x', 0)
            .attr('y', -10)
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text('Players per Country');
        
        // Create gradient for legend
        const legendWidth = 200;
        const legendHeight = 10;
        
        // Create gradient
        const defs = worldMap.svg.append('defs');
        
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'map-legend-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
        
        // Add color stops
        const colorDomain = worldMap.colorScale.domain();
        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', worldMap.colorScale(colorDomain[0]));
            
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', worldMap.colorScale(colorDomain[1]));
        
        // Add rectangle with gradient
        worldMap.legendContainer.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#map-legend-gradient)');
        
        // Add axis for legend
        const legendScale = d3.scaleLinear()
            .domain(colorDomain)
            .range([0, legendWidth]);
        
        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickSize(legendHeight);
        
        worldMap.legendContainer.append('g')
            .attr('transform', `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .select('.domain').remove();
        
        worldMap.legendContainer.selectAll('text')
            .attr('font-size', '8px');
            
        console.log("Map legend created");
    } catch (error) {
        console.error("Error creating map legend:", error);
    }
}

// Show league selection when a country with multiple leagues is clicked
function showLeagueSelectionForCountry(countryName, leagues) {
    try {
        console.log(`Showing league selection dialog for ${countryName} with ${leagues.length} leagues`);
        
        // Remove any existing dialog
        worldMap.svg.selectAll('.league-selection-dialog').remove();
        
        // Sort leagues by player count
        leagues.sort((a, b) => b.count - a.count);
        
        // Create a dialog over the map
        const dialog = worldMap.svg.append('g')
            .attr('class', 'league-selection-dialog')
            .attr('transform', `translate(${worldMap.width / 4}, ${worldMap.height / 4})`);
        
        // Add background
        dialog.append('rect')
            .attr('width', worldMap.width / 2)
            .attr('height', Math.min(150, leagues.length * 30 + 60))
            .attr('fill', 'white')
            .attr('stroke', '#333')
            .attr('rx', 5)
            .attr('ry', 5);
        
        // Add title
        dialog.append('text')
            .attr('x', worldMap.width / 4)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .text(`Select a league from ${countryName}`);
        
        // Add close button
        const closeButton = dialog.append('g')
            .attr('transform', `translate(${worldMap.width / 2 - 20}, 10)`)
            .style('cursor', 'pointer');
        
        closeButton.append('circle')
            .attr('r', 10)
            .attr('fill', '#f44336');
        
        closeButton.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 3)
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text('✕');
        
        closeButton.on('click', function() {
            dialog.remove();
        });
        
        // Add league options
        leagues.forEach((league, i) => {
            const leagueGroup = dialog.append('g')
                .attr('transform', `translate(20, ${i * 30 + 50})`)
                .style('cursor', 'pointer');
            
            leagueGroup.append('rect')
                .attr('width', worldMap.width / 2 - 40)
                .attr('height', 25)
                .attr('fill', '#f0f0f0')
                .attr('rx', 3)
                .attr('ry', 3);
            
            leagueGroup.append('text')
                .attr('x', 10)
                .attr('y', 17)
                .text(`${league.name} (${league.count} players)`);
            
            leagueGroup.on('click', function() {
                // Update dashboard state
                dashboardState.filters.league = league.name;
                dashboardState.filters.club = "all"; // Reset club selection
                
                // Update UI
                const leagueSelector = document.getElementById('league-selector');
                if (leagueSelector) {
                    leagueSelector.value = league.name;
                } else {
                    console.warn("League selector element not found");
                }
                
                updateClubSelector();
                updateSelectionDetails();
                
                // Update visualizations
                updateAllVisualizations();
                
                // Remove dialog
                dialog.remove();
                
                console.log(`Selected league "${league.name}" from dialog`);
            });
        });
    } catch (error) {
        console.error("Error showing league selection dialog:", error);
        // Remove any broken dialog
        worldMap.svg.selectAll('.league-selection-dialog').remove();
    }
}

// Update the world map based on filtered data
function updateWorldMap(filteredData) {
    try {
        console.log(`Updating world map with ${filteredData.length} filtered players`);
        
        // If world data isn't loaded yet, wait for it
        if (!worldMap.worldData) {
            console.warn("World data not loaded yet, can't update map");
            return;
        }
        
        // Group data by country
        const countryCounts = {};
        filteredData.forEach(player => {
            if (!player.country) {
                return; // Skip if no country
            }
            
            const normalizedCountry = normalizeCountryName(player.country);
            
            if (!countryCounts[normalizedCountry]) {
                countryCounts[normalizedCountry] = {
                    numPlayers: 0,
                    totalOverall: 0,
                    totalValue: 0
                };
            }
            
            countryCounts[normalizedCountry].numPlayers += 1;
            countryCounts[normalizedCountry].totalOverall += player.player_overall || 0;
            countryCounts[normalizedCountry].totalValue += player.value_millions_eur || 0;
        });
        
        // Calculate averages
        Object.keys(countryCounts).forEach(country => {
            const count = countryCounts[country].numPlayers;
            countryCounts[country].avgOverall = countryCounts[country].totalOverall / count;
            countryCounts[country].avgValue = countryCounts[country].totalValue / count;
        });
        
        // Update color scale domain
        const maxPlayers = d3.max(Object.values(countryCounts).map(c => c.numPlayers)) || 1;
        worldMap.colorScale.domain([0, maxPlayers]);
        
        // Update map colors
        worldMap.g.selectAll('path')
            .transition()
            .duration(500)
            .attr('fill', function(d) {
                // Get country name
                const geoCountryName = d.properties.name;
                const normalizedName = normalizeCountryName(geoCountryName);
                
                // Find matching country data
                const countryData = countryCounts[normalizedName];
                
                // Return color based on player count
                return countryData ? worldMap.colorScale(countryData.numPlayers) : '#f0f0f0';
            });
        
        // Update legend
        createMapLegend();
        
        console.log("World map updated successfully");
    } catch (error) {
        console.error("Error updating world map:", error);
    }
}