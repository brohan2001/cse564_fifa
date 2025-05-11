// // Global variables for player profile
// let playerProfile = {
//     svg: null,
//     width: 0,
//     height: 0,
//     margin: { top: 20, right: 20, bottom: 20, left: 20 },
//     radarScale: null,
//     attributes: ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'],
//     maxValue: 100, // Maximum attribute value
//     currentPlayer: null
// };

// // Initialize the player profile visualization
// // function initializePlayerProfile() {
// //     // Set dimensions
// //     const container = document.getElementById('radar-chart');
// //     playerProfile.width = container.clientWidth;
// //     playerProfile.height = container.clientHeight;
    
// //     // Find center of radar chart
// //     playerProfile.centerX = playerProfile.width / 2;
// //     playerProfile.centerY = playerProfile.height / 2;
    
// //     // Calculate radar radius (smaller dimension / 2, with margin)
// //     playerProfile.radius = Math.min(
// //         playerProfile.width - playerProfile.margin.left - playerProfile.margin.right,
// //         playerProfile.height - playerProfile.margin.top - playerProfile.margin.bottom
// //     ) / 2;
    
// //     // Create SVG
// //     playerProfile.svg = d3.select('#radar-chart')
// //         .append('svg')
// //         .attr('width', playerProfile.width)
// //         .attr('height', playerProfile.height)
// //         .append('g')
// //         .attr('transform', `translate(${playerProfile.centerX}, ${playerProfile.centerY})`);
    
// //     // Create scale for radar
// //     playerProfile.radarScale = d3.scaleLinear()
// //         .domain([0, playerProfile.maxValue])
// //         .range([0, playerProfile.radius]);
    
// //     // Create radar axes
// //     createRadarAxes();
    
// //     // Add default empty state message
// //     playerProfile.svg.append('text')
// //         .attr('class', 'empty-state')
// //         .attr('text-anchor', 'middle')
// //         .attr('dy', 5)
// //         .text('Select a player to view details');
    
// //     // Initialize player info section
// //     initializePlayerInfo();
    
// //     // Add compare button
// //     addCompareButton();
// // }

// // Add compare button to allow player comparison

// // Restructure the player profile layout
// function initializePlayerProfile() {
//     // Set up container structure for the player profile
//     const container = document.getElementById('player-profile');
//     container.innerHTML = `
//         <div class="player-profile-grid">
//             <div class="player-info-section">
//                 <div id="player-image" class="player-image"></div>
//                 <div id="player-info" class="player-info"></div>
//             </div>
//             <div class="radar-chart-section">
//                 <div id="radar-chart" class="radar-chart"></div>
//             </div>
//         </div>
//     `;
    
//     // Add CSS for the new layout
//     const style = document.createElement('style');
//     style.textContent = `
//         .player-profile-grid {
//             display: grid;
//             grid-template-columns: 1fr 2fr;
//             gap: 20px;
//             height: 100%;
//             width: 100%;
//         }
        
//         .player-info-section {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             padding: 10px;
//         }
        
//         .radar-chart-section {
//             height: 100%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }
        
//         .radar-chart {
//             width: 100%;
//             height: 100%;
//             min-height: 250px;
//         }
//     `;
//     document.head.appendChild(style);
    
//     // Get the radar chart container
//     const radarContainer = document.getElementById('radar-chart');
    
//     // Set dimensions for the radar chart
//     playerProfile.width = radarContainer.clientWidth;
//     playerProfile.height = radarContainer.clientHeight;
    
//     // Find center of radar chart
//     playerProfile.centerX = playerProfile.width / 2;
//     playerProfile.centerY = playerProfile.height / 2;
    
//     // Calculate radar radius (make it larger)
//     playerProfile.radius = Math.min(
//         playerProfile.width - playerProfile.margin.left - playerProfile.margin.right,
//         playerProfile.height - playerProfile.margin.top - playerProfile.margin.bottom
//     ) / 2.2;
    
//     // Create SVG
//     playerProfile.svg = d3.select('#radar-chart')
//         .append('svg')
//         .attr('width', playerProfile.width)
//         .attr('height', playerProfile.height)
//         .append('g')
//         .attr('transform', `translate(${playerProfile.centerX}, ${playerProfile.centerY})`);
    
//     // Create scale for radar
//     playerProfile.radarScale = d3.scaleLinear()
//         .domain([0, playerProfile.maxValue])
//         .range([0, playerProfile.radius]);
    
//     // Create radar axes
//     createRadarAxes();
    
//     // Add default empty state message
//     playerProfile.svg.append('text')
//         .attr('class', 'empty-state')
//         .attr('text-anchor', 'middle')
//         .attr('dy', 5)
//         .text('Select a player to view details');
    
//     // Initialize player info section
//     initializePlayerInfo();
    
//     // Add compare button
//     addCompareButton();
// }


// function addCompareButton() {
//     const buttonContainer = d3.select('#player-profile-container')
//         .append('div')
//         .attr('class', 'compare-button-container')
//         .style('position', 'absolute')
//         .style('top', '10px')
//         .style('right', '10px')
//         .style('z-index', '10');
    
//     // Add compare button
//     buttonContainer.append('button')
//         .attr('id', 'compare-players-btn')
//         .style('padding', '5px 10px')
//         .style('background-color', '#0f53a6')
//         .style('color', 'white')
//         .style('border', 'none')
//         .style('border-radius', '4px')
//         .style('cursor', 'pointer')
//         .style('font-size', '12px')
//         .style('display', 'none') // Initially hidden until player selected
//         .text('Compare with another player')
//         .on('click', function() {
//             // Show player selection dialog
//             showPlayerSelectionDialog();
//         });
// }

// // Initialize player info section
// function initializePlayerInfo() {
//     const container = document.getElementById('player-info');
//     container.innerHTML = '<p>No player selected</p>';
// }

// // Create radar chart axes
// function createRadarAxes() {
//     // Calculate angle for each axis
//     const angleStep = (Math.PI * 2) / playerProfile.attributes.length;
    
