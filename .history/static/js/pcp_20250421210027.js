// Global variables for PCP
let pcp = {
    svg: null,
    width: 0,
    height: 0,
    margin: { top: 30, right: 50, bottom: 30, left: 50 },
    axes: [],
    tooltip: null,
    dimensions: [
        'player_overall', 
        'pace', 
        'shooting', 
        'passing', 
        'dribbling', 
        'defending', 
        'physic'
    ],
    colorScale: d3.scaleOrdinal(d3.schemeCategory10),
    highlightedPlayerId: null,
    clubMode: false  // Flag to toggle between player view and club average view
};

// Initialize the parallel coordinates plot
function initializePCP() {
    // Set dimensions
    const container = document.getElementById('pcp');
    pcp.width = container.clientWidth - pcp.margin.left - pcp.margin.right;
    pcp.height = container.clientHeight - pcp.margin.top - pcp.margin.bottom;
    
    // Create SVG
    pcp.svg = d3.select('#pcp')
        .append('svg')
        .attr('width', pcp.width + pcp.margin.left + pcp.margin.right)
        .attr('height', pcp.height + pcp.margin.top + pcp.margin.bottom)
        .append('g')
        .attr('transform', `translate(${pcp.margin.left},${pcp.margin.top})`);
    
    // Create tooltip
    pcp.tooltip = createTooltip();
    
    // Create scales for each dimension
    pcp.scales = {};
    pcp.dimensions.forEach(dimension => {
        pcp.scales[dimension] = d3.scaleLinear()
            .range([pcp.height, 0]);
    });
    
    // Create axes for each dimension
    pcp.axes = pcp.dimensions.map((dimension, i) => {
        const x = i * (pcp.width / (pcp.dimensions.length - 1));
        
        return {
            dimension: dimension,
            x: x,
            scale: pcp.scales[dimension]
        };
    });
    
    // Add toggle for club mode
    addPCPControls();
    
    // Initial render
    updatePCP(globalData.players);
}

// Add controls for PCP
function addPCPControls() {
    // Add control container
    const controlContainer = d3.select('#pcp-container')
        .append('div')
        .attr('class', 'pcp-controls')
        .style('position', 'absolute')
        .style('top', '10px')
        .style('right', '10px')
        .style('z-index', '10');
    
    // Add toggle button for club mode
    controlContainer.append('button')
        .attr('id', 'toggle-pcp-mode')
        .attr('class', 'pcp-control-button')
        .style('padding', '5px 10px')
        .style('border-radius', '4px')
        .style('background-color', '#0f53a6')
        .style('color', 'white')
        .style('border', 'none')
        .style('cursor', 'pointer')
        .text('Show Club Averages')
        .on('click', function() {
            pcp.clubMode = !pcp.clubMode;
            this.textContent = pcp.clubMode ? 'Show Players' : 'Show Club Averages';
            
            if (pcp.clubMode) {
                updatePCP(globalData.clubs);
            } else {
                updatePCP(filterData());
            }
        });
    
    // Add dimension selector
    controlContainer.append('select')
        .attr('id', 'pcp-dimension-selector')
        .style('margin-left', '10px')
        .style('padding', '5px')
        .style('border-radius', '4px')
        .style('border', '1px solid #ccc')
        .on('change', function() {
            // Update dimensions based on selection
            const dimension = this.value;
            
            // Check if dimension is already included
            const index = pcp.dimensions.indexOf(dimension);
            
            if (index === -1) {
                // Add new dimension - replace the last non-essential dimension
                const essentialDimensions = ['player_overall', 'pace', 'shooting'];
                
                for (let i = pcp.dimensions.length - 1; i >= 0; i--) {
                    if (!essentialDimensions.includes(pcp.dimensions[i])) {
                        pcp.dimensions[i] = dimension;
                        break;
                    }
                }
            }
            
            // Update PCP with new dimensions
            if (pcp.clubMode) {
                updatePCP(globalData.clubs);
            } else {
                updatePCP(filterData());
            }
        })
        .selectAll('option')
        .data([
            'player_overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
            'age', 'height_cm', 'weight_kg', 'value_millions_eur', 'wage_thousands_eur', 
            'potential', 'skill_moves', 'weak_foot', 'international_reputation'
        ])
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => {
            // Convert camelCase to Title Case with spaces
            return d.split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
        });
}

// Format dimension name for display
function formatDimensionName(dimension) {
    return dimension.split('_')
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                   .join(' ');
}

