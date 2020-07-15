
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

// Create a svg wrapper
var svg =d3.select('#scatter')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)

// Create a chartgroup in which we will store the chart elements
var chartGroup = svg.append('g')
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Function for updating xLinearScale upon selecting xAxis label
function xScale(data,chosenX){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data,d=>d[chosenX])*0.8,d3.max(data, d=>d[chosenX])*1.2])
        .range([0,chartWidth])
    return xLinearScale
}

// Function for updating yLinearScale upon selecting yAxis label
function yScale(data,chosenY){
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data,d=>d[chosenY])*0.8,d3.max(data, d=>d[chosenY])*1.2])
        .range([chartHeight,0])
    return yLinearScale
}

// Function for updating xAxis upon selecting xAxis label
function updateXAxis(scale,xAxis){
    var bottomAxis = d3.axisBottom(scale);
    xAxis
        .transition()
        .duration(1000)
        .call(bottomAxis)
    return xAxis
}

// Function for updating yAxis upon selecting yAxis label
function updateYAxis(scale,yAxis){
    var leftAxis= d3.axisLeft(scale);
    yAxis
        .transition()
        .duration(1000)
        .call(leftAxis)
    return yAxis
}

// Function for updating circles upon selecting axis label
function updateCircles(circlesGroup, xScale, yScale, chosenX, chosenY){
    // Add circles
    circlesGroup
        .transition()
        .duration(1000)
        .attr('cx',d=>xScale(d[chosenX]))
        .attr('cy',d=>yScale(d[chosenY]))
    return circlesGroup
}

// Function for updating text inside circles upon selecting axis label
function updateCirclesText(circlesTextGroup, xScale, yScale, chosenX, chosenY){
    circlesTextGroup
        .transition()
        .duration(1000)
        .attr('x',d=>xScale(d[chosenX]))
        .attr('y',d=>yScale(d[chosenY]))
    return circlesTextGroup
}

// Function for updating tooltip upon selecting axis label
function updateTooltip(chosenX,chosenY,circlesGroup){
    // Add tooltip
    var tooltip = d3.tip()
    .attr('class','d3-tip')
    .offset([80,-60])
    .html(function(d){
        return (`<b>${d.state}</b><br>${chosenX}: ${d[chosenX]}<br>${chosenY}: ${d[chosenY]}`)
    })

    // Create the tooltip in chartGroup.
    circlesGroup.call(tooltip);

    // Create Event listener
    circlesGroup
        .on('mouseover',function(d){
            tooltip.show(d);
        })
        .on('mouseout',function(d){
            tooltip.hide(d);
        })
    
    return circlesGroup
}



