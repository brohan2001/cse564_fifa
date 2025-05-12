// // Global variables for world map
// let worldMap = {
//     svg: null,
//     width: 0,
//     height: 0,
//     projection: null,
//     path: null,
//     tooltip: null,
//     worldData: null,
//     colorScale: null,
//     legendContainer: null,
//     zoomGroup: null,
//     selectedCountry: null,
//     originalData: {} // Store original country data for resets
// };

// // Initialize the world map visualization
// function initializeWorldMap() {
//     console.log("Initializing world map...");
    
//     // Clear any previous content to prevent duplicates
//     const container = document.getElementById('world-map');
//     if (!container) {
//         console.error("World map container not found!");
//         return;
//     }
//     container.innerHTML = '';
    
//     // Set dimensions
//     worldMap.width = container.clientWidth;
//     worldMap.height = container.clientHeight;
    
//     console.log(`World map dimensions: ${worldMap.width} x ${worldMap.height}`);
    
//     // Create SVG
//     worldMap.svg = d3.select('#world-map')
//         .append('svg')
//         .attr('width', worldMap.width)
//         .attr('height', worldMap.height);
    
//     // Create tooltip
//     worldMap.tooltip = createTooltip();
    
//     // Add a group for the map (will be used for zooming)
//     worldMap.zoomGroup = worldMap.svg.append('g');
    
//     // Create projection for the map
//     worldMap.projection = d3.geoNaturalEarth1()
//         .scale((worldMap.width) / 6)
//         .translate([worldMap.width / 2, worldMap.height / 1.8]);
    
//     // Create path generator
//     worldMap.path = d3.geoPath()
//         .projection(worldMap.projection);
    
//     // Create color scale for countries
//     worldMap.colorScale = d3.scaleSequential(d3.interpolateBlues)
//         .domain([0, 100]);
    
//     // Add legend container
//     worldMap.legendContainer = worldMap.svg.append('g')
//         .attr('class', 'legend')
//         .attr('transform', `translate(20, ${worldMap.height - 40})`);
    
//     // Add zoom controls
//     addZoomControls();
    
//     // Add loading text
//     worldMap.svg.append('text')
//         .attr('class', 'loading-text')
//         .attr('x', worldMap.width / 2)
//         .attr('y', worldMap.height / 2)
//         .attr('text-anchor', 'middle')
//         .attr('fill', '#333')
//         .text('Loading world map data...');
    
//     // Load GeoJSON data for the world map
//     loadGeoJSON()
//         .then(geoData => {
//             // Once GeoJSON is loaded, process and render the map
//             worldMap.worldData = geoData;
            
//             // Process the country data from our dataset
//             const countryData = processCountryData();
//             worldMap.originalData = JSON.parse(JSON.stringify(countryData)); // Deep copy for resets
            
//             // Render the map
//             renderWorldMap(countryData);
//         })
//         .catch(error => {
//             console.error("Error loading world map:", error);
//             worldMap.svg.select('.loading-text')
//                 .text('Error loading map data. Please refresh the page.');
//         });
// }

// // Add zoom controls to the map
// function addZoomControls() {
//     // Create a container for controls
//     const controlsContainer = worldMap.svg.append('g')
//         .attr('class', 'zoom-controls')
//         .attr('transform', `translate(${worldMap.width - 70}, 20)`);
    
//     // Add background for controls
//     controlsContainer.append('rect')
//         .attr('width', 60)
//         .attr('height', 90)
//         .attr('fill', 'white')
//         .attr('stroke', '#ccc')
//         .attr('stroke-width', 1)
//         .attr('rx', 5)
//         .attr('ry', 5)
//         .attr('opacity', 0.8);
    
//     // Add zoom in button
//     const zoomIn = controlsContainer.append('g')
//         .attr('class', 'zoom-in')
//         .attr('transform', 'translate(30, 25)')
//         .style('cursor', 'pointer');
    
//     zoomIn.append('circle')
//         .attr('r', 15)
//         .attr('fill', '#f0f0f0')
//         .attr('stroke', '#999');
    
//     zoomIn.append('text')
//         .attr('text-anchor', 'middle')
//         .attr('dy', 5)
//         .text('+')
//         .attr('font-size', '20px')
//         .attr('font-weight', 'bold');
    
//     // Add zoom out button
//     const zoomOut = controlsContainer.append('g')
//         .attr('class', 'zoom-out')
//         .attr('transform', 'translate(30, 65)')
//         .style('cursor', 'pointer');
    
//     zoomOut.append('circle')
//         .attr('r', 15)
//         .attr('fill', '#f0f0f0')
//         .attr('stroke', '#999');
    
//     zoomOut.append('text')
//         .attr('text-anchor', 'middle')
//         .attr('dy', 5)
//         .text('−')
//         .attr('font-size', '20px')
//         .attr('font-weight', 'bold');
    
//     // Add functionality to zoom buttons
//     zoomIn.on('click', function() {
//         worldMap.zoom.scaleBy(worldMap.svg.transition().duration(300), 1.5);
//     });
    
//     zoomOut.on('click', function() {
//         worldMap.zoom.scaleBy(worldMap.svg.transition().duration(300), 0.75);
//     });
    
