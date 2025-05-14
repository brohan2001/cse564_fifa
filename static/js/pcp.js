// Global variables for PCP
let pcp = {
    svg: null,
    svgContainer: null,
    container: null,
    width: 0,
    height: 0,
    margin: { top: 20, right: 40, bottom: 30, left: 40 },
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
    clubMode: false,
    sampleMode: false,
    sampleSize: 100,
    positionGroups: {
        "GK": "Goalkeeper",
        "CB": "Defender", 
        "LB": "Defender", 
        "RB": "Defender", 
        "LWB": "Defender", 
        "RWB": "Defender",
        "CDM": "Midfielder", 
        "CM": "Midfielder", 
        "CAM": "Midfielder", 
        "LM": "Midfielder", 
        "RM": "Midfielder",
        "LW": "Attacker", 
        "RW": "Attacker", 
        "CF": "Attacker", 
        "ST": "Attacker"
    },
    minHeight: 300,
    legendHeight: 60,
    axisFilters: {},
    globalScales: {},
    isBrushing: false
};

// Initialize the parallel coordinates plot
function initializePCP() {
    
    try {
        pcp.container = document.getElementById('pcp');
        if (pcp.container.style.minHeight === '') {
            pcp.container.style.minHeight = pcp.minHeight + 'px';
        }
        
        updateDimensions();
        
        pcp.svgContainer = d3.select('#pcp')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('preserveAspectRatio', 'xMinYMin meet');
        
        pcp.svg = pcp.svgContainer
            .append('g')
            .attr('transform', `translate(${pcp.margin.left},${pcp.margin.top})`);
        
        pcp.tooltip = createTooltip();
        
        pcp.scales = {};
        pcp.dimensions.forEach(dimension => {
            pcp.scales[dimension] = d3.scaleLinear();
        });
        
        addPCPControls();
        
        window.addEventListener('resize', function() {
            updateDimensions();
            updatePCP(pcp.clubMode ? globalData.clubs : filterData());
        });
        
        const resizeObserver = new ResizeObserver(entries => {
            updateDimensions();
            updatePCP(pcp.clubMode ? globalData.clubs : filterData());
        });
        
        resizeObserver.observe(pcp.container);
        
        updatePCP(globalData.players);
    } catch (error) {
        console.error("Error initializing PCP:", error);
    }
}

// Update dimensions based on container size
function updateDimensions() {
    try {
        const containerRect = pcp.container.getBoundingClientRect();
        pcp.width = Math.max(500, containerRect.width - pcp.margin.left - pcp.margin.right); // Ensure minimum width
        let availableHeight = Math.max(containerRect.height, pcp.minHeight);
        pcp.height = Math.max(150, availableHeight - pcp.margin.top - pcp.margin.bottom - pcp.legendHeight); // Ensure minimum height
        
        const totalWidth = pcp.width + pcp.margin.left + pcp.margin.right;
        const totalHeight = pcp.height + pcp.margin.top + pcp.margin.bottom + pcp.legendHeight;
        
        if (pcp.svgContainer) {
            pcp.svgContainer
                .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
                .attr('width', totalWidth)
                .attr('height', totalHeight);
        }
    } catch (error) {
        console.error("Error updating dimensions:", error);
    }
}

