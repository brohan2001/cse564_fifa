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
    isLoading: false,
    hasError: false
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
    
    // Add loading text
    worldMap.svg.append('text')
        .attr('class', 'loading-text')
        .attr('x', worldMap.width / 2)
        .attr('y', worldMap.height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .text('Loading world map data...');
    
    worldMap.isLoading = true;
    
    // Load world map data and country data in parallel
    Promise.all([
        loadGeoJSON(),
        loadCountryData()
    ])
    .then(([geoData, countryData]) => {
        worldMap.isLoading = false;
        if (geoData && countryData) {
            renderWorldMap(geoData, countryData);
        }
    })
    .catch(error => {
        worldMap.isLoading = false;
        worldMap.hasError = true;
        console.error("Error loading world map data:", error);
        worldMap.svg.select('.loading-text')
            .text('Error loading map data. See console for details.');
    });
}

// Load GeoJSON data 
async function loadGeoJSON() {
    try {
        console.log("Loading GeoJSON data...");
        
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        
        if (!response.ok) {
            throw new Error(`Failed to load GeoJSON: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("GeoJSON loaded successfully with", data.features.length, "countries");
        
        return data;
    } catch (error) {
        console.error("Error loading GeoJSON:", error);
        throw error;
    }
}

// Load country data from our API
async function loadCountryData() {
    try {
        console.log("Loading country data from API...");
        
        const response = await fetch('/api/countries');
        
        if (!response.ok) {
            throw new Error(`Failed to load country data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Country data loaded successfully with", data.length, "countries");
        
        // Debug: Log countries received
        if (data.length > 0) {
            console.log("First country:", data[0]);
        } else {
            console.warn("No country data received from API");
        }
        
        // Process country data into a map for easier lookup
        const countryMap = {};
        data.forEach(country => {
            countryMap[country.country] = country;
        });
        
        return countryMap;
    } catch (error) {
        console.error("Error loading country data:", error);
        throw error;
    }
}

// Render the world map with country data
function renderWorldMap(geoData, countryData) {
    try {
        console.log("Rendering world map...");
        worldMap.worldData = geoData;
        
        // Remove loading text
        worldMap.svg.select('.loading-text').remove();
        
        // Debug: Check which countries have data
        console.log("Countries with data:", Object.keys(countryData));
        
        // Get count ranges for color scale
        const playerCounts = Object.values(countryData).map(d => d.num_players);
        const maxPlayers = playerCounts.length > 0 ? d3.max(playerCounts) : 100;
        console.log("Max players:", maxPlayers);
        
        // Update color scale
        worldMap.colorScale.domain([0, maxPlayers]);
        
        // Draw map
        worldMap.g.selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', worldMap.path)
            .attr('fill', function(d) {
                // Get country name
                const countryName = d.properties.name;
                
                // Find matching country data with normalization
                const normalizedName = normalizeCountryName(countryName);
                const country = countryData[normalizedName];
                
                // Debug specific countries
                if (normalizedName === "France" || normalizedName === "Spain" || normalizedName === "England") {
                    console.log(`Country ${normalizedName} (${countryName}):`, country ? `${country.num_players} players` : "no data");
                }
                
                // Color based on data
                if (country) {
                    return worldMap.colorScale(country.num_players);
                } else {
                    return '#f0f0f0'; // Default color for countries without data
                }
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .on('mouseover', function(event, d) {
                handleCountryMouseOver(event, d, countryData);
            })
            .on('mouseout', function() {
                handleCountryMouseOut();
            })
            .on('click', function(event, d) {
                handleCountryClick(event, d, countryData);
            });
        
        // Create legend
        createMapLegend(maxPlayers);
        
        console.log("World map rendered successfully");
    } catch (error) {
        console.error("Error rendering world map:", error);
        worldMap.svg.append('text')
            .attr('x', worldMap.width / 2)
            .attr('y', worldMap.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .text('Error rendering map. See console for details.');
    }
}

// Normalize country names between GeoJSON and our data
function normalizeCountryName(name) {
    // Handle special cases
    if (name === "United Kingdom") return "England";
    if (name === "United States of America") return "United States";
    
    // Direct matches
    const directMap = {
        "USA": "United States",
        "UK": "England",
        "Great Britain": "England",
        "England": "England",
        "Scotland": "England", // Map Scotland to England for FIFA data
        "United Kingdom": "England",
        "Wales": "England", // Map Wales to England for FIFA data
        "France": "France",
        "Spain": "Spain",
        "Germany": "Germany",
        "Italy": "Italy",
        "Brazil": "Brazil",
        "Argentina": "Argentina",
        "Netherlands": "Netherlands",
        "Portugal": "Portugal",
        "Russia": "Russia"
    };
    
    return directMap[name] || name;
}

// Handle mouseover on country
function handleCountryMouseOver(event, d, countryData) {
    // Highlight country
    d3.select(event.currentTarget)
        .attr('stroke', '#000')
        .attr('stroke-width', 1.5);
    
    // Get country name
    const countryName = d.properties.name;
    const normalizedName = normalizeCountryName(countryName);
    
    // Find country data
    const country = countryData[normalizedName];
    
    // Show tooltip
    worldMap.tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
    
    if (country) {
        worldMap.tooltip.html(`
            <strong>${countryName}</strong><br>
            Players: ${country.num_players}<br>
            Avg. Rating: ${country.avg_overall.toFixed(1)}<br>
            Avg. Value: €${country.avg_value.toFixed(1)}M
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    } else {
        worldMap.tooltip.html(`
            <strong>${countryName}</strong><br>
            No player data available
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    }
}

// Handle mouseout on country
function handleCountryMouseOut() {
    // Remove highlight
    d3.select(event.currentTarget)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);
    
    // Hide tooltip
    worldMap.tooltip.transition()
        .duration(500)
        .style('opacity', 0);
}

// Handle click on country
function handleCountryClick(event, d, countryData) {
    const countryName = d.properties.name;
    const normalizedName = normalizeCountryName(countryName);
    const country = countryData[normalizedName];
    
    if (country) {
        console.log(`Selected country: ${countryName} with ${country.num_players} players`);
        
        // Update dashboard filters
        dashboardState.filters.country = normalizedName;
        updateSelectionDetails();
        
        // Update visualizations
        updateAllVisualizations();
    } else {
        console.log(`Selected country: ${countryName} - no data available`);
    }
}

// Create legend for the map
function createMapLegend(maxPlayers) {
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
    linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', worldMap.colorScale(0));
        
    linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', worldMap.colorScale(maxPlayers));
    
    // Add rectangle with gradient
    worldMap.legendContainer.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#map-legend-gradient)');
    
    // Add axis for legend
    const legendScale = d3.scaleLinear()
        .domain([0, maxPlayers])
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

// Update the world map based on filtered data
function updateWorldMap(filteredData) {
    // If map isn't loaded yet, don't update
    if (!worldMap.worldData || worldMap.isLoading) {
        console.log("World map not ready for update yet");
        return;
    }
    
    try {
        console.log(`Updating world map with ${filteredData.length} filtered players`);
        
        // Group filtered data by country
        const countryCounts = {};
        filteredData.forEach(player => {
            if (!player.country) return;
            
            const country = player.country;
            
            if (!countryCounts[country]) {
                countryCounts[country] = {
                    numPlayers: 0,
                    totalOverall: 0,
                    totalValue: 0
                };
            }
            
            countryCounts[country].numPlayers += 1;
            countryCounts[country].totalOverall += player.player_overall || 0;
            countryCounts[country].totalValue += player.value_millions_eur || 0;
        });
        
        // Calculate averages
        Object.keys(countryCounts).forEach(country => {
            const count = countryCounts[country].numPlayers;
            countryCounts[country].avgOverall = countryCounts[country].totalOverall / count;
            countryCounts[country].avgValue = countryCounts[country].totalValue / count;
        });
        
        // Update color scale domain
        const playerCounts = Object.values(countryCounts).map(c => c.numPlayers);
        const maxPlayers = playerCounts.length > 0 ? d3.max(playerCounts) : 1;
        worldMap.colorScale.domain([0, maxPlayers]);
        
        // Update map colors
        worldMap.g.selectAll('path')
            .transition()
            .duration(500)
            .attr('fill', function(d) {
                // Get country name
                const countryName = d.properties.name;
                const normalizedName = normalizeCountryName(countryName);
                
                // Find matching country data
                const country = countryCounts[normalizedName];
                
                // Return color based on player count
                return country ? worldMap.colorScale(country.numPlayers) : '#f0f0f0';
            });
        
        // Update legend
        createMapLegend(maxPlayers);
        
        console.log("World map updated successfully");
    } catch (error) {
        console.error("Error updating world map:", error);
    }
}