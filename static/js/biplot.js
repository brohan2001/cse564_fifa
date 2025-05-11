// // // Global variables for biplot
// // let biplot = {
// //     svg: null,
// //     width: 0,
// //     height: 0,
// //     margin: { top: 40, right: 40, bottom: 60, left: 60 },
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
// //     selectedPositions: new Set() // Track selected positions for filtering
// // };

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
    
// //     // Add reset button
// //     addBiplotResetButton();
    
// //     // Initial data load and rendering
// //     loadPCAData();
// // }

// // // Add reset button for biplot
// // function addBiplotResetButton() {
// //     const resetButton = d3.select('#biplot-container')
// //         .append('div')
// //         .attr('id', 'biplot-reset')
// //         .style('position', 'absolute')
// //         .style('top', '10px')
// //         .style('left', '10px')
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
    
// //     biplot.svg.append('text')
// //         .attr('class', 'axis-label')
// //         .attr('transform', 'rotate(-90)')
// //         .attr('x', -biplot.height / 2)
// //         .attr('y', -40)
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
// //             // Color by position
// //             const position = d.player_positions || 'Unknown';
// //             return biplot.colorScale(position.split(',')[0]);
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
            
// //             // If positions are selected, fade non-matching positions
// //             if (biplot.selectedPositions.size > 0) {
// //                 const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
// //                 return biplot.selectedPositions.has(position) ? 0.7 : 0.2;
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
    
// //     // Add legend
// //     addBiplotLegend();
// // }

// // // Add legend to biplot
// // function addBiplotLegend() {
// //     // Get unique positions for legend
// //     const positions = [...new Set(biplot.pcaData
// //         .map(d => d.player_positions ? d.player_positions.split(',')[0] : 'Unknown'))];
    
// //     // Limit to top positions
// //     const topPositions = positions.slice(0, 10);
    
// //     // Create legend container
// //     const legend = biplot.svg.append('g')
// //         .attr('class', 'biplot-legend')
// //         .attr('transform', `translate(${biplot.width - 120}, 0)`);
    
// //     // Add background
// //     legend.append('rect')
// //         .attr('width', 120)
// //         .attr('height', topPositions.length * 20 + 45) // Extra height for toggle button
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
// //         .text('Positions');
    
// //     // Add toggle instructions
// //     legend.append('text')
// //         .attr('x', 10)
// //         .attr('y', 30)
// //         .style('font-size', '8px')
// //         .style('font-style', 'italic')
// //         .text('Click to filter by position');
    
// //     // Add legend items
// //     topPositions.forEach((position, i) => {
// //         // Check if position is selected
// //         const isSelected = biplot.selectedPositions.has(position);
        
// //         // Create group for legend item
// //         const item = legend.append('g')
// //             .attr('transform', `translate(10, ${i * 20 + 45})`)
// //             .style('cursor', 'pointer')
// //             .on('click', function() {
// //                 // Toggle selection for this position
// //                 if (biplot.selectedPositions.has(position)) {
// //                     biplot.selectedPositions.delete(position);
// //                 } else {
// //                     biplot.selectedPositions.add(position);
// //                 }
                
// //                 // If nothing is selected, reset all selections
// //                 if (biplot.selectedPositions.size === 0) {
// //                     // Reset to original state
// //                     biplot.selectedPositions.clear();
// //                 }
                
// //                 // Update dashboard state too for consistency
// //                 if (biplot.selectedPositions.size === 1) {
// //                     const selectedPosition = Array.from(biplot.selectedPositions)[0];
// //                     dashboardState.filters.position = selectedPosition;
// //                     const positionSelector = document.getElementById('position-selector');
// //                     if (positionSelector) {
// //                         positionSelector.value = selectedPosition;
// //                     }
// //                 } else if (biplot.selectedPositions.size === 0) {
// //                     dashboardState.filters.position = 'all';
// //                     const positionSelector = document.getElementById('position-selector');
// //                     if (positionSelector) {
// //                         positionSelector.value = 'all';
// //                     }
// //                 }
                