// Add controls for PCP
function addPCPControls() {
    try {
        const controlContainer = d3.select('#pcp-container')
            .append('div')
            .attr('class', 'pcp-controls')
            .style('position', 'absolute')
            .style('bottom', '10px')
            .style('left', '10px')
            .style('right', '10px')
            .style('z-index', '10')
            .style('display', 'flex')
            .style('flex-direction', 'row')
            .style('justify-content', 'space-between')
            .style('align-items', 'center')
            .style('background-color', 'rgba(255,255,255,0.8)')
            .style('padding', '5px')
            .style('border-radius', '4px');
        
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
            .style('margin-right', '5px')
            .text('Show Club Averages')
            .on('click', function() {
                pcp.clubMode = !pcp.clubMode;
                this.textContent = pcp.clubMode ? 'Show Players' : 'Show Club Averages';
                
                // Reset highlight when changing views
                if (!pcp.isBrushing) {
                    pcp.highlightedPlayerId = null;
                }
                
                if (pcp.clubMode) {
                    updatePCP(globalData.clubs);
                } else {
                    updatePCP(filterData());
                }
            });
            
        // Add sample toggle button
        controlContainer.append('button')
            .attr('id', 'toggle-pcp-sample')
            .attr('class', 'pcp-control-button')
            .style('padding', '5px 10px')
            .style('border-radius', '4px')
            .style('background-color', '#666')
            .style('color', 'white')
            .style('border', 'none')
            .style('cursor', 'pointer')
            .text('Sample 100 Lines')
            .on('click', function() {
                pcp.sampleMode = !pcp.sampleMode;
                this.textContent = pcp.sampleMode ? 'Show All Lines' : 'Sample 100 Lines';
                this.style.backgroundColor = pcp.sampleMode ? '#32cd32' : '#666';
                
                // Reset highlight when changing sampling
                if (!pcp.isBrushing) {
                    pcp.highlightedPlayerId = null;
                }
                
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
                const dimension = this.value;
                const index = pcp.dimensions.indexOf(dimension);
                
                if (index === -1) {
                    const essentialDimensions = ['player_overall', 'pace', 'shooting'];
                    
                    for (let i = pcp.dimensions.length - 1; i >= 0; i--) {
                        if (!essentialDimensions.includes(pcp.dimensions[i])) {
                            pcp.dimensions[i] = dimension;
                            break;
                        }
                    }
                }
                
                // Reset axis filters when changing dimensions
                pcp.axisFilters = {};
                
                // Reset highlight when changing dimensions
                if (!pcp.isBrushing) {
                    pcp.highlightedPlayerId = null;
                }
                
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
                // Special case for player_overall
                if (d === 'player_overall') {
                    return 'Overall';
                }
                
                // Standard handling for all other dimensions
                return d.split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
            });
        
        // Add a "Reset Filters" button for axis filters
        controlContainer.append('button')
            .attr('id', 'reset-axis-filters')
            .attr('class', 'pcp-control-button')
            .style('padding', '5px 10px')
            .style('border-radius', '4px')
            .style('background-color', '#f44336')
            .style('color', 'white')
            .style('border', 'none')
            .style('cursor', 'pointer')
            .style('margin-left', '10px')
            .text('Reset Axis Filters')
            .on('click', function() {
                pcp.axisFilters = {};
                
                // Reset highlight when clearing filters
                if (!pcp.isBrushing) {
                    pcp.highlightedPlayerId = null;
                }
                
                // Update visualization
                if (pcp.clubMode) {
                    updatePCP(globalData.clubs);
                } else {
                    updatePCP(filterData());
                }
                
                // Update other visualizations
                updateAllVisualizations();
            });
    } catch (error) {
        console.error("Error adding PCP controls:", error);
    }
}

// Format dimension name for display
// function formatDimensionName(dimension) {
//     return dimension.split('_')
//                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//                    .join(' ');
// }
function formatDimensionName(dimension) {
    if (dimension === 'player_overall') {
        return 'Overall';
    }
    return dimension.split('_')
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                   .join(' ');
}
// Map position to group
function mapPositionToGroup(position) {
    if (!position) return "Unknown";
    const primaryPosition = position.split(',')[0].trim();
    return pcp.positionGroups[primaryPosition] || "Unknown";
}

// Initialize global scales with the full dataset to keep fixed scales
function initializeGlobalScales(fullData) {
    try {
        pcp.dimensions.forEach(dimension => {
            const extent = d3.extent(fullData, d => {
                const val = +d[dimension];
                return isNaN(val) ? 0 : val; // Handle NaN values
            });
            
            // Add default fallbacks in case of invalid data
            const validMin = isFinite(extent[0]) ? extent[0] : 0;
            const validMax = isFinite(extent[1]) ? extent[1] : 100;
            
            const range = validMax - validMin;
            const padding = range * 0.05;
            
            pcp.globalScales[dimension] = [
                Math.max(0, validMin - padding),
                validMax + padding
            ];
        });
    } catch (error) {
        console.error("Error initializing global scales:", error);
        // Set default scales as fallback
        pcp.dimensions.forEach(dimension => {
            pcp.globalScales[dimension] = [0, 100];
        });
    }
}

