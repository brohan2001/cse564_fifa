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
    legendContainer: null
};

// Initialize the world map visualization
function initializeWorldMap() {
    // Set dimensions
    const container = document.getElementById('world-map');
    worldMap.width = container.clientWidth;
    worldMap.height = container.clientHeight;
    
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
    
    // Load world map data
    loadWorldMapData();
}

// Load GeoJSON data for the world map


// Add labels for countries with significant number of players
function addCountryLabels() {
    // Filter countries with enough players to label
    const significantCountries = globalData.countries.filter(c => c.num_players > 20);
    
    // Find centroid for each country
    significantCountries.forEach(country => {
        // Find matching feature in the world data
        const feature = worldMap.worldData.features.find(f => f.properties.name === country.country);
        
        if (feature) {
            // Calculate centroid
            const centroid = worldMap.path.centroid(feature);
            
            // Only add label if centroid is valid
            if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
                // Add country label
                worldMap.g.append('text')
                    .attr('class', 'country-label')
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '8px')
                    .attr('fill', '#333')
                    .text(country.country);
            }
        }
    });
}

// Create a legend for the map
function createMapLegend() {
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
}

// Show league selection when a country with multiple leagues is clicked
function showLeagueSelectionForCountry(countryName, leagues) {
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
            .text(league.league_name);
        
        leagueGroup.on('click', function() {
            // Update dashboard state
            dashboardState.filters.league = league.league_name;
            dashboardState.filters.club = "all"; // Reset club selection
            
            // Update UI
            document.getElementById('league-selector').value = league.league_name;
            updateClubSelector();
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
            
            // Remove dialog
            dialog.remove();
        });
    });
}

// Update the world map based on filtered data
function updateWorldMap(filteredData) {
    // Group data by country
    const countryCounts = {};
    filteredData.forEach(player => {
        if (!countryCounts[player.country]) {
            countryCounts[player.country] = {
                numPlayers: 0,
                totalOverall: 0,
                totalValue: 0
            };
        }
        
        countryCounts[player.country].numPlayers += 1;
        countryCounts[player.country].totalOverall += player.player_overall;
        countryCounts[player.country].totalValue += player.value_millions_eur;
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
            const countryName = d.properties.name;
            
            // Find matching country data
            const countryData = countryCounts[countryName];
            
            // Return color based on player count
            return countryData ? worldMap.colorScale(countryData.numPlayers) : '#f0f0f0';
        });
    
    // Update legend
    createMapLegend();
}