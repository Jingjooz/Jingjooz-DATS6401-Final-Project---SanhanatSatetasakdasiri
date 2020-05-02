// Chart1 - Airbnb Average occunpancy rate, review rating, and availability 365 at each area of NYC 
function PickedColor(ratetype) {
   var fill;
   switch(ratetype) {
     case "Availability":
        fill = "#88C670";
        break;
     case "Review ratings":
        fill = "#F66863";
        break;
     case "Occupancy rate":
        fill = "#4181F3";
        break;
   }
   return fill;
}

function neighbourhoodCode(code) {
   var neighbourhoodDict = {
      "Bronx":"Bronx",
      "Brooklyn":"Brooklyn",
      "Manhattan":"Manhattan",
      "Queens":"Queens",
      "Staten Island":"Staten Island",
   };
   return neighbourhoodDict[code];
}

function AverageActivityNeighbourhoodplot(chartArea) {
   var margin = {left:150, right:0, top:50, bottom:100};
   var height = 400 - margin.top - margin.bottom,
       width  = 460 - margin.left - margin.right;

   // entire chart
   var chart = d3.select(chartArea)
             .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
             .append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

   //Tooltip
   var tip = d3.tip().attr("class","d3-tip")
           .offset([-10, 0])
           .html(function(d) {
                    var text  = "Occupancy rate: <span style='color:#FCA031'>" + d3.format(",.1f")(d.avg_occupancy_rate) + "%" + "</span></br>";
                        text += "Review scores ratings: <span style='color:#FCA031'>" + d3.format(".1f")(d.avg_review_rating) + "</span></br>";
                        text += "Availability: <span style='color:#FCA031'>" + d3.format(".1f")(d.avg_availability  ) +  " days per year" + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "12.2px") 
           .style("text-decoration", "none")  
           .text("Average Occunpancy rate, Review rating, and Availability");

   //x label
   chart.append("text")
         .attr("y", height + margin.top)
         .attr("x", width/2)
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .text("Borough");


   //y label
   chart.append("text")
         .attr("y", -55)
         .attr("x", -(height/2))
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .attr("transform", "rotate(-90)")
         .text("Average");


   //Read in the data
   d3.json("data_json/Avg_activity_area.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.avg_occupancy_rate      = +d.avg_occupancy_rate;
         d.avg_review_rating      = +d.avg_review_rating;
         d.avg_availability        = +d.avg_availability  ;          
         d.Avg        = +d.avg_availability  ;
         d.Avg_activity_neighbourhood = neighbourhoodCode(d.Neighbourhood);
      });

      update(data,true);


      $(document).ready(function(){
         $('.ratetypeSelect').change(function(){
             var selectedratetype = $(".ratetypeSelect option:selected").text();
             data.forEach(function(d) {
                 if ( selectedratetype === 'Occupancy rate' ) {
                    d.Avg            = +d.avg_occupancy_rate;
                 } else if ( selectedratetype === 'Review ratings' ) {
                       d.Avg            = +d.avg_review_rating;
                 } else if ( selectedratetype === 'Availability' ) {
                       d.Avg            = +d.avg_availability  ;
                 } else {
                    d.Avg            = +d.avg_availability  ;
                 }
             });
             update(data,false);
         });
      });
   }); //import data

   var y;
   function update(data,drawAxis) {
   
      //x scale
      var x = d3.scaleBand()
              .domain(data.map(function(d){
                 return d.Avg_activity_neighbourhood;
              }))
              .range([0, width])
              .padding(0.5);

      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.avg_availability  ;
              })])
              .range([height, 0]);


      //x axis
      var xAxis = d3.axisBottom(x);
      chart.append("g")
             .attr("class", "x-axis")
             .attr("transform", "translate(0, " + height + ")")
             .call(xAxis)
           .selectAll("text")
             .attr("rotate(0)");
   
   
      //y axis
      var yAxis = d3.axisLeft(y)
                    .scale(y)

      chart.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
           .selectAll("text")
             .attr("rotate(0)");
      }
      
     var yLine = () => d3.axisLeft()
           .scale(y)
           .tickFormat(function(d){
              return d
           });

     chart.append('g')
           .attr('transform', `translate(0, ${height})`)
           .call(d3.axisBottom(x));

     chart.append('g')
           .call(d3.axisLeft(y));

     chart.append('g')
           .attr('class', 'grid')
           .call(yLine()
              .tickSize(-width, 0, 0)
              .tickFormat('')
     )

      var rects = chart.selectAll("rect").data(data);

      var a = d3.transition().duration(1000);

      //Exit old elements not present in the new data
      rects.exit()
          .attr("class","exit")
          .remove();

      rects.enter()
          .append("rect")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .on("mouseenter", function (actual, i) {
           d3.select(this).attr("opacity", 0.5)
           .attr('x', (d) => x(d.Avg_activity_neighbourhood) - 8) 
           .attr('width', x.bandwidth() + 15)
           })
           
         .on("mouseleave", function (actual, i) {
           d3.select(this).attr("opacity", 2)
           .attr('x', (d) => x(d.Avg_activity_neighbourhood))
           .attr('width', x.bandwidth())
        })
          .attr("class","enter")
          .merge(rects)
          .transition(a)
               .attr("y", function(d){return y(d.Avg); })
               .attr("x", function(d){return x(d.Avg_activity_neighbourhood); })
               .attr("height", function(d){return height - y(d.Avg); })
               .attr("width", x.bandwidth)

       chart.selectAll("rect").attr("fill", function() { return (PickedColor($(".ratetypeSelect option:selected").text())); });
   } //update
} //Avg_chart1