//     // Create axis lines
//     playerProfile.svg.selectAll('.radar-axis')
//         .data(playerProfile.attributes)
//         .enter()
//         .append('line')
//         .attr('class', 'radar-axis')
//         .attr('x1', 0)
//         .attr('y1', 0)
//         .attr('x2', (d, i) => playerProfile.radarScale(playerProfile.maxValue) * Math.cos(angleStep * i - Math.PI / 2))
//         .attr('y2', (d, i) => playerProfile.radarScale(playerProfile.maxValue) * Math.sin(angleStep * i - Math.PI / 2))
//         .attr('stroke', '#999')
//         .attr('stroke-width', 1);
    
//     // Create circular grid lines
//     const gridLevels = [20, 40, 60, 80, 100];
    
//     gridLevels.forEach(level => {
//         playerProfile.svg.append('circle')
//             .attr('class', 'radar-circle')
//             .attr('cx', 0)
//             .attr('cy', 0)
//             .attr('r', playerProfile.radarScale(level))
//             .attr('fill', 'none')
//             .attr('stroke', '#ddd')
//             .attr('stroke-width', 1)
//             .attr('stroke-dasharray', '3,3');
        
//         // Add value labels
//         playerProfile.svg.append('text')
//             .attr('x', 0)
//             .attr('y', -playerProfile.radarScale(level))
//             .attr('dy', -2)
//             .attr('text-anchor', 'middle')
//             .attr('font-size', '8px')
//             .attr('fill', '#999')
//             .text(level);
//     });
    
//     // Add axis labels
//     playerProfile.attributes.forEach((attribute, i) => {
//         const angle = angleStep * i - Math.PI / 2;
//         const x = (playerProfile.radius + 15) * Math.cos(angle);
//         const y = (playerProfile.radius + 15) * Math.sin(angle);
        
//         // Format attribute name
//         const formattedName = attribute.charAt(0).toUpperCase() + attribute.slice(1);
        
//         playerProfile.svg.append('text')
//             .attr('class', 'axis-label')
//             .attr('x', x)
//             .attr('y', y)
//             .attr('text-anchor', 'middle')
//             .attr('dy', 5)
//             .attr('font-size', '10px')
//             .attr('font-weight', 'bold')
//             .text(formattedName);
//     });
// }

// // Update player profile with selected player
// function updatePlayerProfile(player) {
//     // Show compare button if a player is selected
//     const compareButton = document.getElementById('compare-players-btn');
//     if (compareButton) {
//         compareButton.style.display = player ? 'block' : 'none';
//     }
    
//     // If no player selected, show empty state
//     if (!player) {
//         showEmptyState();
//         return;
//     }
    
//     // Store current player
//     playerProfile.currentPlayer = player;
    
//     // Update player info
//     updatePlayerInfo(player);
    
//     // Update radar chart
//     updateRadarChart(player);
    
//     // Update player image
//     updatePlayerImage(player);
// }

// // Show empty state when no player is selected
// function showEmptyState() {
//     // Clear radar chart
//     playerProfile.svg.selectAll('.radar-web').remove();
//     playerProfile.svg.selectAll('.radar-point').remove();
//     playerProfile.svg.selectAll('.value-label').remove();
    
//     // Show empty state message
//     playerProfile.svg.selectAll('.empty-state')
//         .transition()
//         .duration(300)
//         .style('opacity', 1);
    
//     // Clear player info
//     const infoContainer = document.getElementById('player-info');
//     infoContainer.innerHTML = '<p>No player selected</p>';
    
//     // Clear player image
//     const imageContainer = document.getElementById('player-image');
//     imageContainer.innerHTML = '';
// }

// // Update player info panel
// function updatePlayerInfo(player) {
//     const infoContainer = document.getElementById('player-info');
    
//     // Create HTML for player info
//     const infoHTML = `
//         <div class="player-name">${player.short_name}</div>
//         <div class="player-details">
//             <div class="detail-item">
//                 <span class="detail-label">Overall:</span>
//                 <span class="detail-value">${player.player_overall}</span>
//             </div>
//             <div class="detail-item">
//                 <span class="detail-label">Club:</span>
//                 <span class="detail-value">${player.club_name}</span>
//             </div>
//             <div class="detail-item">
//                 <span class="detail-label">Position:</span>
//                 <span class="detail-value">${player.player_positions}</span>
//             </div>
//             <div class="detail-item">
//                 <span class="detail-label">Nationality:</span>
//                 <span class="detail-value">${player.nationality_name}</span>
//             </div>
//             <div class="detail-item">
//                 <span class="detail-label">Age:</span>
//                 <span class="detail-value">${player.age}</span>
//             </div>
//             <div class="detail-item">
//                 <span class="detail-label">Value:</span>
//                 <span class="detail-value">€${player.value_millions_eur.toFixed(1)}M</span>
//             </div>
//             <div class="detail-item">
//                 <span class="detail-label">Wage:</span>
//                 <span class="detail-value">€${player.wage_thousands_eur}K</span>
//             </div>
//         </div>
//     `;
    
//     // Update container
//     infoContainer.innerHTML = infoHTML;
    
//     // Apply styles
//     const containerStyle = infoContainer.style;
//     containerStyle.padding = '10px';
//     containerStyle.textAlign = 'center';
    
//     // Style player name
//     const nameStyle = document.querySelector('.player-name').style;
//     nameStyle.fontSize = '16px';
//     nameStyle.fontWeight = 'bold';
//     nameStyle.marginBottom = '10px';
    
//     // Style details
//     document.querySelectorAll('.detail-item').forEach(item => {
//         item.style.display = 'flex';
//         item.style.justifyContent = 'space-between';
//         item.style.margin = '5px 0';
//         item.style.fontSize = '12px';
//     });
    
//     document.querySelectorAll('.detail-label').forEach(label => {
//         label.style.fontWeight = 'bold';
//         label.style.color = '#555';
//     });
    
//     document.querySelectorAll('.detail-value').forEach(value => {
//         value.style.color = '#333';
//     });
// }

// // Update radar chart with player attributes
// function updateRadarChart(player, comparePlayer = null) {
//     // Hide empty state message
//     playerProfile.svg.selectAll('.empty-state')
//         .transition()
//         .duration(300)
//         .style('opacity', 0);
    