// Apply axis filters to the data
function applyAxisFilters(data) {
    if (Object.keys(pcp.axisFilters).length === 0) {
        return data;
    }
    
    try {
        return data.filter(d => {
            for (const [dimension, range] of Object.entries(pcp.axisFilters)) {
                const value = +d[dimension];
                if (isNaN(value)) continue;
                if (value < range[0] || value > range[1]) {
                    return false;
                }
            }
            return true;
        });
    } catch (error) {
        console.error("Error applying axis filters:", error);
        return data;
    }
}
// Modify the createAxisBrush function to improve performance
function createAxisBrush(axis, dimension) {
    try {
        let brushTimeout = null;
        let pendingUpdate = false;
        const opacityTransition = 100; // Shorter transition for better performance
        
        const brush = d3.brushY()
            .extent([[-10, 0], [10, pcp.height]])
            .on('start', function(event) {
                if (brushTimeout) clearTimeout(brushTimeout);
                pcp.isBrushing = true;
                
                if (event.sourceEvent && event.sourceEvent.stopPropagation) {
                    event.sourceEvent.stopPropagation();
                }
            })
            .on('brush', function(event) {
                if (!event.selection) return;
                
                const [y0, y1] = event.selection;
                if (isNaN(y0) || isNaN(y1)) return;
                
                const range = [
                    axis.scale.invert(y1),
                    axis.scale.invert(y0)
                ];
                
                if (isNaN(range[0]) || isNaN(range[1])) return;
                
                // PERFORMANCE: Use CSS classes instead of direct attribute manipulation
                pcp.svg.selectAll('.pcp-line').each(function(d) {
                    const value = +d[dimension];
                    const visible = (value >= range[0] && value <= range[1]);
                    d3.select(this)
                        .classed('dimmed', !visible);
                });
            })
            .on('end', function(event) {
                try {
                    // Update the filter state
                    if (!event.selection) {
                        delete pcp.axisFilters[dimension];
                        pendingUpdate = true;
                    } else {
                        const [y0, y1] = event.selection;
                        if (!isNaN(y0) && !isNaN(y1)) {
                            const val1 = axis.scale.invert(y1);
                            const val2 = axis.scale.invert(y0);
                            
                            if (!isNaN(val1) && !isNaN(val2)) {
                                pcp.axisFilters[dimension] = [val1, val2];
                                pendingUpdate = true;
                            }
                        }
                    }
                    
                    // PERFORMANCE: Use a longer delay before full redraw
                    if (brushTimeout) clearTimeout(brushTimeout);
                    
                    // Update filter feedback immediately (lightweight)
                    updateFilterFeedback();
                    
                    // Delay the heavy operations
                    brushTimeout = setTimeout(() => {
                        // PERFORMANCE: Only redraw PCP if we have axis filters
                        if (Object.keys(pcp.axisFilters).length > 0) {
                            // Apply the filters without full redraw
                            applyFiltersWithoutRedraw();
                        } else {
                            // Do a full redraw only when clearing all filters
                            const baseData = pcp.clubMode ? globalData.clubs : filterData();
                            updatePCP(baseData);
                        }
                        
                        // Further delay updates to other visualizations
                        setTimeout(() => {
                            updateAllVisualizations();
                        }, 300);
                        
                        pcp.isBrushing = false;
                    }, 400);
                    
                } catch (error) {
                    console.error("Error in brush end event:", error);
                    pcp.isBrushing = false;
                }
            });
        
        return brush;
    } catch (error) {
        console.error("Error creating axis brush:", error);
        return d3.brushY();
    }
}