d3.csv("assets/data/data.csv").then(function(data){
    
    // data cleaning
    data.forEach(d=>{
        d.healthcare =+ d.healthcare;
        d.poverty =+ d.poverty;
        d.smokes =+ d.smokes;
        d.age =+ d.age;
        d.income =+ d.income;
        d.obesity =+ d.obesity;
    });

    var chosenX = 'poverty';
    var chosenY = 'healthcare';
    
    // Create scale functions
    var xLinearScale = xScale(data,chosenX);
    var yLinearScale = yScale(data,chosenY);
    
    // Create axes
    var leftAxis = d3.axisBottom(xLinearScale)
    var bottomAxis = d3.axisLeft(yLinearScale)
    
    // Add axes to the chartgroup
    var xAxis = chartGroup.append('g')
        .attr('transform',`translate(0,${chartHeight})`)
        .call(leftAxis);
    var yAxis = chartGroup.append('g')
        .call(bottomAxis);

    // Add circles to the chartgroup
    var circlesGroup = chartGroup.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx',d=>xLinearScale(d[chosenX]))
        .attr('cy',d=>yLinearScale(d[chosenY]))
        .attr('r',15)
        .classed('stateCircle',true)
    
    // Add labels inside the circles in scatterplot
    var circlesTextGroup = chartGroup.selectAll('.stateText')
        .data(data)
        .enter()
        .append('text')
        .attr('x',d=>xLinearScale(d[chosenX]))
        .attr('y',d=>yLinearScale(d[chosenY]))
        .classed('stateText',true)
        .text(d=> d.abbr)
        .attr("alignment-baseline", "middle") // Align the text to the vertical midpoint of the circle
        .attr('text-anchor','middle') // Align the text to the horizontal midpoint of the circle
    
    
    // Create a tooltip
    var tooltip = d3.tip()
        .attr('class','d3-tip')
        .offset([80,-60])
        .html(function(d){
            return (`<b>${d.state}</b><br>${chosenX}: ${d[chosenX]}<br>${chosenY}: ${d[chosenY]}`)
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


    // Create a labels group to store all the axis labels
    var labelsGroup = chartGroup.append('g')
    
    // X Axis Labels
    var povertyLabel = labelsGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 15)
        .attr('transform',`translate(${chartWidth/2},${chartHeight+40})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('value','poverty')
        .text('In Poverty(%)')

    var ageLabel = labelsGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 35)
        .attr('transform',`translate(${chartWidth/2},${chartHeight+40})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('value','age')
        .text('Age(Median)')

    var incomeLabel = labelsGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 55)
        .attr('transform',`translate(${chartWidth/2},${chartHeight+40})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('value','income')
        .text('Household Income(Median)')
    
    // Y Axis Labels
    var healthcareLabel = labelsGroup.append('text')
        .attr("y", -30)
        .attr("x", 0 - (chartHeight / 2))
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('value','healthcare')
        .text('Lacks Healthcare(%)')

    var smokesLabel = labelsGroup
        .append('text')
        .attr("y", -50)
        .attr("x", 0 - (chartHeight / 2))
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('value','smokes')
        .text('Smokes(%)')

    var obesityLabel = labelsGroup
        .append('text')
        .attr("y", -70)
        .attr("x", 0 - (chartHeight / 2))
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('value','obesity')
        .text('Obese(%)')

    //Show the poverty label in bold
    povertyLabel
        .attr('class','active');
    ageLabel
        .attr('class','inactive');
    incomeLabel
        .attr('class','inactive');
    
    //Show the healthcarelabel label in bold
    healthcareLabel
        .attr('class','active');
    smokesLabel
        .attr('class','inactive');
    obesityLabel
        .attr('class','inactive');

    // Event Handler
    labelsGroup.selectAll('text')
        .on('click',function(){
            var value = d3.select(this).attr('value')
            
            // Conditionals to check whether the value is clicked on xAxis 
            if (value == 'poverty' || value == 'age' || value == 'income'){
                // Replace the chosenX value with the new value
                chosenX = value;
                // Update xLinearScale for the new data
                xLinearScale = xScale(data,chosenX);
                // Update x Axis
                xAxis = updateXAxis(xLinearScale,xAxis)
                
                // Change classes based on the selected value
                // The class of the selected value becomes active
                // while the unselected ones become inactive
                if (value == 'poverty'){
                    povertyLabel
                        .attr('class','active');
                    ageLabel
                        .attr('class','inactive');
                    incomeLabel
                        .attr('class','inactive');

                } else if (value == 'age'){
                    povertyLabel
                        .attr('class','inactive');
                    ageLabel
                        .attr('class','active');
                    incomeLabel
                        .attr('class','inactive');
                } else {
                    povertyLabel
                        .attr('class','inactive');
                    ageLabel
                        .attr('class','inactive');
                    incomeLabel
                        .attr('class','active'); 
                }
            } else {
                // Replace the chosenY value with the new value
                chosenY = value;
                // Update yLinearScale for the new data
                yLinearScale = yScale(data,chosenY);
                // Update yAxis
                yAxis = updateYAxis(yLinearScale,yAxis)
                
                // Change classes based on the selected value
                // The class of the selected value becomes active
                // while the unselected ones become inactive
                if (value == 'healthcare'){
                    healthcareLabel
                        .attr('class','active');
                    smokesLabel
                        .attr('class','inactive');
                    obesityLabel
                        .attr('class','inactive');

                } else if (value == 'smokes'){
                    healthcareLabel
                        .attr('class','inactive');
                    smokesLabel
                        .attr('class','active');
                    obesityLabel
                        .attr('class','inactive');
                } else {
                    healthcareLabel
                        .attr('class','inactive');
                    smokesLabel
                        .attr('class','inactive');
                    obesityLabel
                        .attr('class','active');
                }
            }

            // Update circles group
            circlesGroup = updateCircles(circlesGroup, xLinearScale, yLinearScale, chosenX, chosenY);
            // Update text inside the circles 
            updateCirclesText(circlesTextGroup, xLinearScale, yLinearScale, chosenX, chosenY)
            // Update tooltip
            updateTooltip(chosenX,chosenY,circlesGroup)

        })

}).catch(function(error){
    console.log(error);
})