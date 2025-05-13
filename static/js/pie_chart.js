/**
 * Creates a pie chart visualization with interaction for world map integration.
 *
 * @param {Array<Object>} jsonData - Array of objects representing the data.
 * @param {string} keyColumn - Column name to group by (e.g., country).
 * @param {string} valueColumn - Column name for values (e.g., percentage_of_players).
 * @param {string} selector - CSS selector for the container element (e.g., '#piechart').
 * @param {Object} options - Optional settings for customization.
 * @returns {Object} - API object with methods to control the chart.
 */
function PieChartFromJSON(jsonData, keyColumn, valueColumn, selector, options = {}) {
    // Default options
    const width = options.width || 550; // Total width of the container
    const height = options.height || 400; // Total height of the container
    
    // Chart specific dimensions - make the pie chart smaller
    const pieSize = options.pieSize || 280; // Size of the pie chart area
    const pieRadius = pieSize / 2.2; // Radius of the pie chart
    const legendWidth = 200; // Width of the legend area
    
    // Calculate positions for pie chart centered in the red circle area
    const pieX = options.pieX || width / 3; // Position pie chart 1/3 from the left
    const pieY = options.pieY || height / 2; // Center vertically
    
    // Clear previous content
    d3.select(selector).selectAll("*").remove();
    
    // Create main container
    const container = d3.select(selector)
        .append("div")
        .attr("id", "pie-chart-container")
        .style("position", "relative")
        .style("width", width + "px")
        .style("height", height + "px");
        
    // Add title if provided
    const title = options.title || '';
    if (title) {
        container.append("div")
            .attr("class", "chart-title")
            .attr("id", "pie-chart-title")
            .style("text-align", "center")
            .style("font-weight", "bold")
            .style("font-size", "18px")
            .style("margin-bottom", "10px")
            .style("color", "#333")
            .text(title);
    }
    
    // Create SVG element
    const svg = container.append("svg")
        .attr("id", "pie-chart-svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible");
    
    // Create group for the pie chart centered in the red circle area
    const pieGroup = svg.append("g")
        .attr("id", "pie-group")
        .attr("transform", `translate(${pieX}, ${pieY})`);
    
    // Process the data
    let pieData;
    if (valueColumn) {
        const counts = d3.rollup(
            jsonData,
            v => d3.sum(v, d => +d[valueColumn]),
            d => d[keyColumn]
        );
        pieData = Array.from(counts, ([key, value]) => ({ key, value }));
    } else {
        const counts = d3.rollup(
            jsonData,
            v => v.length,
            d => d[keyColumn]
        );
        pieData = Array.from(counts, ([key, value]) => ({ key, value }));
    }
    
    // Sort data by value (descending)
    pieData.sort((a, b) => b.value - a.value);
    
    // Calculate total and percentages
    const total = d3.sum(pieData, d => d.value);
    pieData.forEach(d => {
        d.percentage = (d.value / total) * 100;
        d.isSmallSlice = d.percentage < 3; // Threshold for small slices
    });
    
    // Handle empty data case
    if (pieData.length === 0) {
        pieGroup.append("text")
            .attr("text-anchor", "middle")
            .text("No data available");
        return {
            highlightCountry: () => {} // Return empty function for API consistency
        };
    }
    
    // Color scale
    const colorScheme = [
        "#4e79a7", "#f28e2c", "#59a14f", "#e15759", "#76b7b2", 
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", 
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.key))
        .range(colorScheme);
    
    // Pie layout generator
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    // Arc generators
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(pieRadius)
        .cornerRadius(2)
        .padAngle(0.01);
    
    const hoverArc = d3.arc()
        .innerRadius(0)
        .outerRadius(pieRadius * 1.05)
        .cornerRadius(2)
        .padAngle(0.01);
    
    // Create pie slices
    const slices = pieGroup.selectAll(".slice")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "slice")
        .attr("data-country", d => d.data.key);
    
    // Add paths for slices
    const paths = slices.append("path")
        .attr("class", d => `pie-slice pie-slice-${d.data.key.replace(/\s+/g, '-').toLowerCase()}`)
        .attr("d", arc)
        .attr("fill", d => color(d.data.key))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .style("cursor", "pointer");
    
    // Add percentage labels on larger slices
    slices.filter(d => d.data.percentage >= 5)
        .append("text")
        .attr("transform", d => {
            const centroid = arc.centroid(d);
            return `translate(${centroid[0]},${centroid[1]})`;
        })
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.5)")
        .style("pointer-events", "none")
        .text(d => `${d.data.percentage.toFixed(1)}%`);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "pie-tooltip")
        .attr("id", "pie-chart-tooltip")
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
    
    // Create legend on the right side
    const legendX = pieX + pieRadius + 30; // Position legend to the right of the pie
    const legendY = 30; // Start legend near the top
    
    const legend = svg.append("g")
        .attr("id", "pie-chart-legend")
        .attr("class", "legend")
        .attr("transform", `translate(${legendX}, ${legendY})`);
    
    // Create legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", d => `legend-item legend-item-${d.key.replace(/\s+/g, '-').toLowerCase()}`)
        .attr("data-country", d => d.key)
        .attr("transform", (d, i) => `translate(0, ${i * 22})`)
        .style("cursor", "pointer");
    
    // Add color squares
    legendItems.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("fill", d => color(d.key))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);
    
    // Add country names
    legendItems.append("text")
        .attr("x", 18)
        .attr("y", 6)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("fill", "#333")
        .text(d => d.key);
    
    // Add percentages
    legendItems.append("text")
        .attr("x", 18)
        .attr("y", 6)
        .attr("dy", "0.35em")
        .attr("dx", d => {
            // Calculate position based on country name length
            const countryLength = d.key.length;
            return countryLength * 6 + 6; // Approximate text width
        })
        .style("font-size", "11px")
        .style("fill", "#666")
        .text(d => `(${d.percentage.toFixed(1)}%)`);
    
    // Function to highlight a specific country
    function highlightCountry(countryName) {
        // If no country provided, reset all highlights
        if (!countryName || countryName === "all") {
            // Reset all slices
            paths.transition()
                .duration(200)
                .attr("d", arc)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
                
            // Reset all legend items
            legendItems.transition()
                .duration(200)
                .style("opacity", 1)
                .select("rect")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
                
            return;
        }
        
        // Check for country data mapping
        const mappingTable = {
            "United Kingdom": "England",
            "United States of America": "United States",
            "Russian Federation": "Russia",
            "South Korea": "Korea Republic",
            // Add any other mappings needed for your data
        };
        
        // Normalize country name using mapping if available
        const normalizedCountry = mappingTable[countryName] || countryName;
        
        // Find the matching slice and legend item
        const matchingSlice = paths.filter(d => d.data.key === normalizedCountry);
        const matchingLegendItem = legendItems.filter(d => d.key === normalizedCountry);
        
        // If the country exists in our data, highlight it
        if (!matchingSlice.empty()) {
            // Dim all slices
            paths.transition()
                .duration(200)
                .attr("d", arc)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .style("opacity", 0.3);
                
            // Highlight the matching slice
            matchingSlice.transition()
                .duration(200)
                .attr("d", hoverArc)
                .attr("stroke", "#333")
                .attr("stroke-width", 2)
                .style("opacity", 1);
                
            // Dim all legend items
            legendItems.transition()
                .duration(200)
                .style("opacity", 0.3)
                .select("rect")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
                
            // Highlight the matching legend item
            matchingLegendItem.transition()
                .duration(200)
                .style("opacity", 1)
                .select("rect")
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5);
                
            // Show tooltip for this country
            if (!matchingSlice.empty()) {
                const d = matchingSlice.data()[0];
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <strong>${d.data.key}</strong><br>
                    Value: ${d.data.value.toLocaleString()}<br>
                    Percentage: ${d.data.percentage.toFixed(1)}%
                `)
                .style("left", (width / 2) + "px")
                .style("top", (height / 2 - 50) + "px");
                
                // Auto-hide tooltip after a few seconds
                setTimeout(() => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                }, 3000);
            }
        } else {
            // If no match, reset all highlights
            paths.transition()
                .duration(200)
                .attr("d", arc)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .style("opacity", 1);
                
            legendItems.transition()
                .duration(200)
                .style("opacity", 1)
                .select("rect")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
                
            // Show tooltip with "no data" message
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            
            tooltip.html(`
                <strong>${countryName}</strong><br>
                No data available for this country
            `)
            .style("left", (width / 2) + "px")
            .style("top", (height / 2 - 50) + "px");
            
            // Auto-hide tooltip after a few seconds
            setTimeout(() => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            }, 3000);
        }
    }
    
    // Add interactivity for pie slices
    paths.on("mouseover", function(event, d) {
        // Highlight slice
        d3.select(this)
            .transition()
            .duration(200)
            .attr("d", hoverArc);
        
        // Highlight legend item
        legendItems.filter(item => item.key === d.data.key)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .select("rect")
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
        
        // Dim other legend items
        legendItems.filter(item => item.key !== d.data.key)
            .transition()
            .duration(200)
            .style("opacity", 0.6);
        
        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        
        tooltip.html(`
            <strong>${d.data.key}</strong><br>
            Value: ${d.data.value.toLocaleString()}<br>
            Percentage: ${d.data.percentage.toFixed(1)}%
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Reset slice
        d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc);
        
        // Reset legend items
        legendItems
            .transition()
            .duration(200)
            .style("opacity", 1)
            .select("rect")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        
        // Hide tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });
    
    // Add interactivity for legend items
    legendItems.on("mouseover", function(event, d) {
        // Highlight legend item
        d3.select(this)
            .transition()
            .duration(200)
            .select("rect")
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
        
        // Dim other legend items
        legendItems.filter(item => item.key !== d.key)
            .transition()
            .duration(200)
            .style("opacity", 0.6);
        
        // Find and highlight matching slice
        const matchingSlice = paths.filter(slice => slice.data.key === d.key);
        matchingSlice
            .transition()
            .duration(200)
            .attr("d", hoverArc);
        
        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        
        tooltip.html(`
            <strong>${d.key}</strong><br>
            Value: ${d.value.toLocaleString()}<br>
            Percentage: ${d.percentage.toFixed(1)}%
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Reset legend items
        legendItems
            .transition()
            .duration(200)
            .style("opacity", 1)
            .select("rect")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        
        // Reset all slices
        paths
            .transition()
            .duration(200)
            .attr("d", arc);
        
        // Hide tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    .on("click", function(event, d) {
        // When a legend item is clicked, trigger the world map selection
        // This allows bidirectional interaction
        if (typeof dashboardState !== 'undefined' && dashboardState.filters) {
            // Update dashboard state
            dashboardState.filters.country = d.key;
            
            // Update country selector if it exists
            const countrySelector = document.getElementById('country-selector');
            if (countrySelector) {
                countrySelector.value = d.key;
            }
            
            // Update bar chart if available
            if (typeof updateBarChart === 'function') {
                updateBarChart('#Bar-Chart', globalData.matrix_data, d.key);
            }
            
            // Update UI and all visualizations
            if (typeof updateSelectionDetails === 'function') {
                updateSelectionDetails();
            }
            
            if (typeof updateAllVisualizations === 'function') {
                updateAllVisualizations();
            }
        }
    });
    
    // Return the API object to allow external control
    return {
        highlightCountry: highlightCountry,
        update: function(newData) {
            // Provide an update method for future use
            PieChartFromJSON(newData, keyColumn, valueColumn, selector, options);
        }
    };
}