//     // Add reset button
//     const reset = controlsContainer.append('g')
//         .attr('class', 'zoom-reset')
//         .attr('transform', 'translate(30, 105)')
//         .style('cursor', 'pointer');
    
//     reset.append('circle')
//         .attr('r', 15)
//         .attr('fill', '#f0f0f0')
//         .attr('stroke', '#999');
    
//     reset.append('text')
//         .attr('text-anchor', 'middle')
//         .attr('dy', 5)
//         .text('R')
//         .attr('font-size', '14px')
//         .attr('font-weight', 'bold');
    
//     // Extend the background to include reset button
//     controlsContainer.select('rect')
//         .attr('height', 130);
    
//     // Add functionality to reset button
//     reset.on('click', function() {
//         // Reset zoom
//         worldMap.svg.transition()
//             .duration(750)
//             .call(worldMap.zoom.transform, d3.zoomIdentity);
        
//         // Reset country selection if any
//         if (worldMap.selectedCountry) {
//             worldMap.selectedCountry = null;
//             updateWorldMap(filterData());
//         }
//     });
// }

// // Set up zoom behavior
// function setupZoom() {
//     // Define zoom behavior
//     worldMap.zoom = d3.zoom()
//         .scaleExtent([1, 8])
//         .on('zoom', function(event) {
//             worldMap.zoomGroup.attr('transform', event.transform);
            
//             // Update path stroke width based on zoom level
//             const strokeWidth = 0.5 / event.transform.k;
//             worldMap.zoomGroup.selectAll('path')
//                 .attr('stroke-width', strokeWidth);
//         });
    
//     // Apply zoom behavior to SVG
//     worldMap.svg.call(worldMap.zoom);
// }

// // Load GeoJSON data
// async function loadGeoJSON() {
//     try {
//         const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        
//         if (!response.ok) {
//             throw new Error(`Failed to load GeoJSON: ${response.status}`);
//         }
        
//         return await response.json();
//     } catch (error) {
//         console.error("Error loading GeoJSON:", error);
//         throw error;
//     }
// }

// // Process country data from our dataset
// function processCountryData() {
//     // Get player data grouped by country
//     const countryCounts = {};
    
//     // Check if we have players data
//     if (!globalData.players || globalData.players.length === 0) {
//         console.error("No player data available");
//         return {};
//     }
    
//     // Create a mapping between country names in our data and GeoJSON
//     const countryMapping = {
//         'England': 'United Kingdom',
//         'Scotland': 'United Kingdom',
//         'Wales': 'United Kingdom',
//         'Northern Ireland': 'United Kingdom',
//         'United States': 'United States of America',
//         'USA': 'United States of America',
//         'Korea Republic': 'South Korea',
//         'Russia': 'Russian Federation',
//         'UK': 'United Kingdom',
//         'Great Britain': 'United Kingdom'
//     };
    
//     // Process each player
//     globalData.players.forEach(player => {
//         if (!player.country) return;
        
//         // Get normalized country name
//         const countryName = countryMapping[player.country] || player.country;
        
//         if (!countryCounts[countryName]) {
//             countryCounts[countryName] = {
//                 numPlayers: 0,
//                 totalOverall: 0,
//                 totalValue: 0,
//                 leagues: {}
//             };
//         }
        
//         countryCounts[countryName].numPlayers += 1;
//         countryCounts[countryName].totalOverall += player.player_overall || 0;
//         countryCounts[countryName].totalValue += player.value_millions_eur || 0;
        
//         // Track leagues in this country
//         if (player.league_name) {
//             if (!countryCounts[countryName].leagues[player.league_name]) {
//                 countryCounts[countryName].leagues[player.league_name] = 0;
//             }
//             countryCounts[countryName].leagues[player.league_name] += 1;
//         }
//     });
    
//     // Calculate averages
//     Object.keys(countryCounts).forEach(country => {
//         const count = countryCounts[country].numPlayers;
//         countryCounts[country].avgOverall = countryCounts[country].totalOverall / count;
//         countryCounts[country].avgValue = countryCounts[country].totalValue / count;
        
//         // Convert leagues object to array
//         const leaguesArray = Object.entries(countryCounts[country].leagues)
//             .map(([name, count]) => ({ name, count }))
//             .sort((a, b) => b.count - a.count);
        
//         countryCounts[country].leaguesArray = leaguesArray;
//     });
    
//     return countryCounts;
// }

// // Render the world map with country data
// function renderWorldMap(countryData) {
//     // Remove loading text
//     worldMap.svg.select('.loading-text').remove();
    
//     // Check if we have world data
//     if (!worldMap.worldData || !worldMap.worldData.features) {
//         console.error("No GeoJSON data available");
//         worldMap.svg.append('text')
//             .attr('x', worldMap.width / 2)
//             .attr('y', worldMap.height / 2)
//             .attr('text-anchor', 'middle')
//             .attr('fill', 'red')
//             .text('Error: GeoJSON data not available');
//         return;
//     }
    
//     // Find max players for color scale
//     const playerCounts = Object.values(countryData).map(c => c.numPlayers);
//     const maxPlayers = playerCounts.length > 0 ? d3.max(playerCounts) : 100;
    
