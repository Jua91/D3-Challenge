// @TODO: YOUR CODE HERE!

var svgWidth = 1000;
var svgHeight = 800;

var margin ={
    top: 100,
    bottom: 100,
    right: 100,
    left: 100
}

var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

// Add svg and chartGroup to html
var svg =d3.select('body')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)

var chartGroup = svg.append('g')
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("/assets/data/data.csv").then(function(data){
    console.log(data); 
    // data cleaning
    data.forEach(d=>{
        d.healthcare =+ d.healthcare
        d.poverty =+ d.poverty
        d.smokes =+ d.smokes
        d.age =+ d.age
    });
    
    // Scales
    var xLinearScale = d3.scaleLinear()
        .domain([8,d3.max(data, d=>d.poverty)])
        .range([0,chartWidth])

    var yLinearScale = d3.scaleLinear()
        .domain([0,d3.max(data, d=>d.healthcare)])
        .range([chartHeight,0])
    

    // Axis
    var xAxis = d3.axisBottom(xLinearScale)
    var yAxis = d3.axisLeft(yLinearScale)
    
    // Add axis to page
    chartGroup.append('g')
        .attr('transform',`translate(0,${chartHeight})`)
        .call(xAxis);
    chartGroup.append('g')
        .call(yAxis);
    
    // Add circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx',d=>xLinearScale(d.poverty))
        .attr('cy',d=>yLinearScale(d.healthcare))
        .attr('r',15)
        .classed('stateCircle',true)
    
    // Add labels to circles in scatterplot
    var circlesTextGroup = chartGroup.selectAll('.stateText')
        .data(data)
        .enter()
        .append('text')
        .attr('x',d=>xLinearScale(d.poverty))
        .attr('y',d=>yLinearScale(d.healthcare))
        .classed('stateText',true)
        .text(d=> d.abbr)
        .attr("alignment-baseline", "middle") // Align the text to the vertical midpoint of the circle
        .attr('text-anchor','middle') // Align the text to the horizontal midpoint of the circle
    
    // Add tooltip
    var tooltip = d3.tip()
        .attr('class','d3-tip')
        .offset([80,-60])
        .html(function(d){
            return (`<b>${d.state}</b><br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`)
        })
    
    // Create the tooltip in chartGroup.
    chartGroup.call(tooltip);

    // Create Event listener
    circlesGroup.on('mouseover',function(d){
        d3.select(this)
            .transition()
            .duration(500)
            .style("stroke", "black")
            .attr("r", 20)
        tooltip.show(d);
    })
    .on('mouseout',function(d){
        d3.select(this)
            .transition()
            .duration(500)
            .style("stroke", "none")
            .attr("r", 15)
        tooltip.hide(d);
    })
    
    // Add x axis label
    chartGroup.append('text')
        .attr('x', chartWidth/2)
        .attr('y', chartHeight+40)
        // .attr('transform',`translate(${chartWidth/2},${chartHeight+40})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('fill', 'black')
        .text('In Poverty(%)')
    
    // Add y axis label
    chartGroup.append('text')
        //.attr('transform',`translate(100,${chartHeight/2})`)
        .attr("y", -30)
        .attr("x", 0 - (chartHeight / 2))
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('fill', 'black')
        .text('Lacks Healthcare(%)')
        .attr('transform','rotate(-90)')
    
}).catch(function(error){
    console.log(error);
})