// Add this new function to apply filters without full redraw
function applyFiltersWithoutRedraw() {
    try {
        // Get the data that should be displayed
        const baseData = pcp.clubMode ? globalData.clubs : filterData();
        const filteredData = applyAxisFilters(baseData);
        
        // Create a Set of IDs for O(1) lookups
        const filteredIds = new Set();
        filteredData.forEach(d => {
            if (d.player_id) filteredIds.add(d.player_id);
        });
        
        // Update visibility of existing lines
        pcp.svg.selectAll('.pcp-line')
            .classed('filtered-out', d => !filteredIds.has(d.player_id))
            .classed('dimmed', false);
        
        // Show filter notice
        pcp.svg.select('.filter-notice').remove();
        if (Object.keys(pcp.axisFilters).length > 0) {
            addAxisFilterNotice();
        }
        
    } catch (error) {
        console.error("Error applying filters without redraw:", error);
    }
}
// Add this new function to apply filters without full redraw
function applyFiltersWithoutRedraw() {
    try {
        // Get the data that should be displayed
        const baseData = pcp.clubMode ? globalData.clubs : filterData();
        const filteredData = applyAxisFilters(baseData);
        
        // Create a Set of IDs for O(1) lookups
        const filteredIds = new Set();
        filteredData.forEach(d => {
            if (d.player_id) filteredIds.add(d.player_id);
        });
        
        // Update visibility of existing lines
        pcp.svg.selectAll('.pcp-line')
            .classed('filtered-out', d => !filteredIds.has(d.player_id))
            .classed('dimmed', false);
        
        // Show filter notice
        pcp.svg.select('.filter-notice').remove();
        if (Object.keys(pcp.axisFilters).length > 0) {
            addAxisFilterNotice();
        }
        
    } catch (error) {
        console.error("Error applying filters without redraw:", error);
    }
}
// Update visual feedback for active filters
function updateFilterFeedback() {
    try {
        pcp.axes.forEach(axis => {
            const dimension = axis.dimension;
            const axisGroup = pcp.svg.select(`.axis-group-${dimension.replace(/[^a-zA-Z0-9]/g, '_')}`);
            
            if (!axisGroup.empty() && pcp.axisFilters[dimension]) {
                let indicator = axisGroup.select('.filter-indicator');
                
                if (indicator.empty()) {
                    indicator = axisGroup.append('rect')
                        .attr('class', 'filter-indicator')
                        .attr('x', -15)
                        .attr('width', 30)
                        .attr('fill', 'rgba(255, 165, 0, 0.2)')
                        .attr('stroke', 'orange')
                        .attr('stroke-width', 1)
                        .attr('rx', 2)
                        .attr('ry', 2);
                }
                
                const range = pcp.axisFilters[dimension];
                if (!range || isNaN(range[0]) || isNaN(range[1])) return;
                
                const y1 = axis.scale(range[0]);
                const y2 = axis.scale(range[1]);
                
                if (!isNaN(y1) && !isNaN(y2)) {
                    indicator
                        .attr('y', y2)
                        .attr('height', Math.max(0, y1 - y2));
                }
                
                axisGroup.select('.axis-title')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'orange');
            } else if (!axisGroup.empty()) {
                axisGroup.select('.filter-indicator').remove();
                
                axisGroup.select('.axis-title')
                    .attr('font-weight', 'normal')
                    .attr('fill', '#333');
            }
        });
    } catch (error) {
        console.error("Error updating filter feedback:", error);
    }
}

// // Line generator with defensive check for invalid points
// function createLineGenerator() {
//     return d => {
//         try {
//             const points = pcp.axes.map(axis => {
//                 const value = +d[axis.dimension];
                
//                 if (isNaN(value)) return null;
                
//                 const yPos = axis.scale(value);
//                 if (isNaN(yPos)) return null;
                
//                 return {
//                     x: axis.x,
//                     y: Math.min(Math.max(yPos, 0), pcp.height)
//                 };
//             }).filter(point => point !== null && 
//                      !isNaN(point.x) && 
//                      !isNaN(point.y) && 
//                      point.x !== undefined && 
//                      point.y !== undefined);
            
//             if (points.length < 2) return "";
            
//             // Safety check for valid coordinates
//             const validPoints = points.every(p => 
//                 isFinite(p.x) && isFinite(p.y) && 
//                 !isNaN(p.x) && !isNaN(p.y));
            
//             if (!validPoints) return "";

