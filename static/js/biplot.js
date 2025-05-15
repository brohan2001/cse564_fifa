// // // Global variables for biplot
// // let biplot = {
// //     svg: null,
// //     width: 0,
// //     height: 0,
// //     margin: { top: 40, right: 40, bottom: 60, left: 80 },
// //     xScale: null,
// //     yScale: null,
// //     tooltip: null,
// //     pcaData: null,
// //     loadings: null,
// //     featureNames: null,
// //     explainedVariance: null,
// //     colorScale: d3.scaleOrdinal(d3.schemeCategory10),
// //     highlightedPlayerId: null,
// //     zoomTransform: null,
// //     selectedPositions: new Set(), // Track selected positions for filtering
// //     colorScale: d3.scaleOrdinal()
// //         .domain(["Goalkeeper", "Defender", "Midfielder", "Attacker"])
// //         .range(["#ff9e00", "#4169e1", "#32cd32", "#dc143c"]),
// // };

// // function mapPositionToGroup(position) {
// //     if (!position) return "Unknown";
    
// //     const pos = position.toUpperCase();
    
// //     if (pos.includes('GK')) {
// //         return "Goalkeeper";
// //     } else if (pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || pos.includes('LWB') || pos.includes('RWB')) {
// //         return "Defender";
// //     } else if (pos.includes('CDM') || pos.includes('CM') || pos.includes('CAM') || pos.includes('LM') || pos.includes('RM')) {
// //         return "Midfielder";
// //     } else if (pos.includes('CF') || pos.includes('ST') || pos.includes('LW') || pos.includes('RW')) {
// //         return "Attacker";
// //     } else {
// //         return "Unknown";
// //     }
// // }


// // // Initialize the biplot visualization
// // function initializeBiplot() {
// //     // Set dimensions
// //     const container = document.getElementById('biplot');
// //     biplot.width = container.clientWidth - biplot.margin.left - biplot.margin.right;
// //     biplot.height = container.clientHeight - biplot.margin.top - biplot.margin.bottom;
    
// //     // Create SVG
// //     biplot.svg = d3.select('#biplot')
// //         .append('svg')
// //         .attr('width', biplot.width + biplot.margin.left + biplot.margin.right)
// //         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom)
// //         .append('g')
// //         .attr('transform', `translate(${biplot.margin.left},${biplot.margin.top})`);
    
// //     // Create tooltip
// //     biplot.tooltip = createTooltip();
    
// //     // Create scales
// //     biplot.xScale = d3.scaleLinear()
// //         .range([0, biplot.width]);
    
// //     biplot.yScale = d3.scaleLinear()
// //         .range([biplot.height, 0]);
    
// //     // Add zoom behavior
// //     const zoom = d3.zoom()
// //         .scaleExtent([0.5, 5])
// //         .on('zoom', (event) => {
// //             biplot.zoomTransform = event.transform;
// //             updateBiplotWithZoom();
// //         });
    
// //     d3.select('#biplot svg')
// //         .call(zoom);
    
// //     // Add loading message
// //     biplot.svg.append('text')
// //         .attr('class', 'loading-text')
// //         .attr('x', biplot.width / 2)
// //         .attr('y', biplot.height / 2)
// //         .attr('text-anchor', 'middle')
// //         .text('Loading PCA data...');
    
// //     // Add reset button in a better position (top right corner of actual plot)
// //     addBiplotResetButton();
    
// //     // Initial data load and rendering
// //     loadPCAData();
// // }

// // // Add reset button for biplot - positioned at the top right of the container
// // function addBiplotResetButton() {
// //     const resetButton = d3.select('#biplot-container')
// //         .append('div')
// //         .attr('id', 'biplot-reset')
// //         .style('position', 'absolute')
// //         .style('top', '10px')
// //         .style('right', '10px')
// //         .style('z-index', '10')
// //         .style('cursor', 'pointer')
// //         .style('background-color', '#f0f0f0')
// //         .style('border', '1px solid #ccc')
// //         .style('border-radius', '3px')
// //         .style('padding', '5px 10px')
// //         .text('Reset Zoom & Selection')
// //         .on('click', function() {
// //             // Reset zoom
// //             d3.select('#biplot svg')
// //                 .transition()
// //                 .duration(750)
// //                 .call(d3.zoom().transform, d3.zoomIdentity);
            
// //             // Reset selection
// //             biplot.highlightedPlayerId = null;
// //             biplot.selectedPositions.clear();
            
// //             // Update visualization
// //             renderBiplot();
// //         });
// // }

// // // Load PCA data from API
// // async function loadPCAData() {
// //     try {
// //         // Construct API URL - include league filter if active
// //         let url = '/api/pca';
// //         if (dashboardState.filters.league !== 'all') {
// //             url += `?league=${dashboardState.filters.league}`;
// //         }
        
// //         const response = await fetch(url);
// //         const data = await response.json();
        
// //         // Store PCA results
// //         biplot.pcaData = data.players;
// //         biplot.loadings = data.loadings;
// //         biplot.featureNames = data.feature_names;
// //         biplot.explainedVariance = data.explained_variance;
        
// //         // Render the biplot
// //         renderBiplot();
        
// //     } catch (error) {
// //         console.error('Error loading PCA data:', error);
// //         biplot.svg.select('text')
// //             .text('Error loading PCA data. Please try again.');
// //     }
// // }

// // // Render the biplot visualization
// // function renderBiplot() {
// //     // Clear SVG
// //     biplot.svg.selectAll('*').remove();
    
// //     // Extract PC coordinates
// //     const xValues = biplot.pcaData.map(d => d.pca_x);
// //     const yValues = biplot.pcaData.map(d => d.pca_y);
    
// //     // Update scales
// //     biplot.xScale.domain([d3.min(xValues) * 1.1, d3.max(xValues) * 1.1]);
// //     biplot.yScale.domain([d3.min(yValues) * 1.1, d3.max(yValues) * 1.1]);
    
// //     // Create axis objects
// //     const xAxis = d3.axisBottom(biplot.xScale);
// //     const yAxis = d3.axisLeft(biplot.yScale);
    
// //     // Add grid lines
// //     biplot.svg.append('g')
// //         .attr('class', 'grid-lines')
// //         .selectAll('line.horizontal')
// //         .data(biplot.yScale.ticks(5))
// //         .enter()
// //         .append('line')
// //         .attr('class', 'horizontal')
// //         .attr('x1', 0)
// //         .attr('x2', biplot.width)
// //         .attr('y1', d => biplot.yScale(d))
// //         .attr('y2', d => biplot.yScale(d))
// //         .attr('stroke', '#e0e0e0')
// //         .attr('stroke-width', 1);
    
// //     biplot.svg.append('g')
// //         .attr('class', 'grid-lines')
// //         .selectAll('line.vertical')
// //         .data(biplot.xScale.ticks(5))
// //         .enter()
// //         .append('line')
// //         .attr('class', 'vertical')
// //         .attr('y1', 0)
// //         .attr('y2', biplot.height)
// //         .attr('x1', d => biplot.xScale(d))
// //         .attr('x2', d => biplot.xScale(d))
// //         .attr('stroke', '#e0e0e0')
// //         .attr('stroke-width', 1);
    
// //     // Add zero lines
// //     biplot.svg.append('line')
// //         .attr('class', 'zero-line')
// //         .attr('x1', biplot.xScale(0))
// //         .attr('x2', biplot.xScale(0))
// //         .attr('y1', 0)
// //         .attr('y2', biplot.height)
// //         .attr('stroke', '#aaa')
// //         .attr('stroke-dasharray', '3,3');
    
// //     biplot.svg.append('line')
// //         .attr('class', 'zero-line')
// //         .attr('y1', biplot.yScale(0))
// //         .attr('y2', biplot.yScale(0))
// //         .attr('x1', 0)
// //         .attr('x2', biplot.width)
// //         .attr('stroke', '#aaa')
// //         .attr('stroke-dasharray', '3,3');
    
// //     // Add X axis
// //     biplot.svg.append('g')
// //         .attr('class', 'x-axis')
// //         .attr('transform', `translate(0,${biplot.height})`)
// //         .call(xAxis);
    
// //     // Add Y axis
// //     biplot.svg.append('g')
// //         .attr('class', 'y-axis')
// //         .call(yAxis);
    
// //     // Add axis labels
// //     biplot.svg.append('text')
// //         .attr('class', 'axis-label')
// //         .attr('x', biplot.width / 2)
// //         .attr('y', biplot.height + 40)
// //         .attr('text-anchor', 'middle')
// //         .style('font-weight', 'bold')
// //         .text(`Principal Component 1 (${(biplot.explainedVariance[0] * 100).toFixed(1)}%)`);
    
// //     // Further improved y-axis label positioning to ensure it's fully visible
// //     biplot.svg.append('text')
// //         .attr('class', 'axis-label')
// //         .attr('transform', 'rotate(-90)')
// //         .attr('x', -biplot.height / 2)
// //         .attr('y', -55) // Increased distance from axis even more
// //         .attr('text-anchor', 'middle')
// //         .style('font-weight', 'bold')
// //         .text(`Principal Component 2 (${(biplot.explainedVariance[1] * 100).toFixed(1)}%)`);
    
// //     // Create a container for data points
// //     const pointsContainer = biplot.svg.append('g')
// //         .attr('class', 'points-container');
    
// //     // Create a container for loadings
// //     const loadingsContainer = biplot.svg.append('g')
// //         .attr('class', 'loadings-container');
    
// //     // Add data points
// //     pointsContainer.selectAll('.data-point')
// //         .data(biplot.pcaData)
// //         .enter()
// //         .append('circle')
// //         .attr('class', 'data-point')
// //         .attr('cx', d => biplot.xScale(d.pca_x))
// //         .attr('cy', d => biplot.yScale(d.pca_y))
// //         .attr('r', 3)
// //         .attr('fill', d => {
// //             // Color by position group instead of individual position
// //             const position = d.player_positions || 'Unknown';
// //             const positionGroup = mapPositionToGroup(position.split(',')[0]);
// //             return biplot.colorScale(positionGroup);
// //         })
// //         .attr('stroke', d => {
// //             // Highlight selected player
// //             return (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) ? '#000' : 'none';
// //         })
// //         .attr('stroke-width', d => {
// //             // Highlight selected player
// //             return (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) ? 2 : 0;
// //         })
// //         .attr('opacity', d => {
// //             // Handle opacity based on different selection states
// //             // If a player is highlighted, fade all others
// //             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
// //                 return 0.3;
// //             }
            
// //             // If position groups are selected, fade non-matching groups
// //             if (biplot.selectedPositions.size > 0) {
// //                 const position = d.player_positions || 'Unknown';
// //                 const positionGroup = mapPositionToGroup(position.split(',')[0]);
// //                 return biplot.selectedPositions.has(positionGroup) ? 0.7 : 0.2;
// //             }
            
// //             // Default opacity
// //             return 0.7;
// //         })
// //         .on('mouseover', function(event, d) {
// //             // Highlight on hover
// //             d3.select(this)
// //                 .attr('r', 5)
// //                 .attr('opacity', 1);
            
// //             // Show tooltip
// //             biplot.tooltip.transition()
// //                 .duration(200)
// //                 .style('opacity', 0.9);
            
// //             biplot.tooltip.html(`
// //                 <strong>${d.short_name}</strong><br>
// //                 ${d.club_name}<br>
// //                 ${d.nationality_name}<br>
// //                 Position: ${d.player_positions || 'N/A'}<br>
// //                 PC1: ${d.pca_x.toFixed(2)}, PC2: ${d.pca_y.toFixed(2)}
// //             `)
// //             .style('left', (event.pageX + 10) + 'px')
// //             .style('top', (event.pageY - 28) + 'px');
// //         })
// //         .on('mouseout', function(event, d) {
// //             // Reset on mouseout
// //             d3.select(this)
// //                 .attr('r', 3)
// //                 .attr('opacity', d => {
// //                     // Restore appropriate opacity based on selection state
// //                     if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
// //                         return 0.3;
// //                     }
                    
// //                     if (biplot.selectedPositions.size > 0) {
// //                         const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
// //                         return biplot.selectedPositions.has(position) ? 0.7 : 0.2;
// //                     }
                    
// //                     return 0.7;
// //                 });
            
// //             // Hide tooltip
// //             biplot.tooltip.transition()
// //                 .duration(500)
// //                 .style('opacity', 0);
// //         })
// //         .on('click', function(event, d) {
// //             // Select player on click
// //             if (d.player_id) {  // Make sure player_id exists
// //                 selectPlayer(globalData.players.find(p => p.player_id === d.player_id));
// //             }
// //         });
    
// //     // Draw feature vectors (loadings)
// //     const loadingScale = Math.min(biplot.width, biplot.height) / 2 * 0.8;
    
// //     biplot.featureNames.forEach((feature, i) => {
// //         // Calculate vector coordinates
// //         const x1 = biplot.xScale(0);
// //         const y1 = biplot.yScale(0);
// //         const x2 = biplot.xScale(biplot.loadings[0][i] * loadingScale);
// //         const y2 = biplot.yScale(biplot.loadings[1][i] * loadingScale);
        
// //         // Get vector magnitude for filtering
// //         const magnitude = Math.sqrt(
// //             Math.pow(biplot.loadings[0][i], 2) + Math.pow(biplot.loadings[1][i], 2)
// //         );
        
// //         // Skip vectors with very small magnitude
// //         if (magnitude < 0.05) return;
        
// //         // Draw loading vector
// //         loadingsContainer.append('line')
// //             .attr('class', 'loading-vector')
// //             .attr('x1', x1)
// //             .attr('y1', y1)
// //             .attr('x2', x2)
// //             .attr('y2', y2)
// //             .attr('stroke', '#555')
// //             .attr('stroke-width', 1.5);
        
// //         // Add arrowhead
// //         const arrowSize = 5;
// //         const angle = Math.atan2(y1 - y2, x2 - x1);
        
// //         loadingsContainer.append('path')
// //             .attr('d', `M ${x2} ${y2} l ${-arrowSize * Math.cos(angle - Math.PI/6)} ${arrowSize * Math.sin(angle - Math.PI/6)} l ${-arrowSize * Math.cos(angle + Math.PI/6)} ${arrowSize * Math.sin(angle + Math.PI/6)} z`)
// //             .attr('fill', '#555');
        
// //         // Format feature name
// //         const formattedName = feature.split('_')
// //             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// //             .join(' ');
        
// //         // Add feature label
// //         // Calculate label position with slight offset
// //         const labelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) + 10;
// //         const labelX = x1 + (x2 - x1) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * labelDistance;
// //         const labelY = y1 + (y2 - y1) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * labelDistance;

// //         // Add label with background for readability
// //         loadingsContainer.append('text')
// //             .attr('class', 'vector-label-bg')
// //             .attr('x', labelX)
// //             .attr('y', labelY)
// //             .attr('text-anchor', 'middle')
// //             .attr('font-size', '10px')
// //             .attr('stroke', 'white')
// //             .attr('stroke-width', 4)
// //             .attr('paint-order', 'stroke')
// //             .text(formattedName);
        
// //         loadingsContainer.append('text')
// //             .attr('class', 'vector-label')
// //             .attr('x', labelX)
// //             .attr('y', labelY)
// //             .attr('text-anchor', 'middle')
// //             .attr('font-size', '10px')
// //             .attr('fill', '#333')
// //             .text(formattedName);
// //     });
    
// //     // Add title with variance explained
// //     biplot.svg.append('text')
// //         .attr('class', 'biplot-title')
// //         .attr('x', biplot.width / 2)
// //         .attr('y', -15)
// //         .attr('text-anchor', 'middle')
// //         .style('font-size', '14px')
// //         .style('font-weight', 'bold')
// //         .text(`PCA Biplot - Total Variance Explained: ${((biplot.explainedVariance[0] + biplot.explainedVariance[1]) * 100).toFixed(1)}%`);
    
// //     // Add legend below the plot instead of on the side
// //     addBiplotLegend();
// // }

// // // Also update the addBiplotLegend function to use position groups
// // function addBiplotLegend() {
// //     // Use position groups instead of individual positions
// //     const positionGroups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
    
// //     // Calculate legend positioning
// //     const legendWidth = biplot.width;
// //     const itemsPerRow = 4; // Four position groups fit nicely in one row
// //     const itemWidth = legendWidth / itemsPerRow;
// //     const itemHeight = 20;
// //     const legendHeight = itemHeight + 30; // Just one row + title
    
// //     // Create legend container at the bottom
// //     const legend = biplot.svg.append('g')
// //         .attr('class', 'biplot-legend')
// //         .attr('transform', `translate(0, ${biplot.height + 50})`); // Position below x-axis label
    
// //     // Add background
// //     legend.append('rect')
// //         .attr('width', legendWidth)
// //         .attr('height', legendHeight)
// //         .attr('fill', 'white')
// //         .attr('opacity', 0.7)
// //         .attr('rx', 5)
// //         .attr('ry', 5);
    
// //     // Add title
// //     legend.append('text')
// //         .attr('x', 10)
// //         .attr('y', 15)
// //         .style('font-size', '12px')
// //         .style('font-weight', 'bold')
// //         .text('Position Groups');
    
// //     // Add toggle instructions
// //     legend.append('text')
// //         .attr('x', legendWidth - 170)
// //         .attr('y', 15)
// //         .style('font-size', '8px')
// //         .style('font-style', 'italic')
// //         .text('Click on position group to filter');
    
// //     // Add legend items for each position group
// //     positionGroups.forEach((group, i) => {
// //         // Check if group is selected
// //         const isSelected = biplot.selectedPositions.has(group);
        
// //         // Create group for legend item
// //         const item = legend.append('g')
// //             .attr('transform', `translate(${i * itemWidth + 10}, ${30})`)
// //             .style('cursor', 'pointer')
// //             .on('click', function() {
// //                 // Toggle selection for this position group
// //                 if (biplot.selectedPositions.has(group)) {
// //                     biplot.selectedPositions.delete(group);
// //                 } else {
// //                     biplot.selectedPositions.add(group);
// //                 }
                
// //                 // Update dashboard state
// //                 updateDashboardState();
                
// //                 // Update visualization
// //                 renderBiplot();
// //             });
        
// //         // Add selection background for better visibility
// //         if (isSelected) {
// //             item.append('rect')
// //                 .attr('width', itemWidth - 15)
// //                 .attr('height', 16)
// //                 .attr('x', -5)
// //                 .attr('y', -10)
// //                 .attr('fill', '#f0f0f0')
// //                 .attr('rx', 3)
// //                 .attr('ry', 3);
// //         }
        
// //         // Add color swatch
// //         item.append('rect')
// //             .attr('width', 10)
// //             .attr('height', 10)
// //             .attr('fill', biplot.colorScale(group))
// //             .attr('stroke', isSelected ? '#000' : 'none')
// //             .attr('stroke-width', isSelected ? 1 : 0);
        
// //         // Add label
// //         item.append('text')
// //             .attr('x', 15)
// //             .attr('y', 9)
// //             .style('font-size', '10px')
// //             .style('font-weight', isSelected ? 'bold' : 'normal')
// //             .text(group);
// //     });
    