AverageActivityNeighbourhoodplot("#Avg_activity1");


// Chart2 - Airbnb Average occunpancy rate, review rating, and availability 365 at each room type
function roomtypeCode(code) {
   var roomtypeDict = {
      "Shared room":"Shared room",
      "Private room":"Private room",
      "Hotel room":"Hotel room",
      "Entire home/apt":"Entire home/apt",
   };
   return roomtypeDict[code];
}


function AverageActivityRoomtypeplot(chartArea) {
   var margin = {left:150, right:0, top:50, bottom:100};
   var height = 400 - margin.top - margin.bottom,
       width  = 460 - margin.left - margin.right;

   // entire chart
   var chart = d3.select(chartArea)
             .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
             .append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

   //Tooltip
   var tip = d3.tip().attr("class","d3-tip")
           .offset([-10, 0])
           .html(function(d) {
                    var text  = "Occupancy rate: <span style='color:#FCA031'>" + d3.format(",.1f")(d.avg_occupancy_rate) + "%" + "</span></br>";
                        text += "Review scores ratings: <span style='color:#FCA031'>" + d3.format(".1f")(d.avg_review_rating) + "</span></br>";
                        text += "Availability: <span style='color:#FCA031'>" + d3.format(".1f")(d.avg_availability  ) + " days per year" + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "12.2px") 
           .style("text-decoration", "none")  
           .text("Average Occunpancy rate, Review rating, and Availability");

   //x label
   chart.append("text")
         .attr("y", height + margin.top)
         .attr("x", width/2)
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .text("Room type");


   //y label
   chart.append("text")
         .attr("y", -55)
         .attr("x", -(height/2))
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .attr("transform", "rotate(-90)")
         .text("Average");


   //Read in the data
   d3.json("data_json/Avg_activity_roomtype.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.avg_occupancy_rate      = +d.avg_occupancy_rate;
         d.avg_review_rating      = +d.avg_review_rating;
         d.avg_availability        = +d.avg_availability  ;          
         d.Avg        = +d.avg_availability  ;
         d.Avg_activity_roomtype = roomtypeCode(d.Room_Type);
      });

      update(data,true);


      $(document).ready(function(){
         $('.ratetypeSelect').change(function(){
             var selectedratetype = $(".ratetypeSelect option:selected").text();
             data.forEach(function(d) {
                 if ( selectedratetype === 'Occupancy rate' ) {
                    d.Avg            = +d.avg_occupancy_rate;
                 } else if ( selectedratetype === 'Review ratings' ) {
                       d.Avg            = +d.avg_review_rating;
                 } else if ( selectedratetype === 'Availability' ) {
                       d.Avg            = +d.avg_availability  ;
                 } else {
                    d.Avg            = +d.avg_availability  ;
                 }
             });
             update(data,false);
         });
      });
   }); //import data

   var y;
   function update(data,drawAxis) {
   
      //x scale
      var x = d3.scaleBand()
              .domain(data.map(function(d){
                 return d.Avg_activity_roomtype;
              }))
              .range([0, width])
              .padding(0.5);

      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.avg_availability  ;
              })])
              .range([height, 0]);


      //x axis
      var xAxis = d3.axisBottom(x);
      chart.append("g")
             .attr("class", "x-axis")
             .attr("transform", "translate(0, " + height + ")")
             .call(xAxis)
           .selectAll("text")
             .attr("rotate(0)");
   
   
      //y axis
      var yAxis = d3.axisLeft(y)
                    .scale(y)

      chart.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
           .selectAll("text")
             .attr("rotate(0)");
      }
      
     var yLine = () => d3.axisLeft()
           .scale(y)
           .tickFormat(function(d){
              return d
           });

     chart.append('g')
           .attr('transform', `translate(0, ${height})`)
           .call(d3.axisBottom(x));

     chart.append('g')
           .call(d3.axisLeft(y));

     chart.append('g')
           .attr('class', 'grid')
           .call(yLine()
              .tickSize(-width, 0, 0)
              .tickFormat('')
     )

      var rects = chart.selectAll("rect").data(data);

      var a = d3.transition().duration(1000);

      //Exit old elements not present in the new data
      rects.exit()
          .attr("class","exit")
          .remove();

      rects.enter()
          .append("rect")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .on("mouseenter", function (actual, i) {
           d3.select(this).attr("opacity", 0.5)
           .attr('x', (d) => x(d.Avg_activity_roomtype) - 8) 
           .attr('width', x.bandwidth() + 15)
           })
           
         .on("mouseleave", function (actual, i) {
           d3.select(this).attr("opacity", 2)
           .attr('x', (d) => x(d.Avg_activity_roomtype))
           .attr('width', x.bandwidth())
        })
          .attr("class","enter")
          .merge(rects)
          .transition(a)
               .attr("y", function(d){return y(d.Avg); })
               .attr("x", function(d){return x(d.Avg_activity_roomtype); })
               .attr("height", function(d){return height - y(d.Avg); })
               .attr("width", x.bandwidth)

       chart.selectAll("rect").attr("fill", function() { return (PickedColor($(".ratetypeSelect option:selected").text())); });
   } //update
} //Avg_chart1

AverageActivityRoomtypeplot("#Avg_activity2");


 // formula box (hide)
 function myFunction() {
   var x = document.getElementById("myOcc");
   if (x.style.display === "none") {
     x.style.display = "block";
   } else {
     x.style.display = "none";
   }
 }