//     // Clear previous elements
//     playerProfile.svg.selectAll('.radar-web').remove();
//     playerProfile.svg.selectAll('.radar-point').remove();
//     playerProfile.svg.selectAll('.value-label').remove();
    
//     // Calculate angle for each axis
//     const angleStep = (Math.PI * 2) / playerProfile.attributes.length;
    
//     // Create data points for the radar - primary player
//     const radarData = playerProfile.attributes.map((attr, i) => {
//         const value = player[attr];
//         const angle = angleStep * i - Math.PI / 2;
        
//         return {
//             attribute: attr,
//             value: value,
//             x: playerProfile.radarScale(value) * Math.cos(angle),
//             y: playerProfile.radarScale(value) * Math.sin(angle)
//         };
//     });
    
//     // Create path generator for radar web
//     const radarLine = d3.lineRadial()
//         .radius(d => playerProfile.radarScale(d.value))
//         .angle((d, i) => angleStep * i);
    
//     // Convert to polar coordinates for d3.lineRadial
//     const radarPolarData = radarData.map(d => ({
//         value: d.value
//     }));
    
//     // Create radar web for primary player
//     const radarWeb = playerProfile.svg.append('path')
//         .datum(radarPolarData)
//         .attr('class', 'radar-web')
//         .attr('d', radarLine)
//         .attr('fill', 'rgba(244, 178, 35, 0.3)')
//         .attr('stroke', '#f4b223')
//         .attr('stroke-width', 2)
//         .attr('opacity', 0);
    
//     // Animate the radar web
//     radarWeb.transition()
//         .duration(500)
//         .attr('opacity', 1);
    
//     // Add data points for primary player
//     playerProfile.svg.selectAll('.radar-point')
//         .data(radarData)
//         .enter()
//         .append('circle')
//         .attr('class', 'radar-point')
//         .attr('cx', d => d.x)
//         .attr('cy', d => d.y)
//         .attr('r', 3)
//         .attr('fill', '#f4b223')
//         .attr('stroke', '#fff')
//         .attr('stroke-width', 1)
//         .attr('opacity', 0)
//         .transition()
//         .duration(500)
//         .attr('opacity', 1);
    
//     // Add value labels for primary player
//     playerProfile.svg.selectAll('.value-label')
//         .data(radarData)
//         .enter()
//         .append('text')
//         .attr('class', 'value-label')
//         .attr('x', d => d.x * 1.1)
//         .attr('y', d => d.y * 1.1)
//         .attr('text-anchor', 'middle')
//         .attr('font-size', '9px')
//         .attr('font-weight', 'bold')
//         .attr('fill', '#333')
//         .text(d => d.value)
//         .attr('opacity', 0)
//         .transition()
//         .duration(500)
//         .attr('opacity', 1);
    
//     // Add comparison player if provided
//     if (comparePlayer) {
//         // Create data points for the comparison player
//         const compareData = playerProfile.attributes.map((attr, i) => {
//             const value = comparePlayer[attr];
//             const angle = angleStep * i - Math.PI / 2;
            
//             return {
//                 attribute: attr,
//                 value: value,
//                 x: playerProfile.radarScale(value) * Math.cos(angle),
//                 y: playerProfile.radarScale(value) * Math.sin(angle)
//             };
//         });
        
//         // Convert to polar coordinates for d3.lineRadial
//         const comparePolarData = compareData.map(d => ({
//             value: d.value
//         }));
        
//         // Create radar web for comparison player
//         const compareWeb = playerProfile.svg.append('path')
//             .datum(comparePolarData)
//             .attr('class', 'radar-web-compare')
//             .attr('d', radarLine)
//             .attr('fill', 'rgba(15, 83, 166, 0.3)')
//             .attr('stroke', '#0f53a6')
//             .attr('stroke-width', 2)
//             .attr('stroke-dasharray', '5,3')
//             .attr('opacity', 0);
        
//         // Animate the comparison radar web
//         compareWeb.transition()
//             .duration(500)
//             .attr('opacity', 1);
        
//         // Add data points for comparison player
//         playerProfile.svg.selectAll('.radar-point-compare')
//             .data(compareData)
//             .enter()
//             .append('circle')
//             .attr('class', 'radar-point-compare')
//             .attr('cx', d => d.x)
//             .attr('cy', d => d.y)
//             .attr('r', 3)
//             .attr('fill', '#0f53a6')
//             .attr('stroke', '#fff')
//             .attr('stroke-width', 1)
//             .attr('opacity', 0)
//             .transition()
//             .duration(500)
//             .attr('opacity', 1);
        
//         // Add legend for comparison
//         const legend = playerProfile.svg.append('g')
//             .attr('class', 'radar-legend')
//             .attr('transform', `translate(${-playerProfile.radius}, ${-playerProfile.radius + 20})`);
        
//         // Primary player legend item
//         const primaryItem = legend.append('g')
//             .attr('transform', 'translate(0,0)');
        
//         primaryItem.append('rect')
//             .attr('width', 12)
//             .attr('height', 6)
//             .attr('fill', '#f4b223');
        
//         primaryItem.append('text')
//             .attr('x', 16)
//             .attr('y', 6)
//             .attr('font-size', '8px')
//             .text(player.short_name);
        
//         // Comparison player legend item
//         const compareItem = legend.append('g')
//             .attr('transform', 'translate(0,12)');
        
//         compareItem.append('rect')
//             .attr('width', 12)
//             .attr('height', 6)
//             .attr('fill', '#0f53a6');
        
//         compareItem.append('text')
//             .attr('x', 16)
//             .attr('y', 6)
//             .attr('font-size', '8px')
//             .text(comparePlayer.short_name);
//     }
// }

// // Update player image
// // function updatePlayerImage(player) {
// //     const imageContainer = document.getElementById('player-image');
    
// //     // Clear existing content
// //     imageContainer.innerHTML = '';
    
