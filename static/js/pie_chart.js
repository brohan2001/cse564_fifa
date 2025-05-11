/**
 * Draws a pie chart from JSON data, aggregating by a key column and (optionally) summing a value column.
 *
 * @param {Array<Object>} jsonData - Array of objects representing the data.
 * @param {string} keyColumn - Column name to group by (e.g., category).
 * @param {string|undefined} valueColumn - Column name to sum (if undefined, counts occurrences).
 * @param {string} selector - CSS selector for the container element (e.g., '#chart').
 * @param {Object} options - Optional settings: { width, height, title }.
 */






function PieChartFromJSON(jsonData, keyColumn, valueColumn, selector, options = {}) {
    const width = options.width || 400;
    const height = options.height || 400;
    const radius = Math.min(width, height) / 2;
    const title = options.title || '';

    // Clear previous content
    d3.select(selector).selectAll("*").remove();

    // Add title if provided
    if (title) {
        d3.select(selector)
            .append("div")
            .attr("class", "chart-title")
            .style("text-align", "center")
            .style("font-weight", "bold")
            .style("margin-bottom", "10px")
            .text(title);
    }

    // Create SVG container
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Aggregate data
    let counts;
    if (valueColumn) {
        counts = d3.rollup(
            jsonData,
            v => d3.sum(v, d => +d[valueColumn]),
            d => d[keyColumn]
        );
    } else {
        counts = d3.rollup(
            jsonData,
            v => v.length,
            d => d[keyColumn]
        );
    }

    const pieData = Array.from(counts, ([key, value]) => ({ key, value }));

	console.log(pieData)
    if (pieData.length === 0) {
        d3.select(selector)
          .append("div")
          .style("color", "red")
          .text(`No data found for column "${keyColumn}".`);
        return;
    }

    // Color scale
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.key))
        .range(d3.schemeCategory10);

    // Pie generator
    const pie = d3.pie()
        .value(d => d.value);

    // Arc generator
    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    // Draw arcs
    const arcs = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.key));
		
		
		
		
	// Add labels
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.6em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => `${d.data.key} (${d.data.value.toFixed(2)})`);
}