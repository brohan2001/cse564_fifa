// Requires D3.js v6 or later
// Usage: 
//   initBarChart('#mySVG', matrixData);
//   updateBarChart('#mySVG', matrixData, 'England');

function drawBarChart(svgId, data) {
    // First completely clear the container and create a new SVG from scratch
    const container = document.querySelector(svgId);
    container.innerHTML = "";
    
    // Set explicit dimensions
    const width = 500;
    const height = 400;
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create a new SVG element with explicit dimensions
    const svg = d3.select(svgId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
    
    // Add a background to visualize the SVG boundaries
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f9f9f9");
    
    // Create chart group
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Check if we have valid data
    if (!data || data.length === 0) {
        g.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight / 2)
            .attr("text-anchor", "middle")
            .text("No data available");
        return;
    }
    
    console.log("Drawing chart with data:", data);
    
    // X and Y scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.nationality))
        .range([0, chartWidth])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) * 1.1])
        .nice()
        .range([chartHeight, 0]);
    
    // X Axis with rotated labels
    g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("text-anchor", "end")
        .style("font-size", "12px");
    
    // Y Axis
    g.append("g")
        .call(d3.axisLeft(y));
    
    // Bars
    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.nationality))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.count))
        .attr("fill", "#4682b4");
    
    // Value labels
    g.selectAll(".value-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.nationality) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.count)
        .style("font-size", "12px");
    
    // Chart title
    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Top 5 Nationalities");
}




// API 2: Update bar chart for a specific country (Top nationalities in a country)
function updateBarChart(svgSelector, matrixData, countryName) {
    if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
        console.error('Invalid matrix data:', matrixData);
        return;
    }
    
    // Find the row for the given country (case-insensitive)
    const countryRow = matrixData.find(row => {
        return row.country && row.country.toLowerCase() === countryName.toLowerCase();
    });
    
    if (!countryRow) {
        console.error(`Country "${countryName}" not found in matrix data`);
        return;
    }
    
    const top5 = getTop5Nationalities(countryRow);
    if (top5.length === 0) {
        console.warn(`No nationality data found for ${countryName}`);
        drawBarChart(svgSelector, [], `No nationality data for ${countryName}`, "Nationality");
        return;
    }
    
    drawBarChart(svgSelector, top5, `Top 5 Nationalities in ${countryName}`, "Nationality");
}







function getTop5Nationalities(row, excludeKey = 'country') {
    // Add error checking and debugging
    if (!row || typeof row !== 'object') {
        console.error('Invalid data row:', row);
        return [];
    }
    
    console.log('Processing row data:', row);
    
    // Extract nationality data
    const nationalities = Object.entries(row)
        .filter(([key, value]) => {
            return key !== excludeKey && 
                  !isNaN(+value) && 
                  key.length > 0;
        })
        .map(([key, value]) => ({ 
            nationality: key, 
            count: +value 
        }));
    
    console.log('Extracted nationalities:', nationalities);
    
    // Sort and limit to top 5
    const top5 = nationalities
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    console.log('Top 5 nationalities:', top5);
    return top5;
}

function initBarChart(svgSelector, matrixData) {
    console.log('Matrix data:', matrixData);
    
    if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
        console.error('Invalid matrix data:', matrixData);
        return;
    }
    
    // Find the TOTAL row
    const totalRow = matrixData.find(row => row.country === 'TOTAL' || row.country === 'Total');
    if (!totalRow) {
        console.error('TOTAL row not found in matrix data');
        return;
    }
    
    const top5 = getTop5Nationalities(totalRow);
    if (top5.length === 0) {
        console.error('No nationality data extracted');
        return;
    }
    
    drawBarChart(svgSelector, top5);
}

// Export the APIs for use elsewhere
window.initBarChart = initBarChart;
window.updateBarChart = updateBarChart;