// //     // Update SVG height to accommodate legend
// //     d3.select('#biplot svg')
// //         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 10);
// // }

// // // Update biplot with zoom transformation
// // function updateBiplotWithZoom() {
// //     if (!biplot.zoomTransform) return;
    
// //     // Apply zoom to points
// //     biplot.svg.select('.points-container')
// //         .attr('transform', biplot.zoomTransform);
    
// //     // Apply zoom to loadings
// //     biplot.svg.select('.loadings-container')
// //         .attr('transform', biplot.zoomTransform);
    
// //     // Update axes
// //     const newXScale = biplot.zoomTransform.rescaleX(biplot.xScale);
// //     const newYScale = biplot.zoomTransform.rescaleY(biplot.yScale);
    
// //     biplot.svg.select('.x-axis')
// //         .call(d3.axisBottom(newXScale));
    
// //     biplot.svg.select('.y-axis')
// //         .call(d3.axisLeft(newYScale));
    
// //     // Update grid lines
// //     biplot.svg.selectAll('.grid-lines .horizontal')
// //         .attr('y1', d => biplot.zoomTransform.applyY(biplot.yScale(d)))
// //         .attr('y2', d => biplot.zoomTransform.applyY(biplot.yScale(d)));
    
// //     biplot.svg.selectAll('.grid-lines .vertical')
// //         .attr('x1', d => biplot.zoomTransform.applyX(biplot.xScale(d)))
// //         .attr('x2', d => biplot.zoomTransform.applyX(biplot.xScale(d)));
    
// //     // Update zero lines
// //     biplot.svg.select('.zero-line:first-child')
// //         .attr('x1', biplot.zoomTransform.applyX(biplot.xScale(0)))
// //         .attr('x2', biplot.zoomTransform.applyX(biplot.xScale(0)));
    
// //     biplot.svg.select('.zero-line:last-child')
// //         .attr('y1', biplot.zoomTransform.applyY(biplot.yScale(0)))
// //         .attr('y2', biplot.zoomTransform.applyY(biplot.yScale(0)));
// // }

// // // Update biplot visualization with new data
// // function updateBiplot(filteredData) {
// //     // Reset zoom
// //     biplot.zoomTransform = null;
// //     d3.select('#biplot svg').call(d3.zoom().transform, d3.zoomIdentity);
    
// //     // If we have a league filter, reload PCA data
// //     if (dashboardState.filters.league !== globalData.selectedLeague) {
// //         globalData.selectedLeague = dashboardState.filters.league;
// //         loadPCAData();
// //         return;
// //     }
    
// //     // If no reload needed, just update the existing visualization
// //     // Update position selection based on dashboard state
// //     if (dashboardState.filters.position !== 'all') {
// //         biplot.selectedPositions.clear();
// //         biplot.selectedPositions.add(dashboardState.filters.position);
// //     } else if (biplot.selectedPositions.size > 0 && dashboardState.filters.position === 'all') {
// //         biplot.selectedPositions.clear();
// //     }
    
// //     // Filter points based on current filters
// //     const filteredIds = new Set(filteredData.map(d => d.player_id));
    
// //     biplot.svg.selectAll('.data-point')
// //         .attr('opacity', d => {
// //             // If a player is highlighted, fade all others
// //             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
// //                 return 0.2;
// //             }
            
// //             // If positions are selected, fade non-matching positions
// //             if (biplot.selectedPositions.size > 0) {
// //                 const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
// //                 if (!biplot.selectedPositions.has(position)) {
// //                     return 0.2;
// //                 }
// //             }
            
// //             return filteredIds.has(d.player_id) ? 0.7 : 0.2;
// //         })
// //         .attr('r', d => filteredIds.has(d.player_id) ? 3 : 2);
// // }

// // // Helper function to update dashboard state based on position group selections
// // function updateDashboardState() {
// //     if (biplot.selectedPositions.size === 1) {
// //         // Map the position group back to a specific position for dashboard state
// //         const selectedGroup = Array.from(biplot.selectedPositions)[0];
// //         // Pick a representative position from each group
// //         const positionMap = {
// //             "Goalkeeper": "GK",
// //             "Defender": "CB",
// //             "Midfielder": "CM",
// //             "Attacker": "ST"
// //         };
        
// //         dashboardState.filters.position = positionMap[selectedGroup] || 'all';
        
// //         const positionSelector = document.getElementById('position-selector');
// //         if (positionSelector) {
// //             positionSelector.value = dashboardState.filters.position;
// //         }
// //     } else if (biplot.selectedPositions.size === 0) {
// //         dashboardState.filters.position = 'all';
// //         const positionSelector = document.getElementById('position-selector');
// //         if (positionSelector) {
// //             positionSelector.value = 'all';
// //         }
// //     }
    
// //     // Update other visualizations
// //     updateSelectionDetails();
// //     updateAllVisualizations();
// // }

// // // Highlight a specific player in the biplot
// // function highlightPlayerInBiplot(playerId) {
// //     biplot.highlightedPlayerId = playerId;
    
// //     // Update data point styling
// //     biplot.svg.selectAll('.data-point')
// //         .attr('stroke', d => d.player_id === playerId ? '#000' : 'none')
// //         .attr('stroke-width', d => d.player_id === playerId ? 2 : 0)
// //         .attr('r', d => d.player_id === playerId ? 5 : 3)
// //         .attr('opacity', d => d.player_id === playerId ? 1 : 0.3);
    
// //     // Find the player data point
// //     const player = biplot.pcaData.find(d => d.player_id === playerId);
    
// //     if (player) {
// //         // Center the view on the player
// //         const x = biplot.xScale(player.pca_x);
// //         const y = biplot.yScale(player.pca_y);
        
// //         // Create a zoom transform to center on the player
// //         const transform = d3.zoomIdentity
// //             .translate(biplot.width / 2 - x, biplot.height / 2 - y)
// //             .scale(1.5);
        
// //         // Apply the transform with transition
// //         d3.select('#biplot svg')
// //             .transition()
// //             .duration(750)
// //             .call(d3.zoom().transform, transform);
// //     }
// // }
// // Global variables for biplot
// let biplot = {
//     svg: null,
//     width: 0,
//     height: 0,
//     margin: { top: 40, right: 40, bottom: 60, left: 80 },
//     xScale: null,
//     yScale: null,
//     tooltip: null,
//     pcaData: null,
//     loadings: null,
//     featureNames: null,
//     explainedVariance: null,
//     highlightedPlayerId: null,
//     zoomTransform: null,
//     selectedPositionGroups: new Set(), // Track selected position groups for filtering
//     positionGroupToPositions: {
//         "Goalkeeper": ["GK"],
//         "Defender": ["CB", "LB", "RB", "LWB", "RWB"],
//         "Midfielder": ["CDM", "CM", "CAM", "LM", "RM"],
//         "Attacker": ["LW", "RW", "CF", "ST"]
//     },
//     positionToGroup: {}, // Will be populated in init
//     colorScale: d3.scaleOrdinal()
//         .domain(["Goalkeeper", "Defender", "Midfielder", "Attacker"])
//         .range(["#ff9e00", "#4169e1", "#32cd32", "#dc143c"]),
// };

// // Initialize the position to group mapping
// function initPositionMapping() {
//     // Populate the position to group mapping from the group to positions mapping
//     Object.entries(biplot.positionGroupToPositions).forEach(([group, positions]) => {
//         positions.forEach(position => {
//             biplot.positionToGroup[position] = group;
//         });
//     });
// }

// // Map position to group consistently
// function mapPositionToGroup(position) {
//     if (!position) return "Unknown";
    
//     // Handle multiple positions (take the first one)
//     const primaryPosition = position.split(',')[0].trim();
    
//     // Check if it's directly in our mapping
//     if (biplot.positionToGroup[primaryPosition]) {
//         return biplot.positionToGroup[primaryPosition];
//     }
    
//     // For positions not in our mapping, try to infer the group
//     if (primaryPosition.includes('GK')) {
//         return "Goalkeeper";
//     } else if (primaryPosition.includes('B') || primaryPosition === 'CB' || 
//                primaryPosition === 'LB' || primaryPosition === 'RB' || 
//                primaryPosition === 'LWB' || primaryPosition === 'RWB') {
//         return "Defender";
//     } else if (primaryPosition.includes('M') || primaryPosition === 'CDM' || 
//                primaryPosition === 'CM' || primaryPosition === 'CAM' || 
//                primaryPosition === 'LM' || primaryPosition === 'RM') {
//         return "Midfielder";
//     } else if (primaryPosition.includes('W') || primaryPosition.includes('F') || 
//                primaryPosition === 'ST' || primaryPosition === 'CF' || 
//                primaryPosition === 'LW' || primaryPosition === 'RW') {
//         return "Attacker";
//     }
    
//     return "Unknown";
// }

// // Initialize the biplot visualization
// function initializeBiplot() {
//     // Initialize position mapping
//     initPositionMapping();
    
//     // Set dimensions
//     const container = document.getElementById('biplot');
//     biplot.width = container.clientWidth - biplot.margin.left - biplot.margin.right;
//     biplot.height = container.clientHeight - biplot.margin.top - biplot.margin.bottom;
    
//     // Create SVG
//     biplot.svg = d3.select('#biplot')
//         .append('svg')
//         .attr('width', biplot.width + biplot.margin.left + biplot.margin.right)
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom)
//         .append('g')
//         .attr('transform', `translate(${biplot.margin.left},${biplot.margin.top})`);
    
//     // Create tooltip
//     biplot.tooltip = createTooltip();
    
//     // Create scales
//     biplot.xScale = d3.scaleLinear()
//         .range([0, biplot.width]);
    
//     biplot.yScale = d3.scaleLinear()
//         .range([biplot.height, 0]);
    
//     // Add zoom behavior
//     const zoom = d3.zoom()
//         .scaleExtent([0.5, 5])
//         .on('zoom', (event) => {
//             biplot.zoomTransform = event.transform;
//             updateBiplotWithZoom();
//         });
    
//     d3.select('#biplot svg')
//         .call(zoom);
    
//     // Add loading message
//     biplot.svg.append('text')
//         .attr('class', 'loading-text')
//         .attr('x', biplot.width / 2)
//         .attr('y', biplot.height / 2)
//         .attr('text-anchor', 'middle')
//         .text('Loading PCA data...');
    
//     // Add reset button
//     addBiplotResetButton();
    
//     // Initial data load and rendering
//     loadPCAData();
    
//     // Listen for dashboard state changes
//     listenForDashboardChanges();
// }

// // Listen for changes in dashboard state
// function listenForDashboardChanges() {
//     const positionSelector = document.getElementById('position-selector');
//     if (positionSelector) {
//         positionSelector.addEventListener('change', function() {
//             const selectedPosition = this.value;
//             updateBiplotFromDashboard(selectedPosition);
//         });
//     }
    
//     const resetButton = document.getElementById('reset-filters');
//     if (resetButton) {
//         resetButton.addEventListener('click', function() {
//             biplot.selectedPositionGroups.clear();
//             renderBiplot();
//         });
//     }
// }

// // Update biplot based on dashboard position selection
// function updateBiplotFromDashboard(selectedPosition) {
//     // Clear previous selections
//     biplot.selectedPositionGroups.clear();
    
//     if (selectedPosition !== 'all') {
//         // Convert position to group
//         const group = mapPositionToGroup(selectedPosition);
//         if (group !== "Unknown") {
//             biplot.selectedPositionGroups.add(group);
//         }
//     }
    
//     // Re-render biplot with updated selection
//     renderBiplot();
// }

// // Add reset button for biplot - positioned at the top right of the container
// function addBiplotResetButton() {
//     const resetButton = d3.select('#biplot-container')
//         .append('div')
//         .attr('id', 'biplot-reset')
//         .style('position', 'absolute')
//         .style('top', '10px')
//         .style('right', '10px')
//         .style('z-index', '10')
//         .style('cursor', 'pointer')
//         .style('background-color', '#f0f0f0')
//         .style('border', '1px solid #ccc')
//         .style('border-radius', '3px')
//         .style('padding', '5px 10px')
//         .text('Reset Zoom & Selection')
//         .on('click', function() {
//             // Reset zoom
//             d3.select('#biplot svg')
//                 .transition()
//                 .duration(750)
//                 .call(d3.zoom().transform, d3.zoomIdentity);
            
//             // Reset selection
//             biplot.highlightedPlayerId = null;
//             biplot.selectedPositionGroups.clear();
            
//             // Reset dashboard state if necessary
//             if (dashboardState.filters.position !== 'all') {
//                 dashboardState.filters.position = 'all';
//                 const posSelector = document.getElementById('position-selector');
//                 if (posSelector) {
//                     posSelector.value = 'all';
//                 }
//                 updateSelectionDetails();
//                 updateAllVisualizations();
//             } else {
//                 // If already 'all', just update biplot
//                 renderBiplot();
//             }
//         });
// }

// // Load PCA data from API
// async function loadPCAData() {
//     try {
//         // Construct API URL - include league filter if active
//         let url = '/api/pca';
//         if (dashboardState.filters.league !== 'all') {
//             url += `?league=${dashboardState.filters.league}`;
//         }
        
//         const response = await fetch(url);
//         const data = await response.json();
        
//         if (data.error) {
//             throw new Error(data.error);
//         }
        
//         // Store PCA results
//         biplot.pcaData = data.players;
//         biplot.loadings = data.loadings;
//         biplot.featureNames = data.feature_names;
//         biplot.explainedVariance = data.explained_variance;
        
//         // Check if we have position filter active from dashboard
//         if (dashboardState.filters.position !== 'all') {
//             const positionGroup = mapPositionToGroup(dashboardState.filters.position);
//             if (positionGroup !== "Unknown") {
//                 biplot.selectedPositionGroups.clear();
//                 biplot.selectedPositionGroups.add(positionGroup);
//             }
//         }
        
//         // Render the biplot
//         renderBiplot();
        
//     } catch (error) {
//         console.error('Error loading PCA data:', error);
//         biplot.svg.selectAll('*').remove();
//         biplot.svg.append('text')
//             .attr('x', biplot.width / 2)
//             .attr('y', biplot.height / 2)
//             .attr('text-anchor', 'middle')
//             .attr('fill', 'red')
//             .text('Error loading PCA data. Please try again.');
//     }
// }

// // Render the biplot visualization
// function renderBiplot() {
//     // Clear SVG
//     biplot.svg.selectAll('*').remove();
    
//     // Check if we have data
//     if (!biplot.pcaData || !biplot.pcaData.length) {
//         biplot.svg.append('text')
//             .attr('x', biplot.width / 2)
//             .attr('y', biplot.height / 2)
//             .attr('text-anchor', 'middle')
//             .attr('fill', '#666')
//             .text('No PCA data available. Please try a different selection.');
//         return;
//     }
    
//     // Extract PC coordinates
//     const xValues = biplot.pcaData.map(d => d.pca_x);
//     const yValues = biplot.pcaData.map(d => d.pca_y);
    
//     // Update scales
//     biplot.xScale.domain([d3.min(xValues) * 1.1, d3.max(xValues) * 1.1]);
//     biplot.yScale.domain([d3.min(yValues) * 1.1, d3.max(yValues) * 1.1]);
    
//     // Create axis objects
//     const xAxis = d3.axisBottom(biplot.xScale);
//     const yAxis = d3.axisLeft(biplot.yScale);
    
//     // Add grid lines
//     biplot.svg.append('g')
//         .attr('class', 'grid-lines')
//         .selectAll('line.horizontal')
//         .data(biplot.yScale.ticks(5))
//         .enter()
//         .append('line')
//         .attr('class', 'horizontal')
//         .attr('x1', 0)
//         .attr('x2', biplot.width)
//         .attr('y1', d => biplot.yScale(d))
//         .attr('y2', d => biplot.yScale(d))
//         .attr('stroke', '#e0e0e0')
//         .attr('stroke-width', 1);
    
//     biplot.svg.append('g')
//         .attr('class', 'grid-lines')
//         .selectAll('line.vertical')
//         .data(biplot.xScale.ticks(5))
//         .enter()
//         .append('line')
//         .attr('class', 'vertical')
//         .attr('y1', 0)
//         .attr('y2', biplot.height)
//         .attr('x1', d => biplot.xScale(d))
//         .attr('x2', d => biplot.xScale(d))
//         .attr('stroke', '#e0e0e0')
//         .attr('stroke-width', 1);
    
//     // Add zero lines
//     biplot.svg.append('line')
//         .attr('class', 'zero-line')
//         .attr('x1', biplot.xScale(0))
//         .attr('x2', biplot.xScale(0))
//         .attr('y1', 0)
//         .attr('y2', biplot.height)
//         .attr('stroke', '#aaa')
//         .attr('stroke-dasharray', '3,3');
    
//     biplot.svg.append('line')
//         .attr('class', 'zero-line')
//         .attr('y1', biplot.yScale(0))
//         .attr('y2', biplot.yScale(0))
//         .attr('x1', 0)
//         .attr('x2', biplot.width)
//         .attr('stroke', '#aaa')
//         .attr('stroke-dasharray', '3,3');
    
//     // Add X axis
//     biplot.svg.append('g')
//         .attr('class', 'x-axis')
//         .attr('transform', `translate(0,${biplot.height})`)
//         .call(xAxis);
    
//     // Add Y axis
//     biplot.svg.append('g')
//         .attr('class', 'y-axis')
//         .call(yAxis);
    
//     // Add axis labels
//     biplot.svg.append('text')
//         .attr('class', 'axis-label')
//         .attr('x', biplot.width / 2)
//         .attr('y', biplot.height + 40)
//         .attr('text-anchor', 'middle')
//         .style('font-weight', 'bold')
//         .text(`Principal Component 1 (${(biplot.explainedVariance[0] * 100).toFixed(1)}%)`);
    
//     biplot.svg.append('text')
//         .attr('class', 'axis-label')
//         .attr('transform', 'rotate(-90)')
//         .attr('x', -biplot.height / 2)
//         .attr('y', -55)
//         .attr('text-anchor', 'middle')
//         .style('font-weight', 'bold')
//         .text(`Principal Component 2 (${(biplot.explainedVariance[1] * 100).toFixed(1)}%)`);
    
//     // Create a container for data points
//     const pointsContainer = biplot.svg.append('g')
//         .attr('class', 'points-container');
    
//     // Create a container for loadings
//     const loadingsContainer = biplot.svg.append('g')
//         .attr('class', 'loadings-container');
    
//     // Filter data points based on selected position groups
//     const hasPositionFilters = biplot.selectedPositionGroups.size > 0;
    
//     // Add data points
//     pointsContainer.selectAll('.data-point')
//         .data(biplot.pcaData)
//         .enter()
//         .append('circle')
//         .attr('class', 'data-point')
//         .attr('cx', d => biplot.xScale(d.pca_x))
//         .attr('cy', d => biplot.yScale(d.pca_y))
//         .attr('r', 3)
//         .attr('fill', d => {
//             const position = d.player_positions || 'Unknown';
//             const positionGroup = mapPositionToGroup(position);
//             return biplot.colorScale(positionGroup);
//         })
//         .attr('stroke', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return '#000';
//             }
            
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
//             }
            
