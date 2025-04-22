// Global variables for player profile
let playerProfile = {
    svg: null,
    width: 0,
    height: 0,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    radarScale: null,
    attributes: ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'],
    maxValue: 100, // Maximum attribute value
    currentPlayer: null
};

// Initialize the player profile visualization
function initializePlayerProfile() {
    // Set dimensions
    const container = document.getElementById('radar-chart');
    playerProfile.width = container.clientWidth;
    playerProfile.height = container.clientHeight;
    
    // Find center of radar chart
    playerProfile.centerX = playerProfile.width / 2;
    playerProfile.centerY = playerProfile.height / 2;
    
    // Calculate radar radius (smaller dimension / 2, with margin)
    playerProfile.radius = Math.min(
        playerProfile.width - playerProfile.margin.left - playerProfile.margin.right,
        playerProfile.height - playerProfile.margin.top - playerProfile.margin.bottom
    ) / 2;
    
    // Create SVG
    playerProfile.svg = d3.select('#radar-chart')
        .append('svg')
        .attr('width', playerProfile.width)
        .attr('height', playerProfile.height)
        .append('g')
        .attr('transform', `translate(${playerProfile.centerX}, ${playerProfile.centerY})`);
    
    // Create scale for radar
    playerProfile.radarScale = d3.scaleLinear()
        .domain([0, playerProfile.maxValue])
        .range([0, playerProfile.radius]);
    
    // Create radar axes
    createRadarAxes();
    
    // Add default empty state message
    playerProfile.svg.append('text')
        .attr('class', 'empty-state')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text('Select a player to view details');
    
    // Initialize player info section
    initializePlayerInfo();
}

// Initialize player info section
function initializePlayerInfo() {
    const container = document.getElementById('player-info');
    container.innerHTML = '<p>No player selected</p>';
}

// Create radar chart axes
function createRadarAxes() {
    // Calculate angle for each axis
    const angleStep = (Math.PI * 2) / playerProfile.attributes.length;
    
    // Create axis lines
    playerProfile.svg.selectAll('.radar-axis')
        .data(playerProfile.attributes)
        .enter()
        .append('line')
        .attr('class', 'radar-axis')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => playerProfile.radarScale(playerProfile.maxValue) * Math.cos(angleStep * i - Math.PI / 2))
        .attr('y2', (d, i) => playerProfile.radarScale(playerProfile.maxValue) * Math.sin(angleStep * i - Math.PI / 2))
        .attr('stroke', '#999')
        .attr('stroke-width', 1);
    
    // Create circular grid lines
    const gridLevels = [20, 40, 60, 80, 100];
    
    gridLevels.forEach(level => {
        playerProfile.svg.append('circle')
            .attr('class', 'radar-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', playerProfile.radarScale(level))
            .attr('fill', 'none')
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
        
        // Add value labels
        playerProfile.svg.append('text')
            .attr('x', 0)
            .attr('y', -playerProfile.radarScale(level))
            .attr('dy', -2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('fill', '#999')
            .text(level);
    });
    
    // Add axis labels
    playerProfile.attributes.forEach((attribute, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = (playerProfile.radius + 15) * Math.cos(angle);
        const y = (playerProfile.radius + 15) * Math.sin(angle);
        
        // Format attribute name
        const formattedName = attribute.charAt(0).toUpperCase() + attribute.slice(1);
        
        playerProfile.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dy', 5)
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text(formattedName);
    });
}

// Update player profile with selected player
function updatePlayerProfile(player) {
    // If no player selected, show empty state
    if (!player) {
        showEmptyState();
        return;
    }
    
    // Store current player
    playerProfile.currentPlayer = player;
    
    // Update player info
    updatePlayerInfo(player);
    
    // Update radar chart
    updateRadarChart(player);
    
    // Update player image
    updatePlayerImage(player);
}

// Show empty state when no player is selected
function showEmptyState() {
    // Clear radar chart
    playerProfile.svg.selectAll('.radar-web').remove();
    
    // Show empty state message
    playerProfile.svg.selectAll('.empty-state')
        .transition()
        .duration(300)
        .style('opacity', 1);
    
    // Clear player info
    const infoContainer = document.getElementById('player-info');
    infoContainer.innerHTML = '<p>No player selected</p>';
    
    // Clear player image
    const imageContainer = document.getElementById('player-image');
    imageContainer.innerHTML = '';
}