// //                 // Update UI
// //                 updateSelectionDetails();
                
// //                 // Redraw the legend to update selection indicators
// //                 renderBiplot();
// //             });
        
// //         // Add selection background for better visibility
// //         if (isSelected) {
// //             item.append('rect')
// //                 .attr('width', 100)
// //                 .attr('height', 16)
// //                 .attr('x', -2)
// //                 .attr('y', -8)
// //                 .attr('fill', '#f0f0f0')
// //                 .attr('rx', 3)
// //                 .attr('ry', 3);
// //         }
        
// //         // Add color swatch
// //         item.append('rect')
// //             .attr('width', 10)
// //             .attr('height', 10)
// //             .attr('fill', biplot.colorScale(position))
// //             .attr('stroke', isSelected ? '#000' : 'none')
// //             .attr('stroke-width', isSelected ? 1 : 0);
        
// //         // Add label
// //         item.append('text')
// //             .attr('x', 15)
// //             .attr('y', 9)
// //             .style('font-size', '10px')
// //             .style('font-weight', isSelected ? 'bold' : 'normal')
// //             .text(position);
// //     });
    
// //     // Add "more" indicator if there are more positions
// //     if (positions.length > topPositions.length) {
// //         legend.append('text')
// //             .attr('x', 10)
// //             .attr('y', topPositions.length * 20 + 45)
// //             .style('font-size', '10px')
// //             .style('font-style', 'italic')
// //             .text(`+ ${positions.length - topPositions.length} more...`);
// //     }
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
//     margin: { top: 40, right: 40, bottom: 60, left: 60 },
//     xScale: null,
//     yScale: null,
//     tooltip: null,
//     pcaData: null,
//     loadings: null,
//     featureNames: null,
//     explainedVariance: null,
//     colorScale: d3.scaleOrdinal(d3.schemeCategory10),
//     highlightedPlayerId: null,
//     zoomTransform: null,
//     selectedPositions: new Set() // Track selected positions for filtering
// };

// // Initialize the biplot visualization
// function initializeBiplot() {
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
    
//     // Add reset button in a better position (top right corner of actual plot)
//     addBiplotResetButton();
    
//     // Initial data load and rendering
//     loadPCAData();
// }

// // Add reset button for biplot - repositioned to avoid covering title
// function addBiplotResetButton() {
//     const resetButton = d3.select('#biplot')
//         .append('div')
//         .attr('id', 'biplot-reset')
//         .style('position', 'absolute')
//         .style('top', `${biplot.margin.top + 10}px`)
//         .style('right', `${biplot.margin.right + 10}px`)
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
//             biplot.selectedPositions.clear();
            
//             // Update visualization
//             renderBiplot();
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
        
//         // Store PCA results
//         biplot.pcaData = data.players;
//         biplot.loadings = data.loadings;
//         biplot.featureNames = data.feature_names;
//         biplot.explainedVariance = data.explained_variance;
        
//         // Render the biplot
//         renderBiplot();
        
//     } catch (error) {
//         console.error('Error loading PCA data:', error);
//         biplot.svg.select('text')
//             .text('Error loading PCA data. Please try again.');
//     }
// }

// // Render the biplot visualization
// function renderBiplot() {
//     // Clear SVG
//     biplot.svg.selectAll('*').remove();
    
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
    
//     // Improve y-axis label positioning
//     biplot.svg.append('text')
//         .attr('class', 'axis-label')
//         .attr('transform', 'rotate(-90)')
//         .attr('x', -biplot.height / 2)
//         .attr('y', -45) // Increased distance from axis
//         .attr('text-anchor', 'middle')
//         .style('font-weight', 'bold')
//         .text(`Principal Component 2 (${(biplot.explainedVariance[1] * 100).toFixed(1)}%)`);
    
//     // Create a container for data points
//     const pointsContainer = biplot.svg.append('g')
//         .attr('class', 'points-container');
    