//     // Update color scale domain
//     worldMap.colorScale.domain([0, maxPlayers]);
    
//     // Create the map
//     worldMap.zoomGroup.selectAll('path')
//         .data(worldMap.worldData.features)
//         .enter()
//         .append('path')
//         .attr('d', worldMap.path)
//         .attr('fill', function(d) {
//             // Get country name
//             const countryName = d.properties.name;
            
//             // Find matching country data
//             const country = countryData[countryName];
            
//             // Return color based on player count
//             return country ? worldMap.colorScale(country.numPlayers) : '#f0f0f0';
//         })
//         .attr('stroke', '#fff')
//         .attr('stroke-width', 0.5)
//         .attr('data-country', d => d.properties.name)
//         .on('mouseover', function(event, d) {
//             // Highlight country
//             d3.select(this)
//                 .attr('stroke', '#000')
//                 .attr('stroke-width', 1.5);
            
//             // Get country data
//             const countryName = d.properties.name;
//             const country = countryData[countryName];
            
//             // Show tooltip
//             worldMap.tooltip.transition()
//                 .duration(200)
//                 .style('opacity', 0.9);
            
//             if (country) {
//                 // Create tooltip content
//                 let leaguesText = '';
//                 if (country.leaguesArray && country.leaguesArray.length > 0) {
//                     const topLeagues = country.leaguesArray.slice(0, 3);
//                     leaguesText = topLeagues.map(l => `${l.name} (${l.count})`).join('<br>');
//                 }
                
//                 worldMap.tooltip.html(`
//                     <strong>${countryName}</strong><br>
//                     Players: ${country.numPlayers}<br>
//                     Avg. Rating: ${country.avgOverall.toFixed(1)}<br>
//                     ${leaguesText ? `Top Leagues:<br>${leaguesText}` : ''}
//                 `)
//                 .style('left', (event.pageX + 10) + 'px')
//                 .style('top', (event.pageY - 28) + 'px');
//             } else {
//                 worldMap.tooltip.html(`
//                     <strong>${countryName}</strong><br>
//                     No player data available
//                 `)
//                 .style('left', (event.pageX + 10) + 'px')
//                 .style('top', (event.pageY - 28) + 'px');
//             }
//         })
//         .on('mouseout', function() {
//             // Remove highlight if not selected
//             if (!worldMap.selectedCountry || d3.select(this).attr('data-country') !== worldMap.selectedCountry) {
//                 d3.select(this)
//                     .attr('stroke', '#fff')
//                     .attr('stroke-width', 0.5);
//             }
            
//             // Hide tooltip
//             worldMap.tooltip.transition()
//                 .duration(500)
//                 .style('opacity', 0);
//         })
//         .on('click', function(event, d) {
//             // Get country name
//             const countryName = d.properties.name;
            
//             // Toggle selection
//             if (worldMap.selectedCountry === countryName) {
//                 // Deselect country
//                 worldMap.selectedCountry = null;
                
//                 // Reset all countries to original colors
//                 updateWorldMap(filterData());
//             } else {
//                 worldMap.selectedCountry = countryName;
//                 const country = countryData[countryName];
                
//                 if (country && country.leaguesArray && country.leaguesArray.length > 0) {
//                     // If there's only one league in the country, select it directly
//                     if (country.leaguesArray.length === 1) {
//                         const leagueName = country.leaguesArray[0].name;
                        
//                         // Update dashboard state
//                         dashboardState.filters.league = leagueName;
//                         dashboardState.filters.club = "all"; // Reset club selection
                        
//                         // Update UI
//                         const leagueSelector = document.getElementById('league-selector');
//                         if (leagueSelector) {
//                             leagueSelector.value = leagueName;
//                         }
                        
//                         updateClubSelector();
//                         updateSelectionDetails();
                        
//                         // Update visualizations
//                         updateAllVisualizations();
//                     } else {
//                         // Highlight only the selected country
//                         worldMap.zoomGroup.selectAll('path')
//                             .transition()
//                             .duration(300)
//                             .attr('fill', function(d) {
//                                 if (d.properties.name === countryName) {
//                                     const country = countryData[countryName];
//                                     return country ? worldMap.colorScale(country.numPlayers) : '#f0f0f0';
//                                 }
//                                 return '#f0f0f0';
//                             });
                        
//                         // Show a dialog to select a league
//                         showLeagueSelectionForCountry(countryName, country.leaguesArray);
//                     }
//                 }
//             }
//         });
    
//     // Set up zoom after creating the map
//     setupZoom();
    
//     // Create legend
//     createMapLegend(maxPlayers);
// }

// // Show league selection when a country with multiple leagues is clicked
// function showLeagueSelectionForCountry(countryName, leagues) {
//     // Remove any existing dialog
//     worldMap.svg.selectAll('.league-selection-dialog').remove();
    
//     // Create a dialog over the map
//     const dialog = worldMap.svg.append('g')
//         .attr('class', 'league-selection-dialog')
//         .attr('transform', `translate(${worldMap.width / 4}, ${worldMap.height / 4})`);
    