// Update player info panel
function updatePlayerInfo(player) {
    const infoContainer = document.getElementById('player-info');
    
    // Create HTML for player info
    const infoHTML = `
        <div class="player-name">${player.short_name}</div>
        <div class="player-details">
            <div class="detail-item">
                <span class="detail-label">Overall:</span>
                <span class="detail-value">${player.player_overall}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Club:</span>
                <span class="detail-value">${player.club_name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Position:</span>
                <span class="detail-value">${player.player_positions}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Nationality:</span>
                <span class="detail-value">${player.nationality_name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Age:</span>
                <span class="detail-value">${player.age}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Value:</span>
                <span class="detail-value">€${player.value_millions_eur.toFixed(1)}M</span>
            </div>
        </div>
    `;
    
    // Update container
    infoContainer.innerHTML = infoHTML;
    
    // Apply styles
    const containerStyle = infoContainer.style;
    containerStyle.padding = '10px';
    containerStyle.textAlign = 'center';
    
    // Style player name
    const nameStyle = document.querySelector('.player-name').style;
    nameStyle.fontSize = '16px';
    nameStyle.fontWeight = 'bold';
    nameStyle.marginBottom = '10px';
    
    // Style details
    document.querySelectorAll('.detail-item').forEach(item => {
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.margin = '5px 0';
        item.style.fontSize = '12px';
    });
    
    document.querySelectorAll('.detail-label').forEach(label => {
        label.style.fontWeight = 'bold';
        label.style.color = '#555';
    });
    
    document.querySelectorAll('.detail-value').forEach(value => {
        value.style.color = '#333';
    });
}

// Update radar chart with player attributes
function updateRadarChart(player) {
    // Hide empty state message
    playerProfile.svg.selectAll('.empty-state')
        .transition()
        .duration(300)
        .style('opacity', 0);
    
    // Calculate angle for each axis
    const angleStep = (Math.PI * 2) / playerProfile.attributes.length;
    
    // Create data points for the radar
    const radarData = playerProfile.attributes.map((attr, i) => {
        const value = player[attr];
        const angle = angleStep * i - Math.PI / 2;
        
        return {
            attribute: attr,
            value: value,
            x: playerProfile.radarScale(value) * Math.cos(angle),
            y: playerProfile.radarScale(value) * Math.sin(angle)
        };
    });
    
    // Create path generator for radar web
    const radarLine = d3.lineRadial()
        .radius(d => playerProfile.radarScale(d.value))
        .angle((d, i) => angleStep * i);
    
    // Convert to polar coordinates for d3.lineRadial
    const radarPolarData = radarData.map(d => ({
        value: d.value
    }));
    
    // Remove existing radar web
    playerProfile.svg.selectAll('.radar-web').remove();
    
    // Create radar web
    const radarWeb = playerProfile.svg.append('path')
        .datum(radarPolarData)
        .attr('class', 'radar-web')
        .attr('d', radarLine)
        .attr('fill', 'rgba(244, 178, 35, 0.3)')
        .attr('stroke', '#f4b223')
        .attr('stroke-width', 2)
        .attr('opacity', 0);
    
    // Animate the radar web
    radarWeb.transition()
        .duration(500)
        .attr('opacity', 1);
    
    // Add data points
    playerProfile.svg.selectAll('.radar-point')
        .data(radarData)
        .enter()
        .append('circle')
        .attr('class', 'radar-point')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 3)
        .attr('fill', '#f4b223')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    
    // Add value labels
    playerProfile.svg.selectAll('.value-label')
        .data(radarData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => d.x * 1.1)
        .attr('y', d => d.y * 1.1)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(d => d.value)
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
}

// Update player image
function updatePlayerImage(player) {
    const imageContainer = document.getElementById('player-image');
    
    // Clear existing content
    imageContainer.innerHTML = '';
    
    // Create a placeholder image (actual player images would require FIFA API access)
    const placeholderImage = document.createElement('div');
    placeholderImage.className = 'player-placeholder';
    placeholderImage.style.width = '120px';
    placeholderImage.style.height = '120px';
    placeholderImage.style.borderRadius = '50%';
    placeholderImage.style.backgroundColor = '#f0f0f0';
    placeholderImage.style.display = 'flex';
    placeholderImage.style.alignItems = 'center';
    placeholderImage.style.justifyContent = 'center';
    placeholderImage.style.margin = '0 auto 10px auto';
    placeholderImage.style.border = '3px solid #0f53a6';
    placeholderImage.style.overflow = 'hidden';
    
    // Add player initials
    const initials = player.short_name.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    
    placeholderImage.innerHTML = `
        <div style="
            font-size: 40px; 
            font-weight: bold; 
            color: #0f53a6;
        ">${initials}</div>
    `;
    
    // Add to container
    imageContainer.appendChild(placeholderImage);
}