//     // Create a container for loadings
//     const loadingsContainer = biplot.svg.append('g')
//         .attr('class', 'loadings-container');
    
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
//             // Color by position
//             const position = d.player_positions || 'Unknown';
//             return biplot.colorScale(position.split(',')[0]);
//         })
//         .attr('stroke', d => {
//             // Highlight selected player
//             return (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) ? '#000' : 'none';
//         })
//         .attr('stroke-width', d => {
//             // Highlight selected player
//             return (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) ? 2 : 0;
//         })
//         .attr('opacity', d => {
//             // Handle opacity based on different selection states
//             // If a player is highlighted, fade all others
//             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                 return 0.3;
//             }
            
//             // If positions are selected, fade non-matching positions
//             if (biplot.selectedPositions.size > 0) {
//                 const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
//                 return biplot.selectedPositions.has(position) ? 0.7 : 0.2;
//             }
            
//             // Default opacity
//             return 0.7;
//         })
//         .on('mouseover', function(event, d) {
//             // Highlight on hover
//             d3.select(this)
//                 .attr('r', 5)
//                 .attr('opacity', 1);
            
//             // Show tooltip
//             biplot.tooltip.transition()
//                 .duration(200)
//                 .style('opacity', 0.9);
            
//             biplot.tooltip.html(`
//                 <strong>${d.short_name}</strong><br>
//                 ${d.club_name}<br>
//                 ${d.nationality_name}<br>
//                 Position: ${d.player_positions || 'N/A'}<br>
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
//                     // Restore appropriate opacity based on selection state
//                     if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                         return 0.3;
//                     }
                    
//                     if (biplot.selectedPositions.size > 0) {
//                         const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
//                         return biplot.selectedPositions.has(position) ? 0.7 : 0.2;
//                     }
                    
//                     return 0.7;
//                 });
            
//             // Hide tooltip
//             biplot.tooltip.transition()
//                 .duration(500)
//                 .style('opacity', 0);
//         })
//         .on('click', function(event, d) {
//             // Select player on click
//             if (d.player_id) {  // Make sure player_id exists
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
        
//         // Add feature label
//         // Calculate label position with slight offset
//         const labelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) + 10;
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
    
//     // Add legend below the plot instead of on the side
//     addBiplotLegend();
// }

// // Add legend to biplot - moved below the plot
// function addBiplotLegend() {
//     // Get unique positions for legend
//     const positions = [...new Set(biplot.pcaData
//         .map(d => d.player_positions ? d.player_positions.split(',')[0] : 'Unknown'))];
    
//     // Limit to top positions
//     const topPositions = positions.slice(0, 10);
    
//     // Calculate legend positioning
//     const legendWidth = biplot.width;
//     const itemsPerRow = 5; // Number of items per row in the legend
//     const itemWidth = legendWidth / itemsPerRow;
//     const itemHeight = 20;
//     const rows = Math.ceil(topPositions.length / itemsPerRow);
//     const legendHeight = rows * itemHeight + 30; // Extra height for title
    
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
//         .text('Positions');
    
//     // Add toggle instructions
//     legend.append('text')
//         .attr('x', legendWidth - 170)
//         .attr('y', 15)
//         .style('font-size', '8px')
//         .style('font-style', 'italic')
//         .text('Click on position to filter by position');
    
//     // Add legend items in a grid layout
//     topPositions.forEach((position, i) => {
//         const row = Math.floor(i / itemsPerRow);
//         const col = i % itemsPerRow;
        
//         // Check if position is selected
//         const isSelected = biplot.selectedPositions.has(position);
        
//         // Create group for legend item
//         const item = legend.append('g')
//             .attr('transform', `translate(${col * itemWidth + 10}, ${row * itemHeight + 30})`)
//             .style('cursor', 'pointer')
//             .on('click', function() {
//                 // Toggle selection for this position
//                 if (biplot.selectedPositions.has(position)) {
//                     biplot.selectedPositions.delete(position);
//                 } else {
//                     biplot.selectedPositions.add(position);
//                 }
                