// Update the PCP with new data
function updatePCP(data) {
    // Clear existing elements
    pcp.svg.selectAll('*').remove();
    
    // Update scales for each dimension
    pcp.dimensions.forEach(dimension => {
        const extent = d3.extent(data, d => +d[dimension]);
        pcp.scales[dimension].domain(extent);
    });
    
    // Update axes positions
    pcp.axes = pcp.dimensions.map((dimension, i) => {
        const x = i * (pcp.width / (pcp.dimensions.length - 1));
        
        return {
            dimension: dimension,
            x: x,
            scale: pcp.scales[dimension]
        };
    });
    
    // Create axes
    pcp.axes.forEach(axis => {
        // Create axis
        const axisFunction = d3.axisLeft(axis.scale);
        
        // Add axis
        const axisGroup = pcp.svg.append('g')
            .attr('transform', `translate(${axis.x},0)`)
            .attr('class', 'pcp-axis')
            .call(axisFunction);
        
        // Add axis label
        axisGroup.append('text')
            .attr('y', -15)
            .attr('x', 0)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(formatDimensionName(axis.dimension));
        
        // Add drag behavior for axis reordering
        axisGroup.call(d3.drag()
            .subject(() => ({ x: axis.x }))
            .on('drag', function(event) {
                const currentX = event.x;
                
                // Find closest position
                const closest = pcp.axes.reduce((a, b) => {
                    return Math.abs(b.x - currentX) < Math.abs(a.x - currentX) ? b : a;
                });
                
                // Swap dimensions
                if (closest !== axis) {
                    const closestIndex = pcp.dimensions.indexOf(closest.dimension);
                    const currentIndex = pcp.dimensions.indexOf(axis.dimension);
                    
                    [pcp.dimensions[closestIndex], pcp.dimensions[currentIndex]] = 
                    [pcp.dimensions[currentIndex], pcp.dimensions[closestIndex]];
                    
                    // Update PCP
                    updatePCP(data);
                }
            }));
    });
    
    // Add grid lines
    pcp.axes.forEach(axis => {
        pcp.svg.append('g')
            .attr('class', 'pcp-grid')
            .attr('transform', `translate(${axis.x},0)`)
            .call(d3.axisLeft(axis.scale)
                .tickSize(-5)
                .tickFormat(''))
            .call(g => g.select('.domain').remove());
    });
    
    // Create a line generator for polylines
    const line = d3.line()
        .defined(d => d !== null)
        .x(d => d.x)
        .y(d => d.y);
    
    // Group data by position or club for coloring
    const groupKey = pcp.clubMode ? 'league_name' : 'player_positions';
    
    // Extract unique groups for color assignment
    const groups = [...new Set(data.map(d => d[groupKey]))];
    
    // Get selected group
    const selectedGroup = pcp.clubMode ? dashboardState.filters.league : dashboardState.filters.position;
    
    // Add polylines for each data point
    pcp.svg.selectAll('.pcp-line')
        .data(data)
        .enter()
        .append('path')
        .attr('class', 'pcp-line')
        .attr('d', d => {
            // Create points for each dimension
            const points = pcp.axes.map(axis => {
                const value = +d[axis.dimension];
                
                // Handle missing values
                if (isNaN(value)) {
                    return null;
                }
                
                return {
                    x: axis.x,
                    y: axis.scale(value)
                };
            });
            
            return line(points);
        })
        .attr('fill', 'none')
        .attr('stroke', d => {
            // Color by group
            const group = d[groupKey];
            
            // If there's a filter active, highlight matching items
            if (selectedGroup !== 'all' && group.includes(selectedGroup)) {
                return '#f4b223'; // Highlight color
            }
            
            // Use color scale for normal coloring
            return pcp.colorScale(group.split(',')[0]);
        })
        .attr('stroke-width', d => {
            // Highlight selected player or club
            if (pcp.highlightedPlayerId && d.player_id === pcp.highlightedPlayerId) {
                return 3;
            }
            
            // If there's a filter active, make matching items thicker
            if (selectedGroup !== 'all' && d[groupKey].includes(selectedGroup)) {
                return 2;
            }
            
            return 1;
        })
        .attr('opacity', d => {
            // If there's a highlighted player/club, fade others
            if (pcp.highlightedPlayerId && d.player_id !== pcp.highlightedPlayerId) {
                return 0.2;
            }
            
            // If there's a filter active, fade non-matching items
            if (selectedGroup !== 'all' && !d[groupKey].includes(selectedGroup)) {
                return 0.2;
            }
            
            return 0.7;
        })
        .on('mouseover', function(event, d) {
            // Highlight this path
            d3.select(this)
                .attr('stroke-width', 3)
                .attr('opacity', 1);
            
            // Show tooltip
            let tooltipContent = '';
            
            if (pcp.clubMode) {
                tooltipContent = `
                    <strong>${d.club_name}</strong><br>
                    ${d.league_name}<br>
                    Players: ${d.num_players}<br>
                    Overall: ${d.player_overall.toFixed(1)}
                `;
            } else {
                tooltipContent = `
                    <strong>${d.short_name}</strong><br>
                    ${d.club_name}<br>
                    ${d.player_positions}<br>
                    Overall: ${d.player_overall}
                `;
            }
            
            pcp.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            
            pcp.tooltip.html(tooltipContent)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            // Reset styling
            d3.select(this)
                .attr('stroke-width', d => {
                    if (pcp.highlightedPlayerId && d.player_id === pcp.highlightedPlayerId) {
                        return 3;
                    }
                    
                    if (selectedGroup !== 'all' && d[groupKey].includes(selectedGroup)) {
                        return 2;
                    }
                    
                    return 1;
                })
                .attr('opacity', d => {
                    if (pcp.highlightedPlayerId && d.player_id !== pcp.highlightedPlayerId) {
                        return 0.2;
                    }
                    
                    if (selectedGroup !== 'all' && !d[groupKey].includes(selectedGroup)) {
                        return 0.2;
                    }
                    
                    return 0.7;
                });
            
            // Hide tooltip
            pcp.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            if (!pcp.clubMode && d.player_id) {
                // Select this player
                selectPlayer(d);
            }
        });
    
    // Add legend
    addPCPLegend(groups);
}