//             return 'none';
//         })
//         .attr('stroke-width', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return 2;
//             }
            
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
//             }
            
//             return 0;
//         })
//         .attr('opacity', d => {
//             // If a player is highlighted, dim all others
//             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                 return 0.2;
//             }
            
//             // If position groups are selected, dim non-matching groups
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
//             }
            
//             return 0.7;
//         })
//         .style('pointer-events', d => {
//             // Disable pointer events for filtered-out points
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 'auto' : 'none';
//             }
//             return 'auto';
//         })
//         .on('mouseover', function(event, d) {
//             // Skip interaction for filtered-out points
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (!biplot.selectedPositionGroups.has(positionGroup)) return;
//             }
            
//             // Highlight on hover
//             d3.select(this)
//                 .attr('r', 5)
//                 .attr('opacity', 1)
//                 .attr('stroke', '#000')
//                 .attr('stroke-width', 2);
            
//             // Show tooltip
//             biplot.tooltip.transition()
//                 .duration(200)
//                 .style('opacity', 0.9);
            
//             const positionGroup = mapPositionToGroup(d.player_positions);
//             biplot.tooltip.html(`
//                 <strong>${d.short_name || 'Unknown Player'}</strong><br>
//                 ${d.club_name || 'Unknown Club'}<br>
//                 ${d.nationality_name || 'Unknown Nationality'}<br>
//                 Position: ${d.player_positions || 'N/A'} (${positionGroup})<br>
//                 Overall: ${d.player_overall || '?'}<br>
//                 PC1: ${d.pca_x.toFixed(2)}, PC2: ${d.pca_y.toFixed(2)}
//             `)
//             .style('left', (event.pageX + 10) + 'px')
//             .style('top', (event.pageY - 28) + 'px');
//         })
//         .on('mouseout', function(event, d) {
//             // Reset on mouseout
//             d3.select(this)
//                 .attr('r', 3)
//                 .attr('opacity', d => {
//                     if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                         return 0.2;
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
//                     }
                    
//                     return 0.7;
//                 })
//                 .attr('stroke', d => {
//                     if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                         return '#000';
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
//                     }
                    
//                     return 'none';
//                 })
//                 .attr('stroke-width', d => {
//                     if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                         return 2;
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
//                     }
                    
//                     return 0;
//                 });
            
//             // Hide tooltip
//             biplot.tooltip.transition()
//                 .duration(500)
//                 .style('opacity', 0);
//         })
//         .on('click', function(event, d) {
//             // Select player on click if player_id exists
//             if (d.player_id) {
//                 selectPlayer(globalData.players.find(p => p.player_id === d.player_id));
//             }
//         });
    
//     // Draw feature vectors (loadings)
//     const loadingScale = Math.min(biplot.width, biplot.height) / 2 * 0.8;
    
//     biplot.featureNames.forEach((feature, i) => {
//         // Calculate vector coordinates
//         const x1 = biplot.xScale(0);
//         const y1 = biplot.yScale(0);
//         const x2 = biplot.xScale(biplot.loadings[0][i] * loadingScale);
//         const y2 = biplot.yScale(biplot.loadings[1][i] * loadingScale);
        
//         // Get vector magnitude for filtering
//         const magnitude = Math.sqrt(
//             Math.pow(biplot.loadings[0][i], 2) + Math.pow(biplot.loadings[1][i], 2)
//         );
        
//         // Skip vectors with very small magnitude
//         if (magnitude < 0.05) return;
        
//         // Draw loading vector
//         loadingsContainer.append('line')
//             .attr('class', 'loading-vector')
//             .attr('x1', x1)
//             .attr('y1', y1)
//             .attr('x2', x2)
//             .attr('y2', y2)
//             .attr('stroke', '#555')
//             .attr('stroke-width', 1.5);
        
//         // Add arrowhead
//         const arrowSize = 5;
//         const angle = Math.atan2(y1 - y2, x2 - x1);
        
//         loadingsContainer.append('path')
//             .attr('d', `M ${x2} ${y2} l ${-arrowSize * Math.cos(angle - Math.PI/6)} ${arrowSize * Math.sin(angle - Math.PI/6)} l ${-arrowSize * Math.cos(angle + Math.PI/6)} ${arrowSize * Math.sin(angle + Math.PI/6)} z`)
//             .attr('fill', '#555');
        
//         // Format feature name
//         const formattedName = feature.split('_')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(' ');
        
//         // Calculate label position with slight offset
//         const labelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) + 15;
//         const labelX = x1 + (x2 - x1) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * labelDistance;
//         const labelY = y1 + (y2 - y1) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * labelDistance;

//         // Add label with background for readability
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label-bg')
//             .attr('x', labelX)
//             .attr('y', labelY)
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('stroke', 'white')
//             .attr('stroke-width', 4)
//             .attr('paint-order', 'stroke')
//             .text(formattedName);
        
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label')
//             .attr('x', labelX)
//             .attr('y', labelY)
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('fill', '#333')
//             .text(formattedName);
//     });
    
//     // Add title with variance explained
//     biplot.svg.append('text')
//         .attr('class', 'biplot-title')
//         .attr('x', biplot.width / 2)
//         .attr('y', -15)
//         .attr('text-anchor', 'middle')
//         .style('font-size', '14px')
//         .style('font-weight', 'bold')
//         .text(`PCA Biplot - Total Variance Explained: ${((biplot.explainedVariance[0] + biplot.explainedVariance[1]) * 100).toFixed(1)}%`);
    
//     // Add filter indicator if position filters are active
//     if (hasPositionFilters) {
//         const groups = Array.from(biplot.selectedPositionGroups).join(', ');
//         biplot.svg.append('text')
//             .attr('class', 'filter-indicator')
//             .attr('x', biplot.width / 2)
//             .attr('y', -35)
//             .attr('text-anchor', 'middle')
//             .style('font-size', '12px')
//             .style('fill', '#f44336')
//             .text(`Filtered by: ${groups}`);
//     }
    
//     // Add legend for position groups
//     addBiplotLegend();
// }

// // Add legend for position groups
// function addBiplotLegend() {
//     // Use position groups
//     const positionGroups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4; // Four position groups fit nicely in one row
//     const itemWidth = legendWidth / itemsPerRow;
//     const itemHeight = 20;
//     const legendHeight = itemHeight + 30; // Just one row + title
    
//     // Create legend container at the bottom
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 50})`); // Position below x-axis label
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 5)
//         .attr('ry', 5);
    
//     // Add title
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 15)
//         .style('font-size', '12px')
//         .style('font-weight', 'bold')
//         .text('Position Groups');
    
//     // Add toggle instructions
//     legend.append('text')
//         .attr('x', legendWidth - 170)
//         .attr('y', 15)
//         .style('font-size', '8px')
//         .style('font-style', 'italic')
//         .text('Click on position group to filter');
    
//     // Add legend items for each position group
//     positionGroups.forEach((group, i) => {
//         const isSelected = biplot.selectedPositionGroups.has(group);
        
//         // Create group for legend item
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * itemWidth + 10}, ${30})`)
//             .style('cursor', 'pointer')
//             .on('click', function() {
//                 // Toggle selection for this position group
//                 if (biplot.selectedPositionGroups.has(group)) {
//                     biplot.selectedPositionGroups.delete(group);
                    
//                     // If no position groups selected now, reset to all
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         dashboardState.filters.position = 'all';
//                     }
//                 } else {
//                     // Clear other selections if this is first selection
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         biplot.selectedPositionGroups.clear();
//                     }
                    
//                     biplot.selectedPositionGroups.add(group);
                    
//                     // Update dashboard state with a representative position from this group
//                     const representativePosition = biplot.positionGroupToPositions[group][0];
//                     dashboardState.filters.position = representativePosition;
//                 }
                
//                 // Update dashboard UI
//                 const positionSelector = document.getElementById('position-selector');
//                 if (positionSelector) {
//                     positionSelector.value = dashboardState.filters.position;
//                 }
                
//                 // Update the rest of the dashboard
//                 updateSelectionDetails();
                
//                 // Update all visualizations
//                 updateAllVisualizations();
//             });
        
//         // Add selection background for better visibility
//         if (isSelected) {
//             item.append('rect')
//                 .attr('width', itemWidth - 15)
//                 .attr('height', 16)
//                 .attr('x', -5)
//                 .attr('y', -10)
//                 .attr('fill', '#f0f0f0')
//                 .attr('rx', 3)
//                 .attr('ry', 3);
//         }
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 10)
//             .attr('height', 10)
//             .attr('fill', biplot.colorScale(group))
//             .attr('stroke', isSelected ? '#000' : 'none')
//             .attr('stroke-width', isSelected ? 1 : 0);
        
//         // Add label
//         item.append('text')
//             .attr('x', 15)
//             .attr('y', 9)
//             .style('font-size', '10px')
//             .style('font-weight', isSelected ? 'bold' : 'normal')
//             .text(group);
        
//         // Add count badge if selected
//         if (isSelected) {
//             // Count players in this group
//             let count = 0;
//             biplot.pcaData.forEach(d => {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (positionGroup === group) {
//                     count++;
//                 }
//             });
            
//             // Add small badge with count
//             const badge = item.append('g')
//                 .attr('transform', `translate(${itemWidth - 35}, 0)`);
            
//             badge.append('rect')
//                 .attr('width', 20)
//                 .attr('height', 14)
//                 .attr('rx', 7)
//                 .attr('ry', 7)
//                 .attr('fill', '#555')
//                 .attr('y', -7);
                
//             badge.append('text')
//                 .attr('x', 10)
//                 .attr('y', 4)
//                 .attr('text-anchor', 'middle')
//                 .attr('fill', 'white')
//                 .attr('font-size', '9px')
//                 .text(count);
//         }
//     });
    
//     // Update SVG height to accommodate legend
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 10);
// }

// // Update biplot with zoom transformation
// function updateBiplotWithZoom() {
//     if (!biplot.zoomTransform) return;
    
//     // Apply zoom to points and loadings
//     biplot.svg.select('.points-container')
//         .attr('transform', biplot.zoomTransform);
    
//     biplot.svg.select('.loadings-container')
//         .attr('transform', biplot.zoomTransform);
    
//     // Update axes with zoomed scales
//     const newXScale = biplot.zoomTransform.rescaleX(biplot.xScale);
//     const newYScale = biplot.zoomTransform.rescaleY(biplot.yScale);
    
//     biplot.svg.select('.x-axis')
//         .call(d3.axisBottom(newXScale));
    
//     biplot.svg.select('.y-axis')
//         .call(d3.axisLeft(newYScale));
    
//     // Update grid lines
//     biplot.svg.selectAll('.grid-lines .horizontal')
//         .attr('y1', d => biplot.zoomTransform.applyY(biplot.yScale(d)))
//         .attr('y2', d => biplot.zoomTransform.applyY(biplot.yScale(d)));
    
//     biplot.svg.selectAll('.grid-lines .vertical')
//         .attr('x1', d => biplot.zoomTransform.applyX(biplot.xScale(d)))
//         .attr('x2', d => biplot.zoomTransform.applyX(biplot.xScale(d)));
    
//     // Update zero lines
//     biplot.svg.select('.zero-line:first-child')
//         .attr('x1', biplot.zoomTransform.applyX(biplot.xScale(0)))
//         .attr('x2', biplot.zoomTransform.applyX(biplot.xScale(0)));
    
//     biplot.svg.select('.zero-line:last-child')
//         .attr('y1', biplot.zoomTransform.applyY(biplot.yScale(0)))
//         .attr('y2', biplot.zoomTransform.applyY(biplot.yScale(0)));
// }

// // Update biplot visualization when data filters change
// function updateBiplot(filteredData) {
//     // Check if we need to reload PCA data due to league filter change
//     if (dashboardState.filters.league !== globalData.selectedLeague) {
//         globalData.selectedLeague = dashboardState.filters.league;
//         loadPCAData();
//         return;
//     }
    
//     // Sync position filter from dashboard if it changed
//     if (dashboardState.filters.position !== 'all') {
//         const newGroup = mapPositionToGroup(dashboardState.filters.position);
        
//         // Only update if different from current selection
//         if (newGroup !== "Unknown" && 
//             (biplot.selectedPositionGroups.size !== 1 || 
//              !biplot.selectedPositionGroups.has(newGroup))) {
            
//             biplot.selectedPositionGroups.clear();
//             biplot.selectedPositionGroups.add(newGroup);
//             renderBiplot();
//             return;
//         }
//     } else if (biplot.selectedPositionGroups.size > 0 && dashboardState.filters.position === 'all') {
//         // Reset filters if dashboard is set to 'all'
//         biplot.selectedPositionGroups.clear();
//         renderBiplot();
//         return;
//     }
    
//     // If no complete re-render needed, just update point visibility
//     // Get filtered IDs for highlighting
//     const filteredIds = new Set(filteredData.map(d => d.player_id));
    
//     // Update data points based on current filters
//     biplot.svg.selectAll('.data-point')
//         .style('opacity', d => {
//             // If a player is highlighted, dim all others
//             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                 return 0.2;
//             }
            
//             // If position filters are active, apply them
//             if (biplot.selectedPositionGroups.size > 0) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
                
//                 // If not in selected group, make nearly invisible
//                 if (!biplot.selectedPositionGroups.has(positionGroup)) {
//                     return 0.1;
//                 }
                
//                 // If in selected group but not in filtered data, make semi-visible
//                 return filteredIds.has(d.player_id) ? 0.8 : 0.3;
//             }
            
//             // Default: highlight points in filtered data, dim others
//             return filteredIds.has(d.player_id) ? 0.7 : 0.2;
//         })
//         .attr('r', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return 5;
//             }
            
//             if (biplot.selectedPositionGroups.size > 0) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (!biplot.selectedPositionGroups.has(positionGroup)) {
//                     return 2;
//                 }
//             }
            
//             return filteredIds.has(d.player_id) ? 3 : 2;
//         })
//         .style('pointer-events', d => {
//             // Disable interactions for points that should not be interactive
//             if (biplot.selectedPositionGroups.size > 0) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 'auto' : 'none';
//             }
            
//             return 'auto';
//         });
// }

// // Highlight a specific player in the biplot
// function highlightPlayerInBiplot(playerId) {
//     // Store the highlighted player ID
//     biplot.highlightedPlayerId = playerId;
    
//     // Find the player in the data
//     const player = biplot.pcaData.find(d => d.player_id === playerId);
//     if (!player) return;
    
//     // Update all data points based on the highlight
//     biplot.svg.selectAll('.data-point')
//         .attr('stroke', d => d.player_id === playerId ? '#000' : 'none')
//         .attr('stroke-width', d => d.player_id === playerId ? 2 : 0)
//         .attr('r', d => d.player_id === playerId ? 5 : 3)
//         .attr('opacity', d => {
//             if (d.player_id === playerId) return 1;
            
//             if (biplot.selectedPositionGroups.size > 0) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 0.3 : 0.1;
//             }
            
//             return 0.3;
//         });
    
//     // Center the view on the selected player with animation
//     const x = biplot.xScale(player.pca_x);
//     const y = biplot.yScale(player.pca_y);
    
//     // Create a zoom transform to center on the player
//     const transform = d3.zoomIdentity
//         .translate(biplot.width / 2 - x, biplot.height / 2 - y)
//         .scale(1.5);
    
//     // Apply the transform with smooth transition
//     d3.select('#biplot svg')
//         .transition()
//         .duration(750)
//         .call(d3.zoom().transform, transform);
// }

// Global variables for biplot
let biplot = {
    svg: null,
    width: 0,
    height: 0,
    margin: { top: 40, right: 40, bottom: 60, left: 80 },
    xScale: null,
    yScale: null,
    tooltip: null,
    pcaData: null,
    loadings: null,
    featureNames: null,
    explainedVariance: null,
    highlightedPlayerId: null,
    zoomTransform: null,
    selectedPositionGroups: new Set(), // Track selected position groups for filtering
    playerValueCategories: {
        "Bargain": 0,    // Undervalued players (high rating/potential relative to value)
        "Fair Value": 1, // Players valued appropriately for their abilities
        "Premium": 2,    // Players priced higher than their current abilities (could be due to potential or other factors)
        "Unknown": 3     // Not enough data to categorize
    },
    // Add more metrics that are relevant to the transfer market narrative
    marketValueMetrics: [
        'player_overall',        // Current ability
        'potential',             // Future ability
        'age',                   // Age affects value and potential realization
        'value_millions_eur',    // Market value
        'wage_thousands_eur',    // Salary cost
        'international_reputation' // Marketability/popularity
    ],
    // More vibrant color scheme for value categories
    valueColorScale: d3.scaleOrdinal()
        .domain(["Bargain", "Fair Value", "Premium", "Unknown"])
        .range(["#2ecc71", "#3498db", "#e74c3c", "#95a5a6"]),
    // Keep position color scale for reference
    positionColorScale: d3.scaleOrdinal()
        .domain(["Goalkeeper", "Defender", "Midfielder", "Attacker"])
        .range(["#ff9e00", "#4169e1", "#32cd32", "#dc143c"]),
    // Mapping between positions and position groups
    positionGroupToPositions: {
        "Goalkeeper": ["GK"],
        "Defender": ["CB", "LB", "RB", "LWB", "RWB"],
        "Midfielder": ["CDM", "CM", "CAM", "LM", "RM"],
        "Attacker": ["LW", "RW", "CF", "ST"]
    },
    positionToGroup: {}, // Will be populated in init
    // Current coloring mode: "position" or "value"
    colorMode: "value",
    // Toggle for showing/hiding vectors
    showVectors: true,
    // Quadrant labels for story elements
    quadrantLabels: [
        { x: 0.75, y: 0.25, text: "Young Talent", description: "High potential, moderate value" },
        { x: 0.25, y: 0.25, text: "Established Stars", description: "High performance, high value" },
        { x: 0.25, y: 0.75, text: "Veterans", description: "Declining value, solid performance" },
        { x: 0.75, y: 0.75, text: "Hidden Gems", description: "Undervalued performers" }
    ]
};

// Initialize position mapping
function initPositionMapping() {
    // Populate the position to group mapping from the group to positions mapping
    Object.entries(biplot.positionGroupToPositions).forEach(([group, positions]) => {
        positions.forEach(position => {
            biplot.positionToGroup[position] = group;
        });
    });
}

// Map position to group consistently
function mapPositionToGroup(position) {
    if (!position) return "Unknown";
    
    // Handle multiple positions (take the first one)
    const primaryPosition = position.split(',')[0].trim();
    
    // Check if it's directly in our mapping
    if (biplot.positionToGroup[primaryPosition]) {
        return biplot.positionToGroup[primaryPosition];
    }
    
    // For positions not in our mapping, try to infer the group
    if (primaryPosition.includes('GK')) {
        return "Goalkeeper";
    } else if (primaryPosition.includes('B') || primaryPosition === 'CB' || 
               primaryPosition === 'LB' || primaryPosition === 'RB' || 
               primaryPosition === 'LWB' || primaryPosition === 'RWB') {
        return "Defender";
    } else if (primaryPosition.includes('M') || primaryPosition === 'CDM' || 
               primaryPosition === 'CM' || primaryPosition === 'CAM' || 
               primaryPosition === 'LM' || primaryPosition === 'RM') {
        return "Midfielder";
    } else if (primaryPosition.includes('W') || primaryPosition.includes('F') || 
               primaryPosition === 'ST' || primaryPosition === 'CF' || 
               primaryPosition === 'LW' || primaryPosition === 'RW') {
        return "Attacker";
    }
    
    return "Unknown";
}