//                 // If nothing is selected, reset all selections
//                 if (biplot.selectedPositions.size === 0) {
//                     // Reset to original state
//                     biplot.selectedPositions.clear();
//                 }
                
//                 // Update dashboard state too for consistency
//                 if (biplot.selectedPositions.size === 1) {
//                     const selectedPosition = Array.from(biplot.selectedPositions)[0];
//                     dashboardState.filters.position = selectedPosition;
//                     const positionSelector = document.getElementById('position-selector');
//                     if (positionSelector) {
//                         positionSelector.value = selectedPosition;
//                     }
//                 } else if (biplot.selectedPositions.size === 0) {
//                     dashboardState.filters.position = 'all';
//                     const positionSelector = document.getElementById('position-selector');
//                     if (positionSelector) {
//                         positionSelector.value = 'all';
//                     }
//                 }
                
//                 // Update UI
//                 updateSelectionDetails();
                
//                 // Redraw the legend to update selection indicators
//                 renderBiplot();
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
//             .attr('fill', biplot.colorScale(position))
//             .attr('stroke', isSelected ? '#000' : 'none')
//             .attr('stroke-width', isSelected ? 1 : 0);
        
//         // Add label
//         item.append('text')
//             .attr('x', 15)
//             .attr('y', 9)
//             .style('font-size', '10px')
//             .style('font-weight', isSelected ? 'bold' : 'normal')
//             .text(position);
//     });
    
//     // Add "more" indicator if there are more positions
//     if (positions.length > topPositions.length) {
//         legend.append('text')
//             .attr('x', 10)
//             .attr('y', legendHeight - 5)
//             .style('font-size', '10px')
//             .style('font-style', 'italic')
//             .text(`+ ${positions.length - topPositions.length} more positions not shown`);
//     }
    
//     // Update SVG height to accommodate legend
//     d3.select('#biplot svg')
//         .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 10);
// }

// // Update biplot with zoom transformation
// function updateBiplotWithZoom() {
//     if (!biplot.zoomTransform) return;
    
//     // Apply zoom to points
//     biplot.svg.select('.points-container')
//         .attr('transform', biplot.zoomTransform);
    
//     // Apply zoom to loadings
//     biplot.svg.select('.loadings-container')
//         .attr('transform', biplot.zoomTransform);
    
//     // Update axes
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

// // Update biplot visualization with new data
// function updateBiplot(filteredData) {
//     // Reset zoom
//     biplot.zoomTransform = null;
//     d3.select('#biplot svg').call(d3.zoom().transform, d3.zoomIdentity);
    
//     // If we have a league filter, reload PCA data
//     if (dashboardState.filters.league !== globalData.selectedLeague) {
//         globalData.selectedLeague = dashboardState.filters.league;
//         loadPCAData();
//         return;
//     }
    
//     // If no reload needed, just update the existing visualization
//     // Update position selection based on dashboard state
//     if (dashboardState.filters.position !== 'all') {
//         biplot.selectedPositions.clear();
//         biplot.selectedPositions.add(dashboardState.filters.position);
//     } else if (biplot.selectedPositions.size > 0 && dashboardState.filters.position === 'all') {
//         biplot.selectedPositions.clear();
//     }
    
//     // Filter points based on current filters
//     const filteredIds = new Set(filteredData.map(d => d.player_id));
    
//     biplot.svg.selectAll('.data-point')
//         .attr('opacity', d => {
//             // If a player is highlighted, fade all others
//             if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
//                 return 0.2;
//             }
            
//             // If positions are selected, fade non-matching positions
//             if (biplot.selectedPositions.size > 0) {
//                 const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
//                 if (!biplot.selectedPositions.has(position)) {
//                     return 0.2;
//                 }
//             }
            
//             return filteredIds.has(d.player_id) ? 0.7 : 0.2;
//         })
//         .attr('r', d => filteredIds.has(d.player_id) ? 3 : 2);
// }

