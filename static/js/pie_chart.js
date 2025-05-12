// /**
//  * Draws a pie chart from JSON data, aggregating by a key column and (optionally) summing a value column.
//  *
//  * @param {Array<Object>} jsonData - Array of objects representing the data.
//  * @param {string} keyColumn - Column name to group by (e.g., category).
//  * @param {string|undefined} valueColumn - Column name to sum (if undefined, counts occurrences).
//  * @param {string} selector - CSS selector for the container element (e.g., '#chart').
//  * @param {Object} options - Optional settings: { width, height, title }.
//  */






// function PieChartFromJSON(jsonData, keyColumn, valueColumn, selector, options = {}) {
//     const width = options.width || 400;
//     const height = options.height || 400;
//     const radius = Math.min(width, height) / 2;
//     const title = options.title || '';

//     // Clear previous content
//     d3.select(selector).selectAll("*").remove();

//     // Add title if provided
//     if (title) {
//         d3.select(selector)
//             .append("div")
//             .attr("class", "chart-title")
//             .style("text-align", "center")
//             .style("font-weight", "bold")
//             .style("margin-bottom", "10px")
//             .text(title);
//     }

//     // Create SVG container
//     const svg = d3.select(selector)
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height)
//         .append("g")
//         .attr("transform", `translate(${width / 2},${height / 2})`);

//     // Aggregate data
//     let counts;
//     if (valueColumn) {
//         counts = d3.rollup(
//             jsonData,
//             v => d3.sum(v, d => +d[valueColumn]),
//             d => d[keyColumn]
//         );
//     } else {
//         counts = d3.rollup(
//             jsonData,
//             v => v.length,
//             d => d[keyColumn]
//         );
//     }

//     const pieData = Array.from(counts, ([key, value]) => ({ key, value }));

// 	console.log(pieData)
//     if (pieData.length === 0) {
//         d3.select(selector)
//           .append("div")
//           .style("color", "red")
//           .text(`No data found for column "${keyColumn}".`);
//         return;
//     }

//     // Color scale
//     const color = d3.scaleOrdinal()
//         .domain(pieData.map(d => d.key))
//         .range(d3.schemeCategory10);

//     // Pie generator
//     const pie = d3.pie()
//         .value(d => d.value);

//     // Arc generator
//     const arc = d3.arc()
//         .outerRadius(radius - 10)
//         .innerRadius(0);

//     // Draw arcs
//     const arcs = svg.selectAll(".arc")
//         .data(pie(pieData))
//         .enter()
//         .append("g")
//         .attr("class", "arc");

//     arcs.append("path")
//         .attr("d", arc)
//         .attr("fill", d => color(d.data.key));
		
		
		
		
// 	// Add labels
//     arcs.append("text")
//         .attr("transform", d => `translate(${arc.centroid(d)})`)
//         .attr("dy", "0.6em")
//         .attr("text-anchor", "middle")
//         .style("font-size", "12px")
//         .text(d => `${d.data.key} (${d.data.value.toFixed(2)})`);
// }



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
        .value(d => d.value)
        .sort(null);

    // Arc generators
    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)");

    // Draw arcs
    const arcs = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("fill", d => color(d.data.key))
        .transition()
        .duration(800)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            const copy = Object.assign({}, d);
            return function(t) {
                copy.endAngle = i(t);
                return arc(copy);
            };
        });

    // Add interactivity (tooltip and highlight)
    arcs.select("path")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#222").attr("stroke-width", 2);
            tooltip.transition().duration(200).style("opacity", 0.95);
            tooltip.html(`<strong>${d.data.key}</strong><br>Value: ${d.data.value.toFixed(2)}`)
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 12) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("stroke", null);
            tooltip.transition().duration(400).style("opacity", 0);
        });

    // Helper for label placement
    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    // Add polylines for labels
    arcs.append("polyline")
        .attr("points", function(d) {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 0.98 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .style("fill", "none")
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .style("opacity", 0.5);

    // Add labels outside the pie
    arcs.append("text")
        .attr("transform", function(d) {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 1.05 * (midAngle(d) < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr("text-anchor", function(d) {
            return midAngle(d) < Math.PI ? "start" : "end";
        })
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(d => `${d.data.key} (${d.data.value.toFixed(2)})`);

    // Add legend
    const legend = d3.select(selector)
        .append("div")
        .attr("class", "pie-legend")
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("margin-top", "12px");

    pieData.forEach(d => {
        const item = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "0 10px 6px 0");

        item.append("div")
            .style("width", "14px")
            .style("height", "14px")
            .style("background", color(d.key))
            .style("margin-right", "6px")
            .style("border-radius", "2px")
            .style("border", "1px solid #ccc");

        item.append("span")
            .style("font-size", "12px")
            .text(`${d.key}`);
    });
}