// Replace the calculatePlayerValueCategory function with this:

function calculatePlayerValueCategory(player) {
    if (!player) return "Unknown";
    
    // Output debug info
    console.log("Calculating value category for player:", player.short_name, 
                "Overall:", player.player_overall,
                "Value:", player.value_millions_eur,
                "Potential:", player.potential,
                "Age:", player.age);
    
    // Ensure we have all the necessary data
    if (player.player_overall === undefined || 
        player.value_millions_eur === undefined || 
        player.potential === undefined || 
        player.age === undefined) {
        console.log("Missing critical data for value calculation");
        return "Unknown";
    }
    
    // Use default values if data is null or NaN
    const overall = isNaN(player.player_overall) ? 70 : player.player_overall;
    const value = isNaN(player.value_millions_eur) ? 1 : Math.max(0.5, player.value_millions_eur);
    const potential = isNaN(player.potential) ? overall + 5 : player.potential;
    const age = isNaN(player.age) ? 25 : player.age;
    
    // Calculate value metrics
    const ageScore = Math.max(0, 30 - age); // Higher for younger players
    const potentialGrowth = potential - overall;
    
    // Calculate value for money (higher means more undervalued)
    // This formula weights potential growth more for younger players
    const valueForMoney = (overall + (potentialGrowth * (1 + ageScore/20))) / 
                          (value * Math.pow(1 + (player.international_reputation || 1) / 10, 2));
    
    console.log("Value for money calculation:", valueForMoney);
    
    // Categorize based on value for money
    if (valueForMoney > 2.5) return "Bargain";      // Significantly undervalued
    if (valueForMoney > 1.25) return "Fair Value";  // Reasonably priced
    return "Premium";                               // Expensive relative to abilities
}
// Initialize the biplot visualization
function initializeBiplot() {
    // Initialize position mapping
    initPositionMapping();
    
    // Set dimensions
    const container = document.getElementById('biplot');
    biplot.width = container.clientWidth - biplot.margin.left - biplot.margin.right;
    biplot.height = container.clientHeight - biplot.margin.top - biplot.margin.bottom;
    
    // Create SVG
    biplot.svg = d3.select('#biplot')
        .append('svg')
        .attr('width', biplot.width + biplot.margin.left + biplot.margin.right)
        .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom)
        .append('g')
        .attr('transform', `translate(${biplot.margin.left},${biplot.margin.top})`);
    
    // Create tooltip
    biplot.tooltip = createTooltip();
    
    // Create scales
    biplot.xScale = d3.scaleLinear()
        .range([0, biplot.width]);
    
    biplot.yScale = d3.scaleLinear()
        .range([biplot.height, 0]);
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => {
            biplot.zoomTransform = event.transform;
            updateBiplotWithZoom();
        });
    
    d3.select('#biplot svg')
        .call(zoom);
    
    // Add loading message
    biplot.svg.append('text')
        .attr('class', 'loading-text')
        .attr('x', biplot.width / 2)
        .attr('y', biplot.height / 2)
        .attr('text-anchor', 'middle')
        .text('Loading PCA data...');
    
    // Add controls for the biplot
    addBiplotControls();
    
    // Initial data load and rendering
    loadPCAData();
    
    // Listen for dashboard state changes
    listenForDashboardChanges();
}

// Add controls for the biplot visualization
function addBiplotControls() {
    // Create a container for all controls
    const controlsContainer = d3.select('#biplot-container')
        .append('div')
        .attr('class', 'biplot-controls')
        .style('position', 'absolute')
        .style('top', '10px')
        .style('right', '10px')
        .style('z-index', '10')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('gap', '5px');
    
    // Add reset button
    controlsContainer.append('button')
        .attr('id', 'biplot-reset')
        .style('cursor', 'pointer')
        .style('background-color', '#f0f0f0')
        .style('border', '1px solid #ccc')
        .style('border-radius', '3px')
        .style('padding', '5px 10px')
        .text('Reset Zoom & Selection')
        .on('click', function() {
            // Reset zoom
            d3.select('#biplot svg')
                .transition()
                .duration(750)
                .call(d3.zoom().transform, d3.zoomIdentity);
            
            // Reset selection
            biplot.highlightedPlayerId = null;
            biplot.selectedPositionGroups.clear();
            
            // Reset dashboard state if necessary
            if (dashboardState.filters.position !== 'all') {
                dashboardState.filters.position = 'all';
                const posSelector = document.getElementById('position-selector');
                if (posSelector) {
                    posSelector.value = 'all';
                }
                updateSelectionDetails();
                updateAllVisualizations();
            } else {
                // If already 'all', just update biplot
                renderBiplot();
            }
        });
    
    // Add color mode toggle button
    controlsContainer.append('button')
        .attr('id', 'biplot-color-toggle')
        .style('cursor', 'pointer')
        .style('background-color', biplot.colorMode === 'value' ? '#e74c3c' : '#3498db')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '3px')
        .style('padding', '5px 10px')
        .text(biplot.colorMode === 'value' ? 'Color By: Value' : 'Color By: Position')
        .on('click', function() {
            // Toggle color mode
            biplot.colorMode = biplot.colorMode === 'value' ? 'position' : 'value';
            
            // Update button appearance
            d3.select(this)
                .style('background-color', biplot.colorMode === 'value' ? '#e74c3c' : '#3498db')
                .text(biplot.colorMode === 'value' ? 'Color By: Value' : 'Color By: Position');
            
            // Re-render biplot with new coloring
            renderBiplot();
        });
    
    // Add vector toggle button
    // controlsContainer.append('button')
    //     .attr('id', 'biplot-vector-toggle')
    //     .style('cursor', 'pointer')
    //     .style('background-color', '#2c3e50')
    //     .style('color', 'white')
    //     .style('border', 'none')
    //     .style('border-radius', '3px')
    //     .style('padding', '5px 10px')
    //     .text(biplot.showVectors ? 'Hide Vectors' : 'Show Vectors')
    //     .on('click', function() {
    //         // Toggle vector visibility
    //         biplot.showVectors = !biplot.showVectors;
            
    //         // Update button text
    //         d3.select(this)
    //             .text(biplot.showVectors ? 'Hide Vectors' : 'Show Vectors');
            
    //         // Update vector visibility without full re-render
    //         biplot.svg.select('.loadings-container')
    //             .transition()
    //             .duration(300)
    //             .style('opacity', biplot.showVectors ? 1 : 0);
    //     });
}

// Listen for changes in dashboard state
function listenForDashboardChanges() {
    const positionSelector = document.getElementById('position-selector');
    if (positionSelector) {
        positionSelector.addEventListener('change', function() {
            const selectedPosition = this.value;
            updateBiplotFromDashboard(selectedPosition);
        });
    }
    
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            biplot.selectedPositionGroups.clear();
            renderBiplot();
        });
    }
}

// Update biplot based on dashboard position selection
function updateBiplotFromDashboard(selectedPosition) {
    // Clear previous selections
    biplot.selectedPositionGroups.clear();
    
    if (selectedPosition !== 'all') {
        // Convert position to group
        const group = mapPositionToGroup(selectedPosition);
        if (group !== "Unknown") {
            biplot.selectedPositionGroups.add(group);
        }
    }
    
    // Re-render biplot with updated selection
    renderBiplot();
}

// // Load PCA data from API with specified market value metrics
// async function loadPCAData() {
//     // Add this after the data is loaded in loadPCAData:
//     console.log("Loaded PCA Data:", {
//         players: biplot.pcaData ? biplot.pcaData.length : 0,
//         features: biplot.featureNames,
//         loadings: biplot.loadings ? biplot.loadings.length : 0
//     });

//     // Log a sample player to see what data is available
//     if (biplot.pcaData && biplot.pcaData.length > 0) {
//         console.log("Sample player data:", biplot.pcaData[0]);
//     }
//     try {
//         // Prepare a query with specific dimensions we want for our market value story
//         let url = '/api/pca';
//         if (dashboardState.filters.league !== 'all') {
//             url += `?league=${dashboardState.filters.league}`;
//         }
        
//         // Later, we could potentially add a parameter to request specific dimensions:
//         // &dimensions=player_overall,potential,age,value_millions_eur,wage_thousands_eur,international_reputation
        
//         const response = await fetch(url);
//         const data = await response.json();
        
//         if (data.error) {
//             throw new Error(data.error);
//         }
        
//         // Store PCA results
//         biplot.pcaData = data.players;
//         biplot.loadings = data.loadings;
//         biplot.featureNames = data.feature_names;
//         biplot.explainedVariance = data.explained_variance;
        
//         // Enrich data with value categories
//         biplot.pcaData.forEach(player => {
//             player.valueCategory = calculatePlayerValueCategory(player);
            
//             // Calculate simple value metrics for the tooltip
//             if (player.player_overall && player.value_millions_eur) {
//                 player.valuePerRating = (player.value_millions_eur / player.player_overall).toFixed(2);
//                 player.potentialGain = player.potential - player.player_overall;
//             }
//         });
        
//         // Check if we have position filter active from dashboard
//         if (dashboardState.filters.position !== 'all') {
//             const positionGroup = mapPositionToGroup(dashboardState.filters.position);
//             if (positionGroup !== "Unknown") {
//                 biplot.selectedPositionGroups.clear();
//                 biplot.selectedPositionGroups.add(positionGroup);
//             }
//         }
        
//         // Render the biplot
//         renderBiplot();
        
