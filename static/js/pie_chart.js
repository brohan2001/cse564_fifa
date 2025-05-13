/**
 * Creates an improved pie chart visualization from JSON data.
 *
 * @param {Array<Object>} jsonData - Array of objects representing the data.
 * @param {string} keyColumn - Column name to group by (e.g., country).
 * @param {string} valueColumn - Column name for values (e.g., percentage_of_players).
 * @param {string} selector - CSS selector for the container element (e.g., '#piechart').
 * @param {Object} options - Optional settings: { width, height, title, sortData, smallSliceThreshold }.
 */
function PieChartFromJSON(jsonData, keyColumn, valueColumn, selector, options = {}) {
    // Default options
    const width = options.width || 500;
    const height = options.height || 500;
    const radius = Math.min(width, height) / 2.5;
    const innerRadius = options.donut ? radius * 0.5 : 0; // For donut chart option
    const title = options.title || '';
    const sortData = options.sortData !== false; // Sort data by default
    const smallSliceThreshold = options.smallSliceThreshold || 3; // Percentage threshold for small slices
    const showLabels = options.showLabels !== false; // Show labels by default
    const showPercentages = options.showPercentages !== false; // Show percentages by default
    
    // Clear previous content
    d3.select(selector).selectAll("*").remove();
    
    // Add container for the chart
    const container = d3.select(selector)
        .append("div")
        .attr("class", "pie-chart-container")
        .style("position", "relative")
        .style("width", width + "px")
        .style("margin", "0 auto");
    
    // Add title if provided
    if (title) {
        container.append("div")
            .attr("class", "chart-title")
            .style("text-align", "center")
            .style("font-weight", "bold")
            .style("font-size", "18px")
            .style("margin-bottom", "20px")
            .style("color", "#333")
            .text(title);
    }
    
    // Create SVG container with viewBox for responsiveness
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
        
    // Background circle for better aesthetics
    svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius + 2)
        .attr("fill", "#f8f8f8")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1);
    
    // Process the data
    // Aggregate data
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
    
    // Sort data by value if requested
    if (sortData) {
        pieData.sort((a, b) => b.value - a.value);
    }
    
    // Calculate total for percentages
    const total = d3.sum(pieData, d => d.value);
    
    // Add percentage to data
    pieData.forEach(d => {
        d.percentage = (d.value / total) * 100;
        d.isSmallSlice = d.percentage < smallSliceThreshold;
    });
    
    if (pieData.length === 0) {
        container.append("div")
            .style("color", "#d9534f")
            .style("text-align", "center")
            .style("padding", "20px")
            .text(`No data found for column "${keyColumn}".`);
        return;
    }
    
    // Enhanced color scheme with better contrast and harmony
    // Using a categorical color scheme optimized for distinguishing different categories
    const colorScheme = [
        "#4e79a7", "#f28e2c", "#59a14f", "#e15759", "#76b7b2", 
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", 
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
    
    // Color scale
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.key))
        .range(colorScheme);
    
    // Pie generator
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    // Arc generator for main slices
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius)
        .cornerRadius(2)
        .padAngle(0.01);
    
    // Arc generator for labels
    const labelArc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius * 1.2);
    
    // Arc generator for hover effect
    const hoverArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius * 1.05)
        .cornerRadius(2)
        .padAngle(0.01);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "pie-tooltip")
        .style("position", "absolute")
        .style("padding", "8px 12px")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.2)")
        .style("max-width", "250px");
    
    // Create slices with transitions
    const slices = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    // Add slice paths with animation
    const paths = slices.append("path")
        .attr("fill", d => color(d.data.key))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("class", d => d.data.isSmallSlice ? "small-slice" : "")
        .style("cursor", "pointer")
        .style("transition", "opacity 0.3s")
        .each(function(d) { this._current = d; }); // Store initial angles
    
    // Animate slices on load
    paths.transition()
        .duration(800)
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return t => arc(interpolate(t));
        });
    
    // Add hover effects
    paths.on("mouseover", function(event, d) {
            // Highlight the slice
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", hoverArc)
                .style("filter", "drop-shadow(0 0 3px rgba(0,0,0,0.3))");
                
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
                
            tooltip.html(`
                <strong>${d.data.key}</strong><br>
                Value: ${d.data.value.toLocaleString()}<br>
                Percentage: ${d.data.percentage.toFixed(1)}%
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Restore original slice size
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arc)
                .style("filter", "none");
                
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add value labels
    if (showLabels) {
        // Only add labels to slices above the threshold
        slices.filter(d => !d.data.isSmallSlice)
            .append("text")
            .attr("transform", d => {
                const pos = labelArc.centroid(d);
                // Adjust label position based on angle for better placement
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                const x = Math.sin(midAngle) * (radius + 10);
                const y = -Math.cos(midAngle) * (radius + 10);
                return `translate(${x},${y})`;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", d => {
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return midAngle < Math.PI ? "start" : "end";
            })
            .style("font-size", "12px")
            .style("font-weight", "500")
            .style("fill", "#333")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .text(d => showPercentages ? `${d.data.percentage.toFixed(1)}%` : d.data.key)
            .transition()
            .delay((_, i) => 800 + i * 50)
            .duration(500)
            .style("opacity", 1);
    }
    
    // Add connecting lines for labels outside the chart
    if (showLabels) {
        slices.filter(d => !d.data.isSmallSlice)
            .append("polyline")
            .attr("points", d => {
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                const pos = labelArc.centroid(d);
                const x2 = Math.sin(midAngle) * (radius + 8);
                const y2 = -Math.cos(midAngle) * (radius + 8);
                const x3 = Math.sin(midAngle) * (radius + 20);
                const y3 = -Math.cos(midAngle) * (radius + 20);
                return [arc.centroid(d), [x2, y2], [x3, y3]];
            })
            .style("fill", "none")
            .style("stroke", "#999")
            .style("stroke-width", 1)
            .style("opacity", 0)
            .transition()
            .delay((_, i) => 800 + i * 50)
            .duration(500)
            .style("opacity", 0.5);
    }
    
    // Add center text for total if it's a donut chart
    if (options.donut) {
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .style("fill", "#333")
            .style("opacity", 0)
            .text(total.toLocaleString())
            .transition()
            .delay(800)
            .duration(400)
            .style("opacity", 1);
        
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .style("font-size", "14px")
            .style("fill", "#666")
            .style("opacity", 0)
            .text("Total Players")
            .transition()
            .delay(1000)
            .duration(400)
            .style("opacity", 1);
    }
    
    // Create improved legend
    const legendContainer = container.append("div")
        .attr("class", "pie-legend")
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("margin-top", "20px");
    
    // Create a legend item for each data point
    pieData.forEach((d, i) => {
        const legendItem = legendContainer.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "5px 10px")
            .style("cursor", "pointer")
            .style("transition", "transform 0.2s")
            .on("mouseover", function() {
                // Highlight corresponding slice
                paths.filter((path, j) => path.data.key === d.key)
                    .transition()
                    .duration(200)
                    .attr("d", hoverArc)
                    .style("filter", "drop-shadow(0 0 3px rgba(0,0,0,0.3))");
                
                // Highlight legend item
                d3.select(this)
                    .style("transform", "scale(1.05)");
            })
            .on("mouseout", function() {
                // Reset slice
                paths.filter((path, j) => path.data.key === d.key)
                    .transition()
                    .duration(200)
                    .attr("d", arc)
                    .style("filter", "none");
                
                // Reset legend item
                d3.select(this)
                    .style("transform", "scale(1)");
            });
        
        // Add color box
        legendItem.append("div")
            .style("width", "16px")
            .style("height", "16px")
            .style("background", color(d.key))
            .style("border-radius", "3px")
            .style("border", "1px solid rgba(0,0,0,0.1)")
            .style("margin-right", "8px");
        
        // Add legend text with value
        legendItem.append("div")
            .style("font-size", "13px")
            .style("display", "flex")
            .style("flex-direction", "column")
            .html(`
                <span style="font-weight: 500;">${d.key}</span>
                <span style="font-size: 11px; color: #666;">${d.percentage.toFixed(1)}% (${d.value.toLocaleString()})</span>
            `);
    });
    
    return {
        update: function(newData) {
            // Provide an update method for future use
            PieChartFromJSON(newData, keyColumn, valueColumn, selector, options);
        }
    };
}