//     // Add background
//     dialog.append('rect')
//         .attr('width', worldMap.width / 2)
//         .attr('height', Math.min(150, leagues.length * 30 + 60))
//         .attr('fill', 'white')
//         .attr('stroke', '#333')
//         .attr('rx', 5)
//         .attr('ry', 5);
    
//     // Add title
//     dialog.append('text')
//         .attr('x', worldMap.width / 4)
//         .attr('y', 25)
//         .attr('text-anchor', 'middle')
//         .attr('font-weight', 'bold')
//         .text(`Select a league from ${countryName}`);
    
//     // Add close button
//     const closeButton = dialog.append('g')
//         .attr('transform', `translate(${worldMap.width / 2 - 20}, 10)`)
//         .style('cursor', 'pointer');
    
//     closeButton.append('circle')
//         .attr('r', 10)
//         .attr('fill', '#f44336');
    
//     closeButton.append('text')
//         .attr('text-anchor', 'middle')
//         .attr('dy', 3)
//         .attr('fill', 'white')
//         .attr('font-size', '12px')
//         .attr('font-weight', 'bold')
//         .text('✕');
    
//     closeButton.on('click', function() {
//         // Remove dialog
//         dialog.remove();
        
//         // Reset country selection
//         worldMap.selectedCountry = null;
//         updateWorldMap(filterData());
//     });
    
//     // Add league options
//     leagues.forEach((league, i) => {
//         const leagueGroup = dialog.append('g')
//             .attr('transform', `translate(20, ${i * 30 + 50})`)
//             .style('cursor', 'pointer');
        
//         leagueGroup.append('rect')
//             .attr('width', worldMap.width / 2 - 40)
//             .attr('height', 25)
//             .attr('fill', '#f0f0f0')
//             .attr('rx', 3)
//             .attr('ry', 3);
        
//         leagueGroup.append('text')
//             .attr('x', 10)
//             .attr('y', 17)
//             .text(`${league.name} (${league.count} players)`);
        
//         leagueGroup.on('click', function() {
//             // Update dashboard state
//             dashboardState.filters.league = league.name;
//             dashboardState.filters.club = "all"; // Reset club selection
            
//             // Update UI
//             const leagueSelector = document.getElementById('league-selector');
//             if (leagueSelector) {
//                 leagueSelector.value = league.name;
//             }
            
//             updateClubSelector();
//             updateSelectionDetails();
            
//             // Update visualizations
//             updateAllVisualizations();
            
//             // Remove dialog
//             dialog.remove();
//         });
//     });
// }

// // Create a legend for the map
// function createMapLegend(maxPlayers) {
//     // Clear existing legend
//     worldMap.legendContainer.selectAll('*').remove();
    
//     // Legend title
//     worldMap.legendContainer.append('text')
//         .attr('x', 0)
//         .attr('y', -10)
//         .attr('font-size', '10px')
//         .attr('font-weight', 'bold')
//         .text('Players per Country');
    
//     // Create gradient for legend
//     const legendWidth = 200;
//     const legendHeight = 10;
    
//     // Create gradient
//     const defs = worldMap.svg.append('defs');
    
//     const linearGradient = defs.append('linearGradient')
//         .attr('id', 'map-legend-gradient')
//         .attr('x1', '0%')
//         .attr('y1', '0%')
//         .attr('x2', '100%')
//         .attr('y2', '0%');
    
//     // Add color stops
//     linearGradient.append('stop')
//         .attr('offset', '0%')
//         .attr('stop-color', worldMap.colorScale(0));
        
//     linearGradient.append('stop')
//         .attr('offset', '100%')
//         .attr('stop-color', worldMap.colorScale(maxPlayers));
    
//     // Add rectangle with gradient
//     worldMap.legendContainer.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .style('fill', 'url(#map-legend-gradient)');
    
//     // Add axis for legend
//     const legendScale = d3.scaleLinear()
//         .domain([0, maxPlayers])
//         .range([0, legendWidth]);
    
//     const legendAxis = d3.axisBottom(legendScale)
//         .ticks(5)
//         .tickSize(legendHeight);
    
//     worldMap.legendContainer.append('g')
//         .attr('transform', `translate(0, ${legendHeight})`)
//         .call(legendAxis)
//         .select('.domain').remove();
    
//     worldMap.legendContainer.selectAll('text')
//         .attr('font-size', '8px');
// }

// // Update the world map based on filtered data
// function updateWorldMap(filteredData) {
//     // If world data isn't loaded yet, don't update
//     if (!worldMap.worldData) {
//         console.log("World map not ready for update yet");
//         return;
//     }
    
//     // If a country is selected and we want to keep the selection, return
//     if (worldMap.selectedCountry && !filteredData) {
//         return;
//     }
    
//     // Process filtered data for countries
//     const countryData = {};
    
//     // Create a mapping between country names in our data and GeoJSON
//     const countryMapping = {
//         'England': 'United Kingdom',
//         'Scotland': 'United Kingdom',
//         'Wales': 'United Kingdom',
//         'Northern Ireland': 'United Kingdom',
//         'United States': 'United States of America',
//         'USA': 'United States of America',
//         'Korea Republic': 'South Korea',
//         'Russia': 'Russian Federation',
//         'UK': 'United Kingdom',
//         'Great Britain': 'United Kingdom'
//     };
    