//             return d3.line()
//                 .x(d => d.x)
//                 .y(d => d.y)
//                 .curve(d3.curveCardinal.tension(0.6))(points);
//         } catch (error) {
//             console.error("Error generating line path:", error);
//             return "";
//         }
//     };
// }
// Optimize the line generator further
function createLineGenerator() {
    // Create line function outside of return to avoid recreation on each call
    const lineFunc = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCardinal.tension(0.2));
    
    // Create a memoization cache to avoid recalculating paths for the same data
    const pathCache = new Map();
    
    return d => {
        try {
            if (!d) return "";
            
            // Use player_id as cache key if available, otherwise use stringified data
            const cacheKey = d.player_id || JSON.stringify(d);
            
            // Return cached path if exists
            if (pathCache.has(cacheKey)) {
                return pathCache.get(cacheKey);
            }
            
            const points = [];
            for (const axis of pcp.axes) {
                if (!axis || !axis.dimension) continue;
                
                const value = +d[axis.dimension];
                if (isNaN(value)) continue;
                
                const yPos = axis.scale(value);
                if (isNaN(yPos)) continue;
                
                points.push({
                    x: axis.x,
                    y: Math.min(Math.max(yPos, 0), pcp.height)
                });
            }
            
            if (points.length < 2) return "";
            
            const path = lineFunc(points);
            
            // Cache the result
            pathCache.set(cacheKey, path);
            
            return path;
        } catch (error) {
            return "";
        }
    };
}
// Update the PCP with new data
function updatePCP(data) {
    try {
        // First time with full data, initialize global scales
        if (!pcp.globalScales[pcp.dimensions[0]]) {
            initializeGlobalScales(data);
        }
        
        updateDimensions();
        pcp.svg.selectAll('*').remove();
        
        // Apply random sampling if enabled
        let displayData = data || [];
        if (displayData.length === 0) {
            // Show empty state message
            pcp.svg.append('text')
                .attr('x', pcp.width / 2)
                .attr('y', pcp.height / 2)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('fill', '#666')
                .text('No data available');
            return;
        }
        
        if (pcp.sampleMode && displayData.length > pcp.sampleSize) {
            const dataArray = [...displayData];
            
            for (let i = dataArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dataArray[i], dataArray[j]] = [dataArray[j], dataArray[i]];
            }
            
            displayData = dataArray.slice(0, pcp.sampleSize);
        }
        
        // Apply axis filters
        const filteredData = applyAxisFilters(displayData);
        
        // Safety check for dimensions
        if (pcp.dimensions.length === 0) {
            pcp.dimensions = ['player_overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'];
        }
        
        // Update scales for each dimension using FIXED GLOBAL SCALES
        pcp.dimensions.forEach(dimension => {
            const scale = pcp.scales[dimension] || d3.scaleLinear();
            const domain = pcp.globalScales[dimension] || [0, 100];
            
            // Validate domain values
            const validDomain = [
                isFinite(domain[0]) ? domain[0] : 0,
                isFinite(domain[1]) ? domain[1] : 100
            ];
            
            scale.domain(validDomain).range([pcp.height, 0]);
            pcp.scales[dimension] = scale;
        });
        
        // Space axes evenly
        pcp.axes = pcp.dimensions.map((dimension, i) => {
            const x = i * (pcp.width / Math.max(1, pcp.dimensions.length - 1));
            return {
                dimension: dimension,
                x: x,
                scale: pcp.scales[dimension]
            };
        });
        
        // Create axes with brushes
        pcp.axes.forEach(axis => {
            const dimension = axis.dimension;
            
            // Create axis group
            const axisGroup = pcp.svg.append('g')
                .attr('class', `axis-group-${dimension.replace(/[^a-zA-Z0-9]/g, '_')} pcp-axis`)
                .attr('transform', `translate(${axis.x},0)`);
            
            // Add axis
            axisGroup.call(d3.axisLeft(axis.scale));
            
            // Add axis label
            // axisGroup.append('text')
            //     .attr('class', 'axis-title')
            //     .attr('y', -10)
            //     .attr('x', 0)
            //     .attr('text-anchor', 'middle')
            //     .attr('fill', '#333')
            //     .style('font-size', '12px')
            //     .style('font-weight', 'bold')
            //     .text(formatDimensionName(dimension));
            axisGroup.append('text')
    .attr('class', 'axis-title')
    .attr('y', -10)
    .attr('x', function() {
        // Handle special positioning for first and last labels
        const index = pcp.dimensions.indexOf(dimension);
        if (index === 0) return -5; // Shift first label right/ Shift last label left
        return 0; // Keep middle labels centered
    })
    .attr('text-anchor', function() {
        // Adjust text anchor for edge labels
        const index = pcp.dimensions.indexOf(dimension);
        if (index === 0) return 'start'; // Left-align first label
        if (index === pcp.dimensions.length - 1) return 'end'; // Right-align last label
        return 'middle'; // Center middle labels
    })
    .attr('fill', '#333')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text(formatDimensionName(dimension));
            // Add brush for axis filtering - only if not in club mode
            if (!pcp.clubMode) {
                const brush = createAxisBrush(axis, dimension);
                
                // Create brush group and apply brush
                const brushGroup = axisGroup.append('g')
                    .attr('class', 'axis-brush')
                    .call(brush);
                
                // If there's an active filter for this dimension, set brush position
                if (pcp.axisFilters[dimension]) {
                    const range = pcp.axisFilters[dimension];
                    
                    // Validate brush values before applying
                    if (Array.isArray(range) && range.length === 2 && 
                        !isNaN(range[0]) && !isNaN(range[1]) &&
                        !isNaN(axis.scale(range[0])) && !isNaN(axis.scale(range[1]))) {
                        
                        brushGroup.call(brush.move, [
                            axis.scale(range[1]),
                            axis.scale(range[0])
                        ]);
                    }
                }
                
                // Style brush handles
                brushGroup.selectAll('.handle')
                    .attr('fill', '#666')
                    .attr('stroke', '#000')
                    .attr('stroke-width', 1);
                
                // Style brush selection
                brushGroup.selectAll('.selection')
                    .attr('fill', 'rgba(255, 165, 0, 0.2)')
                    .attr('stroke', 'orange')
                    .attr('stroke-width', 1);
            }
            
            // Add drag behavior for axis reordering
            // In the updatePCP function, where you add drag behavior:

            // Add drag behavior for axis reordering
            axisGroup.call(d3.drag()
                .subject(() => ({ x: axis.x }))
                .on('start', function(event) {
                    // Only allow drag to start if we're not currently brushing
                    if (pcp.isBrushing) {
                        event.sourceEvent.stopPropagation();
                        return;
                    }
                })
                .on('drag', function(event) {
                    // Skip drag events during or immediately after brushing
                    if (pcp.isBrushing) return;
                    
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
                        setTimeout(() => {
                            updatePCP(data);
                        }, 0);
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
        
        // Create line generator
        const lineGenerator = createLineGenerator();
        
        // Group data by position group or league for coloring
        const groupKey = pcp.clubMode ? 'league_name' : 'player_positions';
        
        // Extract unique groups for color assignment
        let groups;
        
        if (pcp.clubMode) {
            groups = [...new Set(data.map(d => d[groupKey] || "Unknown").filter(g => g))];
        } else {
            groups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
            
            const positionColors = {
                "Goalkeeper": "#ff9e00", // Orange
                "Defender": "#4169e1",   // Royal Blue
                "Midfielder": "#32cd32", // Lime Green
                "Attacker": "#dc143c"    // Crimson
            };
            
            groups.forEach(group => {
                pcp.colorScale(group);
            });
            
            Object.entries(positionColors).forEach(([group, color]) => {
                pcp.colorScale.domain().forEach((d, i) => {
                    if (d === group) {
                        pcp.colorScale.range()[i] = color;
                    }
                });
            });
        }
        
        // Get selected group
        const selectedGroup = pcp.clubMode ? dashboardState.filters.league : dashboardState.filters.position;
        const selectedPositionGroup = !pcp.clubMode && selectedGroup !== 'all' 
            ? mapPositionToGroup(selectedGroup) 
            : null;
        
        // Handle empty data case
        if (filteredData.length === 0) {
            pcp.svg.append('text')
                .attr('x', pcp.width / 2)
                .attr('y', pcp.height / 2)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('fill', '#666')
                .text('No data matches the current filters');
        } else {
            // Add polylines for each data point
            pcp.svg.selectAll('.pcp-line')
                .data(filteredData)
                .enter()
                .append('path')
                .attr('class', 'pcp-line')
                .attr('d', d => {
                    const path = lineGenerator(d);
                    return path || ""; // Ensure we never return undefined or null
                })
                .attr('fill', 'none')
                .attr('stroke', d => {
                    try {
                        if (pcp.clubMode) {
                            const group = d[groupKey] || "Unknown";
                            return pcp.colorScale(group);
                        } else {
                            const position = d[groupKey] || "";
                            const positionGroup = mapPositionToGroup(position);
                            return pcp.colorScale(positionGroup);
                        }
                    } catch (error) {
                        console.error("Error assigning stroke color:", error);
                        return "#999"; // Default color as fallback
                    }
                })
                .attr('stroke-width', d => {
                    try {
                        if (pcp.highlightedPlayerId && d.player_id === pcp.highlightedPlayerId) {
                            return 3;
                        }
                        
                        if (pcp.clubMode) {
                            if (selectedGroup !== 'all' && d[groupKey] === selectedGroup) {
                                return 2;
                            }
                        } else {
                            const position = d[groupKey] || "";
                            const positionGroup = mapPositionToGroup(position);
                            
                            if (selectedPositionGroup && positionGroup === selectedPositionGroup) {
                                return 2;
                            }
                            
                            if (selectedGroup !== 'all' && position && position.includes(selectedGroup)) {
                                return 2;
                            }
                        }
                        
                        return 1;
                    } catch (error) {
                        console.error("Error assigning stroke width:", error);
                        return 1; // Default width as fallback
                    }
                })
                .attr('opacity', d => {
                    try {
                        if (pcp.highlightedPlayerId && d.player_id !== pcp.highlightedPlayerId) {
                            return 0.2;
                        }
                        
                        if (pcp.clubMode) {
                            if (selectedGroup !== 'all' && d[groupKey] !== selectedGroup) {
                                return 0.2;
                            }
                        } else {
                            const position = d[groupKey] || "";
                            const positionGroup = mapPositionToGroup(position);
                            
                            if (selectedPositionGroup && positionGroup !== selectedPositionGroup) {
                                return 0.2;
                            }
                            
                            if (selectedGroup !== 'all' && position && !position.includes(selectedGroup)) {
                                return 0.2;
                            }
                        }
                        
                        return 0.7;
                    } catch (error) {
                        console.error("Error assigning opacity:", error);
                        return 0.7; // Default opacity as fallback
                    }
                })
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .attr('stroke-width', 3)
                        .attr('opacity', 1);
                    
                    let tooltipContent = '';
                    
                    if (pcp.clubMode) {
                        tooltipContent = `
                            <strong>${d.club_name || 'Unknown Club'}</strong><br>
                            ${d.league_name || 'Unknown League'}<br>
                            Players: ${d.num_players || 0}<br>
                            Overall: ${(d.player_overall || 0).toFixed(1)}
                        `;
} else {
                        const positionGroup = mapPositionToGroup(d.player_positions);
                        tooltipContent = `
                            <strong>${d.short_name || 'Unknown Player'}</strong><br>
                            ${d.club_name || 'Unknown Club'}<br>
                            ${d.player_positions || 'Unknown'} (${positionGroup})<br>
                            Overall: ${d.player_overall || 0}
                        `;
                    }
                    
                    pcp.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    
                    pcp.tooltip.html(tooltipContent)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function(event, d) {
                    try {
                        d3.select(this)
                            .attr('stroke-width', d => {
                                if (pcp.highlightedPlayerId && d.player_id === pcp.highlightedPlayerId) {
                                    return 3;
                                }
                                
                                if (pcp.clubMode) {
                                    if (selectedGroup !== 'all' && d[groupKey] === selectedGroup) {
                                        return 2;
                                    }
                                } else {
                                    const position = d[groupKey] || "";
                                    const positionGroup = mapPositionToGroup(position);
                                    
                                    if (selectedPositionGroup && positionGroup === selectedPositionGroup) {
                                        return 2;
                                    }
                                    
                                    if (selectedGroup !== 'all' && position && position.includes(selectedGroup)) {
                                        return 2;
                                    }
                                }
                                
                                return 1;
                            })
                            .attr('opacity', d => {
                                if (pcp.highlightedPlayerId && d.player_id !== pcp.highlightedPlayerId) {
                                    return 0.2;
                                }
                                
                                if (pcp.clubMode) {
                                    if (selectedGroup !== 'all' && d[groupKey] !== selectedGroup) {
                                        return 0.2;
                                    }
                                } else {
                                    const position = d[groupKey] || "";
                                    const positionGroup = mapPositionToGroup(position);
                                    
                                    if (selectedPositionGroup && positionGroup !== selectedPositionGroup) {
                                        return 0.2;
                                    }
                                    
                                    if (selectedGroup !== 'all' && position && !position.includes(selectedGroup)) {
                                        return 0.2;
                                    }
                                }
                                
                                return 0.7;
                            });
                    } catch (error) {
                        console.error("Error in mouseout event:", error);
                    }
                    
                    pcp.tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                })
                .on('click', function(event, d) {
                    try {
                        if (!pcp.clubMode && d.player_id) {
                            if (pcp.highlightedPlayerId === d.player_id) {
                                pcp.highlightedPlayerId = null;
                                updatePCP(filterData());
                            } else {
                                selectPlayer(d);
                            }
                        }
                    } catch (error) {
                        console.error("Error in click event:", error);
                    }
                });
        }
        
        // Update active filter feedback
        updateFilterFeedback();
        
        // Add legend
        addPCPLegend(groups);
        
        // Show filter notice if filters are active
        if (Object.keys(pcp.axisFilters).length > 0) {
            addAxisFilterNotice();
        }
    } catch (error) {
        console.error("Error updating PCP:", error);
        // Try to show an error message in the visualization
        if (pcp.svg) {
            pcp.svg.selectAll('*').remove();
            pcp.svg.append('text')
                .attr('x', pcp.width / 2)
                .attr('y', pcp.height / 2)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('fill', 'red')
                .text('Error rendering visualization');
        }
    }
}

// Add notice when axis filters are active
function addAxisFilterNotice() {
    try {
        pcp.svg.append('g')
            .attr('class', 'filter-notice')
            .attr('transform', `translate(${pcp.width / 2}, 10)`)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-style', 'italic')
            .attr('fill', 'orange')
            .text(`${Object.keys(pcp.axisFilters).length} active axis ${Object.keys(pcp.axisFilters).length === 1 ? 'filter' : 'filters'} - use "Reset Axis Filters" to clear`);
    } catch (error) {
        console.error("Error adding filter notice:", error);
    }
}

// Add legend to PCP
function addPCPLegend(groups) {
    try {
        if (pcp.sampleMode) {
            // pcp.svg.append('text')
            //     .attr('class', 'sample-indicator')
            //     .attr('x', pcp.width / 2)
            //     .attr('y', -5)
            //     .attr('text-anchor', 'middle')
            //     .attr('font-size', '12px')
            //     .attr('fill', '#666')
            //     .attr('font-style', 'italic')
            //     .text(`Showing random sample of ${pcp.sampleSize} lines`);
        }
        
        const legendWidth = pcp.width;
        
        const legend = pcp.svg.append('g')
            .attr('class', 'pcp-legend')
            .attr('transform', `translate(0, ${pcp.height + 5})`);
        
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', pcp.legendHeight - 10)
            .attr('fill', 'white')
            .attr('opacity', 0.7)
            .attr('rx', 5)
            .attr('ry', 5);

        legend.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(pcp.clubMode ? 'Leagues' : 'Position Groups');
        
        legend.append('text')
            .attr('x', legendWidth - 120)
            .attr('y', 20)
            .style('font-size', '10px')
            .style('font-style', 'italic')
            .text('Click to filter');
        
        // Validate groups
        if (!groups || !Array.isArray(groups) || groups.length === 0) {
            groups = pcp.clubMode ? ["Unknown League"] : ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
        }
        
        // Ensure we have a safe number of groups for legend
        const displayGroups = groups.slice(0, Math.min(groups.length, 10));
        
        const itemWidth = Math.min(130, legendWidth / Math.max(1, displayGroups.length));
        
        const itemsGroup = legend.append('g')
            .attr('transform', 'translate(5, 25)');
            
        displayGroups.forEach((group, i) => {
            // Skip empty groups
            if (!group) return;
            
            let isSelected = false;
            
            if (pcp.clubMode) {
                isSelected = (dashboardState.filters.league === group);
            } else {
                const selectedPosition = dashboardState.filters.position;
                if (selectedPosition !== 'all') {
                    const selectedGroup = mapPositionToGroup(selectedPosition);
                    isSelected = (selectedGroup === group);
                }
            }
            
            const item = itemsGroup.append('g')
                .attr('transform', `translate(${i * itemWidth}, 0)`)
                .style('cursor', 'pointer')
                .on('click', function() {
                    try {
                        if (!pcp.isBrushing) {
                            pcp.highlightedPlayerId = null;
                        }
                        
                        if (pcp.clubMode) {
                            if (dashboardState.filters.league === group) {
                                dashboardState.filters.league = 'all';
                            } else {
                                dashboardState.filters.league = group;
                            }
                            const selector = document.getElementById('league-selector');
                            if (selector) selector.value = dashboardState.filters.league;
                        } else {
                            const positions = Object.entries(pcp.positionGroups)
                                .filter(([pos, posGroup]) => posGroup === group)
                                .map(([pos]) => pos);
                            
                            if (positions.length > 0) {
                                const firstPosition = positions[0];
                                
                                if (dashboardState.filters.position === firstPosition) {
                                    dashboardState.filters.position = 'all';
                                } else {
                                    dashboardState.filters.position = firstPosition;
                                }
                                
                                const selector = document.getElementById('position-selector');
                                if (selector) selector.value = dashboardState.filters.position;
                            }
                        }
                        
                        updateSelectionDetails();
                        setTimeout(() => {
                            updateAllVisualizations();
                        }, 0);
                    } catch (error) {
                        console.error("Error in legend click event:", error);
                    }
                });
            
            if (isSelected) {
                item.append('rect')
                    .attr('width', itemWidth - 10)
                    .attr('height', 22)
                    .attr('x', -5)
                    .attr('y', -15)
                    .attr('fill', '#f0f0f0')
                    .attr('rx', 4)
                    .attr('ry', 4);
            }
            
            item.append('rect')
                .attr('width', 14)
                .attr('height', 14)
                .attr('fill', pcp.colorScale(group))
                .attr('stroke', isSelected ? '#000' : 'none')
                .attr('stroke-width', isSelected ? 1.5 : 0);
            
            item.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-size', '12px')
                .style('font-weight', isSelected ? 'bold' : 'normal')
                .text(group);
        });
    } catch (error) {
        console.error("Error adding PCP legend:", error);
    }
}

// Highlight a specific player in the PCP
function highlightPlayerInPCP(playerId) {
    try {
        if (!pcp.isBrushing) {
            pcp.highlightedPlayerId = playerId;
        }
        
        if (pcp.clubMode) {
            updatePCP(globalData.clubs);
        } else {
            updatePCP(filterData());
        }
    } catch (error) {
        console.error("Error highlighting player in PCP:", error);
    }
}