//     } catch (error) {
//         console.error('Error loading PCA data:', error);
//         biplot.svg.selectAll('*').remove();
//         biplot.svg.append('text')
//             .attr('x', biplot.width / 2)
//             .attr('y', biplot.height / 2)
//             .attr('text-anchor', 'middle')
//             .attr('fill', 'red')
//             .text('Error loading PCA data. Please try again.');
//     }
// }
async function loadPCAData() {
    try {
        if (!globalData.players || !globalData.players.length) {
            console.error("No player data available. Make sure data is loaded before initializing biplot.");
            biplot.svg.append('text')
                .attr('x', biplot.width / 2)
                .attr('y', biplot.height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'red')
                .text('Error: Player data not available');
            return;
        }
        
        // Prepare a query with specific dimensions we want for our market value story
        let url = '/api/pca';
        if (dashboardState.filters.league !== 'all') {
            url += `?league=${dashboardState.filters.league}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Store PCA results
        biplot.pcaData = data.players;
        biplot.loadings = data.loadings;
        biplot.featureNames = data.feature_names;
        biplot.explainedVariance = data.explained_variance;
        
        console.log("PCA Data received:", {
            playerCount: biplot.pcaData.length,
            features: biplot.featureNames
        });
        
        // Create a lookup map for global player data
        const playerMap = new Map();
        globalData.players.forEach(player => {
            if (player.player_id) {
                playerMap.set(player.player_id, player);
            }
        });
        
        console.log(`Created player map with ${playerMap.size} entries`);
        
        // Enrich PCA data with complete player details
        let enrichedCount = 0;
        biplot.pcaData.forEach(pcaPlayer => {
            // Find the corresponding full player data using player_id
            const fullPlayer = playerMap.get(pcaPlayer.player_id);
            
            if (fullPlayer) {
                // For debugging: log full player data for the first match
                if (enrichedCount === 0) {
                    console.log("Full player data example:", fullPlayer);
                }
                
                // Copy all properties from fullPlayer to pcaPlayer
                Object.keys(fullPlayer).forEach(key => {
                    if (!(key in pcaPlayer) || pcaPlayer[key] === undefined) {
                        pcaPlayer[key] = fullPlayer[key];
                    }
                });
                
                enrichedCount++;
            }
            
            // Calculate value category based on complete data
            pcaPlayer.valueCategory = calculatePlayerValueCategory(pcaPlayer);
            
            // Calculate additional metrics
            if (pcaPlayer.player_overall && pcaPlayer.value_millions_eur) {
                pcaPlayer.valuePerRating = (pcaPlayer.value_millions_eur / pcaPlayer.player_overall).toFixed(2);
                pcaPlayer.potentialGain = pcaPlayer.potential - pcaPlayer.player_overall;
            }
        });
        
        console.log(`Enriched ${enrichedCount} out of ${biplot.pcaData.length} players with complete data`);
        
        // Check if we have position filter active from dashboard
        if (dashboardState.filters.position !== 'all') {
            const positionGroup = mapPositionToGroup(dashboardState.filters.position);
            if (positionGroup !== "Unknown") {
                biplot.selectedPositionGroups.clear();
                biplot.selectedPositionGroups.add(positionGroup);
            }
        }
        
        // Render the biplot
        renderBiplot();
        
    } catch (error) {
        console.error('Error loading PCA data:', error);
        biplot.svg.selectAll('*').remove();
        biplot.svg.append('text')
            .attr('x', biplot.width / 2)
            .attr('y', biplot.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .text('Error loading PCA data: ' + error.message);
    }
}

// // Render the biplot visualization with the transfer market story
// function renderBiplot() {
//     // Clear SVG
//     biplot.svg.selectAll('*').remove();
    
//     // Check if we have data
//     if (!biplot.pcaData || !biplot.pcaData.length) {
//         biplot.svg.append('text')
//             .attr('x', biplot.width / 2)
//             .attr('y', biplot.height / 2)
//             .attr('text-anchor', 'middle')
//             .attr('fill', '#666')
//             .text('No PCA data available. Please try a different selection.');
//         return;
//     }
    
//     // Extract PC coordinates
//     const xValues = biplot.pcaData.map(d => d.pca_x);
//     const yValues = biplot.pcaData.map(d => d.pca_y);
    
//     // Update scales
//     biplot.xScale.domain([d3.min(xValues) * 1.1, d3.max(xValues) * 1.1]);
//     biplot.yScale.domain([d3.min(yValues) * 1.1, d3.max(yValues) * 1.1]);
    
//     // Create axis objects
//     const xAxis = d3.axisBottom(biplot.xScale);
//     const yAxis = d3.axisLeft(biplot.yScale);
    
//     // Add background quadrants for the story
//     addQuadrants();
    
//     // Add grid lines
//     biplot.svg.append('g')
//         .attr('class', 'grid-lines')
//         .selectAll('line.horizontal')
//         .data(biplot.yScale.ticks(5))
//         .enter()
//         .append('line')
//         .attr('class', 'horizontal')
//         .attr('x1', 0)
//         .attr('x2', biplot.width)
//         .attr('y1', d => biplot.yScale(d))
//         .attr('y2', d => biplot.yScale(d))
//         .attr('stroke', '#e0e0e0')
//         .attr('stroke-width', 1);
    
//     biplot.svg.append('g')
//         .attr('class', 'grid-lines')
//         .selectAll('line.vertical')
//         .data(biplot.xScale.ticks(5))
//         .enter()
//         .append('line')
//         .attr('class', 'vertical')
//         .attr('y1', 0)
//         .attr('y2', biplot.height)
//         .attr('x1', d => biplot.xScale(d))
//         .attr('x2', d => biplot.xScale(d))
//         .attr('stroke', '#e0e0e0')
//         .attr('stroke-width', 1);
    
//     // Add zero lines
//     biplot.svg.append('line')
//         .attr('class', 'zero-line')
//         .attr('x1', biplot.xScale(0))
//         .attr('x2', biplot.xScale(0))
//         .attr('y1', 0)
//         .attr('y2', biplot.height)
//         .attr('stroke', '#aaa')
//         .attr('stroke-dasharray', '3,3');
    
//     biplot.svg.append('line')
//         .attr('class', 'zero-line')
//         .attr('y1', biplot.yScale(0))
//         .attr('y2', biplot.yScale(0))
//         .attr('x1', 0)
//         .attr('x2', biplot.width)
//         .attr('stroke', '#aaa')
//         .attr('stroke-dasharray', '3,3');
    
//     // Add X axis
//     biplot.svg.append('g')
//         .attr('class', 'x-axis')
//         .attr('transform', `translate(0,${biplot.height})`)
//         .call(xAxis);
    
//     // Add Y axis
//     biplot.svg.append('g')
//         .attr('class', 'y-axis')
//         .call(yAxis);
    
//     // Add axis labels with interpretations based on loadings
//     addAxisLabelsWithInterpretation();
    
//     // Create a container for data points
//     const pointsContainer = biplot.svg.append('g')
//         .attr('class', 'points-container');
    
//     // Create a container for loadings
//     const loadingsContainer = biplot.svg.append('g')
//         .attr('class', 'loadings-container')
//         .style('opacity', biplot.showVectors ? 1 : 0);
    
//     // Filter data points based on selected position groups
//     const hasPositionFilters = biplot.selectedPositionGroups.size > 0;
    
//     // Add data points
//     pointsContainer.selectAll('.data-point')
//         .data(biplot.pcaData)
//         .enter()
//         .append('circle')
//         .attr('class', 'data-point')
//         .attr('cx', d => biplot.xScale(d.pca_x))
//         .attr('cy', d => biplot.yScale(d.pca_y))
//         .attr('r', d => {
//             // Make higher-valued players appear slightly larger
//             if (biplot.colorMode === 'value') {
//                 const baseSize = 3;
//                 // If value is very high, increase size slightly
//                 if (d.value_millions_eur > 50) return baseSize + 2;
//                 if (d.value_millions_eur > 20) return baseSize + 1;
//                 return baseSize;
//             }
//             return 3;
//         })
//         .attr('fill', d => {
//             if (biplot.colorMode === 'value') {
//                 return biplot.valueColorScale(d.valueCategory);
//             } else {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.positionColorScale(positionGroup);
//             }
//         })
//         .attr('stroke', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return '#000';
//             }
            
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
//             }
            
//             return 'none';
//         })
//         .attr('stroke-width', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return 2;
//             }
            
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
//             }
            
//             return 0;
//         })
//         .attr('opacity', d => {
//             // If a player is highlighted, dim all others
//             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                 return 0.2;
//             }
            
//             // If position groups are selected, dim non-matching groups
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
//             }
            
//             return 0.7;
//         })
//         .style('pointer-events', d => {
//             // Disable pointer events for filtered-out points
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 'auto' : 'none';
//             }
//             return 'auto';
//         })
//         .on('mouseover', function(event, d) {
//             // Skip interaction for filtered-out points
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (!biplot.selectedPositionGroups.has(positionGroup)) return;
//             }
            
//             // Highlight on hover
//             d3.select(this)
//                 .attr('r', d => {
//                     // Base size for highlighted state
//                     const baseSize = 5;
//                     // If value is very high, increase size slightly
//                     if (d.value_millions_eur > 50) return baseSize + 2;
//                     if (d.value_millions_eur > 20) return baseSize + 1;
//                     return baseSize;
//                 })
//                 .attr('opacity', 1)
//                 .attr('stroke', '#000')
//                 .attr('stroke-width', 2);
            
//             // Show tooltip with market value information
//             biplot.tooltip.transition()
//                 .duration(200)
//                 .style('opacity', 0.9);
            
//             const positionGroup = mapPositionToGroup(d.player_positions);
//             let valueAssessment = '';
            
//             switch (d.valueCategory) {
//                 case 'Bargain':
//                     valueAssessment = '<span style="color:#2ecc71;font-weight:bold;">Bargain</span>';
//                     break;
//                 case 'Fair Value':
//                     valueAssessment = '<span style="color:#3498db;font-weight:bold;">Fair Value</span>';
//                     break;
//                 case 'Premium':
//                     valueAssessment = '<span style="color:#e74c3c;font-weight:bold;">Premium Price</span>';
//                     break;
//                 default:
//                     valueAssessment = '<span style="color:#95a5a6;font-weight:bold;">Unknown</span>';
//             }
            
//             // Format tooltip content with market info
//             biplot.tooltip.html(`
//                 <strong>${d.short_name || 'Unknown Player'}</strong> (${d.age || '?'} yo)<br>
//                 ${d.club_name || 'Unknown Club'}<br>
//                 ${d.nationality_name || 'Unknown Nationality'}<br>
//                 <span style="color:#777">Position:</span> ${d.player_positions || 'N/A'} (${positionGroup})<br>
//                 <span style="color:#777">Overall:</span> ${d.player_overall || '?'} | <span style="color:#777">Potential:</span> ${d.potential || '?'}<br>
//                 <span style="color:#777">Value:</span> €${d.value_millions_eur ? d.value_millions_eur.toFixed(1) : '?'}M | <span style="color:#777">Wage:</span> €${d.wage_thousands_eur ? d.wage_thousands_eur.toFixed(1) : '?'}K<br>
//                 <span style="color:#777">Value per Rating:</span> €${d.valuePerRating || '?'}M<br>
//                 <hr style="margin:3px 0;opacity:0.3">
//                 <div style="font-size:11px;margin-top:3px">Market Assessment: ${valueAssessment}</div>
//             `)
//             .style('left', (event.pageX + 10) + 'px')
//             .style('top', (event.pageY - 28) + 'px');
//         })
//         .on('mouseout', function(event, d) {
//             // Reset on mouseout
//             d3.select(this)
//                 .attr('r', d => {
//                     // Base size
//                     const baseSize = 3;
//                     // If value is very high, maintain slightly increased size
//                     if (biplot.colorMode === 'value') {
//                         if (d.value_millions_eur > 50) return baseSize + 2;
//                         if (d.value_millions_eur > 20) return baseSize + 1;
//                     }
//                     return baseSize;
//                 })
//                 .attr('opacity', d => {
//                     if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                         return 0.2;
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
//                     }
                    
//                     return 0.7;
//                 })
//                 .attr('stroke', d => {
//                     if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                         return '#000';
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
//                     }
                    
//                     return 'none';
//                 })
//                 .attr('stroke-width', d => {
//                     if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                         return 2;
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
//                     }
                    
//                     return 0;
//                 });
            
//             // Hide tooltip
//             biplot.tooltip.transition()
//                 .duration(500)
//                 .style('opacity', 0);
//         })
//         .on('click', function(event, d) {
//             // Select player on click if player_id exists
//             if (d.player_id) {
//                 // First try to find the enriched player from our PCA data
//                 const selectedPlayer = biplot.pcaData.find(p => p.player_id === d.player_id);
                
//                 // If that fails, try to find the player in the global data
//                 if (!selectedPlayer) {
//                     const globalPlayer = globalData.players.find(p => p.player_id === d.player_id);
//                     if (globalPlayer) {
//                         selectPlayer(globalPlayer);
//                     }
//                 } else {
//                     selectPlayer(selectedPlayer);
//                 }
//             }
//         });
    
//     // Draw feature vectors (loadings) if enabled
//     if (biplot.showVectors) {
//         const loadingScale = Math.min(biplot.width, biplot.height) / 2 * 0.8;
        
//         // We'll draw vectors but NOT generate any labels automatically
//         biplot.featureNames.forEach((feature, i) => {
//             // Only draw vectors for our three attributes of interest
//             if (feature !== 'value_millions_eur' && feature !== 'pace' && feature !== 'shooting') {
//                 return;
//             }
            
//             // Calculate vector coordinates
//             const x1 = biplot.xScale(0); // Origin
//             const y1 = biplot.yScale(0); // Origin
//             const x2 = biplot.xScale(biplot.loadings[0][i] * loadingScale);
//             const y2 = biplot.yScale(biplot.loadings[1][i] * loadingScale);
            
//             // Draw loading vector
//             loadingsContainer.append('line')
//                 .attr('class', 'loading-vector')
//                 .attr('x1', x1)
//                 .attr('y1', y1)
//                 .attr('x2', x2)
//                 .attr('y2', y2)
//                 .attr('stroke', getFeatureColor(feature))
//                 .attr('stroke-width', 1.5);
            
//             // Add arrowhead
//             const arrowSize = 5;
//             const angle = Math.atan2(y1 - y2, x2 - x1);
            
//             loadingsContainer.append('path')
//                 .attr('d', `M ${x2} ${y2} l ${-arrowSize * Math.cos(angle - Math.PI/6)} ${arrowSize * Math.sin(angle - Math.PI/6)} l ${-arrowSize * Math.cos(angle + Math.PI/6)} ${arrowSize * Math.sin(angle + Math.PI/6)} z`)
//                 .attr('fill', getFeatureColor(feature));
//         });
        
//         // Now add the three hardcoded labels ONLY
        
//         // 1. Pace (3, 4)
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label-bg')
//             .attr('x', biplot.xScale(3))
//             .attr('y', biplot.yScale(4))
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('stroke', 'white')
//             .attr('stroke-width', 4)
//             .attr('paint-order', 'stroke')
//             .text('Pace');
        
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label')
//             .attr('x', biplot.xScale(3))
//             .attr('y', biplot.yScale(4))
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('fill', getFeatureColor('pace'))
//             .attr('font-weight', 'bold')
//             .text('Pace');
        
//         // 2. Value (-3, 4) - SHORTENED LABEL
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label-bg')
//             .attr('x', biplot.xScale(-3))
//             .attr('y', biplot.yScale(4))
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('stroke', 'white')
//             .attr('stroke-width', 4)
//             .attr('paint-order', 'stroke')
//             .text('Value');
        
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label')
//             .attr('x', biplot.xScale(-3))
//             .attr('y', biplot.yScale(4))
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('fill', getFeatureColor('value_millions_eur'))
//             .attr('font-weight', 'bold')
//             .text('Value');
        
//         // 3. Shooting (-3, -2)
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label-bg')
//             .attr('x', biplot.xScale(-3))
//             .attr('y', biplot.yScale(-2))
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('stroke', 'white')
//             .attr('stroke-width', 4)
//             .attr('paint-order', 'stroke')
//             .text('Shooting');
        
//         loadingsContainer.append('text')
//             .attr('class', 'vector-label')
//             .attr('x', biplot.xScale(-3))
//             .attr('y', biplot.yScale(-2))
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '10px')
//             .attr('fill', getFeatureColor('shooting'))
//             .attr('font-weight', 'bold')
//             .text('Shooting');
//     }
    
//     // Add title with variance explained and market value theme
//     biplot.svg.append('text')
//         .attr('class', 'biplot-title')
//         .attr('x', biplot.width / 2)
//         .attr('y', -15)
//         .attr('text-anchor', 'middle')
//         .style('font-size', '14px')
//         .style('font-weight', 'bold')
//         .text(`Transfer Market Value Analysis - Total Variance Explained: ${((biplot.explainedVariance[0] + biplot.explainedVariance[1]) * 100).toFixed(1)}%`);
    
//     // Add filter indicator if position filters are active
//     if (hasPositionFilters) {
//         const groups = Array.from(biplot.selectedPositionGroups).join(', ');
//         biplot.svg.append('text')
//             .attr('class', 'filter-indicator')
//             .attr('x', biplot.width / 2)
//             .attr('y', -35)
//             .attr('text-anchor', 'middle')
//             .style('font-size', '12px')
//             .style('fill', '#f44336')
//             .text(`Filtered by: ${groups}`);
//     }
    
//     // Add legend based on current color mode
//     if (biplot.colorMode === 'value') {
//         addValueCategoryLegend();
//     } else {
//         addPositionLegend();
//     }
// }

// function renderBiplot() {
//     // Clear SVG completely before starting
//     biplot.svg.selectAll('*').remove();
    
//     // Check if we have data
//     if (!biplot.pcaData || !biplot.pcaData.length) {
//         biplot.svg.append('text')
//             .attr('x', biplot.width / 2)
//             .attr('y', biplot.height / 2)
//             .attr('text-anchor', 'middle')
//             .attr('fill', '#666')
//             .text('No PCA data available. Please try a different selection.');
//         return;
//     }
    
//     // Extract PC coordinates
//     const xValues = biplot.pcaData.map(d => d.pca_x);
//     const yValues = biplot.pcaData.map(d => d.pca_y);
    
//     // Update scales
//     biplot.xScale.domain([d3.min(xValues) * 1.1, d3.max(xValues) * 1.1]);
//     biplot.yScale.domain([d3.min(yValues) * 1.1, d3.max(yValues) * 1.1]);
    
//     // Create axis objects
//     const xAxis = d3.axisBottom(biplot.xScale);
//     const yAxis = d3.axisLeft(biplot.yScale);
    
//     // Add background quadrants for the story
//     addQuadrants();
    
//     // Add grid lines
//     biplot.svg.append('g')
//         .attr('class', 'grid-lines')
//         .selectAll('line.horizontal')
//         .data(biplot.yScale.ticks(5))
//         .enter()
//         .append('line')
//         .attr('class', 'horizontal')
//         .attr('x1', 0)
//         .attr('x2', biplot.width)
//         .attr('y1', d => biplot.yScale(d))
//         .attr('y2', d => biplot.yScale(d))
//         .attr('stroke', '#e0e0e0')
//         .attr('stroke-width', 1);
    
//     biplot.svg.append('g')
//         .attr('class', 'grid-lines')
//         .selectAll('line.vertical')
//         .data(biplot.xScale.ticks(5))
//         .enter()
//         .append('line')
//         .attr('class', 'vertical')
//         .attr('y1', 0)
//         .attr('y2', biplot.height)
//         .attr('x1', d => biplot.xScale(d))
//         .attr('x2', d => biplot.xScale(d))
//         .attr('stroke', '#e0e0e0')
//         .attr('stroke-width', 1);
    
//     // Add zero lines
//     biplot.svg.append('line')
//         .attr('class', 'zero-line')
//         .attr('x1', biplot.xScale(0))
//         .attr('x2', biplot.xScale(0))
//         .attr('y1', 0)
//         .attr('y2', biplot.height)
//         .attr('stroke', '#aaa')
//         .attr('stroke-dasharray', '3,3');
    
//     biplot.svg.append('line')
//         .attr('class', 'zero-line')
//         .attr('y1', biplot.yScale(0))
//         .attr('y2', biplot.yScale(0))
//         .attr('x1', 0)
//         .attr('x2', biplot.width)
//         .attr('stroke', '#aaa')
//         .attr('stroke-dasharray', '3,3');
    
//     // Add X axis
//     biplot.svg.append('g')
//         .attr('class', 'x-axis')
//         .attr('transform', `translate(0,${biplot.height})`)
//         .call(xAxis);
    
//     // Add Y axis
//     biplot.svg.append('g')
//         .attr('class', 'y-axis')
//         .call(yAxis);
    
//     // Create a container for data points
//     const pointsContainer = biplot.svg.append('g')
//         .attr('class', 'points-container');
    
//     // Create a container for vectors and labels (but DO NOT name it loadingsContainer 
//     // to avoid any conflicts with existing code)
//     const vectorsGroup = biplot.svg.append('g')
//         .attr('class', 'vector-elements')
//         .style('opacity', biplot.showVectors ? 1 : 0);
    
//     // Filter data points based on selected position groups
//     const hasPositionFilters = biplot.selectedPositionGroups.size > 0;
    
//     // Add data points
//     pointsContainer.selectAll('.data-point')
//         .data(biplot.pcaData)
//         .enter()
//         .append('circle')
//         .attr('class', 'data-point')
//         .attr('cx', d => biplot.xScale(d.pca_x))
//         .attr('cy', d => biplot.yScale(d.pca_y))
//         .attr('r', d => {
//             // Make higher-valued players appear slightly larger
//             if (biplot.colorMode === 'value') {
//                 const baseSize = 3;
//                 // If value is very high, increase size slightly
//                 if (d.value_millions_eur > 50) return baseSize + 2;
//                 if (d.value_millions_eur > 20) return baseSize + 1;
//                 return baseSize;
//             }
//             return 3;
//         })
//         .attr('fill', d => {
//             if (biplot.colorMode === 'value') {
//                 return biplot.valueColorScale(d.valueCategory);
//             } else {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.positionColorScale(positionGroup);
//             }
//         })
//         .attr('stroke', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return '#000';
//             }
            
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
//             }
            
//             return 'none';
//         })
//         .attr('stroke-width', d => {
//             if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                 return 2;
//             }
            
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
//             }
            
//             return 0;
//         })
//         .attr('opacity', d => {
//             // If a player is highlighted, dim all others
//             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                 return 0.2;
//             }
            
//             // If position groups are selected, dim non-matching groups
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
//             }
            
//             return 0.7;
//         })
//         .style('pointer-events', d => {
//             // Disable pointer events for filtered-out points
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 return biplot.selectedPositionGroups.has(positionGroup) ? 'auto' : 'none';
//             }
//             return 'auto';
//         })
//         .on('mouseover', function(event, d) {
//             // Skip interaction for filtered-out points
//             if (hasPositionFilters) {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (!biplot.selectedPositionGroups.has(positionGroup)) return;
//             }
            
//             // Highlight on hover
//             d3.select(this)
//                 .attr('r', d => {
//                     // Base size for highlighted state
//                     const baseSize = 5;
//                     // If value is very high, increase size slightly
//                     if (d.value_millions_eur > 50) return baseSize + 2;
//                     if (d.value_millions_eur > 20) return baseSize + 1;
//                     return baseSize;
//                 })
//                 .attr('opacity', 1)
//                 .attr('stroke', '#000')
//                 .attr('stroke-width', 2);
            
//             // Show tooltip with market value information
//             biplot.tooltip.transition()
//                 .duration(200)
//                 .style('opacity', 0.9);
            
//             const positionGroup = mapPositionToGroup(d.player_positions);
//             let valueAssessment = '';
            
//             switch (d.valueCategory) {
//                 case 'Bargain':
//                     valueAssessment = '<span style="color:#2ecc71;font-weight:bold;">Bargain</span>';
//                     break;
//                 case 'Fair Value':
//                     valueAssessment = '<span style="color:#3498db;font-weight:bold;">Fair Value</span>';
//                     break;
//                 case 'Premium':
//                     valueAssessment = '<span style="color:#e74c3c;font-weight:bold;">Premium Price</span>';
//                     break;
//                 default:
//                     valueAssessment = '<span style="color:#95a5a6;font-weight:bold;">Unknown</span>';
//             }
            
//             // Format tooltip content with market info
//             biplot.tooltip.html(`
//                 <strong>${d.short_name || 'Unknown Player'}</strong> (${d.age || '?'} yo)<br>
//                 ${d.club_name || 'Unknown Club'}<br>
//                 ${d.nationality_name || 'Unknown Nationality'}<br>
//                 <span style="color:#777">Position:</span> ${d.player_positions || 'N/A'} (${positionGroup})<br>
//                 <span style="color:#777">Overall:</span> ${d.player_overall || '?'} | <span style="color:#777">Potential:</span> ${d.potential || '?'}<br>
//                 <span style="color:#777">Value:</span> €${d.value_millions_eur ? d.value_millions_eur.toFixed(1) : '?'}M | <span style="color:#777">Wage:</span> €${d.wage_thousands_eur ? d.wage_thousands_eur.toFixed(1) : '?'}K<br>
//                 <span style="color:#777">Value per Rating:</span> €${d.valuePerRating || '?'}M<br>
//                 <hr style="margin:3px 0;opacity:0.3">
//                 <div style="font-size:11px;margin-top:3px">Market Assessment: ${valueAssessment}</div>
//             `)
//             .style('left', (event.pageX + 10) + 'px')
//             .style('top', (event.pageY - 28) + 'px');
//         })
//         .on('mouseout', function(event, d) {
//             // Reset on mouseout
//             d3.select(this)
//                 .attr('r', d => {
//                     // Base size
//                     const baseSize = 3;
//                     // If value is very high, maintain slightly increased size
//                     if (biplot.colorMode === 'value') {
//                         if (d.value_millions_eur > 50) return baseSize + 2;
//                         if (d.value_millions_eur > 20) return baseSize + 1;
//                     }
//                     return baseSize;
//                 })
//                 .attr('opacity', d => {
//                     if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                         return 0.2;
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
//                     }
                    
//                     return 0.7;
//                 })
//                 .attr('stroke', d => {
//                     if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                         return '#000';
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
//                     }
                    
//                     return 'none';
//                 })
//                 .attr('stroke-width', d => {
//                     if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
//                         return 2;
//                     }
                    
//                     if (hasPositionFilters) {
//                         const position = d.player_positions || 'Unknown';
//                         const positionGroup = mapPositionToGroup(position);
//                         return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
//                     }
                    
//                     return 0;
//                 });
            
//             // Hide tooltip
//             biplot.tooltip.transition()
//                 .duration(500)
//                 .style('opacity', 0);
//         })
//         .on('click', function(event, d) {
//             // Select player on click if player_id exists
//             if (d.player_id) {
//                 // First try to find the enriched player from our PCA data
//                 const selectedPlayer = biplot.pcaData.find(p => p.player_id === d.player_id);
                
//                 // If that fails, try to find the player in the global data
//                 if (!selectedPlayer) {
//                     const globalPlayer = globalData.players.find(p => p.player_id === d.player_id);
//                     if (globalPlayer) {
//                         selectPlayer(globalPlayer);
//                     }
//                 } else {
//                     selectPlayer(selectedPlayer);
//                 }
//             }
//         });
    
//     // ONLY if vectors should be shown, draw them  
//     if (biplot.showVectors) {
//         const loadingScale = Math.min(biplot.width, biplot.height) / 2 * 0.8;
        
//         // Map of feature names to their data (to simplify lookup)
//         const featureMap = {};
//         biplot.featureNames.forEach((feature, i) => {
//             if (feature === 'value_millions_eur' || feature === 'pace' || feature === 'shooting') {
//                 featureMap[feature] = {
//                     index: i,
//                     vector: {
//                         x1: 0,
//                         y1: 0,
//                         x2: biplot.loadings[0][i] * loadingScale,
//                         y2: biplot.loadings[1][i] * loadingScale
//                     }
//                 };
//             }
//         });
        
//         // Draw only the vectors for the three attributes we care about
//         Object.keys(featureMap).forEach(feature => {
//             const vector = featureMap[feature].vector;
            
//             // Draw vector
//             vectorsGroup.append('line')
//                 .attr('x1', biplot.xScale(vector.x1))
//                 .attr('y1', biplot.yScale(vector.y1))
//                 .attr('x2', biplot.xScale(vector.x2))
//                 .attr('y2', biplot.yScale(vector.y2))
//                 .attr('stroke', getFeatureColor(feature))
//                 .attr('stroke-width', 1.5);
            
//             // Draw arrowhead
//             const arrowSize = 5;
//             const angle = Math.atan2(vector.y1 - vector.y2, vector.x2 - vector.x1);
            
//             vectorsGroup.append('path')
//                 .attr('d', `M ${biplot.xScale(vector.x2)} ${biplot.yScale(vector.y2)} l ${-arrowSize * Math.cos(angle - Math.PI/6)} ${arrowSize * Math.sin(angle - Math.PI/6)} l ${-arrowSize * Math.cos(angle + Math.PI/6)} ${arrowSize * Math.sin(angle + Math.PI/6)} z`)
//                 .attr('fill', getFeatureColor(feature));
//         });
        
//         // Hardcoded label positions
//         const labelPositions = {
//             'pace': { x: 3, y: 4 },
//             'value_millions_eur': { x: -3, y: 4 },
//             'shooting': { x: -3, y: -2 }
//         };
        
//         // Add hardcoded labels with adjusted names
//         Object.keys(labelPositions).forEach(feature => {
//             const pos = labelPositions[feature];
//             // Set the label text (shorter for value)
//             const labelText = feature === 'value_millions_eur' ? 'Value' : feature.charAt(0).toUpperCase() + feature.slice(1);
            
//             // Add label (no background for simplicity)
//             vectorsGroup.append('text')
//                 .attr('x', biplot.xScale(pos.x))
//                 .attr('y', biplot.yScale(pos.y))
//                 .attr('text-anchor', 'middle')
//                 .attr('font-size', '10px')
//                 .attr('fill', getFeatureColor(feature))
//                 .attr('font-weight', 'bold')
//                 .text(labelText);
//         });
//     }
    
//     // Add title with variance explained and market value theme
//     biplot.svg.append('text')
//         .attr('class', 'biplot-title')
//         .attr('x', biplot.width / 2)
//         .attr('y', -15)
//         .attr('text-anchor', 'middle')
//         .style('font-size', '14px')
//         .style('font-weight', 'bold')
//         .text(`Transfer Market Value Analysis - Total Variance Explained: ${((biplot.explainedVariance[0] + biplot.explainedVariance[1]) * 100).toFixed(1)}%`);
    
//     // Add filter indicator if position filters are active
//     if (hasPositionFilters) {
//         const groups = Array.from(biplot.selectedPositionGroups).join(', ');
//         biplot.svg.append('text')
//             .attr('class', 'filter-indicator')
//             .attr('x', biplot.width / 2)
//             .attr('y', -35)
//             .attr('text-anchor', 'middle')
//             .style('font-size', '12px')
//             .style('fill', '#f44336')
//             .text(`Filtered by: ${groups}`);
//     }
    
//     // Add legend based on current color mode
//     if (biplot.colorMode === 'value') {
//         addValueCategoryLegend();
//     } else {
//         addPositionLegend();
//     }
// }

function renderBiplot() {
    // Clear SVG completely before starting
    biplot.svg.selectAll('*').remove();
    
    // Check if we have data
    if (!biplot.pcaData || !biplot.pcaData.length) {
        biplot.svg.append('text')
            .attr('x', biplot.width / 2)
            .attr('y', biplot.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#666')
            .text('No PCA data available. Please try a different selection.');
        return;
    }
    
    // Extract PC coordinates
    const xValues = biplot.pcaData.map(d => d.pca_x);
    const yValues = biplot.pcaData.map(d => d.pca_y);
    
    // Update scales
    biplot.xScale.domain([d3.min(xValues) * 1.1, d3.max(xValues) * 1.1]);
    biplot.yScale.domain([d3.min(yValues) * 1.1, d3.max(yValues) * 1.1]);
    
    // Create axis objects
    const xAxis = d3.axisBottom(biplot.xScale);
    const yAxis = d3.axisLeft(biplot.yScale);
    
    // Add background quadrants for the story
    addQuadrants();
    
    // Add grid lines
    biplot.svg.append('g')
        .attr('class', 'grid-lines')
        .selectAll('line.horizontal')
        .data(biplot.yScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'horizontal')
        .attr('x1', 0)
        .attr('x2', biplot.width)
        .attr('y1', d => biplot.yScale(d))
        .attr('y2', d => biplot.yScale(d))
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);
    
    biplot.svg.append('g')
        .attr('class', 'grid-lines')
        .selectAll('line.vertical')
        .data(biplot.xScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'vertical')
        .attr('y1', 0)
        .attr('y2', biplot.height)
        .attr('x1', d => biplot.xScale(d))
        .attr('x2', d => biplot.xScale(d))
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);
    
    // Add zero lines
    biplot.svg.append('line')
        .attr('class', 'zero-line')
        .attr('x1', biplot.xScale(0))
        .attr('x2', biplot.xScale(0))
        .attr('y1', 0)
        .attr('y2', biplot.height)
        .attr('stroke', '#aaa')
        .attr('stroke-dasharray', '3,3');
    
    biplot.svg.append('line')
        .attr('class', 'zero-line')
        .attr('y1', biplot.yScale(0))
        .attr('y2', biplot.yScale(0))
        .attr('x1', 0)
        .attr('x2', biplot.width)
        .attr('stroke', '#aaa')
        .attr('stroke-dasharray', '3,3');
    
    // Add X axis
    biplot.svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${biplot.height})`)
        .call(xAxis);
    
    // Add Y axis
    biplot.svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    
    // Create a container for data points
    const pointsContainer = biplot.svg.append('g')
        .attr('class', 'points-container');
    
    // Create a container for vectors and labels (but DO NOT name it loadingsContainer 
    // to avoid any conflicts with existing code)
    const vectorsGroup = biplot.svg.append('g')
        .attr('class', 'vector-elements')
        .style('opacity', biplot.showVectors ? 1 : 0);
    
    // Filter data points based on selected position groups
    const hasPositionFilters = biplot.selectedPositionGroups.size > 0;
    
    // Add data points
    pointsContainer.selectAll('.data-point')
        .data(biplot.pcaData)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => biplot.xScale(d.pca_x))
        .attr('cy', d => biplot.yScale(d.pca_y))
        .attr('r', d => {
            // Make higher-valued players appear slightly larger
            if (biplot.colorMode === 'value') {
                const baseSize = 3;
                // If value is very high, increase size slightly
                if (d.value_millions_eur > 50) return baseSize + 2;
                if (d.value_millions_eur > 20) return baseSize + 1;
                return baseSize;
            }
            return 3;
        })
        .attr('fill', d => {
            if (biplot.colorMode === 'value') {
                return biplot.valueColorScale(d.valueCategory);
            } else {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.positionColorScale(positionGroup);
            }
        })
        .attr('stroke', d => {
            if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
                return '#000';
            }
            
            if (hasPositionFilters) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
            }
            
            return 'none';
        })
        .attr('stroke-width', d => {
            if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
                return 2;
            }
            
            if (hasPositionFilters) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
            }
            
            return 0;
        })
        .attr('opacity', d => {
            // If a player is highlighted, dim all others
            if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                return 0.2;
            }
            
            // If position groups are selected, dim non-matching groups
            if (hasPositionFilters) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
            }
            
            return 0.7;
        })
        .style('pointer-events', d => {
            // Disable pointer events for filtered-out points
            if (hasPositionFilters) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.selectedPositionGroups.has(positionGroup) ? 'auto' : 'none';
            }
            return 'auto';
        })
        .on('mouseover', function(event, d) {
            // Skip interaction for filtered-out points
            if (hasPositionFilters) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                if (!biplot.selectedPositionGroups.has(positionGroup)) return;
            }
            
            // Highlight on hover
            d3.select(this)
                .attr('r', d => {
                    // Base size for highlighted state
                    const baseSize = 5;
                    // If value is very high, increase size slightly
                    if (d.value_millions_eur > 50) return baseSize + 2;
                    if (d.value_millions_eur > 20) return baseSize + 1;
                    return baseSize;
                })
                .attr('opacity', 1)
                .attr('stroke', '#000')
                .attr('stroke-width', 2);
            
            // Show tooltip with market value information
            biplot.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            
            const positionGroup = mapPositionToGroup(d.player_positions);
            let valueAssessment = '';
            
            switch (d.valueCategory) {
                case 'Bargain':
                    valueAssessment = '<span style="color:#2ecc71;font-weight:bold;">Bargain</span>';
                    break;
                case 'Fair Value':
                    valueAssessment = '<span style="color:#3498db;font-weight:bold;">Fair Value</span>';
                    break;
                case 'Premium':
                    valueAssessment = '<span style="color:#e74c3c;font-weight:bold;">Premium Price</span>';
                    break;
                default:
                    valueAssessment = '<span style="color:#95a5a6;font-weight:bold;">Unknown</span>';
            }
            
            // Format tooltip content with market info
            biplot.tooltip.html(`
                <strong>${d.short_name || 'Unknown Player'}</strong> (${d.age || '?'} yo)<br>
                ${d.club_name || 'Unknown Club'}<br>
                ${d.nationality_name || 'Unknown Nationality'}<br>
                <span style="color:#777">Position:</span> ${d.player_positions || 'N/A'} (${positionGroup})<br>
                <span style="color:#777">Overall:</span> ${d.player_overall || '?'} | <span style="color:#777">Potential:</span> ${d.potential || '?'}<br>
                <span style="color:#777">Value:</span> €${d.value_millions_eur ? d.value_millions_eur.toFixed(1) : '?'}M | <span style="color:#777">Wage:</span> €${d.wage_thousands_eur ? d.wage_thousands_eur.toFixed(1) : '?'}K<br>
                <span style="color:#777">Value per Rating:</span> €${d.valuePerRating || '?'}M<br>
                <hr style="margin:3px 0;opacity:0.3">
                <div style="font-size:11px;margin-top:3px">Market Assessment: ${valueAssessment}</div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function(event, d) {
            // Reset on mouseout
            d3.select(this)
                .attr('r', d => {
                    // Base size
                    const baseSize = 3;
                    // If value is very high, maintain slightly increased size
                    if (biplot.colorMode === 'value') {
                        if (d.value_millions_eur > 50) return baseSize + 2;
                        if (d.value_millions_eur > 20) return baseSize + 1;
                    }
                    return baseSize;
                })
                .attr('opacity', d => {
                    if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                        return 0.2;
                    }
                    
                    if (hasPositionFilters) {
                        const position = d.player_positions || 'Unknown';
                        const positionGroup = mapPositionToGroup(position);
                        return biplot.selectedPositionGroups.has(positionGroup) ? 0.8 : 0.1;
                    }
                    
                    return 0.7;
                })
                .attr('stroke', d => {
                    if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
                        return '#000';
                    }
                    
                    if (hasPositionFilters) {
                        const position = d.player_positions || 'Unknown';
                        const positionGroup = mapPositionToGroup(position);
                        return biplot.selectedPositionGroups.has(positionGroup) ? '#000' : 'none';
                    }
                    
                    return 'none';
                })
                .attr('stroke-width', d => {
                    if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
                        return 2;
                    }
                    
                    if (hasPositionFilters) {
                        const position = d.player_positions || 'Unknown';
                        const positionGroup = mapPositionToGroup(position);
                        return biplot.selectedPositionGroups.has(positionGroup) ? 1 : 0;
                    }
                    
                    return 0;
                });
            
            // Hide tooltip
            biplot.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            // Select player on click if player_id exists
            if (d.player_id) {
                // First try to find the enriched player from our PCA data
                const selectedPlayer = biplot.pcaData.find(p => p.player_id === d.player_id);
                
                // If that fails, try to find the player in the global data
                if (!selectedPlayer) {
                    const globalPlayer = globalData.players.find(p => p.player_id === d.player_id);
                    if (globalPlayer) {
                        selectPlayer(globalPlayer);
                    }
                } else {
                    selectPlayer(selectedPlayer);
                }
            }
        });
    
    // ONLY if vectors should be shown, draw them  
    if (biplot.showVectors) {
        const loadingScale = Math.min(biplot.width, biplot.height) / 2 * 0.8;
        
        // Map of feature names to their data (to simplify lookup)
        const featureMap = {};
        biplot.featureNames.forEach((feature, i) => {
            if (feature === 'value_millions_eur' || feature === 'pace' || feature === 'shooting') {
                featureMap[feature] = {
                    index: i,
                    vector: {
                        x1: 0,
                        y1: 0,
                        x2: biplot.loadings[0][i] * loadingScale,
                        y2: biplot.loadings[1][i] * loadingScale
                    }
                };
            }
        });
        
        // Draw only the vectors for the three attributes we care about
        Object.keys(featureMap).forEach(feature => {
            const vector = featureMap[feature].vector;
            
            // Draw vector - CHANGED TO BLACK
            vectorsGroup.append('line')
                .attr('x1', biplot.xScale(vector.x1))
                .attr('y1', biplot.yScale(vector.y1))
                .attr('x2', biplot.xScale(vector.x2))
                .attr('y2', biplot.yScale(vector.y2))
                .attr('stroke', '#000000') // HARDCODED BLACK
                .attr('stroke-width', 1.5);
            
            // Draw arrowhead - CHANGED TO BLACK
            const arrowSize = 5;
            const angle = Math.atan2(vector.y1 - vector.y2, vector.x2 - vector.x1);
            
            vectorsGroup.append('path')
                .attr('d', `M ${biplot.xScale(vector.x2)} ${biplot.yScale(vector.y2)} l ${-arrowSize * Math.cos(angle - Math.PI/6)} ${arrowSize * Math.sin(angle - Math.PI/6)} l ${-arrowSize * Math.cos(angle + Math.PI/6)} ${arrowSize * Math.sin(angle + Math.PI/6)} z`)
                .attr('fill', '#000000'); // HARDCODED BLACK
        });
        
        // Hardcoded label positions
        const labelPositions = {
            'pace': { x: 3, y: 4 },
            'value_millions_eur': { x: -3, y: 4 },
            'shooting': { x: -3, y: -2 }
        };
        
        // Add hardcoded labels with adjusted names - ALL IN BLACK
        Object.keys(labelPositions).forEach(feature => {
            const pos = labelPositions[feature];
            // Set the label text (shorter for value)
            const labelText = feature === 'value_millions_eur' ? 'Value' : feature.charAt(0).toUpperCase() + feature.slice(1);
            
            // Add label - CHANGED TO BLACK
            vectorsGroup.append('text')
                .attr('x', biplot.xScale(pos.x))
                .attr('y', biplot.yScale(pos.y))
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('fill', '#000000') // HARDCODED BLACK
                .attr('font-weight', 'bold')
                .text(labelText);
        });
    }
    
    // Add title with variance explained and market value theme
    biplot.svg.append('text')
        .attr('class', 'biplot-title')
        .attr('x', biplot.width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`Transfer Market Value Analysis - Total Variance Explained: ${((biplot.explainedVariance[0] + biplot.explainedVariance[1]) * 100).toFixed(1)}%`);
    
    // Add filter indicator if position filters are active
    if (hasPositionFilters) {
        const groups = Array.from(biplot.selectedPositionGroups).join(', ');
        biplot.svg.append('text')
            .attr('class', 'filter-indicator')
            .attr('x', biplot.width / 2)
            .attr('y', -35)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#f44336')
            .text(`Filtered by: ${groups}`);
    }
    
    // Add legend based on current color mode
    if (biplot.colorMode === 'value') {
        addValueCategoryLegend();
    } else {
        addPositionLegend();
    }
}