// // Highlight a specific player in the biplot
// function highlightPlayerInBiplot(playerId) {
//     biplot.highlightedPlayerId = playerId;
    
//     // Update data point styling
//     biplot.svg.selectAll('.data-point')
//         .attr('stroke', d => d.player_id === playerId ? '#000' : 'none')
//         .attr('stroke-width', d => d.player_id === playerId ? 2 : 0)
//         .attr('r', d => d.player_id === playerId ? 5 : 3)
//         .attr('opacity', d => d.player_id === playerId ? 1 : 0.3);
    
//     // Find the player data point
//     const player = biplot.pcaData.find(d => d.player_id === playerId);
    
//     if (player) {
//         // Center the view on the player
//         const x = biplot.xScale(player.pca_x);
//         const y = biplot.yScale(player.pca_y);
        
//         // Create a zoom transform to center on the player
//         const transform = d3.zoomIdentity
//             .translate(biplot.width / 2 - x, biplot.height / 2 - y)
//             .scale(1.5);
        
//         // Apply the transform with transition
//         d3.select('#biplot svg')
//             .transition()
//             .duration(750)
//             .call(d3.zoom().transform, transform);
//     }
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
    colorScale: d3.scaleOrdinal(d3.schemeCategory10),
    highlightedPlayerId: null,
    zoomTransform: null,
    selectedPositions: new Set() // Track selected positions for filtering
};

// Initialize the biplot visualization
function initializeBiplot() {
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
    
    // Add reset button in a better position (top right corner of actual plot)
    addBiplotResetButton();
    
    // Initial data load and rendering
    loadPCAData();
}

// Add reset button for biplot - positioned at the top right of the container
function addBiplotResetButton() {
    const resetButton = d3.select('#biplot-container')
        .append('div')
        .attr('id', 'biplot-reset')
        .style('position', 'absolute')
        .style('top', '10px')
        .style('right', '10px')
        .style('z-index', '10')
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
            biplot.selectedPositions.clear();
            
            // Update visualization
            renderBiplot();
        });
}