//     // Process filtered players
//     filteredData.forEach(player => {
//         if (!player.country) return;
        
//         // Get normalized country name
//         const countryName = countryMapping[player.country] || player.country;
        
//         if (!countryData[countryName]) {
//             countryData[countryName] = {
//                 numPlayers: 0,
//                 totalOverall: 0,
//                 totalValue: 0,
//                 leagues: {}
//             };
//         }
        
//         countryData[countryName].numPlayers += 1;
//         countryData[countryName].totalOverall += player.player_overall || 0;
//         countryData[countryName].totalValue += player.value_millions_eur || 0;
        
//         // Track leagues in this country
//         if (player.league_name) {
//             if (!countryData[countryName].leagues[player.league_name]) {
//                 countryData[countryName].leagues[player.league_name] = 0;
//             }
//             countryData[countryName].leagues[player.league_name] += 1;
//         }
//     });
    
//     // Calculate averages and convert leagues to arrays
//     Object.keys(countryData).forEach(country => {
//         const count = countryData[country].numPlayers;
//         countryData[country].avgOverall = countryData[country].totalOverall / count;
//         countryData[country].avgValue = countryData[country].totalValue / count;
        
//         // Convert leagues object to array
//         const leaguesArray = Object.entries(countryData[country].leagues)
//             .map(([name, count]) => ({ name, count }))
//             .sort((a, b) => b.count - a.count);
        
//         countryData[country].leaguesArray = leaguesArray;
//     });
    
//     // Update color scale domain
//     const playerCounts = Object.values(countryData).map(c => c.numPlayers);
//     const maxPlayers = playerCounts.length > 0 ? d3.max(playerCounts) : 1;
//     worldMap.colorScale.domain([0, maxPlayers]);
    
//     // Update map colors
//     worldMap.zoomGroup.selectAll('path')
//         .transition()
//         .duration(500)
//         .attr('fill', function(d) {
//             // Get country name
//             const countryName = d.properties.name;
            
//             // If we have a selected country, only show it colored
//             if (worldMap.selectedCountry && countryName !== worldMap.selectedCountry) {
//                 return '#f0f0f0';
//             }
            
//             // Find matching country data
//             const country = countryData[countryName];
            
//             // Return color based on player count
//             return country ? worldMap.colorScale(country.numPlayers) : '#f0f0f0';
//         })
//         .attr('stroke', function(d) {
//             // Highlight selected country
//             return (worldMap.selectedCountry && d.properties.name === worldMap.selectedCountry) ? '#000' : '#fff';
//         })
//         .attr('stroke-width', function(d) {
//             // Thicker border for selected country
//             return (worldMap.selectedCountry && d.properties.name === worldMap.selectedCountry) ? 1.5 : 0.5;
//         });
    
//     // Update legend
//     createMapLegend(maxPlayers);
// }

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
    zoomGroup: null,
    selectedCountry: null,
    originalData: {} // Store original country data for resets
};