// Add quadrants with market value interpretation
function addQuadrants() {
    // Add subtle quadrant backgrounds
    const quadrantContainer = biplot.svg.append('g')
        .attr('class', 'quadrant-container');
    
    // Draw quadrant backgrounds
    const quadrantWidth = biplot.width / 2;
    const quadrantHeight = biplot.height / 2;
    
    // Create quadrants with subtle colors
    const quadrants = [
        { x: 0, y: 0, fill: 'rgba(231, 76, 60, 0.05)' },            // Top left: Established Stars (high value, high performance)
        { x: quadrantWidth, y: 0, fill: 'rgba(46, 204, 113, 0.05)' }, // Top right: Young Talent (high potential, moderate value)
        { x: 0, y: quadrantHeight, fill: 'rgba(52, 152, 219, 0.05)' }, // Bottom left: Veterans (declining value, solid performance)
        { x: quadrantWidth, y: quadrantHeight, fill: 'rgba(241, 196, 15, 0.05)' }  // Bottom right: Hidden Gems (undervalued performers)
    ];
    
    // Add quadrant backgrounds
    quadrants.forEach((q, i) => {
        quadrantContainer.append('rect')
            .attr('x', q.x)
            .attr('y', q.y)
            .attr('width', quadrantWidth)
            .attr('height', quadrantHeight)
            .attr('fill', q.fill)
            .attr('stroke', 'none');
        
        // Add subtle quadrant labels
        const labelX = q.x + (i % 2 === 0 ? quadrantWidth * 0.25 : quadrantWidth * 0.75);
        const labelY = q.y + (i < 2 ? quadrantHeight * 0.25 : quadrantHeight * 0.75);
        
        quadrantContainer.append('text')
            .attr('x', labelX)
            .attr('y', labelY)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', 'rgba(0,0,0,0.5)')
            .attr('font-weight', 'bold')
            .text(biplot.quadrantLabels[i].text);
        
        quadrantContainer.append('text')
            .attr('x', labelX)
            .attr('y', labelY + 15)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'rgba(0,0,0,0.4)')
            .attr('font-style', 'italic')
            .text(biplot.quadrantLabels[i].description);
    });
}