// Load PCA data from API
async function loadPCAData() {
    try {
        // Construct API URL - include league filter if active
        let url = '/api/pca';
        if (dashboardState.filters.league !== 'all') {
            url += `?league=${dashboardState.filters.league}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Store PCA results
        biplot.pcaData = data.players;
        biplot.loadings = data.loadings;
        biplot.featureNames = data.feature_names;
        biplot.explainedVariance = data.explained_variance;
        
        // Render the biplot
        renderBiplot();
        
    } catch (error) {
        console.error('Error loading PCA data:', error);
        biplot.svg.select('text')
            .text('Error loading PCA data. Please try again.');
    }
}

// Render the biplot visualization
function renderBiplot() {
    // Clear SVG
    biplot.svg.selectAll('*').remove();
    
    // Extract PC coordinates
    const xValues = biplot.pcaData.map(d => d.pca_x);
    const yValues = biplot.pcaData.map(d => d.pca_y);
    
    // Update scales
    biplot.xScale.domain([d3.min(xValues) * 1.1, d3.max(xValues) * 1.1]);
    biplot.yScale.domain([d3.min(yValues) * 1.1, d3.max(yValues) * 1.1]);
    
    // Create axis objects
    const xAxis = d3.axisBottom(biplot.xScale);
    const yAxis = d3.axisLeft(biplot.yScale);
    
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
    
    // Add axis labels
    biplot.svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', biplot.width / 2)
        .attr('y', biplot.height + 40)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text(`Principal Component 1 (${(biplot.explainedVariance[0] * 100).toFixed(1)}%)`);
    
    // Further improved y-axis label positioning to ensure it's fully visible
    biplot.svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -biplot.height / 2)
        .attr('y', -55) // Increased distance from axis even more
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text(`Principal Component 2 (${(biplot.explainedVariance[1] * 100).toFixed(1)}%)`);
    
    // Create a container for data points
    const pointsContainer = biplot.svg.append('g')
        .attr('class', 'points-container');
    
    // Create a container for loadings
    const loadingsContainer = biplot.svg.append('g')
        .attr('class', 'loadings-container');
    
    // Add data points
    pointsContainer.selectAll('.data-point')
        .data(biplot.pcaData)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => biplot.xScale(d.pca_x))
        .attr('cy', d => biplot.yScale(d.pca_y))
        .attr('r', 3)
        .attr('fill', d => {
            // Color by position
            const position = d.player_positions || 'Unknown';
            return biplot.colorScale(position.split(',')[0]);
        })
        .attr('stroke', d => {
            // Highlight selected player
            return (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) ? '#000' : 'none';
        })
        .attr('stroke-width', d => {
            // Highlight selected player
            return (biplot.highlightedPlayerId && d.player_id === biplot.highlightedPlayerId) ? 2 : 0;
        })
        .attr('opacity', d => {
            // Handle opacity based on different selection states
            // If a player is highlighted, fade all others
            if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                return 0.3;
            }
            
            // If positions are selected, fade non-matching positions
            if (biplot.selectedPositions.size > 0) {
                const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
                return biplot.selectedPositions.has(position) ? 0.7 : 0.2;
            }
            
            // Default opacity
            return 0.7;
        })
        .on('mouseover', function(event, d) {
            // Highlight on hover
            d3.select(this)
                .attr('r', 5)
                .attr('opacity', 1);
            
            // Show tooltip
            biplot.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            
            biplot.tooltip.html(`
                <strong>${d.short_name}</strong><br>
                ${d.club_name}<br>
                ${d.nationality_name}<br>
                Position: ${d.player_positions || 'N/A'}<br>
                PC1: ${d.pca_x.toFixed(2)}, PC2: ${d.pca_y.toFixed(2)}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function(event, d) {
            // Reset on mouseout
            d3.select(this)
                .attr('r', 3)
                .attr('opacity', d => {
                    // Restore appropriate opacity based on selection state
                    if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                        return 0.3;
                    }
                    
                    if (biplot.selectedPositions.size > 0) {
                        const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
                        return biplot.selectedPositions.has(position) ? 0.7 : 0.2;
                    }
                    
                    return 0.7;
                });
            
            // Hide tooltip
            biplot.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            // Select player on click
            if (d.player_id) {  // Make sure player_id exists
                selectPlayer(globalData.players.find(p => p.player_id === d.player_id));
            }
        });
    
    // Draw feature vectors (loadings)
    const loadingScale = Math.min(biplot.width, biplot.height) / 2 * 0.8;
    
    biplot.featureNames.forEach((feature, i) => {
        // Calculate vector coordinates
        const x1 = biplot.xScale(0);
        const y1 = biplot.yScale(0);
        const x2 = biplot.xScale(biplot.loadings[0][i] * loadingScale);
        const y2 = biplot.yScale(biplot.loadings[1][i] * loadingScale);
        
        // Get vector magnitude for filtering
        const magnitude = Math.sqrt(
            Math.pow(biplot.loadings[0][i], 2) + Math.pow(biplot.loadings[1][i], 2)
        );
        
        // Skip vectors with very small magnitude
        if (magnitude < 0.05) return;
        
        // Draw loading vector
        loadingsContainer.append('line')
            .attr('class', 'loading-vector')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#555')
            .attr('stroke-width', 1.5);
        
        // Add arrowhead
        const arrowSize = 5;
        const angle = Math.atan2(y1 - y2, x2 - x1);
        
        loadingsContainer.append('path')
            .attr('d', `M ${x2} ${y2} l ${-arrowSize * Math.cos(angle - Math.PI/6)} ${arrowSize * Math.sin(angle - Math.PI/6)} l ${-arrowSize * Math.cos(angle + Math.PI/6)} ${arrowSize * Math.sin(angle + Math.PI/6)} z`)
            .attr('fill', '#555');
        
        // Format feature name
        const formattedName = feature.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Add feature label
        // Calculate label position with slight offset
        const labelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) + 10;
        const labelX = x1 + (x2 - x1) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * labelDistance;
        const labelY = y1 + (y2 - y1) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * labelDistance;

        // Add label with background for readability
        loadingsContainer.append('text')
            .attr('class', 'vector-label-bg')
            .attr('x', labelX)
            .attr('y', labelY)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('stroke', 'white')
            .attr('stroke-width', 4)
            .attr('paint-order', 'stroke')
            .text(formattedName);
        
        loadingsContainer.append('text')
            .attr('class', 'vector-label')
            .attr('x', labelX)
            .attr('y', labelY)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#333')
            .text(formattedName);
    });
    
    // Add title with variance explained
    biplot.svg.append('text')
        .attr('class', 'biplot-title')
        .attr('x', biplot.width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`PCA Biplot - Total Variance Explained: ${((biplot.explainedVariance[0] + biplot.explainedVariance[1]) * 100).toFixed(1)}%`);
    
    // Add legend below the plot instead of on the side
    addBiplotLegend();
}