// Initialize the world map visualization
function initializeWorldMap() {
    console.log("Initializing world map...");
    
    // Clear any previous content to prevent duplicates
    const container = document.getElementById('world-map');
    if (!container) {
        console.error("World map container not found!");
        return;
    }
    container.innerHTML = '';
    
    // Set dimensions
    worldMap.width = container.clientWidth;
    worldMap.height = container.clientHeight;
    
    console.log(`World map dimensions: ${worldMap.width} x ${worldMap.height}`);
    
    // Create SVG
    worldMap.svg = d3.select('#world-map')
        .append('svg')
        .attr('width', worldMap.width)
        .attr('height', worldMap.height);
    
    // Create tooltip
    worldMap.tooltip = createTooltip();
    
    // Add a group for the map (will be used for zooming)
    worldMap.zoomGroup = worldMap.svg.append('g');
    
    // Create projection for the map
    worldMap.projection = d3.geoNaturalEarth1()
        .scale((worldMap.width) / 6)
        .translate([worldMap.width / 2, worldMap.height / 1.8]);
    
    // Create path generator
    worldMap.path = d3.geoPath()
        .projection(worldMap.projection);
    
    // Create color scale for countries
    worldMap.colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 100]);
    
    // Add legend container
    worldMap.legendContainer = worldMap.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(20, ${worldMap.height - 40})`);
    
    // Add zoom controls
    addZoomControls();
    
    // Add loading text
    worldMap.svg.append('text')
        .attr('class', 'loading-text')
        .attr('x', worldMap.width / 2)
        .attr('y', worldMap.height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .text('Loading world map data...');
    
    // Load GeoJSON data for the world map
    loadGeoJSON()
        .then(geoData => {
            // Once GeoJSON is loaded, process and render the map
            worldMap.worldData = geoData;
            
            // Process the country data from our dataset
            const countryData = processCountryData();
            worldMap.originalData = JSON.parse(JSON.stringify(countryData)); // Deep copy for resets
            
            // Render the map
            renderWorldMap(countryData);
        })
        .catch(error => {
            console.error("Error loading world map:", error);
            worldMap.svg.select('.loading-text')
                .text('Error loading map data. Please refresh the page.');
        });
}

// Add zoom controls to the map
function addZoomControls() {
    // Create a container for controls
    const controlsContainer = worldMap.svg.append('g')
        .attr('class', 'zoom-controls')
        .attr('transform', `translate(${worldMap.width - 70}, 20)`);
    
    // Add background for controls
    controlsContainer.append('rect')
        .attr('width', 60)
        .attr('height', 90)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('opacity', 0.8);
    
    // Add zoom in button
    const zoomIn = controlsContainer.append('g')
        .attr('class', 'zoom-in')
        .attr('transform', 'translate(30, 25)')
        .style('cursor', 'pointer');
    
    zoomIn.append('circle')
        .attr('r', 15)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#999');
    
    zoomIn.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text('+')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold');
    
    // Add zoom out button
    const zoomOut = controlsContainer.append('g')
        .attr('class', 'zoom-out')
        .attr('transform', 'translate(30, 65)')
        .style('cursor', 'pointer');
    
    zoomOut.append('circle')
        .attr('r', 15)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#999');
    
    zoomOut.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text('−')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold');
    
    // Add functionality to zoom buttons
    zoomIn.on('click', function() {
        worldMap.zoom.scaleBy(worldMap.svg.transition().duration(300), 1.5);
    });
    
    zoomOut.on('click', function() {
        worldMap.zoom.scaleBy(worldMap.svg.transition().duration(300), 0.75);
    });
    
    // Add reset button
    const reset = controlsContainer.append('g')
        .attr('class', 'zoom-reset')
        .attr('transform', 'translate(30, 105)')
        .style('cursor', 'pointer');
    
    reset.append('circle')
        .attr('r', 15)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#999');
    
    reset.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text('R')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');
    
    // Extend the background to include reset button
    controlsContainer.select('rect')
        .attr('height', 130);
    
    // Add functionality to reset button
    reset.on('click', function() {
        // Reset zoom
        worldMap.svg.transition()
            .duration(750)
            .call(worldMap.zoom.transform, d3.zoomIdentity);
        
        // Reset country selection if any
        if (worldMap.selectedCountry) {
            worldMap.selectedCountry = null;
            
            // Reset dashboard country filter
            dashboardState.filters.country = "all";
            initBarChart('#Bar-Chart', globalData.matrix_data);
            // Update UI
            const countrySelector = document.getElementById('country-selector');
            if (countrySelector) {
                countrySelector.value = "all";
            }
            
            updateSelectionDetails();
            updateAllVisualizations();
        }
    });
}

// Set up zoom behavior
function setupZoom() {
    // Define zoom behavior
    worldMap.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function(event) {
            worldMap.zoomGroup.attr('transform', event.transform);
            
            // Update path stroke width based on zoom level
            const strokeWidth = 0.5 / event.transform.k;
            worldMap.zoomGroup.selectAll('path')
                .attr('stroke-width', function(d) {
                    // Keep selected country's stroke thicker
                    if (worldMap.selectedCountry === d.properties.name) {
                        return 1.5 / event.transform.k;
                    }
                    return strokeWidth;
                });
        });
    
    // Apply zoom behavior to SVG
    worldMap.svg.call(worldMap.zoom);
}

// Load GeoJSON data
async function loadGeoJSON() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        
        if (!response.ok) {
            throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error loading GeoJSON:", error);
        throw error;
    }
}

// Process country data from our dataset
function processCountryData() {
    // Get player data grouped by country
    const countryCounts = {};
    
    // Check if we have players data
    if (!globalData.players || globalData.players.length === 0) {
        console.error("No player data available");
        return {};
    }
    
    // Create a mapping between country names in our data and GeoJSON
    const countryMapping = {
        'England': 'United Kingdom',
        'Scotland': 'United Kingdom',
        'Wales': 'United Kingdom',
        'Northern Ireland': 'United Kingdom',
        'United States': 'United States of America',
        'USA': 'United States of America',
        'Korea Republic': 'South Korea',
        'Russia': 'Russian Federation',
        'UK': 'United Kingdom',
        'Great Britain': 'United Kingdom'
    };
    
    // Process each player
    globalData.players.forEach(player => {
        if (!player.country) return;
        
        // Get normalized country name for GeoJSON
        const geoJSONCountryName = getGeoJSONCountryName(player.country, countryMapping);
        
        if (!countryCounts[geoJSONCountryName]) {
            countryCounts[geoJSONCountryName] = {
                numPlayers: 0,
                totalOverall: 0,
                totalValue: 0,
                leagues: {},
                dataCountryName: player.country // Store original country name from data
            };
        }
        
        countryCounts[geoJSONCountryName].numPlayers += 1;
        countryCounts[geoJSONCountryName].totalOverall += player.player_overall || 0;
        countryCounts[geoJSONCountryName].totalValue += player.value_millions_eur || 0;
        
        // Track leagues in this country
        if (player.league_name) {
            if (!countryCounts[geoJSONCountryName].leagues[player.league_name]) {
                countryCounts[geoJSONCountryName].leagues[player.league_name] = 0;
            }
            countryCounts[geoJSONCountryName].leagues[player.league_name] += 1;
        }
    });
    
    // Calculate averages
    Object.keys(countryCounts).forEach(country => {
        const count = countryCounts[country].numPlayers;
        countryCounts[country].avgOverall = countryCounts[country].totalOverall / count;
        countryCounts[country].avgValue = countryCounts[country].totalValue / count;
        
        // Convert leagues object to array
        const leaguesArray = Object.entries(countryCounts[country].leagues)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        countryCounts[country].leaguesArray = leaguesArray;
    });
    
    return countryCounts;
}

// Helper function to convert data country name to GeoJSON country name
function getGeoJSONCountryName(countryName, mapping) {
    // Forward mapping (from data -> GeoJSON)
    for (const [dataName, geoName] of Object.entries(mapping)) {
        if (dataName === countryName) {
            return geoName;
        }
    }
    
    return countryName; // If no mapping exists, return as is
}

// Helper function to convert GeoJSON country name to data country name
function getDataCountryName(geoJSONCountryName, mapping) {
    // Reverse mapping (from GeoJSON -> data)
    for (const [dataName, geoName] of Object.entries(mapping)) {
        if (geoName === geoJSONCountryName) {
            return dataName;
        }
    }
    
    return geoJSONCountryName; // If no mapping exists, return as is
}

// Render the world map with country data
function renderWorldMap(countryData) {
    // Remove loading text
    worldMap.svg.select('.loading-text').remove();
    
    // Check if we have world data
    if (!worldMap.worldData || !worldMap.worldData.features) {
        console.error("No GeoJSON data available");
        worldMap.svg.append('text')
            .attr('x', worldMap.width / 2)
            .attr('y', worldMap.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .text('Error: GeoJSON data not available');
        return;
    }
    
    // Find max players for color scale
    const playerCounts = Object.values(countryData).map(c => c.numPlayers);
    const maxPlayers = playerCounts.length > 0 ? d3.max(playerCounts) : 100;
    
    // Update color scale domain
    worldMap.colorScale.domain([0, maxPlayers]);
    
    // Create the map
    worldMap.zoomGroup.selectAll('path')
        .data(worldMap.worldData.features)
        .enter()
        .append('path')
        .attr('d', worldMap.path)
        .attr('fill', function(d) {
            // Get country name
            const countryName = d.properties.name;
            
            // Find matching country data
            const country = countryData[countryName];
            
            // Return color based on player count
            return country ? worldMap.colorScale(country.numPlayers) : '#f0f0f0';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('data-country', d => d.properties.name)
        .on('mouseover', function(event, d) {
            // Highlight country
            d3.select(this)
                .attr('stroke', '#000')
                .attr('stroke-width', 1.5);
            
            // Get country data
            const countryName = d.properties.name;
            const country = countryData[countryName];
            
            // Show tooltip
            worldMap.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            
            if (country) {
                // Create tooltip content
                let leaguesText = '';
                if (country.leaguesArray && country.leaguesArray.length > 0) {
                    const topLeagues = country.leaguesArray.slice(0, 3);
                    leaguesText = topLeagues.map(l => `${l.name} (${l.count})`).join('<br>');
                }
                
                worldMap.tooltip.html(`
                    <strong>${countryName}</strong><br>
                    Players: ${country.numPlayers}<br>
                    Avg. Rating: ${country.avgOverall.toFixed(1)}<br>
                    ${leaguesText ? `Top Leagues:<br>${leaguesText}` : ''}
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
        })
        .on('mouseout', function() {
            // Remove highlight if not selected
            if (!worldMap.selectedCountry || d3.select(this).attr('data-country') !== worldMap.selectedCountry) {
                d3.select(this)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 0.5);
            }
            
            // Hide tooltip
            worldMap.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            // Get country name from GeoJSON
            const geoJSONCountryName = d.properties.name;
            const country = countryData[geoJSONCountryName];
            
            // If no data for this country, do nothing
            if (!country) return;
            
            // Get original country name from our data
            const dataCountryName = country.dataCountryName;
            

            // Toggle selection
            if (worldMap.selectedCountry === geoJSONCountryName) {
                // Deselect country
                worldMap.selectedCountry = null;
                
                // Reset country filter in dashboard state
                dashboardState.filters.country = "all";
                
                // Update UI
                const countrySelector = document.getElementById('country-selector');
                if (countrySelector) {
                    countrySelector.value = "all";
                }
                
                // Reset all countries to original colors
                updateWorldMap(filterData());
            } else {
                // Select country
                worldMap.selectedCountry = geoJSONCountryName;
                
                // Update dashboard state with country filter
                dashboardState.filters.country = dataCountryName;
                
                // Update UI
                const countrySelector = document.getElementById('country-selector');
                if (countrySelector) {
                    countrySelector.value = dataCountryName;
                }
                
                updateBarChart('#Bar-Chart', globalData.matrix_data,worldMap.selectedCountry );

                // If there are leagues in this country, optionally show league selection
                if (country.leaguesArray && country.leaguesArray.length > 0) {
                    // For countries with a single league, optionally auto-select it
                    if (country.leaguesArray.length === 1) {
                        const leagueName = country.leaguesArray[0].name;
                        
                        // Optionally update league filter - uncomment if you want auto-selection
                        // dashboardState.filters.league = leagueName;
                        // const leagueSelector = document.getElementById('league-selector');
                        // if (leagueSelector) {
                        //     leagueSelector.value = leagueName;
                        // }
                    }
                    // For countries with multiple leagues, optionally show selection dialog
                    // else {
                    //    showLeagueSelectionForCountry(geoJSONCountryName, country.leaguesArray);
                    // }
                }
                
                // Update UI and visualizations
                updateClubSelector();
                updateSelectionDetails();
                updateAllVisualizations();
            }
        });
    
    // Set up zoom after creating the map
    setupZoom();
    
    // Create legend
    createMapLegend(maxPlayers);
}