// Add axis labels with interpretations based on loadings
function addAxisLabelsWithInterpretation() {
    // Find dominant features in each PC
    const pc1Features = [];
    const pc2Features = [];
    
    biplot.featureNames.forEach((feature, i) => {
        const pc1Loading = biplot.loadings[0][i];
        const pc2Loading = biplot.loadings[1][i];
        
        if (Math.abs(pc1Loading) > 0.3) {
            pc1Features.push({
                name: feature,
                loading: pc1Loading
            });
        }
        
        if (Math.abs(pc2Loading) > 0.3) {
            pc2Features.push({
                name: feature,
                loading: pc2Loading
            });
        }
    });
    
    // Sort by absolute loading value
    pc1Features.sort((a, b) => Math.abs(b.loading) - Math.abs(a.loading));
    pc2Features.sort((a, b) => Math.abs(b.loading) - Math.abs(a.loading));
    
    // Create interpretations
    let pc1Interpretation = '';
    let pc2Interpretation = '';
    
    if (pc1Features.length > 0) {
        // Check if positive or negative features are more dominant
        const positiveFeatures = pc1Features.filter(f => f.loading > 0);
        const negativeFeatures = pc1Features.filter(f => f.loading < 0);
        
        // if (positiveFeatures.length > 0) {
        //     pc1Interpretation += ' → Increasing: ' + positiveFeatures.slice(0, 2).map(f => formatFeatureName(f.name)).join(', ');
        // }
        
        // if (negativeFeatures.length > 0) {
        //     pc1Interpretation += ' | Decreasing: ' + negativeFeatures.slice(0, 2).map(f => formatFeatureName(f.name)).join(', ');
        // }
    }
    
    if (pc2Features.length > 0) {
        // Check if positive or negative features are more dominant
        const positiveFeatures = pc2Features.filter(f => f.loading > 0);
        const negativeFeatures = pc2Features.filter(f => f.loading < 0);
        
        // if (positiveFeatures.length > 0) {
        //     pc2Interpretation += ' ↑ Increasing: ' + positiveFeatures.slice(0, 2).map(f => formatFeatureName(f.name)).join(', ');
        // }
        
        // if (negativeFeatures.length > 0) {
        //     pc2Interpretation += ' | Decreasing: ' + negativeFeatures.slice(0, 2).map(f => formatFeatureName(f.name)).join(', ');
        // }
    }
    
    // Add X axis label with interpretation
    biplot.svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', biplot.width / 2)
        .attr('y', biplot.height + 30)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text(`Principal Component 1 (${(biplot.explainedVariance[0] * 100).toFixed(1)}%)`);
    
    biplot.svg.append('text')
        .attr('class', 'axis-interpretation')
        .attr('x', biplot.width / 2)
        .attr('y', biplot.height + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(pc1Interpretation);
    
    // Add Y axis label with interpretation
    biplot.svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -biplot.height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text(`Principal Component 2 (${(biplot.explainedVariance[1] * 100).toFixed(1)}%)`);
    
    biplot.svg.append('text')
        .attr('class', 'axis-interpretation')
        .attr('transform', 'rotate(-90)')
        .attr('x', -biplot.height / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(pc2Interpretation);
}

// // Add legend for value categories
// function addValueCategoryLegend() {
//     // Use value categories
//     const valueCategories = ["Bargain", "Fair Value", "Premium", "Unknown"];
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4; // Four categories fit nicely in one row
//     const itemWidth = legendWidth / itemsPerRow;
//     const itemHeight = 20;
//     const legendHeight = itemHeight + 50; // Title + row + description
    
//     // Create legend container at the bottom
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 60})`); // Position below x-axis label
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 5)
//         .attr('ry', 5);
    
//     // Add title and subtitle
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 15)
//         .style('font-size', '12px')
//         .style('font-weight', 'bold')
//         .text('Market Value Assessment');
        
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', legendHeight - 10)
//         .style('font-size', '9px')
//         .style('font-style', 'italic')
//         .style('fill', '#666')
//         .text('Based on player overall rating, potential, age, and market value');
    
//     // Add legend items for each value category
//     valueCategories.forEach((category, i) => {
//         // Create group for legend item
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * itemWidth + 10}, ${30})`);
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 10)
//             .attr('height', 10)
//             .attr('fill', biplot.valueColorScale(category));
        
//         // Add label
//         item.append('text')
//             .attr('x', 15)
//             .attr('y', 9)
//             .style('font-size', '10px')
//             .text(category);
        
//         // Add short description below
//         let description = '';
//         switch(category) {
//             case 'Bargain':
//                 description = 'Undervalued players';
//                 break;
//             case 'Fair Value':
//                 description = 'Appropriate pricing';
//                 break;
//             case 'Premium':
//                 description = 'High cost relative to ability';
//                 break;
//             case 'Unknown':
//                 description = 'Insufficient data';
//                 break;
//         }
        
//         item.append('text')
//             .attr('x', 15)
//             .attr('y', 22)
//             .style('font-size', '8px')
//             .style('fill', '#666')
//             .text(description);
//     });
    
//     // Update SVG height to accommodate legend
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 20);
// }
// Add legend for value categories - complete function with changes
// Updated function for value category legend with subtexts removed
// function addValueCategoryLegend() {
//     // Use value categories
//     const valueCategories = ["Bargain", "Fair Value", "Premium", "Unknown"];
    
//     // Calculate legend positioning - moved up to be closer to the plot
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4; // Four categories fit nicely in one row
//     const itemWidth = legendWidth / itemsPerRow;
//     const itemHeight = 15; // Reduced further
//     const legendHeight = itemHeight + 5; // Minimal height
    
//     // Create legend container positioned much closer to the plot
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 15})`); // Close to the plot
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 3)
//         .attr('ry', 3);
    
//     // Add title only, remove subtitle
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 12)
//         .style('font-size', '10px')
//         .style('font-weight', 'bold')
//         .text('Market Value Assessment');
    
//     // Add legend items for each value category - more compact
//     valueCategories.forEach((category, i) => {
//         // Create group for legend item
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * itemWidth + legendWidth/2 - (itemWidth * valueCategories.length)/2 + 10}, ${8})`);
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 8)
//             .attr('height', 8)
//             .attr('fill', biplot.valueColorScale(category));
        
//         // Add label - no description
//         item.append('text')
//             .attr('x', 12)
//             .attr('y', 7)
//             .style('font-size', '9px')
//             .text(category);
        
//         // Descriptions removed
//     });
    
//     // Update SVG height to accommodate legend - less extra space
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 5);
// }


// // Updated function for position legend to match the compact style
// function addPositionLegend() {
//     // Use position groups
//     const positionGroups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
    
//     // Calculate legend positioning - same compact format as value legend
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4;
//     const itemWidth = legendWidth / itemsPerRow;
//     const itemHeight = 15; // Reduced height
//     const legendHeight = itemHeight + 5; // Minimal height
    
//     // Create legend container at the bottom - same distance as value legend
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 15})`);
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 3)
//         .attr('ry', 3);
    
//     // Add title only - no subtitle or instructions
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 12)
//         .style('font-size', '10px')
//         .style('font-weight', 'bold')
//         .text('Position Groups');

//     // Add legend items - centered
//     positionGroups.forEach((group, i) => {
//         const isSelected = biplot.selectedPositionGroups.has(group);
        
//         // Create group for legend item - centered in available space
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * itemWidth + legendWidth/2 - (itemWidth * positionGroups.length)/2 + 10}, ${8})`)
//             .style('cursor', 'pointer')
//             .on('click', function() {
//                 // Toggle selection for this position group
//                 if (biplot.selectedPositionGroups.has(group)) {
//                     biplot.selectedPositionGroups.delete(group);
                    
//                     // If no position groups selected now, reset to all
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         dashboardState.filters.position = 'all';
//                     }
//                 } else {
//                     // Clear other selections if this is first selection
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         biplot.selectedPositionGroups.clear();
//                     }
                    
//                     biplot.selectedPositionGroups.add(group);
                    
//                     // Update dashboard state with a representative position from this group
//                     const representativePosition = biplot.positionGroupToPositions[group][0];
//                     dashboardState.filters.position = representativePosition;
//                 }
                
//                 // Update dashboard UI
//                 const positionSelector = document.getElementById('position-selector');
//                 if (positionSelector) {
//                     positionSelector.value = dashboardState.filters.position;
//                 }
                
//                 // Update the rest of the dashboard
//                 updateSelectionDetails();
                
//                 // Update all visualizations
//                 updateAllVisualizations();
//             });
        
//         // Add selection background for better visibility
//         if (isSelected) {
//             item.append('rect')
//                 .attr('width', itemWidth - 15)
//                 .attr('height', 14)
//                 .attr('x', -5)
//                 .attr('y', -8)
//                 .attr('fill', '#f0f0f0')
//                 .attr('rx', 3)
//                 .attr('ry', 3);
//         }
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 8)
//             .attr('height', 8)
//             .attr('fill', biplot.positionColorScale(group))
//             .attr('stroke', isSelected ? '#000' : 'none')
//             .attr('stroke-width', isSelected ? 1 : 0);
        
//         // Add label only - no descriptions
//         item.append('text')
//             .attr('x', 12)
//             .attr('y', 7)
//             .style('font-size', '9px')
//             .style('font-weight', isSelected ? 'bold' : 'normal')
//             .text(group);
        
//         // Count badge for selected items - smaller and more subtle
//         if (isSelected) {
//             // Count players in this group
//             let count = 0;
//             biplot.pcaData.forEach(d => {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (positionGroup === group) {
//                     count++;
//                 }
//             });
            
//             // Add small badge with count - more compact
//             const badge = item.append('g')
//                 .attr('transform', `translate(${itemWidth - 30}, 0)`);
            
//             badge.append('rect')
//                 .attr('width', 16)
//                 .attr('height', 12)
//                 .attr('rx', 6)
//                 .attr('ry', 6)
//                 .attr('fill', '#555')
//                 .attr('y', -6)
//                 .attr('opacity', 0.7);
                
//             badge.append('text')
//                 .attr('x', 8)
//                 .attr('y', 3)
//                 .attr('text-anchor', 'middle')
//                 .attr('fill', 'white')
//                 .attr('font-size', '8px')
//                 .text(count);
//         }
//     });
    
//     // Update SVG height to accommodate legend - match value legend
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 5);
// }

// Updated function for value category legend with spacing between title and items
// function addValueCategoryLegend() {
//     // Use value categories
//     const valueCategories = ["Bargain", "Fair Value", "Premium", "Unknown"];
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4; // Four categories fit nicely in one row
//     const itemHeight = 15; 
//     const legendHeight = itemHeight + 15; // Increased for more space
    
//     // Create legend container positioned close to the plot
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 15})`);
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 3)
//         .attr('ry', 3);
    
//     // Move title to left corner
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 11)
//         .style('font-size', '10px')
//         .style('font-weight', 'bold')
//         .text('Market Value Assessment');
    
//     // Add legend items for each value category - moved to the right side 
//     // and added spacing from the title
//     valueCategories.forEach((category, i) => {
//         // Create group for legend item - moved right and down for spacing
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * (legendWidth/4 - 10) + legendWidth/2 - 180}, ${12})`);
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 8)
//             .attr('height', 8)
//             .attr('fill', biplot.valueColorScale(category));
        
//         // Add label
//         item.append('text')
//             .attr('x', 12)
//             .attr('y', 7)
//             .style('font-size', '9px')
//             .text(category);
//     });
    
//     // Update SVG height to accommodate legend
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 5);
// }

// // Updated function for position legend with spacing between title and items
// function addPositionLegend() {
//     // Use position groups
//     const positionGroups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4;
//     const itemHeight = 15;
//     const legendHeight = itemHeight + 15; // Increased for more space
    
//     // Create legend container at the bottom
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 15})`);
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 3)
//         .attr('ry', 3);
    
//     // Move title to left corner
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 11)
//         .style('font-size', '10px')
//         .style('font-weight', 'bold')
//         .text('Position Groups');

//     // Add legend items - moved right and down for spacing from title
//     positionGroups.forEach((group, i) => {
//         const isSelected = biplot.selectedPositionGroups.has(group);
        
//         // Create group for legend item - moved right and down for spacing
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * (legendWidth/4 - 10) + legendWidth/2 - 180}, ${12})`)
//             .style('cursor', 'pointer')
//             .on('click', function() {
//                 // Toggle selection for this position group
//                 if (biplot.selectedPositionGroups.has(group)) {
//                     biplot.selectedPositionGroups.delete(group);
                    
//                     // If no position groups selected now, reset to all
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         dashboardState.filters.position = 'all';
//                     }
//                 } else {
//                     // Clear other selections if this is first selection
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         biplot.selectedPositionGroups.clear();
//                     }
                    
//                     biplot.selectedPositionGroups.add(group);
                    
//                     // Update dashboard state with a representative position from this group
//                     const representativePosition = biplot.positionGroupToPositions[group][0];
//                     dashboardState.filters.position = representativePosition;
//                 }
                
//                 // Update dashboard UI
//                 const positionSelector = document.getElementById('position-selector');
//                 if (positionSelector) {
//                     positionSelector.value = dashboardState.filters.position;
//                 }
                
//                 // Update the rest of the dashboard
//                 updateSelectionDetails();
                
//                 // Update all visualizations
//                 updateAllVisualizations();
//             });
        
//         // Add selection background for better visibility
//         if (isSelected) {
//             item.append('rect')
//                 .attr('width', itemWidth - 15)
//                 .attr('height', 14)
//                 .attr('x', -5)
//                 .attr('y', -8)
//                 .attr('fill', '#f0f0f0')
//                 .attr('rx', 3)
//                 .attr('ry', 3);
//         }
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 8)
//             .attr('height', 8)
//             .attr('fill', biplot.positionColorScale(group))
//             .attr('stroke', isSelected ? '#000' : 'none')
//             .attr('stroke-width', isSelected ? 1 : 0);
        
//         // Add label
//         item.append('text')
//             .attr('x', 12)
//             .attr('y', 7)
//             .style('font-size', '9px')
//             .style('font-weight', isSelected ? 'bold' : 'normal')
//             .text(group);
        
//         // Count badge for selected items
//         if (isSelected) {
//             // Count players in this group
//             let count = 0;
//             biplot.pcaData.forEach(d => {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (positionGroup === group) {
//                     count++;
//                 }
//             });
            
//             // Add small badge with count
//             const badge = item.append('g')
//                 .attr('transform', `translate(${legendWidth/4 - 40}, 0)`);
            
//             badge.append('rect')
//                 .attr('width', 16)
//                 .attr('height', 12)
//                 .attr('rx', 6)
//                 .attr('ry', 6)
//                 .attr('fill', '#555')
//                 .attr('y', -6)
//                 .attr('opacity', 0.7);
                
//             badge.append('text')
//                 .attr('x', 8)
//                 .attr('y', 3)
//                 .attr('text-anchor', 'middle')
//                 .attr('fill', 'white')
//                 .attr('font-size', '8px')
//                 .text(count);
//         }
//     });
    
//     // Update SVG height to accommodate legend
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 5);
// }
// Updated function for value category legend with increased distance from the plot
// function addValueCategoryLegend() {
//     // Use value categories
//     const valueCategories = ["Bargain", "Fair Value", "Premium", "Unknown"];
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4; // Four categories fit nicely in one row
//     const itemHeight = 15; 
//     const legendHeight = itemHeight + 15; // Increased for more space
    
//     // CHANGED: Create legend container positioned further from the plot
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 35})`); // Increased from 15 to 35
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 3)
//         .attr('ry', 3);
    
//     // Move title to left corner
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 11)
//         .style('font-size', '10px')
//         .style('font-weight', 'bold')
//         .text('Market Value Assessment');
    
//     // Add legend items for each value category - moved to the right side 
//     // and added spacing from the title
//     valueCategories.forEach((category, i) => {
//         // Create group for legend item - moved right and down for spacing
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * (legendWidth/4 - 10) + legendWidth/2 - 180}, ${12})`);
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 8)
//             .attr('height', 8)
//             .attr('fill', biplot.valueColorScale(category));
        
//         // Add label
//         item.append('text')
//             .attr('x', 12)
//             .attr('y', 7)
//             .style('font-size', '9px')
//             .text(category);
//     });
    
//     // Update SVG height to accommodate legend with increased distance
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 30); // Increased padding
// }

// // Updated function for position legend with increased distance from the plot
// function addPositionLegend() {
//     // Use position groups
//     const positionGroups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 4;
//     const itemHeight = 15;
//     const legendHeight = itemHeight + 15; // Increased for more space
    
//     // CHANGED: Create legend container positioned further from the plot
//     const legend = biplot.svg.append('g')
//         .attr('class', 'biplot-legend')
//         .attr('transform', `translate(0, ${biplot.height + 35})`); // Increased from 15 to 35
    
//     // Add background
//     legend.append('rect')
//         .attr('width', legendWidth)
//         .attr('height', legendHeight)
//         .attr('fill', 'white')
//         .attr('opacity', 0.7)
//         .attr('rx', 3)
//         .attr('ry', 3);
    
//     // Move title to left corner
//     legend.append('text')
//         .attr('x', 10)
//         .attr('y', 11)
//         .style('font-size', '10px')
//         .style('font-weight', 'bold')
//         .text('Position Groups');

//     // Add legend items - moved right and down for spacing from title
//     positionGroups.forEach((group, i) => {
//         const isSelected = biplot.selectedPositionGroups.has(group);
        
//         // Create group for legend item - moved right and down for spacing
//         const item = legend.append('g')
//             .attr('transform', `translate(${i * (legendWidth/4 - 10) + legendWidth/2 - 180}, ${12})`)
//             .style('cursor', 'pointer')
//             .on('click', function() {
//                 // Toggle selection for this position group
//                 if (biplot.selectedPositionGroups.has(group)) {
//                     biplot.selectedPositionGroups.delete(group);
                    
//                     // If no position groups selected now, reset to all
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         dashboardState.filters.position = 'all';
//                     }
//                 } else {
//                     // Clear other selections if this is first selection
//                     if (biplot.selectedPositionGroups.size === 0) {
//                         biplot.selectedPositionGroups.clear();
//                     }
                    
//                     biplot.selectedPositionGroups.add(group);
                    
//                     // Update dashboard state with a representative position from this group
//                     const representativePosition = biplot.positionGroupToPositions[group][0];
//                     dashboardState.filters.position = representativePosition;
//                 }
                
//                 // Update dashboard UI
//                 const positionSelector = document.getElementById('position-selector');
//                 if (positionSelector) {
//                     positionSelector.value = dashboardState.filters.position;
//                 }
                
//                 // Update the rest of the dashboard
//                 updateSelectionDetails();
                
//                 // Update all visualizations
//                 updateAllVisualizations();
//             });
        
//         // Add selection background for better visibility
//         if (isSelected) {
//             item.append('rect')
//                 .attr('width', itemWidth - 15)
//                 .attr('height', 14)
//                 .attr('x', -5)
//                 .attr('y', -8)
//                 .attr('fill', '#f0f0f0')
//                 .attr('rx', 3)
//                 .attr('ry', 3);
//         }
        
//         // Add color swatch
//         item.append('rect')
//             .attr('width', 8)
//             .attr('height', 8)
//             .attr('fill', biplot.positionColorScale(group))
//             .attr('stroke', isSelected ? '#000' : 'none')
//             .attr('stroke-width', isSelected ? 1 : 0);
        
//         // Add label
//         item.append('text')
//             .attr('x', 12)
//             .attr('y', 7)
//             .style('font-size', '9px')
//             .style('font-weight', isSelected ? 'bold' : 'normal')
//             .text(group);
        
//         // Count badge for selected items
//         if (isSelected) {
//             // Count players in this group
//             let count = 0;
//             biplot.pcaData.forEach(d => {
//                 const position = d.player_positions || 'Unknown';
//                 const positionGroup = mapPositionToGroup(position);
//                 if (positionGroup === group) {
//                     count++;
//                 }
//             });
            
//             // Add small badge with count
//             const badge = item.append('g')
//                 .attr('transform', `translate(${legendWidth/4 - 40}, 0)`);
            