// //     // Create a placeholder image (actual player images would require FIFA API access)
// //     const placeholderImage = document.createElement('div');
// //     placeholderImage.className = 'player-placeholder';
// //     placeholderImage.style.width = '120px';
// //     placeholderImage.style.height = '120px';
// //     placeholderImage.style.borderRadius = '50%';
// //     placeholderImage.style.backgroundColor = '#f0f0f0';
// //     placeholderImage.style.display = 'flex';
// //     placeholderImage.style.alignItems = 'center';
// //     placeholderImage.style.justifyContent = 'center';
// //     placeholderImage.style.margin = '0 auto 10px auto';
// //     placeholderImage.style.border = '3px solid #0f53a6';
// //     placeholderImage.style.overflow = 'hidden';
    
// //     // Add player initials
// //     const initials = player.short_name.split(' ')
// //         .map(name => name[0])
// //         .join('')
// //         .toUpperCase();
    
// //     placeholderImage.innerHTML = `
// //         <div style="
// //             font-size: 40px; 
// //             font-weight: bold; 
// //             color: #0f53a6;
// //         ">${initials}</div>
// //     `;
    
// //     // Add to container
// //     imageContainer.appendChild(placeholderImage);
// // }

// function updatePlayerImage(player) {
//     const imageContainer = document.getElementById('player-image');
    
//     // Clear existing content
//     imageContainer.innerHTML = '';
    
//     // Create container for player image
//     const imageWrapper = document.createElement('div');
//     imageWrapper.className = 'player-image-wrapper';
//     imageWrapper.style.width = '120px';
//     imageWrapper.style.height = '120px';
//     imageWrapper.style.borderRadius = '50%';
//     imageWrapper.style.border = '3px solid #0f53a6';
//     imageWrapper.style.overflow = 'hidden';
//     imageWrapper.style.margin = '0 auto 10px auto';
//     imageWrapper.style.backgroundColor = '#f0f0f0';
//     imageWrapper.style.display = 'flex';
//     imageWrapper.style.alignItems = 'center';
//     imageWrapper.style.justifyContent = 'center';
    
//     if (player.image_link) {
//         // Use actual player image from dataset
//         const playerImg = document.createElement('img');
//         playerImg.src = player.image_link;
//         playerImg.style.width = '100%';
//         playerImg.style.height = '100%';
//         playerImg.style.objectFit = 'cover';
//         playerImg.style.objectPosition = 'center top'; // Focus on player's face
        
//         // Add error handler in case image fails to load
//         playerImg.onerror = function() {
//             createInitialsPlaceholder(imageWrapper, player);
//         };
        
//         imageWrapper.appendChild(playerImg);
//     } else {
//         // Fallback to initials if no image link
//         createInitialsPlaceholder(imageWrapper, player);
//     }
    
//     // Add to container
//     imageContainer.appendChild(imageWrapper);
// }

// // Helper function to create initials placeholder
// function createInitialsPlaceholder(container, player) {
//     // Add player initials
//     const initials = player.short_name.split(' ')
//         .map(name => name[0])
//         .join('')
//         .toUpperCase();
    
//     const initialsDiv = document.createElement('div');
//     initialsDiv.style.fontSize = '40px';
//     initialsDiv.style.fontWeight = 'bold';
//     initialsDiv.style.color = '#0f53a6';
//     initialsDiv.textContent = initials;
    
//     container.appendChild(initialsDiv);
// }

// // Show player selection dialog for comparison
// function showPlayerSelectionDialog() {
//     // Create dialog element
//     const dialog = document.createElement('div');
//     dialog.className = 'player-selection-dialog';
//     dialog.style.position = 'fixed';
//     dialog.style.top = '50%';
//     dialog.style.left = '50%';
//     dialog.style.transform = 'translate(-50%, -50%)';
//     dialog.style.width = '400px';
//     dialog.style.maxHeight = '500px';
//     dialog.style.background = 'white';
//     dialog.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
//     dialog.style.borderRadius = '5px';
//     dialog.style.padding = '20px';
//     dialog.style.zIndex = '1000';
//     dialog.style.display = 'flex';
//     dialog.style.flexDirection = 'column';
    
//     // Create dialog header
//     const header = document.createElement('div');
//     header.style.display = 'flex';
//     header.style.justifyContent = 'space-between';
//     header.style.marginBottom = '10px';
    
//     const title = document.createElement('h3');
//     title.textContent = 'Select Player to Compare';
//     title.style.margin = '0';
    
//     const closeButton = document.createElement('button');
//     closeButton.textContent = '✕';
//     closeButton.style.background = 'none';
//     closeButton.style.border = 'none';
//     closeButton.style.fontSize = '18px';
//     closeButton.style.cursor = 'pointer';
//     closeButton.onclick = function() {
//         document.body.removeChild(dialog);
//     };
    
//     header.appendChild(title);
//     header.appendChild(closeButton);
    
//     // Create search input
//     const searchContainer = document.createElement('div');
//     searchContainer.style.marginBottom = '15px';
    
//     const searchInput = document.createElement('input');
//     searchInput.type = 'text';
//     searchInput.placeholder = 'Search players...';
//     searchInput.style.width = '100%';
//     searchInput.style.padding = '8px';
//     searchInput.style.boxSizing = 'border-box';
//     searchInput.style.borderRadius = '4px';
//     searchInput.style.border = '1px solid #ccc';
    
//     searchContainer.appendChild(searchInput);
    
//     // Create player list container
//     const listContainer = document.createElement('div');
//     listContainer.style.overflow = 'auto';
//     listContainer.style.maxHeight = '400px';
//     listContainer.style.border = '1px solid #eee';
//     listContainer.style.borderRadius = '4px';
    
//     // Create player list
//     const playerList = document.createElement('ul');
//     playerList.style.listStyle = 'none';
//     playerList.style.padding = '0';
//     playerList.style.margin = '0';
    
//     // Add elements to dialog
//     dialog.appendChild(header);
//     dialog.appendChild(searchContainer);
//     dialog.appendChild(listContainer);
//     listContainer.appendChild(playerList);
    
//     // Add dialog to page
//     document.body.appendChild(dialog);
    
//     // Create overlay
//     const overlay = document.createElement('div');
//     overlay.style.position = 'fixed';
//     overlay.style.top = '0';
//     overlay.style.left = '0';
//     overlay.style.width = '100%';
//     overlay.style.height = '100%';
//     overlay.style.background = 'rgba(0, 0, 0, 0.5)';
//     overlay.style.zIndex = '999';
//     overlay.onclick = function() {
//         document.body.removeChild(overlay);
//         document.body.removeChild(dialog);
//     };
    