// Add legend for PCP
function addPCPLegend(groups) {
    // Limit to top N groups to avoid overcrowding
    const topGroups = groups.slice(0, 10);
    
    // Create legend container
    const legend = pcp.svg.append('g')
        .attr('class', 'pcp-legend')
        .attr('transform', `translate(${pcp.width - 150}, 0)`);
    
    // Add background
    legend.append('rect')
        .attr('width', 150)
        .attr('height', topGroups.length * 20 + 25)
        .attr('fill', 'white')
        .attr('opacity', 0.7)
        .attr('rx', 5)
        .attr('ry', 5);
    
    // Add title
    legend.append('text')
        .attr('x', 10)
        .attr('y', 15)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(pcp.clubMode ? 'Leagues' : 'Positions');
    
    // Add legend items
    topGroups.forEach((group, i) => {
        // Create group for legend item
        const item = legend.append('g')
            .attr('transform', `translate(10, ${i * 20 + 30})`)
            .style('cursor', 'pointer')
            .on('click', function() {
                // Update filter based on legend item
                if (pcp.clubMode) {
                    if (dashboardState.filters.league === group) {
                        dashboardState.filters.league = 'all';
                    } else {
                        dashboardState.filters.league = group;
                    }
                    document.getElementById('league-selector').value = dashboardState.filters.league;
                } else {
                    if (dashboardState.filters.position === group) {
                        dashboardState.filters.position = 'all';
                    } else {
                        dashboardState.filters.position = group;
                    }
                    document.getElementById('position-selector').value = dashboardState.filters.position;
                }
                
                // Update UI
                updateSelectionDetails();
                
                // Update visualizations
                updateAllVisualizations();
            });
        
        // Add color swatch
        item.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', pcp.colorScale(group.split(',')[0]));
        
        // Add label
        item.append('text')
            .attr('x', 15)
            .attr('y', 9)
            .style('font-size', '10px')
            .text(group.split(',')[0]);
    });
    
    // Add "more" indicator if there are more groups
    if (groups.length > topGroups.length) {
        legend.append('text')
            .attr('x', 10)
            .attr('y', topGroups.length * 20 + 30)
            .style('font-size', '10px')
            .style('font-style', 'italic')
            .text(`+ ${groups.length - topGroups.length} more...`);
    }
}

// Highlight a specific player in the PCP
function highlightPlayerInPCP(playerId) {
    pcp.highlightedPlayerId = playerId;
    
    // Update visualization with current data
    if (pcp.clubMode) {
        updatePCP(globalData.clubs);
    } else {
        updatePCP(filterData());
    }
}