// Global variables for biplot
let biplot = {
    svg: null,
    width: 0,
    height: 0,
    margin: { top: 40, right: 40, bottom: 60, left: 60 },
    xScale: null,
    yScale: null,
    tooltip: null,
    pcaData: null,
    loadings: null,
    featureNames: null,
    explainedVariance: null,
    colorScale: d3.scaleOrdinal(d3.schemeCategory10),
    highlightedPlayerId: null,
    zoomTransform: null
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
        .attr('x', biplot.width / 2)
        .attr('y', biplot.height / 2)
        .attr('text-anchor', 'middle')
        .text('Loading PCA data...');
    
    // Initial data load and rendering
    loadPCAData();
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
    
    biplot.svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -biplot.height / 2)
        .attr('y', -40)
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
            // Fade non-selected players if there's a selection
            if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                return 0.3;
            }
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
                    if (biplot.highlightedPlayerId && d.player_id !== biplot.highlightedPlayerId) {
                        return 0.3;
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
            selectPlayer(d);
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