//     document.body.appendChild(overlay);
    
//     // Load players and populate list
//     populatePlayerList(playerList, searchInput);
// }

// // Populate player list in the selection dialog
// function populatePlayerList(playerList, searchInput) {
//     // Filter players for reasonable list size
//     const topPlayers = globalData.players
//         .slice(0, 500) // Limit initial list size
//         .sort((a, b) => b.player_overall - a.player_overall);
    
//     // Create player list items
//     updatePlayerListItems(playerList, topPlayers);
    
//     // Add search functionality
//     searchInput.addEventListener('input', function() {
//         const searchTerm = this.value.toLowerCase();
        
//         // Filter players based on search term
//         const filteredPlayers = globalData.players.filter(player => {
//             return player.short_name.toLowerCase().includes(searchTerm) ||
//                    player.club_name.toLowerCase().includes(searchTerm) ||
//                    (player.nationality_name && player.nationality_name.toLowerCase().includes(searchTerm));
//         }).slice(0, 100); // Limit results
        
//         // Update list
//         updatePlayerListItems(playerList, filteredPlayers);
//     });
// }

// // Update player list items based on filtered data
// function updatePlayerListItems(playerList, players) {
//     // Clear current list
//     playerList.innerHTML = '';
    
//     // Populate with filtered players
//     players.forEach(player => {
//         const listItem = document.createElement('li');
//         listItem.style.padding = '10px';
//         listItem.style.borderBottom = '1px solid #eee';
//         listItem.style.cursor = 'pointer';
//         listItem.style.display = 'flex';
//         listItem.style.alignItems = 'center';
//         listItem.style.justifyContent = 'space-between';
        
//         listItem.innerHTML = `
//             <div>
//                 <div style="font-weight: bold;">${player.short_name}</div>
//                 <div style="font-size: 12px; color: #666;">${player.club_name} | ${player.nationality_name || 'Unknown'}</div>
//             </div>
//             <div style="font-weight: bold; min-width: 30px; text-align: center; background: #f0f0f0; padding: 4px; border-radius: 4px;">
//                 ${player.player_overall}
//             </div>
//         `;
        
//         listItem.addEventListener('mouseenter', function() {
//             this.style.backgroundColor = '#f0f0f0';
//         });
        
//         listItem.addEventListener('mouseleave', function() {
//             this.style.backgroundColor = '';
//         });
        
//         listItem.onclick = function() {
//             if (playerProfile.currentPlayer && playerProfile.currentPlayer.player_id !== player.player_id) {
//                 // Update radar chart with comparison
//                 updateRadarChart(playerProfile.currentPlayer, player);
                
//                 // Close dialog
//                 const dialog = document.querySelector('.player-selection-dialog');
//                 const overlay = document.querySelector('.player-selection-dialog + div');
//                 if (dialog) document.body.removeChild(dialog);
//                 if (overlay) document.body.removeChild(overlay);
//             }
//         };
        
//         playerList.appendChild(listItem);
//     });
    