// Show league selection when a country with multiple leagues is clicked
function showLeagueSelectionForCountry(countryName, leagues) {
    // Remove any existing dialog
    worldMap.svg.selectAll('.league-selection-dialog').remove();
    
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
        // Remove dialog
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
            }
            
            updateClubSelector();
            updateSelectionDetails();
            
            // Update visualizations
            updateAllVisualizations();
            
            // Remove dialog
            dialog.remove();
        });
    });
}

// Create a legend for the map
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
    // If world data isn't loaded yet, don't update
    if (!worldMap.worldData) {
        console.log("World map not ready for update yet");
        return;
    }
    
    // Create a mapping between country names in our data and GeoJSON
    const countryMapping = {
        'England': 'United Kingdom',
        'Scotland': 'United Kingdom',
        'Wales': 'United Kingdom',
        'Northern Ireland': 'United Kingdom',
        'United States': 'United States of America',
        'USA': 'United States of America',
        'Korea Republic': 'South Korea',
        'Russia': 'Russian Federation',
        'UK': 'United Kingdom',
        'Great Britain': 'United Kingdom'
    };
    
    // Process filtered data for countries
    const countryData = {};
    
    // Process filtered players
    filteredData.forEach(player => {
        if (!player.country) return;
        
        // Get normalized country name for GeoJSON
        const geoJSONCountryName = getGeoJSONCountryName(player.country, countryMapping);
        
        if (!countryData[geoJSONCountryName]) {
            countryData[geoJSONCountryName] = {
                numPlayers: 0,
                totalOverall: 0,
                totalValue: 0,
                leagues: {},
                dataCountryName: player.country // Store original country name from data
            };
        }
        
        countryData[geoJSONCountryName].numPlayers += 1;
        countryData[geoJSONCountryName].totalOverall += player.player_overall || 0;
        countryData[geoJSONCountryName].totalValue += player.value_millions_eur || 0;
        
        // Track leagues in this country
        if (player.league_name) {
            if (!countryData[geoJSONCountryName].leagues[player.league_name]) {
                countryData[geoJSONCountryName].leagues[player.league_name] = 0;
            }
            countryData[geoJSONCountryName].leagues[player.league_name] += 1;
        }
    });
    
    // Calculate averages and convert leagues to arrays
    Object.keys(countryData).forEach(country => {
        const count = countryData[country].numPlayers;
        countryData[country].avgOverall = countryData[country].totalOverall / count;
        countryData[country].avgValue = countryData[country].totalValue / count;
        
        // Convert leagues object to array
        const leaguesArray = Object.entries(countryData[country].leagues)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        countryData[country].leaguesArray = leaguesArray;
    });
    
    // Update color scale domain based on filtered data
    const playerCounts = Object.values(countryData).map(c => c.numPlayers);
    const maxPlayers = playerCounts.length > 0 ? d3.max(playerCounts) : 1;
    worldMap.colorScale.domain([0, maxPlayers]);
    
    // Update map colors
    worldMap.zoomGroup.selectAll('path')
        .transition()
        .duration(500)
        .attr('fill', function(d) {
            // Get country name
            const countryName = d.properties.name;
            
            // Find matching country data
            const country = countryData[countryName];
            
            // If dashboard has a country filter active, highlight only that country
            if (dashboardState.filters.country !== "all") {
                const geoJSONCountryName = getGeoJSONCountryName(dashboardState.filters.country, countryMapping);
                
                if (countryName !== geoJSONCountryName) {
                    return '#f0f0f0'; // Fade other countries
                }
            }
            
            // Return color based on player count
            return country ? worldMap.colorScale(country.numPlayers) : '#f0f0f0';
        })
        .attr('stroke', function(d) {
            // Highlight selected country
            if (dashboardState.filters.country !== "all") {
                const geoJSONCountryName = getGeoJSONCountryName(dashboardState.filters.country, countryMapping);
                return (d.properties.name === geoJSONCountryName) ? '#000' : '#fff';
            }
            return '#fff';
        })
        .attr('stroke-width', function(d) {
            // Thicker border for selected country
            if (dashboardState.filters.country !== "all") {
                const geoJSONCountryName = getGeoJSONCountryName(dashboardState.filters.country, countryMapping);
                return (d.properties.name === geoJSONCountryName) ? 1.5 : 0.5;
            }
            return 0.5;
        });
    
    // Update legend
    createMapLegend(maxPlayers);
    
    // Update selected country reference
    if (dashboardState.filters.country !== "all") {
        worldMap.selectedCountry = getGeoJSONCountryName(dashboardState.filters.country, countryMapping);
    } else {
        worldMap.selectedCountry = null;
    }
}        