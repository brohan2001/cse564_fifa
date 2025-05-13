// Enhanced Bar Chart for FIFA Player Data Visualization
// This improved version includes better styling, animations, responsive design,
// improved interactivity, and better error handling

// Main function to draw the bar chart
function drawBarChart(svgId, data, title = 'Top 5 Nationalities', xLabel = 'Nationality') {
    // First completely clear the container and create a new SVG from scratch
    const container = document.querySelector(svgId);
    container.innerHTML = "";
    
    // Set explicit dimensions with better defaults for visualization
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;
    const margin = { top: 60, right: 30, bottom: 120, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create a new SVG element with explicit dimensions and responsive viewBox
    const svg = d3.select(svgId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
    
    // Add a subtle background for better visual appearance
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f9f9f9")
        .attr("rx", 8)  // Rounded corners
        .attr("ry", 8);
    
    // Create chart group
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Check if we have valid data and handle empty data gracefully
    if (!data || data.length === 0) {
        g.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#888")
            .style("font-size", "16px")
            .text("No nationality data available");
        
        // Add subtitle with instructions
        g.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight / 2 + 30)
            .attr("text-anchor", "middle")
            .attr("fill", "#888")
            .style("font-size", "14px")
            .text("Select a country to view nationalities distribution");
        
        return;
    }
    
    // Create tooltip for better user interaction
    const tooltip = d3.select("body").append("div")
        .attr("class", "bar-chart-tooltip")
        .style("position", "absolute")
        .style("padding", "8px 12px")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.2)");
    
    // X and Y scales with better padding
    const x = d3.scaleBand()
        .domain(data.map(d => d.nationality))
        .range([0, chartWidth])
        .padding(0.4);  // More space between bars
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) * 1.1])
        .nice()
        .range([chartHeight, 0]);
    
    // Add gradient for bars
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(0))
        .attr("x2", 0)
        .attr("y2", y(d3.max(data, d => d.count)));
    
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4682b4");  // Steel blue
    
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#275a88");  // Darker steel blue
    
    // Add grid lines for better readability
    g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-chartWidth)
            .tickFormat("")
        )
        .selectAll("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "3,3");
    
    // Remove the grid path
    g.select(".grid path").attr("stroke", "none");
    
    // X Axis with rotated labels
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", "500");
    
    // Style the x-axis
    g.select(".x-axis path")
        .attr("stroke", "#888")
        .attr("stroke-width", 1);
    
    // Y Axis with better styling
    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d))
        .selectAll("text")
        .style("font-size", "12px");
    
    // Style the y-axis
    g.select(".y-axis path")
        .attr("stroke", "#888")
        .attr("stroke-width", 1);
    
    // Add X axis label
    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#555")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(xLabel);
    
    // Add Y axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#555")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Number of Players");
    
    // Add chart title with better styling and positioning
    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(title);
    
    // Calculate total count for percentage
    const total = d3.sum(data, d => d.count);
    
    // Create bars with animation and interactivity
    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.nationality))
        .attr("y", chartHeight)  // Start from bottom for animation
        .attr("width", x.bandwidth())
        .attr("height", 0)  // Start with height 0 for animation
        .attr("fill", "url(#bar-gradient)")
        .attr("stroke", "#275a88")
        .attr("stroke-width", 1)
        .attr("rx", 2)  // Slightly rounded corners
        .attr("ry", 2)
        .on("mouseover", function(event, d) {
            // Highlight bar on hover
            d3.select(this)
                .attr("fill", "#5b9ad5")
                .attr("stroke", "#1e466e")
                .attr("stroke-width", 2);
            
            // Show tooltip with more detailed information
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            
            const percentage = ((d.count / total) * 100).toFixed(1);
            tooltip.html(`
                <strong>${d.nationality}</strong><br>
                Players: ${d.count}<br>
                Percentage: ${percentage}%
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Reset bar styling on mouseout
            d3.select(this)
                .attr("fill", "url(#bar-gradient)")
                .attr("stroke", "#275a88")
                .attr("stroke-width", 1);
            
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        // Animate bars on load
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.count))
        .attr("height", d => chartHeight - y(d.count));
    
    // Add value labels with animation
    g.selectAll(".value-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.nationality) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("opacity", 0)  // Start invisible for animation
        .text(d => d.count)
        .transition()
        .duration(800)
        .delay((d, i) => 800 + i * 100)
        .style("opacity", 1);
    
    // Add percentage labels under the count
    g.selectAll(".percentage-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "percentage-label")
        .attr("x", d => x(d.nationality) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) + 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")  // White text for visibility against bar
        .style("font-size", "11px")
        .style("opacity", 0)  // Start invisible for animation
        .text(d => `${((d.count / total) * 100).toFixed(1)}%`)
        .transition()
        .duration(800)
        .delay((d, i) => 1000 + i * 100)
        .style("opacity", d => {
            // Only show percentage if there's enough space in the bar
            return (chartHeight - y(d.count) > 20) ? 1 : 0;
        });
    
    // Return an object with methods for potential further interaction
    return {
        update: function(newData, newTitle) {
            // For future implementations - could add update functionality
            drawBarChart(svgId, newData, newTitle, xLabel);
        }
    };
}

// Function to get top nationalities from a country row with better data validation
function getTop5Nationalities(row, excludeKey = 'country') {
    // Add error checking and debugging
    if (!row || typeof row !== 'object') {
        console.error('Invalid data row:', row);
        return [];
    }
    
    // Extract nationality data with better validation
    const nationalities = Object.entries(row)
        .filter(([key, value]) => {
            return key !== excludeKey && 
                  !isNaN(+value) && 
                  value > 0 &&  // Only include non-zero values
                  key.length > 0;
        })
        .map(([key, value]) => ({ 
            nationality: key, 
            count: +value 
        }));
    
    // Sort and limit to top 5
    const top5 = nationalities
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    return top5;
}

// Initialize a bar chart with global data
function initBarChart(svgSelector, matrixData) {
    if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
        console.error('Invalid matrix data:', matrixData);
        // Draw empty chart with message
        drawBarChart(svgSelector, [], 'No Data Available');
        return;
    }
    
    // Find the TOTAL row
    const totalRow = matrixData.find(row => row.country === 'TOTAL');
    if (!totalRow) {
        console.error('TOTAL row not found in matrix data');
        // Draw empty chart with message
        drawBarChart(svgSelector, [], 'Data Missing');
        return;
    }
    
    const top5 = getTop5Nationalities(totalRow);
    if (top5.length === 0) {
        console.error('No nationality data extracted');
        // Draw empty chart with message
        drawBarChart(svgSelector, [], 'No Nationality Data');
        return;
    }
    
    // Draw chart with title
    drawBarChart(svgSelector, top5, 'Top 5 Nationalities Globally');
}

// Update bar chart for a specific country
function updateBarChart(svgSelector, matrixData, countryName) {
    if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
        console.error('Invalid matrix data:', matrixData);
        // Draw empty chart with message
        drawBarChart(svgSelector, [], 'No Data Available');
        return;
    }
    
    // Find the row for the given country (case-insensitive matching)
    const countryRow = matrixData.find(row => {
        return row.country && row.country.toLowerCase() === countryName.toLowerCase();
    });
    
    if (!countryRow) {
        console.error(`Country "${countryName}" not found in matrix data`);
        // Draw empty chart with message for specific country
        drawBarChart(svgSelector, [], `No Data For ${countryName}`);
        return;
    }
    
    const top5 = getTop5Nationalities(countryRow);
    if (top5.length === 0) {
        console.warn(`No nationality data found for ${countryName}`);
        // Draw empty chart with message specific to this country
        drawBarChart(svgSelector, [], `No Nationality Data For ${countryName}`);
        return;
    }
    
    // Draw chart with country-specific title
    drawBarChart(svgSelector, top5, `Top 5 Nationalities In ${countryName}`);
}

// Export the APIs for use elsewhere
window.initBarChart = initBarChart;
window.updateBarChart = updateBarChart;