//     // Show message if no players found
//     if (players.length === 0) {
//         const noResults = document.createElement('li');
//         noResults.style.padding = '10px';
//         noResults.style.textAlign = 'center';
//         noResults.style.color = '#999';
//         noResults.textContent = 'No players found';
//         playerList.appendChild(noResults);
//     }
// }
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
    // Set up container structure for the player profile
    const container = document.getElementById('player-profile');
    container.innerHTML = `
        <div class="player-profile-grid">
            <div class="player-info-section">
                <div id="fifa-card" class="fifa-card">
                    <div class="card-header">
                        <div class="rating-position-column">
                            <div class="player-rating">--</div>
                            <div class="player-position">--</div>
                            <div class="nationality-flag" title=""></div>
                            <div class="club-badge" title=""></div>
                        </div>
                        <div class="player-image-container">
                            <div id="player-image" class="player-image"></div>
                        </div>
                    </div>
                    <div class="player-name-bar">
                        <div class="player-name">Select a player</div>
                    </div>
                    <div class="player-stats">
                        <div class="stat-column">
                            <div class="stat"><span class="stat-value">--</span> PAC</div>
                            <div class="stat"><span class="stat-value">--</span> SHO</div>
                            <div class="stat"><span class="stat-value">--</span> PAS</div>
                        </div>
                        <div class="stat-column">
                            <div class="stat"><span class="stat-value">--</span> DRI</div>
                            <div class="stat"><span class="stat-value">--</span> DEF</div>
                            <div class="stat"><span class="stat-value">--</span> PHY</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="radar-chart-section">
                <div id="radar-chart" class="radar-chart"></div>
            </div>
        </div>
    `;
    
    // Add CSS for the FIFA card style
    const style = document.createElement('style');
    style.textContent = `
        .player-profile-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
            height: 100%;
            width: 100%;
        }
        
        .player-info-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        
        .radar-chart-section {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .radar-chart {
            width: 100%;
            height: 100%;
            min-height: 250px;
        }
        
        /* FIFA Card Styles */
        .fifa-card {
            width: 200px;
            background-color: #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            margin: 0 auto;
            font-family: 'Roboto Condensed', Arial, sans-serif;
            color: #333;
        }
        
        .card-header {
            display: grid;
            grid-template-columns: 80px 1fr;
            min-height: 120px;
        }
        
        .rating-position-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px 5px;
            gap: 5px;
        }
        
        .player-rating {
            font-size: 32px;
            font-weight: bold;
            line-height: 1;
        }
        
        .player-position {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .nationality-flag {
            width: 32px;
            height: 22px;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            border: 1px solid rgba(0,0,0,0.1);
            margin: 5px 0;
            cursor: help;
        }
        
        .club-badge {
            width: 32px;
            height: 32px;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            margin: 5px 0;
            cursor: help;
        }
        
        .player-image-container {
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 5px;
        }
        
        .player-image {
            height: 110px;
            width: 110px;
            background-color: transparent;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: #333;
        }
        
        .player-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
        }
        
        .player-name-bar {
            background-color: #333;
            color: white;
            padding: 5px 0;
            text-align: center;
        }
        
        .player-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .player-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 10px;
            gap: 5px;
            background-color: #f0f0f0;
        }
        
        .stat {
            font-size: 14px;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
        }
        
        .stat-value {
            font-weight: bold;
            margin-right: 8px;
            font-size: 15px;
            min-width: 25px;
            display: inline-block;
        }
        
        .player-details {
            padding: 5px 10px;
            font-size: 12px;
            border-top: 1px solid rgba(0,0,0,0.1);
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
        }
        
        .detail-label {
            font-weight: bold;
        }
        
        /* Tooltip styles for hover effects */
        .tooltip-text {
            visibility: hidden;
            width: 120px;
            background-color: rgba(0,0,0,0.8);
            color: #fff;
            text-align: center;
            border-radius: 4px;
            padding: 5px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 12px;
            pointer-events: none;
        }
        
        /* Show tooltip on hover */
        .has-tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Get the radar chart container
    const radarContainer = document.getElementById('radar-chart');
    
    // Set dimensions for the radar chart
    playerProfile.width = radarContainer.clientWidth;
    playerProfile.height = radarContainer.clientHeight;
    
    // Find center of radar chart
    playerProfile.centerX = playerProfile.width / 2;
    playerProfile.centerY = playerProfile.height / 2;
    
    // Calculate radar radius
    playerProfile.radius = Math.min(
        playerProfile.width - playerProfile.margin.left - playerProfile.margin.right,
        playerProfile.height - playerProfile.margin.top - playerProfile.margin.bottom
    ) / 2.2;
    
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
    
    // Add compare button
    addCompareButton();
    
    // Add event listeners for hover tooltips
    addTooltipEventListeners();
}

// Add compare button to allow player comparison
function addCompareButton() {
    const buttonContainer = d3.select('#player-profile-container')
        .append('div')
        .attr('class', 'compare-button-container')
        .style('position', 'absolute')
        .style('top', '10px')
        .style('right', '10px')
        .style('z-index', '10');
    
    // Add compare button
    buttonContainer.append('button')
        .attr('id', 'compare-players-btn')
        .style('padding', '5px 10px')
        .style('background-color', '#0f53a6')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('cursor', 'pointer')
        .style('font-size', '12px')
        .style('display', 'none') // Initially hidden until player selected
        .text('Compare with another player')
        .on('click', function() {
            // Show player selection dialog
            showPlayerSelectionDialog();
        });
}

// Add event listeners for tooltips
function addTooltipEventListeners() {
    // Add hover events for club badge and nationality flag
    const flagElement = document.querySelector('.nationality-flag');
    const clubElement = document.querySelector('.club-badge');
    
    if (flagElement) {
        flagElement.addEventListener('mouseenter', function() {
            const tooltip = this.getAttribute('title');
            if (tooltip) {
                this.setAttribute('data-original-title', tooltip);
                
                // Create tooltip element
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip-text';
                tooltipEl.textContent = tooltip;
                this.setAttribute('title', '');
                this.appendChild(tooltipEl);
            }
        });
        
        flagElement.addEventListener('mouseleave', function() {
            const tooltip = this.getAttribute('data-original-title');
            if (tooltip) {
                this.setAttribute('title', tooltip);
                
                // Remove tooltip element
                const tooltipEl = this.querySelector('.tooltip-text');
                if (tooltipEl) {
                    this.removeChild(tooltipEl);
                }
            }
        });
    }
    
    if (clubElement) {
        clubElement.addEventListener('mouseenter', function() {
            const tooltip = this.getAttribute('title');
            if (tooltip) {
                this.setAttribute('data-original-title', tooltip);
                
                // Create tooltip element
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip-text';
                tooltipEl.textContent = tooltip;
                this.setAttribute('title', '');
                this.appendChild(tooltipEl);
            }
        });
        
        clubElement.addEventListener('mouseleave', function() {
            const tooltip = this.getAttribute('data-original-title');
            if (tooltip) {
                this.setAttribute('title', tooltip);
                
                // Remove tooltip element
                const tooltipEl = this.querySelector('.tooltip-text');
                if (tooltipEl) {
                    this.removeChild(tooltipEl);
                }
            }
        });
    }
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

// Helper function for creating a URL for country flags
function getFlagUrl(countryName) {
    // Convert country name to 2-letter ISO code
    const countryCodes = {
        "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "American Samoa": "as", "Andorra": "ad",
        "Angola": "ao", "Argentina": "ar", "Armenia": "am", "Australia": "au", "Austria": "at",
        "Azerbaijan": "az", "Bahamas": "bs", "Bahrain": "bh", "Bangladesh": "bd", "Belgium": "be",
        "Benin": "bj", "Bhutan": "bt", "Bolivia": "bo", "Bosnia and Herzegovina": "ba", "Brazil": "br",
        "Bulgaria": "bg", "Burkina Faso": "bf", "Cameroon": "cm", "Canada": "ca", "Chile": "cl",
        "China PR": "cn", "Colombia": "co", "Congo": "cg", "Costa Rica": "cr", "Croatia": "hr",
        "Cuba": "cu", "Cyprus": "cy", "Czech Republic": "cz", "Denmark": "dk", "Ecuador": "ec",
        "Egypt": "eg", "England": "gb-eng", "Estonia": "ee", "Finland": "fi", "France": "fr",
        "Germany": "de", "Ghana": "gh", "Greece": "gr", "Guinea": "gn", "Honduras": "hn",
        "Hong Kong": "hk", "Hungary": "hu", "Iceland": "is", "India": "in", "Indonesia": "id",
        "Iran": "ir", "Iraq": "iq", "Ireland": "ie", "Israel": "il", "Italy": "it",
        "Ivory Coast": "ci", "Jamaica": "jm", "Japan": "jp", "Kazakhstan": "kz", "Korea Republic": "kr",
        "Kosovo": "xk", "Latvia": "lv", "Lithuania": "lt", "Luxembourg": "lu", "Mali": "ml",
        "Malta": "mt", "Mexico": "mx", "Moldova": "md", "Montenegro": "me", "Morocco": "ma",
        "Netherlands": "nl", "New Zealand": "nz", "Nigeria": "ng", "North Macedonia": "mk", "Northern Ireland": "gb-nir",
        "Norway": "no", "Paraguay": "py", "Peru": "pe", "Poland": "pl", "Portugal": "pt",
        "Romania": "ro", "Russia": "ru", "Saudi Arabia": "sa", "Scotland": "gb-sct", "Senegal": "sn",
        "Serbia": "rs", "Slovakia": "sk", "Slovenia": "si", "South Africa": "za", "Spain": "es",
        "Sweden": "se", "Switzerland": "ch", "Tunisia": "tn", "Turkey": "tr", "Ukraine": "ua",
        "United States": "us", "Uruguay": "uy", "Venezuela": "ve", "Wales": "gb-wls",
        "Bosnia & Herzegovina": "ba", "USA": "us", "Republic of Ireland": "ie"
    };
    
    const countryCode = countryCodes[countryName] || "unknown";
    
    // Return flag URL using a public flag API
    return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
}

// Find club crest URL from club_averages data
function getClubCrestUrl(clubName) {
    // Default fallback URL
    let fallbackUrl = null;
    
    // Look up the club in global data
    if (globalData && globalData.clubs) {
        const clubData = globalData.clubs.find(club => club.club_name === clubName);
        if (clubData && clubData.club_crest_url) {
            return clubData.club_crest_url;
        } else if (clubData && clubData.club_id) {
            // If we have club_id but no crest URL, construct it
            return `https://cdn.sofifa.net/teams/${clubData.club_id}/60.png`;
        }
    }
    
    // Fallback to a placeholder
    return fallbackUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="%23f0f0f0" stroke="%23ccc" stroke-width="2"/></svg>';
}