//             badge.append('rect')
//                 .attr('width', 16)
//                 .attr('height', 12)
//                 .attr('rx', 6)
//                 .attr('ry', 6)
//                 .attr('fill', '#555')
//                 .attr('y', -6)
//                 .attr('opacity', 0.7);
                
//             badge.append('text')
//                 .attr('x', 8)
//                 .attr('y', 3)
//                 .attr('text-anchor', 'middle')
//                 .attr('fill', 'white')
//                 .attr('font-size', '8px')
//                 .text(count);
//         }
//     });
    
//     // Update SVG height to accommodate legend with increased distance
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 30); // Increased padding
// }

// Updated function for value category legend with more horizontal space
function addValueCategoryLegend() {
    // Use value categories
    const valueCategories = ["Bargain", "Fair Value", "Premium", "Unknown"];
    
    // Calculate legend positioning
    const legendWidth = biplot.width;
    const itemsPerRow = 4; // Four categories fit nicely in one row
    const itemHeight = 15; 
    const legendHeight = itemHeight + 15;
    
    // Create legend container positioned further from the plot
    const legend = biplot.svg.append('g')
        .attr('class', 'biplot-legend')
        .attr('transform', `translate(0, ${biplot.height + 35})`);
    
    // Add background
    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'white')
        .attr('opacity', 0.7)
        .attr('rx', 3)
        .attr('ry', 3);
    
    // Move title to left corner
    legend.append('text')
        .attr('x', 10)
        .attr('y', 11)
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text('Market Value Assessment');
    
    // CHANGED: Increased horizontal spacing between title and legend items
    valueCategories.forEach((category, i) => {
        // Create group for legend item - moved further right for more spacing from title
        const item = legend.append('g')
            .attr('transform', `translate(${i * (legendWidth/4 - 15) + legendWidth/2 - 120}, ${12})`);
        
        // Add color swatch
        item.append('rect')
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', biplot.valueColorScale(category));
        
        // Add label
        item.append('text')
            .attr('x', 12)
            .attr('y', 7)
            .style('font-size', '9px')
            .text(category);
    });
    
    // Update SVG height to accommodate legend with increased distance
    d3.select('#biplot svg')
        .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 30);
}

// Updated function for position legend with more horizontal space
function addPositionLegend() {
    // Use position groups
    const positionGroups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
    
    // Calculate legend positioning
    const legendWidth = biplot.width;
    const itemsPerRow = 4;
    const itemHeight = 15;
    const legendHeight = itemHeight + 15;
    
    // Create legend container positioned further from the plot
    const legend = biplot.svg.append('g')
        .attr('class', 'biplot-legend')
        .attr('transform', `translate(0, ${biplot.height + 35})`);
    
    // Add background
    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'white')
        .attr('opacity', 0.7)
        .attr('rx', 3)
        .attr('ry', 3);
    
    // Move title to left corner
    legend.append('text')
        .attr('x', 10)
        .attr('y', 11)
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text('Position Groups');

    // CHANGED: Increased horizontal spacing between title and legend items
    positionGroups.forEach((group, i) => {
        const isSelected = biplot.selectedPositionGroups.has(group);
        
        // Create group for legend item - moved further right for more spacing from title
        const item = legend.append('g')
            .attr('transform', `translate(${i * (legendWidth/4 - 15) + legendWidth/2 - 120}, ${12})`)
            .style('cursor', 'pointer')
            .on('click', function() {
                // Toggle selection for this position group
                if (biplot.selectedPositionGroups.has(group)) {
                    biplot.selectedPositionGroups.delete(group);
                    
                    // If no position groups selected now, reset to all
                    if (biplot.selectedPositionGroups.size === 0) {
                        dashboardState.filters.position = 'all';
                    }
                } else {
                    // Clear other selections if this is first selection
                    if (biplot.selectedPositionGroups.size === 0) {
                        biplot.selectedPositionGroups.clear();
                    }
                    
                    biplot.selectedPositionGroups.add(group);
                    
                    // Update dashboard state with a representative position from this group
                    const representativePosition = biplot.positionGroupToPositions[group][0];
                    dashboardState.filters.position = representativePosition;
                }
                
                // Update dashboard UI
                const positionSelector = document.getElementById('position-selector');
                if (positionSelector) {
                    positionSelector.value = dashboardState.filters.position;
                }
                
                // Update the rest of the dashboard
                updateSelectionDetails();
                
                // Update all visualizations
                updateAllVisualizations();
            });
        
        // Add selection background for better visibility
        if (isSelected) {
            item.append('rect')
                .attr('width', itemWidth - 15)
                .attr('height', 14)
                .attr('x', -5)
                .attr('y', -8)
                .attr('fill', '#f0f0f0')
                .attr('rx', 3)
                .attr('ry', 3);
        }
        
        // Add color swatch
        item.append('rect')
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', biplot.positionColorScale(group))
            .attr('stroke', isSelected ? '#000' : 'none')
            .attr('stroke-width', isSelected ? 1 : 0);
        
        // Add label
        item.append('text')
            .attr('x', 12)
            .attr('y', 7)
            .style('font-size', '9px')
            .style('font-weight', isSelected ? 'bold' : 'normal')
            .text(group);
        
        // Count badge for selected items
        if (isSelected) {
            // Count players in this group
            let count = 0;
            biplot.pcaData.forEach(d => {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                if (positionGroup === group) {
                    count++;
                }
            });
            
            // Add small badge with count
            const badge = item.append('g')
                .attr('transform', `translate(${legendWidth/4 - 40}, 0)`);
            
            badge.append('rect')
                .attr('width', 16)
                .attr('height', 12)
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('fill', '#555')
                .attr('y', -6)
                .attr('opacity', 0.7);
                
            badge.append('text')
                .attr('x', 8)
                .attr('y', 3)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', '8px')
                .text(count);
        }
    });
    
    // Update SVG height to accommodate legend with increased distance
    d3.select('#biplot svg')
        .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 30);
}

// Also update the PCP legend for consistency:
function addPCPLegend(groups) {
    try {
        if (pcp.sampleMode) {
            pcp.svg.append('text')
                .attr('class', 'sample-indicator')
                .attr('x', pcp.width / 2)
                .attr('y', -5)
                .attr('text-anchor', 'middle')
                .attr('font-size', '9px')
                .attr('fill', '#666')
                .attr('font-style', 'italic')
                .text(`Showing sample of ${pcp.sampleSize} lines`);
        }
        
        const legendWidth = pcp.width;
        
        // Move legend to bottom of chart and make it smaller
        const legend = pcp.svg.append('g')
            .attr('class', 'pcp-legend')
            .attr('transform', `translate(0, ${pcp.height + 2})`);
        
        // Make legend background smaller and more transparent
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', 20)
            .attr('fill', 'white')
            .attr('opacity', 0.5)
            .attr('rx', 3)
            .attr('ry', 3);

        // Reduced title text and moved left
        legend.append('text')
            .attr('x', 5)
            .attr('y', 12)
            .style('font-size', '9px')
            .style('font-weight', 'bold')
            .text(pcp.clubMode ? 'Leagues' : 'Position Groups');
        
        // Validate groups
        if (!groups || !Array.isArray(groups) || groups.length === 0) {
            groups = pcp.clubMode ? ["Unknown League"] : ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
        }
        
        // Ensure we have a safe number of groups for legend
        const displayGroups = groups.slice(0, Math.min(groups.length, 4));
        
        const itemWidth = Math.min(80, legendWidth / Math.max(1, displayGroups.length));
        
        // CHANGED: Increased distance between title and labels even more
        const itemsGroup = legend.append('g')
            .attr('transform', 'translate(120, 5)'); // Increased from 95 to 120
            
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
                .attr('transform', `translate(${i * (itemWidth)}, 0)`)
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
            
            // Compact selected indicator
            if (isSelected) {
                item.append('rect')
                    .attr('width', itemWidth - 5)
                    .attr('height', 12)
                    .attr('x', -3)
                    .attr('y', -9)
                    .attr('fill', '#f0f0f0')
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('opacity', 0.6);
            }
            
            // Small color square
            item.append('rect')
                .attr('width', 8)
                .attr('height', 8)
                .attr('fill', pcp.colorScale(group))
                .attr('stroke', isSelected ? '#000' : 'none')
                .attr('stroke-width', isSelected ? 1 : 0);
            
            // Smaller text
            item.append('text')
                .attr('x', 12)
                .attr('y', 7)q
                .style('font-size', '9px')
                .style('font-weight', isSelected ? 'bold' : 'normal')
                .text(group);
        });
        
        // Set reduced legend height
        pcp.legendHeight = 22;
    } catch (error) {
        console.error("Error adding PCP legend:", error);
    }
}
// Format feature name for display
function formatFeatureName(feature) {
    return feature.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Get color for feature vector based on category
function getFeatureColor(feature) {
    if (feature.includes('value') || feature.includes('wage')) {
        return '#e74c3c'; // Red for financial metrics
    } else if (feature.includes('overall') || feature.includes('rating')) {
        return '#3498db'; // Blue for performance metrics
    } else if (feature.includes('potential')) {
        return '#2ecc71'; // Green for potential metrics
    } else if (feature.includes('age')) {
        return '#f39c12'; // Orange for age-related metrics
    }
    return '#95a5a6'; // Default gray
}

// Update biplot with zoom transformation
function updateBiplotWithZoom() {
    if (!biplot.zoomTransform) return;
    
    // Apply zoom to points and loadings
    biplot.svg.select('.points-container')
        .attr('transform', biplot.zoomTransform);
    
    biplot.svg.select('.loadings-container')
        .attr('transform', biplot.zoomTransform);
    
    // Update axes with zoomed scales
    const newXScale = biplot.zoomTransform.rescaleX(biplot.xScale);
    const newYScale = biplot.zoomTransform.rescaleY(biplot.yScale);
    
    biplot.svg.select('.x-axis')
        .call(d3.axisBottom(newXScale));
    
    biplot.svg.select('.y-axis')
        .call(d3.axisLeft(newYScale));
    
    // Update grid lines
    biplot.svg.selectAll('.grid-lines .horizontal')
        .attr('y1', d => biplot.zoomTransform.applyY(biplot.yScale(d)))
        .attr('y2', d => biplot.zoomTransform.applyY(biplot.yScale(d)));
    
    biplot.svg.selectAll('.grid-lines .vertical')
        .attr('x1', d => biplot.zoomTransform.applyX(biplot.xScale(d)))
        .attr('x2', d => biplot.zoomTransform.applyX(biplot.xScale(d)));
    
    // Update zero lines
    biplot.svg.select('.zero-line:first-child')
        .attr('x1', biplot.zoomTransform.applyX(biplot.xScale(0)))
        .attr('x2', biplot.zoomTransform.applyX(biplot.xScale(0)));
    
    biplot.svg.select('.zero-line:last-child')
        .attr('y1', biplot.zoomTransform.applyY(biplot.yScale(0)))
        .attr('y2', biplot.zoomTransform.applyY(biplot.yScale(0)));
}

// Update biplot visualization when data filters change
function updateBiplot(filteredData) {
    // Check if we need to reload PCA data due to league filter change
    if (dashboardState.filters.league !== globalData.selectedLeague) {
        globalData.selectedLeague = dashboardState.filters.league;
        loadPCAData();
        return;
    }
    
    // Sync position filter from dashboard if it changed
    if (dashboardState.filters.position !== 'all') {
        const newGroup = mapPositionToGroup(dashboardState.filters.position);
        
        // Only update if different from current selection
        if (newGroup !== "Unknown" && 
            (biplot.selectedPositionGroups.size !== 1 || 
             !biplot.selectedPositionGroups.has(newGroup))) {
            
            biplot.selectedPositionGroups.clear();
            biplot.selectedPositionGroups.add(newGroup);
            renderBiplot();
            return;
        }
    } else if (biplot.selectedPositionGroups.size > 0 && dashboardState.filters.position === 'all') {
        // Reset filters if dashboard is set to 'all'
        biplot.selectedPositionGroups.clear();
        renderBiplot();
        return;
    }
    
    // If no complete re-render needed, just update point visibility
    // Get filtered IDs for highlighting
    const filteredIds = new Set(filteredData.map(d => d.player_id));
    
    // Update data points based on current filters
    biplot.svg.selectAll('.data-point')
        .style('opacity', d => {
            // If a player is highlighted, dim all others
            if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                return 0.2;
            }
            
            // If position filters are active, apply them
            if (biplot.selectedPositionGroups.size > 0) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                
                // If not in selected group, make nearly invisible
                if (!biplot.selectedPositionGroups.has(positionGroup)) {
                    return 0.1;
                }
                
                // If in selected group but not in filtered data, make semi-visible
                return filteredIds.has(d.player_id) ? 0.8 : 0.3;
            }
            
            // Default: highlight points in filtered data, dim others
            return filteredIds.has(d.player_id) ? 0.7 : 0.2;
        })
        .attr('r', d => {
            if (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) {
                return 5;
            }
            
            if (biplot.selectedPositionGroups.size > 0) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                if (!biplot.selectedPositionGroups.has(positionGroup)) {
                    return 2;
                }
            }
            
            // Make higher-valued players appear slightly larger
            if (biplot.colorMode === 'value') {
                const baseSize = 3;
                if (d.value_millions_eur > 50) return baseSize + 2;
                if (d.value_millions_eur > 20) return baseSize + 1;
                return baseSize;
            }
            
            return filteredIds.has(d.player_id) ? 3 : 2;
        })
        .style('pointer-events', d => {
            // Disable interactions for points that should not be interactive
            if (biplot.selectedPositionGroups.size > 0) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.selectedPositionGroups.has(positionGroup) ? 'auto' : 'none';
            }
            
            return 'auto';
        });
}

// Highlight a specific player in the biplot
function highlightPlayerInBiplot(playerId) {
    // Store the highlighted player ID
    biplot.highlightedPlayerId = playerId;
    
    // Find the player in the data
    const player = biplot.pcaData?.find(d => d.player_id === playerId);
    if (!player) return;
    
    // Update all data points based on the highlight
    biplot.svg.selectAll('.data-point')
        .attr('stroke', d => d.player_id === playerId ? '#000' : 'none')
        .attr('stroke-width', d => d.player_id === playerId ? 2 : 0)
        .attr('r', d => {
            if (d.player_id === playerId) return 5;
            
            // Keep size distinction by value if in value mode
            if (biplot.colorMode === 'value') {
                const baseSize = 3;
                if (d.value_millions_eur > 50) return baseSize + 2;
                if (d.value_millions_eur > 20) return baseSize + 1;
                return baseSize;
            }
            
            return 3;
        })
        .attr('opacity', d => {
            if (d.player_id === playerId) return 1;
            
            if (biplot.selectedPositionGroups.size > 0) {
                const position = d.player_positions || 'Unknown';
                const positionGroup = mapPositionToGroup(position);
                return biplot.selectedPositionGroups.has(positionGroup) ? 0.3 : 0.1;
            }
            
            return 0.3;
        });
    
    // Center the view on the selected player with animation
    const x = biplot.xScale(player.pca_x);
    const y = biplot.yScale(player.pca_y);
    
    // Create a zoom transform to center on the player
    const transform = d3.zoomIdentity
        .translate(biplot.width / 2 - x, biplot.height / 2 - y)
        .scale(1.5);
    
    // Apply the transform with smooth transition
    d3.select('#biplot svg')
        .transition()
        .duration(750)
        .call(d3.zoom().transform, transform);
    
    // Add market value analysis for the highlighted player
    addPlayerValueAnalysis(player);
}

// Add detailed value analysis for highlighted player
function addPlayerValueAnalysis(player) {
    if (!player) return;
    
    // Remove any existing analysis panel
    biplot.svg.select('.player-analysis-panel').remove();
    
    // Calculate panel dimensions and position
    const panelWidth = 200;
    const panelHeight = 150;
    const panelX = 10; 
    const panelY = 10;
    
    // Create analysis panel
    const panel = biplot.svg.append('g')
        .attr('class', 'player-analysis-panel')
        .attr('transform', `translate(${panelX}, ${panelY})`);
    
    // Add panel background
    panel.append('rect')
        .attr('width', panelWidth)
        .attr('height', panelHeight)
        .attr('fill', 'white')
        .attr('opacity', 0.85)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    
    // Add player name
    panel.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .attr('font-weight', 'bold')
        .text(player.short_name);
    
    // Add club & position
    panel.append('text')
        .attr('x', 10)
        .attr('y', 35)
        .attr('font-size', '10px')
        .text(`${player.club_name} | ${player.player_positions}`);
    
    // Add rating info
    panel.append('text')
        .attr('x', 10)
        .attr('y', 55)
        .attr('font-size', '11px')
        .text(`Overall: ${player.player_overall} | Potential: ${player.potential}`);
    
    // Add value info
    panel.append('text')
        .attr('x', 10)
        .attr('y', 70)
        .attr('font-size', '11px')
        .text(`Value: €${player.value_millions_eur?.toFixed(1)}M | Wage: €${player.wage_thousands_eur?.toFixed(1)}K`);
    
    // Add value assessment
    let assessmentColor;
    switch (player.valueCategory) {
        case 'Bargain':
            assessmentColor = '#2ecc71';
            break;
        case 'Fair Value':
            assessmentColor = '#3498db';
            break;
        case 'Premium':
            assessmentColor = '#e74c3c';
            break;
        default:
            assessmentColor = '#95a5a6';
    }
    
    // Add assessment header
    panel.append('text')
        .attr('x', 10)
        .attr('y', 90)
        .attr('font-size', '11px')
        .text('Market Value Assessment:');
    
    // Add assessment rating
    panel.append('text')
        .attr('x', 10)
        .attr('y', 105)
        .attr('font-weight', 'bold')
        .attr('fill', assessmentColor)
        .text(player.valueCategory);
    
    // Add rationale
    let rationale = '';
    switch (player.valueCategory) {
        case 'Bargain':
            rationale = `High performance-to-value ratio. Consider acquiring.`;
            break;
        case 'Fair Value':
            rationale = `Appropriately priced for current abilities.`;
            break;
        case 'Premium':
            rationale = `High cost relative to current abilities.`;
            break;
        default:
            rationale = `Insufficient data for assessment.`;
    }
    
    // Add a custom metric
    panel.append('text')
        .attr('x', 10)
        .attr('y', 120)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(rationale);
    
    // Add value per rating
    if (player.valuePerRating) {
        panel.append('text')
            .attr('x', 10)
            .attr('y', 135)
            .attr('font-size', '10px')
            .attr('fill', '#666')
            .text(`Cost per rating point: €${player.valuePerRating}M`);
    }
    
    // Add close button
    const closeButton = panel.append('g')
        .attr('transform', `translate(${panelWidth - 15}, 15)`)
        .style('cursor', 'pointer')
        .on('click', function() {
            panel.remove();
        });
    
    closeButton.append('circle')
        .attr('r', 8)
        .attr('fill', '#f5f5f5')
        .attr('stroke', '#ccc');
    
    closeButton.append('text')
        .attr('x', 0)
        .attr('y', 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#999')
        .text('×');
}