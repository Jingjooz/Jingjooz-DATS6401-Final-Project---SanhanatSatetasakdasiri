 
// chart 7 - scatter plot between income and price
function IncomePricescatterplot(body) {
  var margin = {left:60, right:50, top:50, bottom:100};
  var height = 490 - margin.top - margin.bottom,
      width  = 500 - margin.left - margin.right;

  var svg = d3.select(body)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


  // The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
  var xScale = d3.scaleLinear()
    .range([0, width]);

  var yScale = d3.scaleLinear()
    .range([height, 0]);

  // square root scale.
  var radius = d3.scaleSqrt()
    .range([2,5]);

  // the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
  var xAxis = d3.axisBottom()
    .scale(xScale);

  var yAxis = d3.axisLeft()
    .scale(yScale);

  // again scaleOrdinal
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  d3.csv('data_json/scatter_income_price.csv', function(error, data){
    data.forEach(function(d){
       d.income = +d.income;
       d.Daily_price = +d.Daily_price;
       d.Size = +d.Size;
       d.Area = d.Area;
    });

    xScale.domain(d3.extent(data, function(d){
      return d.Daily_price;
    })).nice();

    yScale.domain(d3.extent(data, function(d){
      return d.income;
    })).nice();

    radius.domain(d3.extent(data, function(d){
      return d.Size;
    })).nice();

    // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis. 
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'x axis')
      .call(xAxis);

    // y-axis is translated to (0,0)
    svg.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'y axis')
      .call(yAxis);


    var bubble = svg.selectAll('.bubble')
      .data(data)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', function(d){return xScale(d.Daily_price);})
      .attr('cy', function(d){ return yScale(d.income); })
      .attr('r', function(d){ return radius(d.Size); })
      .style('fill', function(d){ return color(d.Area); });

    bubble.append('title')
      .attr('x', function(d){ return radius(d.Size); })
      .text(function(d){
        return d.Area;
      });

      svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("text-decoration", "none")  
      .text("Monthly income (Estimated) VS Daily price");

    // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
    svg.append('text')
      .attr('x', 10)
      .attr('y', 10)
      .attr('class', 'label')
      .text('Monthly income (Estimated)');


    svg.append('text')
      .attr('x', width)
      .attr('y', height - 10)
      .attr('text-anchor', 'end')
      .attr('class', 'label')
      .text('Daily price');

    // I feel I understand legends much better now.
    // define a group element for each color i, and translate it to (0, i * 20). 
    var legend = svg.selectAll('legend')
      .data(color.domain())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });

    // give x value equal to the legend elements. 
    // no need to define a function for fill, this is automatically fill by color.
    legend.append('rect')
      .attr('x', width)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    // add text to the legend elements.
    // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
    legend.append('text')
      .attr('x', width - 6)
      .attr('y', 9)
      .attr('dy', '.2em')
      .style('text-anchor', 'end')
      .text(function(d){ return d; });


    // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
    legend.on('click', function(type){
      d3.selectAll('.bubble')
        .style('opacity', 0.15)
        .filter(function(d){
          return d.Area == type;
        })
        .style('opacity', 1);
    })


  })
}
IncomePricescatterplot("#Avg_income7");



  // chart 8 - scatter plot between income and reviewing
  function IncomeReviewingscatterplot(body) {
    var margin = {left:60, right:50, top:50, bottom:100};
    var height = 490 - margin.top - margin.bottom,
        width  = 500 - margin.left - margin.right;
  
    var svg = d3.select(body)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
  
    // The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    var xScale = d3.scaleLinear()
      .range([0, width]);
  
    var yScale = d3.scaleLinear()
      .range([height, 0]);
  
    // square root scale.
    var radius = d3.scaleSqrt()
      .range([2,5]);
  
    // the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    var xAxis = d3.axisBottom()
      .scale(xScale);
  
    var yAxis = d3.axisLeft()
      .scale(yScale);
  
    // again scaleOrdinal
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  
    d3.csv('data_json/scatter_income_reviewing.csv', function(error, data){
      data.forEach(function(d){
         d.review_scores = +d.review_scores;
         d.income = +d.income;
         d.Size = +d.Size;
         d.Area = d.Area;
      });
  
      xScale.domain(d3.extent(data, function(d){
        return d.review_scores;
      })).nice();
  
      yScale.domain(d3.extent(data, function(d){
        return d.income;
      })).nice();
  
      radius.domain(d3.extent(data, function(d){
        return d.Size;
      })).nice();
  
      svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("text-decoration", "none")  
      .text("Monthly income (Estimated) VS Reviewing scores rating");

      // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis. 
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);
  
      // y-axis is translated to (0,0)
      svg.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);
  
  
      var bubble = svg.selectAll('.bubble')
        .data(data)
        .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', function(d){return xScale(d.review_scores);})
        .attr('cy', function(d){ return yScale(d.income); })
        .attr('r', function(d){ return radius(d.Size); })
        .style('fill', function(d){ return color(d.Area); });
  
      bubble.append('title')
        .attr('x', function(d){ return radius(d.Size); })
        .text(function(d){
          return d.Area;
        });
  
      // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
      svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('class', 'label')
        .text('Monthly income (Estimated)');
  
  
      svg.append('text')
        .attr('x', width)
        .attr('y', height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Reviewing scores rating');
  
      // I feel I understand legends much better now.
      // define a group element for each color i, and translate it to (0, i * 20). 
      var legend = svg.selectAll('legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });
  
      // give x value equal to the legend elements. 
      // no need to define a function for fill, this is automatically fill by color.
      legend.append('rect')
        .attr('x', width)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);
  
      // add text to the legend elements.
      // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
      legend.append('text')
        .attr('x', width - 6)
        .attr('y', 9)
        .attr('dy', '.2em')
        .style('text-anchor', 'end')
        .text(function(d){ return d; });
  
  
      // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
      legend.on('click', function(type){
        d3.selectAll('.bubble')
          .style('opacity', 0.15)
          .filter(function(d){
            return d.Area == type;
          })
          .style('opacity', 1);
      })
  
  
    })
  }
  IncomeReviewingscatterplot("#Avg_income8");


  // chart 9 - scatter plot between income and occupancy rate
  function IncomeOccupancyscatterplot(body) {
    var margin = {left:60, right:50, top:50, bottom:100};
    var height = 490 - margin.top - margin.bottom,
        width  = 500 - margin.left - margin.right;
  
    var svg = d3.select(body)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
  
    // The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    var xScale = d3.scaleLinear()
      .range([0, width]);
  
    var yScale = d3.scaleLinear()
      .range([height, 0]);
  
    // square root scale.
    var radius = d3.scaleSqrt()
      .range([2,5]);
  
    // the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    var xAxis = d3.axisBottom()
      .scale(xScale);
  
    var yAxis = d3.axisLeft()
      .scale(yScale);
  
    // again scaleOrdinal
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  
    d3.csv('data_json/scatter_income_occupancy_rate.csv', function(error, data){
      data.forEach(function(d){
         d.Occupancy_rate = +d.Occupancy_rate;
         d.income = +d.income;
         d.Size = +d.Size;
         d.Area = d.Area;
      });
  
      xScale.domain(d3.extent(data, function(d){
        return d.Occupancy_rate;
      })).nice();
  
      yScale.domain(d3.extent(data, function(d){
        return d.income;
      })).nice();
  
      radius.domain(d3.extent(data, function(d){
        return d.Size;
      })).nice();
  
      svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("text-decoration", "none")  
      .text("Monthly income (est.) VS Occupancy rate (est.)");

      // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis. 
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);
  
      // y-axis is translated to (0,0)
      svg.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);
  
  
      var bubble = svg.selectAll('.bubble')
        .data(data)
        .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', function(d){return xScale(d.Occupancy_rate);})
        .attr('cy', function(d){ return yScale(d.income); })
        .attr('r', function(d){ return radius(d.Size); })
        .style('fill', function(d){ return color(d.Area); });
  
      bubble.append('title')
        .attr('x', function(d){ return radius(d.Size); })
        .text(function(d){
          return d.Area;
        });
  
      // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
      svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('class', 'label')
        .text('Monthly income (Estimated)');
  
  
      svg.append('text')
        .attr('x', width)
        .attr('y', height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Occupancy rate (Estimated)');
  
      // I feel I understand legends much better now.
      // define a group element for each color i, and translate it to (0, i * 20). 
      var legend = svg.selectAll('legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });
  
      // give x value equal to the legend elements. 
      // no need to define a function for fill, this is automatically fill by color.
      legend.append('rect')
        .attr('x', width)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);
  
      // add text to the legend elements.
      // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
      legend.append('text')
        .attr('x', width - 6)
        .attr('y', 9)
        .attr('dy', '.2em')
        .style('text-anchor', 'end')
        .text(function(d){ return d; });
  
  
      // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
      legend.on('click', function(type){
        d3.selectAll('.bubble')
          .style('opacity', 0.15)
          .filter(function(d){
            return d.Area == type;
          })
          .style('opacity', 1);
      })
  
  
    })
  }
  IncomeOccupancyscatterplot("#Avg_income9");




  // chart 10 - scatter plot between price and Availability
  function IncomeAvailabilityscatterplot(body) {
    var margin = {left:60, right:50, top:50, bottom:100};
    var height = 490 - margin.top - margin.bottom,
        width  = 500 - margin.left - margin.right;
  
    var svg = d3.select(body)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
  
    // The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    var xScale = d3.scaleLinear()
      .range([0, width]);
  
    var yScale = d3.scaleLinear()
      .range([height, 0]);
  
    // square root scale.
    var radius = d3.scaleSqrt()
      .range([2,5]);
  
    // the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
    var xAxis = d3.axisBottom()
      .scale(xScale);
  
    var yAxis = d3.axisLeft()
      .scale(yScale);
  
    // again scaleOrdinal
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  
    d3.csv('data_json/scatter_income_availability.csv', function(error, data){
      data.forEach(function(d){
         d.Availability = +d.Availability;
         d.income = +d.income;
         d.Size = +d.Size;
         d.Area = d.Area;
      });
  
      xScale.domain(d3.extent(data, function(d){
        return d.Availability;
      })).nice();
  
      yScale.domain(d3.extent(data, function(d){
        return d.income;
      })).nice();
  
      radius.domain(d3.extent(data, function(d){
        return d.Size;
      })).nice();
  
      // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis. 
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);
  
      // y-axis is translated to (0,0)
      svg.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);
  
  
      var bubble = svg.selectAll('.bubble')
        .data(data)
        .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', function(d){return xScale(d.Availability);})
        .attr('cy', function(d){ return yScale(d.income); })
        .attr('r', function(d){ return radius(d.Size); })
        .style('fill', function(d){ return color(d.Area); });
  
      bubble.append('title')
        .attr('x', function(d){ return radius(d.Size); })
        .text(function(d){
          return d.Area;
        });
  
      // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
      svg.append("text")
         .attr("x", (width / 2))             
         .attr("y", 0 - (margin.top / 2))
         .attr("text-anchor", "middle")  
         .style("font-size", "16px") 
         .style("text-decoration", "none")  
         .text("Monthly income (Estimated) VS Availability");
     
      svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('class', 'label')
        .text('Monthly income (Estimated)');
  
  
      svg.append('text')
        .attr('x', width)
        .attr('y', height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Availability');
  
      // I feel I understand legends much better now.
      // define a group element for each color i, and translate it to (0, i * 20). 
      var legend = svg.selectAll('legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });
  
      // give x value equal to the legend elements. 
      // no need to define a function for fill, this is automatically fill by color.
      legend.append('rect')
        .attr('x', width)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);
  
      // add text to the legend elements.
      // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
      legend.append('text')
        .attr('x', width - 6)
        .attr('y', 9)
        .attr('dy', '.2em')
        .style('text-anchor', 'end')
        .text(function(d){ return d; });
  
  
      // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
      legend.on('click', function(type){
        d3.selectAll('.bubble')
          .style('opacity', 0.15)
          .filter(function(d){
            return d.Area == type;
          })
          .style('opacity', 1);
      })
  
  
    })
  }
 IncomeAvailabilityscatterplot("#Avg_income10");