// Update player profile with selected player
function updatePlayerProfile(player) {
    // Show compare button if a player is selected
    const compareButton = document.getElementById('compare-players-btn');
    if (compareButton) {
        compareButton.style.display = player ? 'block' : 'none';
    }
    
    // If no player selected, show empty state
    if (!player) {
        showEmptyState();
        return;
    }
    
    // Store current player
    playerProfile.currentPlayer = player;
    
    // Update FIFA card
    updateFIFACard(player);
    
    // Update radar chart
    updateRadarChart(player);
}

// Show empty state when no player is selected
function showEmptyState() {
    // Clear radar chart
    playerProfile.svg.selectAll('.radar-web').remove();
    playerProfile.svg.selectAll('.radar-point').remove();
    playerProfile.svg.selectAll('.value-label').remove();
    
    // Show empty state message
    playerProfile.svg.selectAll('.empty-state')
        .transition()
        .duration(300)
        .style('opacity', 1);
    
    // Reset FIFA card to empty state
    const fifaCard = document.getElementById('fifa-card');
    if (fifaCard) {
        // Reset rating and position
        const ratingElem = fifaCard.querySelector('.player-rating');
        const positionElem = fifaCard.querySelector('.player-position');
        if (ratingElem) ratingElem.textContent = '--';
        if (positionElem) positionElem.textContent = '--';
        
        // Clear flags and badges
        const flagElem = fifaCard.querySelector('.nationality-flag');
        const badgeElem = fifaCard.querySelector('.club-badge');
        if (flagElem) {
            flagElem.style.backgroundImage = 'none';
            flagElem.setAttribute('title', '');
        }
        if (badgeElem) {
            badgeElem.style.backgroundImage = 'none';
            badgeElem.setAttribute('title', '');
        }
        
        // Clear player image
        const imageElem = fifaCard.querySelector('.player-image');
        if (imageElem) imageElem.innerHTML = '';
        
        // Reset player name
        const nameElem = fifaCard.querySelector('.player-name');
        if (nameElem) nameElem.textContent = 'Select a player';
        
        // Reset stats
        const statValues = fifaCard.querySelectorAll('.stat-value');
        statValues.forEach(elem => {
            elem.textContent = '--';
        });
        
        // Reset details
        const detailValues = fifaCard.querySelectorAll('.player-details .detail-value');
        detailValues.forEach(elem => {
            elem.textContent = '--';
        });
    }
}

// Update FIFA card with player data
function updateFIFACard(player) {
    const fifaCard = document.getElementById('fifa-card');
    if (!fifaCard) return;
    
    // Get card color based on player rating
    updateCardColor(fifaCard, player.player_overall);
    
    // Update rating and position
    const ratingElem = fifaCard.querySelector('.player-rating');
    const positionElem = fifaCard.querySelector('.player-position');
    if (ratingElem) ratingElem.textContent = player.player_overall;
    if (positionElem) positionElem.textContent = player.player_positions ? player.player_positions.split(',')[0] : 'ST';
    
    // Update nationality flag with tooltip
    const flagElem = fifaCard.querySelector('.nationality-flag');
    if (flagElem && player.nationality_name) {
        const flagUrl = getFlagUrl(player.nationality_name);
        flagElem.style.backgroundImage = `url('${flagUrl}')`;
        flagElem.setAttribute('title', player.nationality_name);
    }
    
    // Update club badge with tooltip
    const badgeElem = fifaCard.querySelector('.club-badge');
    if (badgeElem && player.club_name) {
        const badgeUrl = getClubCrestUrl(player.club_name);
        badgeElem.style.backgroundImage = `url('${badgeUrl}')`;
        badgeElem.setAttribute('title', player.club_name);
    }
    
    // Update player image
    updatePlayerImage(player);
    
    // Update player name
    const nameElem = fifaCard.querySelector('.player-name');
    if (nameElem) nameElem.textContent = player.short_name;
    
    // Update stats
    const stats = [
        { key: 'pace', abbr: 'PAC' },
        { key: 'shooting', abbr: 'SHO' },
        { key: 'passing', abbr: 'PAS' },
        { key: 'dribbling', abbr: 'DRI' },
        { key: 'defending', abbr: 'DEF' },
        { key: 'physic', abbr: 'PHY' }
    ];
    
    const statElems = fifaCard.querySelectorAll('.stat');
    stats.forEach((stat, index) => {
        if (statElems[index]) {
            const valueElem = statElems[index].querySelector('.stat-value');
            if (valueElem) {
                valueElem.textContent = Math.round(player[stat.key]);
            }
        }
    });
    
    // Update player details
    // const detailsContainer = fifaCard.querySelector('.player-details');
    // if (detailsContainer) {
    //     // Value
    //     const valueItem = detailsContainer.querySelector('.detail-item:nth-child(1) .detail-value');
    //     if (valueItem) {
    //         valueItem.textContent = `€${player.value_millions_eur.toFixed(1)}M`;
    //     }
        
    //     // Wage
    //     const wageItem = detailsContainer.querySelector('.detail-item:nth-child(2) .detail-value');
    //     if (wageItem) {
    //         wageItem.textContent = `€${player.wage_thousands_eur}K`;
    //     }
        
    //     // Age
    //     const ageItem = detailsContainer.querySelector('.detail-item:nth-child(3) .detail-value');
    //     if (ageItem) {
    //         ageItem.textContent = player.age;
    //     }
    // }
}