// Add legend to biplot - moved below the plot
function addBiplotLegend() {
    // Get unique positions for legend
    const positions = [...new Set(biplot.pcaData
        .map(d => d.player_positions ? d.player_positions.split(',')[0] : 'Unknown'))];
    
    // Limit to top positions
    const topPositions = positions.slice(0, 10);
    
    // Calculate legend positioning
    const legendWidth = biplot.width;
    const itemsPerRow = 5; // Number of items per row in the legend
    const itemWidth = legendWidth / itemsPerRow;
    const itemHeight = 20;
    const rows = Math.ceil(topPositions.length / itemsPerRow);
    const legendHeight = rows * itemHeight + 30; // Extra height for title
    
    // Create legend container at the bottom
    const legend = biplot.svg.append('g')
        .attr('class', 'biplot-legend')
        .attr('transform', `translate(0, ${biplot.height + 50})`); // Position below x-axis label
    
    // Add background
    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
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
        .text('Positions');
    
    // Add toggle instructions
    legend.append('text')
        .attr('x', legendWidth - 170)
        .attr('y', 15)
        .style('font-size', '8px')
        .style('font-style', 'italic')
        .text('Click on position to filter by position');
    
    // Add legend items in a grid layout
    topPositions.forEach((position, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        
        // Check if position is selected
        const isSelected = biplot.selectedPositions.has(position);
        
        // Create group for legend item
        const item = legend.append('g')
            .attr('transform', `translate(${col * itemWidth + 10}, ${row * itemHeight + 30})`)
            .style('cursor', 'pointer')
            .on('click', function() {
                // Toggle selection for this position
                if (biplot.selectedPositions.has(position)) {
                    biplot.selectedPositions.delete(position);
                } else {
                    biplot.selectedPositions.add(position);
                }
                
                // If nothing is selected, reset all selections
                if (biplot.selectedPositions.size === 0) {
                    // Reset to original state
                    biplot.selectedPositions.clear();
                }
                
                // Update dashboard state too for consistency
                if (biplot.selectedPositions.size === 1) {
                    const selectedPosition = Array.from(biplot.selectedPositions)[0];
                    dashboardState.filters.position = selectedPosition;
                    const positionSelector = document.getElementById('position-selector');
                    if (positionSelector) {
                        positionSelector.value = selectedPosition;
                    }
                } else if (biplot.selectedPositions.size === 0) {
                    dashboardState.filters.position = 'all';
                    const positionSelector = document.getElementById('position-selector');
                    if (positionSelector) {
                        positionSelector.value = 'all';
                    }
                }
                
                // Update UI
                updateSelectionDetails();
                
                // Redraw the legend to update selection indicators
                renderBiplot();
            });
        
        // Add selection background for better visibility
        if (isSelected) {
            item.append('rect')
                .attr('width', itemWidth - 15)
                .attr('height', 16)
                .attr('x', -5)
                .attr('y', -10)
                .attr('fill', '#f0f0f0')
                .attr('rx', 3)
                .attr('ry', 3);
        }
        
        // Add color swatch
        item.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', biplot.colorScale(position))
            .attr('stroke', isSelected ? '#000' : 'none')
            .attr('stroke-width', isSelected ? 1 : 0);
        
        // Add label
        item.append('text')
            .attr('x', 15)
            .attr('y', 9)
            .style('font-size', '10px')
            .style('font-weight', isSelected ? 'bold' : 'normal')
            .text(position);
    });
    
    // Remove "more positions not shown" indicator as requested
    
    // Update SVG height to accommodate legend
    d3.select('#biplot svg')
        .attr('height', biplot.height + biplot.margin.top + biplot.margin.bottom + legendHeight + 10);
}