// Update card color based on player rating
function updateCardColor(cardElement, rating) {
    let backgroundColor;
    
    if (rating >= 90) {
        // Gold
        backgroundColor = '#e0e0e0';
    } else if (rating >= 80) {
        // Gold (slightly different shade)
        backgroundColor = '#e0e0e0';
    } else if (rating >= 70) {
        // Silver
        backgroundColor = '#e0e0e0';
    } else {
        // Bronze
        backgroundColor = '#e0e0e0';
    }
    
    cardElement.style.backgroundColor = backgroundColor;
}

// Update player image
function updatePlayerImage(player) {
    const imageContainer = document.getElementById('player-image');
    if (!imageContainer) return;
    
    // Clear existing content
    imageContainer.innerHTML = '';
    
    if (player.image_link) {
        // Use actual player image from dataset
        const playerImg = document.createElement('img');
        playerImg.src = player.image_link;
        playerImg.style.width = '100%';
        playerImg.style.height = '100%';
        playerImg.style.objectFit = 'cover';
        playerImg.style.objectPosition = 'center top'; // Focus on player's face
        
        // Add error handler in case image fails to load
        playerImg.onerror = function() {
            createInitialsPlaceholder(imageContainer, player);
        };
        
        imageContainer.appendChild(playerImg);
    } else {
        // Fallback to initials if no image link
        createInitialsPlaceholder(imageContainer, player);
    }
}

// Helper function to create initials placeholder
function createInitialsPlaceholder(container, player) {
    // Add player initials
    const initials = player.short_name.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    
    const initialsDiv = document.createElement('div');
    initialsDiv.style.fontSize = '36px';
    initialsDiv.style.fontWeight = 'bold';
    initialsDiv.style.color = '#333';
    initialsDiv.textContent = initials;
    
    container.appendChild(initialsDiv);
}

// Update radar chart with player attributes
function updateRadarChart(player, comparePlayer = null) {
    // Hide empty state message
    playerProfile.svg.selectAll('.empty-state')
        .transition()
        .duration(300)
        .style('opacity', 0);
    
    // Clear previous elements
    playerProfile.svg.selectAll('.radar-web').remove();
    playerProfile.svg.selectAll('.radar-point').remove();
    playerProfile.svg.selectAll('.value-label').remove();
    playerProfile.svg.selectAll('.radar-legend').remove();
    
    // Calculate angle for each axis
    const angleStep = (Math.PI * 2) / playerProfile.attributes.length;
    
    // Create data points for the radar - primary player
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
    
    // Create radar web for primary player
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
    
    // Add data points for primary player
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
    
    // Add value labels for primary player
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
        .text(d => Math.round(d.value))
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    
    // Add comparison player if provided
    if (comparePlayer) {
        // Create data points for the comparison player
        const compareData = playerProfile.attributes.map((attr, i) => {
            const value = comparePlayer[attr];
            const angle = angleStep * i - Math.PI / 2;
            
            return {
                attribute: attr,
                value: value,
                x: playerProfile.radarScale(value) * Math.cos(angle),
                y: playerProfile.radarScale(value) * Math.sin(angle)
            };
        });
        
        // Convert to polar coordinates for d3.lineRadial
        const comparePolarData = compareData.map(d => ({
            value: d.value
        }));
        
        // Create radar web for comparison player
        const compareWeb = playerProfile.svg.append('path')
            .datum(comparePolarData)
            .attr('class', 'radar-web-compare')
            .attr('d', radarLine)
            .attr('fill', 'rgba(15, 83, 166, 0.3)')
            .attr('stroke', '#0f53a6')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3')
            .attr('opacity', 0);
        
        // Animate the comparison radar web
        compareWeb.transition()
            .duration(500)
            .attr('opacity', 1);
        
        // Add data points for comparison player
        playerProfile.svg.selectAll('.radar-point-compare')
            .data(compareData)
            .enter()
            .append('circle')
            .attr('class', 'radar-point-compare')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 3)
            .attr('fill', '#0f53a6')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .transition()
            .duration(500)
            .attr('opacity', 1);
        
        // Add legend for comparison
        const legend = playerProfile.svg.append('g')
            .attr('class', 'radar-legend')
            .attr('transform', `translate(${-playerProfile.radius}, ${-playerProfile.radius + 20})`);
        
        // Primary player legend item
        const primaryItem = legend.append('g')
            .attr('transform', 'translate(0,0)');
        
        primaryItem.append('rect')
            .attr('width', 12)
            .attr('height', 6)
            .attr('fill', '#f4b223');
        
        primaryItem.append('text')
            .attr('x', 16)
            .attr('y', 6)
            .attr('font-size', '8px')
            .text(player.short_name);
        
        // Comparison player legend item
        const compareItem = legend.append('g')
            .attr('transform', 'translate(0,12)');
        
        compareItem.append('rect')
            .attr('width', 12)
            .attr('height', 6)
            .attr('fill', '#0f53a6');
        
        compareItem.append('text')
            .attr('x', 16)
            .attr('y', 6)
            .attr('font-size', '8px')
            .text(comparePlayer.short_name);
    }
}