// Update biplot with zoom transformation
function updateBiplotWithZoom() {
    if (!biplot.zoomTransform) return;
    
    // Apply zoom to points
    biplot.svg.select('.points-container')
        .attr('transform', biplot.zoomTransform);
    
    // Apply zoom to loadings
    biplot.svg.select('.loadings-container')
        .attr('transform', biplot.zoomTransform);
    
    // Update axes
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

// Update biplot visualization with new data
function updateBiplot(filteredData) {
    // Reset zoom
    biplot.zoomTransform = null;
    d3.select('#biplot svg').call(d3.zoom().transform, d3.zoomIdentity);
    
    // If we have a league filter, reload PCA data
    if (dashboardState.filters.league !== globalData.selectedLeague) {
        globalData.selectedLeague = dashboardState.filters.league;
        loadPCAData();
        return;
    }
    
    // If no reload needed, just update the existing visualization
    // Update position selection based on dashboard state
    if (dashboardState.filters.position !== 'all') {
        biplot.selectedPositions.clear();
        biplot.selectedPositions.add(dashboardState.filters.position);
    } else if (biplot.selectedPositions.size > 0 && dashboardState.filters.position === 'all') {
        biplot.selectedPositions.clear();
    }
    
    // Filter points based on current filters
    const filteredIds = new Set(filteredData.map(d => d.player_id));
    
    biplot.svg.selectAll('.data-point')
        .attr('opacity', d => {
            // If a player is highlighted, fade all others
            if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                return 0.2;
            }
            
            // If positions are selected, fade non-matching positions
            if (biplot.selectedPositions.size > 0) {
                const position = d.player_positions ? d.player_positions.split(',')[0] : 'Unknown';
                if (!biplot.selectedPositions.has(position)) {
                    return 0.2;
                }
            }
            
            return filteredIds.has(d.player_id) ? 0.7 : 0.2;
        })
        .attr('r', d => filteredIds.has(d.player_id) ? 3 : 2);
}

// Highlight a specific player in the biplot
function highlightPlayerInBiplot(playerId) {
    biplot.highlightedPlayerId = playerId;
    
    // Update data point styling
    biplot.svg.selectAll('.data-point')
        .attr('stroke', d => d.player_id === playerId ? '#000' : 'none')
        .attr('stroke-width', d => d.player_id === playerId ? 2 : 0)
        .attr('r', d => d.player_id === playerId ? 5 : 3)
        .attr('opacity', d => d.player_id === playerId ? 1 : 0.3);
    
    // Find the player data point
    const player = biplot.pcaData.find(d => d.player_id === playerId);
    
    if (player) {
        // Center the view on the player
        const x = biplot.xScale(player.pca_x);
        const y = biplot.yScale(player.pca_y);
        
        // Create a zoom transform to center on the player
        const transform = d3.zoomIdentity
            .translate(biplot.width / 2 - x, biplot.height / 2 - y)
            .scale(1.5);
        
        // Apply the transform with transition
        d3.select('#biplot svg')
            .transition()
            .duration(750)
            .call(d3.zoom().transform, transform);
    }
}