
// Chart1 - Airbnb Average Price at each area of NYC 
function PickedColor(pricetype) {
    var fill;
    switch(pricetype) {
      case "Daily Price":
         fill = "#88C670";
         break;
      case "Weekly Price":
         fill = "#F66863";
         break;
      case "Monthly Price":
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


function AveragePriceNeighbourhoodplot(chartArea) {
    var margin = {left:100, right:0, top:50, bottom:100};
    var height = 500 - margin.top - margin.bottom,
        width  = 600 - margin.left - margin.right;

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
                     var text  = "Daily price: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Daily_Price) + "</span></br>";
                         text += "Weekly price: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Weekly_Price) + "</span></br>";
                         text += "Monthly price: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Price) + "</span></br>";
                     return text;
                  })
    chart.call(tip);

    chart.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "none")  
            .text("Airbnb Average Price at each area of NYC");

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
          .text("Average price ($)");


    //Read in the data
    d3.json("data_json/Avg_price_Neighbourhood.json").then( function(data) {
    
       // ensure Ava is cast as integer
       data.forEach(function(d) {
          d.Avg_Daily_Price      = +d.Avg_Daily_Price;
          d.Avg_Weekly_Price      = +d.Avg_Weekly_Price;
          d.Avg_Monthly_Price      = +d.Avg_Monthly_Price;          
          d.Avg        = +d.Avg_Monthly_Price;
          d.Avg_price_neighbourhood = neighbourhoodCode(d.Neighbourhood);
       });

       update(data,true);


       $(document).ready(function(){
          $('.pricetypeSelect').change(function(){
              var selectedpricetype = $(".pricetypeSelect option:selected").text();
              data.forEach(function(d) {
                  if ( selectedpricetype === 'Daily Price' ) {
                     d.Avg            = +d.Avg_Daily_Price;
                  } else if ( selectedpricetype === 'Weekly Price' ) {
                        d.Avg            = +d.Avg_Weekly_Price;
                  } else if ( selectedpricetype === 'Monthly Price' ) {
                        d.Avg            = +d.Avg_Monthly_Price;
                  } else {
                     d.Avg            = +d.Avg_Monthly_Price;
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
                  return d.Avg_price_neighbourhood;
               }))
               .range([0, width])
               .padding(0.5);

       if (drawAxis) {
       //y scale
       y = d3.scaleLinear()
               .domain([0, d3.max(data, function(d){
                  return d.Avg_Monthly_Price;
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
            .attr('x', (d) => x(d.Avg_price_neighbourhood) - 8) 
            .attr('width', x.bandwidth() + 15)
            })
            
          .on("mouseleave", function (actual, i) {
            d3.select(this).attr("opacity", 2)
            .attr('x', (d) => x(d.Avg_price_neighbourhood))
            .attr('width', x.bandwidth())
         })
           .attr("class","enter")
           .merge(rects)
           .transition(a)
                .attr("y", function(d){return y(d.Avg); })
                .attr("x", function(d){return x(d.Avg_price_neighbourhood); })
                .attr("height", function(d){return height - y(d.Avg); })
                .attr("width", x.bandwidth)

        chart.selectAll("rect").attr("fill", function() { return (PickedColor($(".pricetypeSelect option:selected").text())); });
    } //update
} //Avg_chart1

AveragePriceNeighbourhoodplot("#Avg_price1");



// Chart 2 - Treemap chart for each area
google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
var data = new google.visualization.DataTable();
data.addColumn('string', 'Subeighbourhood');
data.addColumn('string', 'Airbnb in New York City');
data.addColumn('number', 'Avg_Daily_Price');
data.addRows([
   ['Airbnb in New York City', null , 160],


['Bronx', 'Airbnb in New York City', 89],
['Woodlawn','Bronx',63],
['Williamsbridge','Bronx',87],
['Westchester Square','Bronx',133],
['West Farms','Bronx',120],
['Wakefield','Bronx',88],
['Van Nest','Bronx',126],
['University Heights','Bronx',61],
['Unionport','Bronx',208],
['Tremont','Bronx',68],
['Throgs Neck','Bronx',94],
['Spuyten Duyvil','Bronx',113],
['Soundview','Bronx',52],
['Schuylerville','Bronx',66],
['Riverdale','Bronx',231],
['Port Morris','Bronx',84],
['Pelham Gardens','Bronx',98],
['Pelham Bay','Bronx',123],
['Parkchester','Bronx',69],
['Olinville','Bronx',69],
['Norwood','Bronx',76],
['North Riverdale','Bronx',84],
['Mount Hope','Bronx',77],
['Mount Eden','Bronx',66],
['Mott Haven','Bronx',91],
['Morrisania','Bronx',78],
['Morris Park','Bronx',62],
['Morris Heights','Bronx',69],
['Melrose','Bronx',58],
['Longwood','Bronx',93],
['Kingsbridge','Bronx',81],
['Hunts Point','Bronx',56],
['Highbridge','Bronx',74],
['Fordham','Bronx',83],
['Fieldston','Bronx',259],
['Edenwald','Bronx',84],
['Eastchester','Bronx',135],
['East Morrisania','Bronx',94],
['Country Club','Bronx',525],
['Concourse Village','Bronx',73],
['Concourse','Bronx',81],
['Co-op City','Bronx',57],
['Clason Point','Bronx',86],
['Claremont Village','Bronx',85],
['City Island','Bronx',102],
['Castle Hill','Bronx',84],
['Bronxdale','Bronx',81],
['Belmont','Bronx',99],
['Baychester','Bronx',88],
['Allerton','Bronx',91],

['Brooklyn', 'Airbnb in New York City', 125],
['Windsor Terrace','Brooklyn',137],
['Williamsburg','Brooklyn',147],
['Vinegar Hill','Brooklyn',177],
['Sunset Park','Brooklyn',93],
['South Slope','Brooklyn',146],
['Sheepshead Bay','Brooklyn',115],
['Sea Gate','Brooklyn',448],
['Red Hook','Brooklyn',141],
['Prospect-Lefferts Gardens','Brooklyn',109],
['Prospect Heights','Brooklyn',147],
['Park Slope','Brooklyn',172],
['Navy Yard','Brooklyn',140],
['Mill Basin','Brooklyn',111],
['Midwood','Brooklyn',81],
['Manhattan Beach','Brooklyn',862],
['Kensington','Brooklyn',95],
['Greenpoint','Brooklyn',150],
['Gravesend','Brooklyn',80],
['Gowanus','Brooklyn',162],
['Gerritsen Beach','Brooklyn',120],
['Fort Hamilton','Brooklyn',102],
['Fort Greene','Brooklyn',152],
['Flatlands','Brooklyn',101],
['Flatbush','Brooklyn',97],
['East New York','Brooklyn',91],
['East Flatbush','Brooklyn',104],
['Dyker Heights','Brooklyn',81],
['DUMBO','Brooklyn',202],
['Downtown Brooklyn','Brooklyn',160],
['Cypress Hills','Brooklyn',113],
['Crown Heights','Brooklyn',114],
['Coney Island','Brooklyn',101],
['Columbia St','Brooklyn',161],
['Cobble Hill','Brooklyn',197],
['Clinton Hill','Brooklyn',189],
['Carroll Gardens','Brooklyn',174],
['Canarsie','Brooklyn',103],
['Bushwick','Brooklyn',86],
['Brownsville','Brooklyn',82],
['Brooklyn Heights','Brooklyn',208],
['Brighton Beach','Brooklyn',154],
['Borough Park','Brooklyn',64],
['Boerum Hill','Brooklyn',210],
['Bergen Beach','Brooklyn',99],
['Bensonhurst','Brooklyn',77],
['Bedford-Stuyvesant','Brooklyn',109],
['Bay Ridge','Brooklyn',108],
['Bath Beach','Brooklyn',82],

['Manhattan', 'Airbnb in New York City', 215],
['West Village','Manhattan',263],
['Washington Heights','Manhattan',91],
['Upper West Side','Manhattan',209],
['Upper East Side','Manhattan',189],
['Two Bridges','Manhattan',123],
['Tribeca','Manhattan',415],
['Theater District','Manhattan',448],
['Stuyvesant Town','Manhattan',248],
['SoHo','Manhattan',361],
['Roosevelt Island','Manhattan',107],
['Nolita','Manhattan',194],
['NoHo','Manhattan',255],
['Murray Hill','Manhattan',240],
['Morningside Heights','Manhattan',108],
['Midtown','Manhattan',419],
['Marble Hill','Manhattan',91],
['Lower East Side','Manhattan',255],
['Little Italy','Manhattan',241],
['Kips Bay','Manhattan',205],
['Inwood','Manhattan',86],
['HellKitchen','Manhattan',231],
['Harlem','Manhattan',121],
['Greenwich Village','Manhattan',271],
['Gramercy','Manhattan',248],
['Flatiron District','Manhattan',339],
['Financial District','Manhattan',209],
['East Village','Manhattan',186],
['East Harlem','Manhattan',140],
['Civic Center','Manhattan',219],
['Chinatown','Manhattan',228],
['Chelsea','Manhattan',219],
['Battery Park City','Manhattan',316],

['Queens', 'Airbnb in New York City', 97],
['Woodside','Queens',73],
['Woodhaven','Queens',70],
['Whitestone','Queens',100],
['Sunnyside','Queens',87],
['St. Albans','Queens',96],
['Springfield Gardens','Queens',105],
['South Ozone Park','Queens',79],
['Rosedale','Queens',75],
['Rockaway Beach','Queens',129],
['Ridgewood','Queens',81],
['Richmond Hill','Queens',87],
['Rego Park','Queens',80],
['Queens Village','Queens',88],
['Ozone Park','Queens',87],
['Neponsit','Queens',275],
['Middle Village','Queens',115],
['Maspeth','Queens',88],
['Long Island City','Queens',127],
['Little Neck','Queens',74],
['Laurelton','Queens',78],
['Kew Gardens Hills','Queens',102],
['Kew Gardens','Queens',92],
['Jamaica Hills','Queens',126],
['Jamaica Estates','Queens',202],
['Jamaica','Queens',91],
['Jackson Heights','Queens',83],
['Howard Beach','Queens',115],
['Holliswood','Queens',229],
['Hollis','Queens',94],
['Glendale','Queens',72],
['Fresh Meadows','Queens',103],
['Forest Hills','Queens',125],
['Flushing','Queens',98],
['Far Rockaway','Queens',179],
['Elmhurst','Queens',78],
['Edgemere','Queens',90],
['East Elmhurst','Queens',85],
['Douglaston','Queens',97],
['Ditmars Steinway','Queens',103],
['Corona','Queens',63],
['College Point','Queens',87],
['Cambria Heights','Queens',85],
['Briarwood','Queens',114],
['Breezy Point','Queens',209],
['Bellerose','Queens',75],
['Belle Harbor','Queens',164],
['Bayswater','Queens',82],
['Bayside','Queens',113],
['Bay Terrace','Queens',105],
['Astoria','Queens',104],
['Arverne','Queens',172],

['Staten Island', 'Airbnb in New York City', 105],
['Woodrow','Staten Island',700],
['Willowbrook','Staten Island',309],
['Westerleigh','Staten Island',85],
['West Brighton','Staten Island',78],
['Tottenville','Staten Island',163],
['Tompkinsville','Staten Island',80],
['Todt Hill','Staten Island',180],
['Stapleton','Staten Island',92],
['St. George','Staten Island',137],
['South Beach','Staten Island',59],
['Silver Lake','Staten Island',70],
['Shore Acres','Staten Island',120],
['Rossville','Staten Island',59],
['Rosebank','Staten Island',105],
['Richmondtown','Staten Island',93],
['Randall Manor','Staten Island',126],
['PrinceBay','Staten Island',507],
['Port Richmond','Staten Island',58],
['Port Ivory','Staten Island',95],
['Oakwood','Staten Island',93],
['New Springville','Staten Island',84],
['New Dorp Beach','Staten Island',61],
['New Dorp','Staten Island',57],
['New Brighton','Staten Island',63],
['Midland Beach','Staten Island',93],
['Mariners Harbor','Staten Island',87],
['Lighthouse Hill','Staten Island',158],
['Huguenot','Staten Island',180],
['Howland Hook','Staten Island',130],
['Grymes Hill','Staten Island',139],
['Great Kills','Staten Island',89],
['Grant City','Staten Island',53],
['Graniteville','Staten Island',60],
['Fort Wadsworth','Staten Island',800],
['Emerson Hill','Staten Island',83],
['Eltingville','Staten Island',143],
['Dongan Hills','Staten Island',101],
['Concord','Staten Island',72],
['Clifton','Staten Island',76],
['Castleton Corners','Staten Island',62],
['BullHead','Staten Island',58],
['Bay Terrace, Staten Island','Staten Island',150],
['Arrochar','Staten Island',111],
['Arden Heights','Staten Island',92]

]);

var tree = new google.visualization.TreeMap(document.getElementById('Avg_price2'));

var options = {
  highlightOnMouseOver: true,
  maxDepth: 1,
  maxPostDepth: 1,
  minHighlightColor: '#6992cf',
  midHighlightColor: '#97afd1',
  maxHighlightColor: '#c0c7d1',
  minColor: '#029662',
  midColor: '#dbd9d9',
  maxColor: '#ee8100',
  headerHeight: 25,
  height: 500,
  useWeightedAverageForAggregation: true,
  showScale: true,
  generateTooltip: showStaticTooltip

};

  tree.draw(data, options);
  function showStaticTooltip(row, size, value) {
   return '<div style="background:rgba(0, 0, 0, 0.8); padding:10px; color: #fff">' + "<strong>Area: </strong><span style='color:#FCA031'>" +  data.getValue(row,0) + "</span></br>" + 
   "<strong>Daily price</strong><span style='color:#FCA031'>" + ': ' +  d3.format("$,.0f")(data.getValue(row,2)) + "</span></br>" ;
  }

 }


// Chart3 - Airbnb Average Price for roomtype
function roomtypeCode(code) {
   var roomtypeDict = {
      "Shared room":"Shared room",
      "Private room":"Private room",
      "Hotel room":"Hotel room",
      "Entire home/apt":"Entire home/apt",
   };
   return roomtypeDict[code];
}


function AveragePriceRoomtypeplot(chartArea) {
    var margin = {left:100, right:0, top:50, bottom:100};
    var height = 500 - margin.top - margin.bottom,
        width  = 600 - margin.left - margin.right;
 
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
                    var text  = "<strong>Daily price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Daily_Price) + "</span></br>";
                        text += "<strong>Weekly price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Weekly_Price) + "</span></br>";
                        text += "<strong>Monthly price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Price) + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "16px") 
           .style("text-decoration", "none")  
           .text("Airbnb Average Price by room type");

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
         .text("Average price ($)");


   //Read in the data
   d3.json("data_json/Avg_price_Roomtype.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.Avg_Daily_Price      = +d.Avg_Daily_Price;
         d.Avg_Weekly_Price      = +d.Avg_Weekly_Price;
         d.Avg_Monthly_Price      = +d.Avg_Monthly_Price;          
         d.Avg        = +d.Avg_Monthly_Price;
         d.Avg_price_roomtype = roomtypeCode(d.Room_Type);
      });

      update(data,true);


      $(document).ready(function(){
         $('.priceroomtypeSelect').change(function(){
             var selectedpricetype = $(".priceroomtypeSelect option:selected").text();
             data.forEach(function(d) {
                 if ( selectedpricetype === 'Daily Price' ) {
                    d.Avg            = +d.Avg_Daily_Price;
                 } else if ( selectedpricetype === 'Weekly Price' ) {
                       d.Avg            = +d.Avg_Weekly_Price;
                 } else if ( selectedpricetype === 'Monthly Price' ) {
                       d.Avg            = +d.Avg_Monthly_Price;
                 } else {
                    d.Avg            = +d.Avg_Monthly_Price;
                 }
             });
             update(data,false);
         });
      });
   }); //d3.json

   var y;
   function update(data,drawAxis) {
   
      //x scale
      var x = d3.scaleBand()
              .domain(data.map(function(d){
                 return d.Avg_price_roomtype;
              }))
              .range([0, width])
              .padding(0.5);

      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.Avg_Monthly_Price;
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
            .attr('x', (d) => x(d.Avg_price_roomtype) - 8) 
            .attr('width', x.bandwidth() + 17)
            })
            
          .on("mouseleave", function (actual, i) {
            d3.select(this).attr("opacity", 2)
            .attr('x', (d) => x(d.Avg_price_roomtype))
            .attr('width', x.bandwidth())
         })
           .attr("class","enter")
           .merge(rects)
           .transition(a)
                .attr("y", function(d){return y(d.Avg); })
                .attr("x", function(d){return x(d.Avg_price_roomtype); })
                .attr("height", function(d){return height - y(d.Avg); })
                .attr("width", x.bandwidth)

        chart.selectAll("rect").attr("fill", function() { return (PickedColor($(".priceroomtypeSelect option:selected").text())); });

   } //update
} // AveragePriceRoomtypeplot


 AveragePriceRoomtypeplot("#Avg_price3");
 

 // Chart 4 - Treemap chart for propertype and roomtype
google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart2);

function drawChart2() {
var data = new google.visualization.DataTable();
data.addColumn('string', 'Property');
data.addColumn('string', 'Airbnb in New York City');
data.addColumn('number', 'Avg_Daily_Price');
data.addRows([
   ['Airbnb in New York City', null , 160],

['Entire home/apt', 'Airbnb in New York City', 209],
['Aparthotel (Entire home/apt)','Entire home/apt',219],
['Apartment (Entire home/apt)','Entire home/apt',194],
['Barn (Entire home/apt)','Entire home/apt',175],
['Bed and breakfast (Entire home/apt)','Entire home/apt',123],
['Boat (Entire home/apt)','Entire home/apt',1071],
['Boutique hotel (Entire home/apt)','Entire home/apt',189],
['Bungalow (Entire home/apt)','Entire home/apt',224],
['Bus (Entire home/apt)','Entire home/apt',151],
['Camper/RV (Entire home/apt)','Entire home/apt',99],
['Casa particular (Cuba) (Entire home/apt)','Entire home/apt',160],
['Cave (Entire home/apt)','Entire home/apt',129],
['Condominium (Entire home/apt)','Entire home/apt',282],
['Cottage (Entire home/apt)','Entire home/apt',191],
['Earth house (Entire home/apt)','Entire home/apt',45],
['Guest suite (Entire home/apt)','Entire home/apt',128],
['Guesthouse (Entire home/apt)','Entire home/apt',162],
['House (Entire home/apt)','Entire home/apt',249],
['Houseboat (Entire home/apt)','Entire home/apt',382],
['Island (Entire home/apt)','Entire home/apt',750],
['Lighthouse (Entire home/apt)','Entire home/apt',199],
['Loft (Entire home/apt)','Entire home/apt',298],
['Other (Entire home/apt)','Entire home/apt',243],
['Resort (Entire home/apt)','Entire home/apt',634],
['Serviced apartment (Entire home/apt)','Entire home/apt',277],
['Tent (Entire home/apt)','Entire home/apt',311],
['Timeshare (Entire home/apt)','Entire home/apt',425],
['Tiny house (Entire home/apt)','Entire home/apt',111],
['Townhouse (Entire home/apt)','Entire home/apt',353],
['Villa (Entire home/apt)','Entire home/apt',439],

['Hotel room', 'Airbnb in New York City', 293],
['Aparthotel (Hotel room)','Hotel room',288],
['Bed and breakfast (Hotel room)','Hotel room',172],
['Boutique hotel (Hotel room)','Hotel room',407],
['Hostel (Hotel room)','Hotel room',85],
['Hotel (Hotel room)','Hotel room',205],
['Resort (Hotel room)','Hotel room',270],
['Serviced apartment (Hotel room)','Hotel room',346],

['Private room', 'Airbnb in New York City', 106],
['Aparthotel (Private room)','Private room',421],
['Apartment (Private room)','Private room',86],
['Barn (Private room)','Private room',90],
['Bed and breakfast (Private room)','Private room',99],
['Boutique hotel (Private room)','Private room',1786],
['Bungalow (Private room)','Private room',50],
['Bus (Private room)','Private room',200],
['Cabin (Private room)','Private room',77],
['Casa particular (Cuba) (Private room)','Private room',51],
['Castle (Private room)','Private room',83],
['Cave (Private room)','Private room',238],
['Condominium (Private room)','Private room',106],
['Cottage (Private room)','Private room',57],
['Dome house (Private room)','Private room',53],
['Dorm (Private room)','Private room',38],
['Earth house (Private room)','Private room',78],
['Farm stay (Private room)','Private room',70],
['Guest suite (Private room)','Private room',87],
['Guesthouse (Private room)','Private room',87],
['Hostel (Private room)','Private room',99],
['Hotel (Private room)','Private room',607],
['House (Private room)','Private room',68],
['In-law (Private room)','Private room',40],
['Island (Private room)','Private room',80],
['Lighthouse (Private room)','Private room',800],
['Loft (Private room)','Private room',102],
['Other (Private room)','Private room',242],
['Resort (Private room)','Private room',537],
['Serviced apartment (Private room)','Private room',129],
['Tent (Private room)','Private room',195],
['Tiny house (Private room)','Private room',71],
['Townhouse (Private room)','Private room',74],
['Train (Private room)','Private room',30],
['Treehouse (Private room)','Private room',44],
['Villa (Private room)','Private room',56],
['Yurt (Private room)','Private room',75],

['Shared room', 'Airbnb in New York City', 85],
['Aparthotel (Shared room)','Shared room',23],
['Apartment (Shared room)','Shared room',86],
['Bed and breakfast (Shared room)','Shared room',82],
['Boat (Shared room)','Shared room',1000],
['Boutique hotel (Shared room)','Shared room',85],
['Bungalow (Shared room)','Shared room',23],
['Condominium (Shared room)','Shared room',68],
['Earth house (Shared room)','Shared room',38],
['Guest suite (Shared room)','Shared room',64],
['Guesthouse (Shared room)','Shared room',76],
['Hostel (Shared room)','Shared room',52],
['House (Shared room)','Shared room',46],
['Loft (Shared room)','Shared room',286],
['Other (Shared room)','Shared room',60],
['Serviced apartment (Shared room)','Shared room',40],
['Tent (Shared room)','Shared room',119],
['Townhouse (Shared room)','Shared room',37],


]);

var tree = new google.visualization.TreeMap(document.getElementById('Avg_price4'));


var options = {
  highlightOnMouseOver: true,
  maxDepth: 1,
  maxPostDepth: 1,
  minHighlightColor: '#6992cf',
  midHighlightColor: '#97afd1',
  maxHighlightColor: '#c0c7d1',
  minColor: '#029662',
  midColor: '#dbd9d9',
  maxColor: '#ee8100',
  headerHeight: 25,
  height: 500,
  useWeightedAverageForAggregation: true,
  showScale: true,
  generateTooltip: showStaticTooltip

};

  tree.draw(data, options);
  function showStaticTooltip(row, size, value) {
   return '<div style="background:rgba(0, 0, 0, 0.8); padding:10px; color: #fff">' + "<strong>Type: </strong><span style='color:#FCA031'>" +  data.getValue(row,0) + "</span></br>" + 
   "<strong>Daily price</strong><span style='color:#FCA031'>" + ': ' +  d3.format("$,.0f")(data.getValue(row,2)) + "</span></br>" ;
  }

 }

// Chart5 - Airbnb Average Price for review rating
function ReviewratingCode(code) {
   var ReviewratingDict = {
      "high":"high",
      "moderate":"moderate",
      "low":"low",
   };
   return ReviewratingDict[code];
}

function AveragePriceReviewratingplot(chartArea) {
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
                    var text  = "<strong>Daily price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Daily_Price) + "</span></br>";
                        text += "<strong>Weekly price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Weekly_Price) + "</span></br>";
                        text += "<strong>Monthly price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Price) + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "16px") 
           .style("text-decoration", "none")  
           .text("Average Price at different review ratings");

   //x label
   chart.append("text")
         .attr("y", height + margin.top)
         .attr("x", width/2)
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .text("Review score rating");


   //y label
   chart.append("text")
         .attr("y", -55)
         .attr("x", -(height/2))
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .attr("transform", "rotate(-90)")
         .text("Average price ($)");


   //Read in the data
   d3.json("data_json/Avg_price_Reviewrating.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.Avg_Daily_Price      = +d.Avg_Daily_Price;
         d.Avg_Weekly_Price      = +d.Avg_Weekly_Price;
         d.Avg_Monthly_Price      = +d.Avg_Monthly_Price;          
         d.Avg        = +d.Avg_Monthly_Price;
         d.Avg_price_Reviewrating = ReviewratingCode(d.Review_Scores_Rating);
      });

      update(data,true);


      $(document).ready(function(){
         $('.priceReviewratingSelect').change(function(){
             var selectedpricetype = $(".priceReviewratingSelect option:selected").text();
             data.forEach(function(d) {
                 if ( selectedpricetype === 'Daily Price' ) {
                    d.Avg            = +d.Avg_Daily_Price;
                 } else if ( selectedpricetype === 'Weekly Price' ) {
                       d.Avg            = +d.Avg_Weekly_Price;
                 } else if ( selectedpricetype === 'Monthly Price' ) {
                       d.Avg            = +d.Avg_Monthly_Price;
                 } else {
                    d.Avg            = +d.Avg_Monthly_Price;
                 }
             });
             update(data,false);
         });
      });
   }); //d3.json
   
   var y;
   function update(data,drawAxis) {
   
      //x scale
      var x = d3.scaleBand()
              .domain(data.map(function(d){
                 return d.Avg_price_Reviewrating;
              }))
              .range([0, width])
              .padding(1.0);


      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.Avg_Monthly_Price;
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

      var circles = chart.selectAll("circle").data(data)

      var a = d3.transition().duration(1000);

      //Exit old elements not present in the new data
      circles.exit()
          .attr("class","exit")
          .remove();
      
      circles.enter()
          .append("circle")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .on("mouseenter", function (actual, i) {
            d3.select(this).attr("opacity", 0.5)
            .attr('cx', (d) => x(d.Avg_price_Reviewrating)) 
            .attr('r', 25)
            })
          .on("mouseleave", function (actual, i) {
               d3.select(this).attr("opacity", 2)
               .attr('cx', (d) => x(d.Avg_price_Reviewrating))
               .attr('r', 15)
            })
   
          .attr("class","enter")
          .merge(circles)
          .transition(a)
               .attr("cy", function(d){return y(d.Avg); })
               .attr("cx", function(d){return x(d.Avg_price_Reviewrating); })
               .attr("r", 15);  
               

       chart.selectAll("circle").attr("fill", function() { return (PickedColor($(".priceReviewratingSelect option:selected").text())); });


   } //update
} // AveragePriceRoomtypeplot


 AveragePriceReviewratingplot("#Avg_price5");

 // Chart6 - Airbnb Average Price for Availability level
function AvailabilityCode(code) {
   var AvailabilityDict = {
      "high.":"high.",
      "low.":"low.",
   };
   return AvailabilityDict[code];
}

function AveragePriceAvailabilityplot(chartArea) {
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
                    var text  = "<strong>Daily price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Daily_Price) + "</span></br>";
                        text += "<strong>Weekly price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Weekly_Price) + "</span></br>";
                        text += "<strong>Monthly price: </strong><span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Price) + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "16px") 
           .style("text-decoration", "none")  
           .text("Average Price by Availability");

   //x label
   chart.append("text")
         .attr("y", height + margin.top)
         .attr("x", width/2)
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .text("Availability (1 year)");


   //y label
   chart.append("text")
         .attr("y", -55)
         .attr("x", -(height/2))
         .attr("font-size", "17px")
         .attr("text-anchor", "middle")
         .attr("transform", "rotate(-90)")
         .text("Average price ($)");


   //Read in the data
   d3.json("data_json/Avg_price_Availability.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.Avg_Daily_Price      = +d.Avg_Daily_Price;
         d.Avg_Weekly_Price      = +d.Avg_Weekly_Price;
         d.Avg_Monthly_Price      = +d.Avg_Monthly_Price;          
         d.Avg        = +d.Avg_Monthly_Price;
         d.Avg_price_Availability = AvailabilityCode(d.Availability_Level);
      });

      update(data,true);


      $(document).ready(function(){
         $('.priceReviewratingSelect').change(function(){
             var selectedpricetype = $(".priceReviewratingSelect option:selected").text();
             data.forEach(function(d) {
                 if ( selectedpricetype === 'Daily Price' ) {
                    d.Avg            = +d.Avg_Daily_Price;
                 } else if ( selectedpricetype === 'Weekly Price' ) {
                       d.Avg            = +d.Avg_Weekly_Price;
                 } else if ( selectedpricetype === 'Monthly Price' ) {
                       d.Avg            = +d.Avg_Monthly_Price;
                 } else {
                    d.Avg            = +d.Avg_Monthly_Price;
                 }
             });
             update(data,false);
         });
      });
   }); //d3.json
   
   var y;
   function update(data,drawAxis) {
   
      //x scale
      var x = d3.scaleBand()
              .domain(data.map(function(d){
                 return d.Avg_price_Availability;
              }))
              .range([0, width])
              .padding(1.0);


      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.Avg_Monthly_Price;
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

      var circles = chart.selectAll("circle").data(data)

      var a = d3.transition().duration(1000);

      //Exit old elements not present in the new data
      circles.exit()
          .attr("class","exit")
          .remove();
      
      circles.enter()
          .append("circle")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .on("mouseenter", function (actual, i) {
            d3.select(this).attr("opacity", 0.5)
            .attr('cx', (d) => x(d.Avg_price_Availability)) 
            .attr('r', 25)
            })
          .on("mouseleave", function (actual, i) {
               d3.select(this).attr("opacity", 2)
               .attr('cx', (d) => x(d.Avg_price_Availability))
               .attr('r', 15)
            })
   
          .attr("class","enter")
          .merge(circles)
          .transition(a)
               .attr("cy", function(d){return y(d.Avg); })
               .attr("cx", function(d){return x(d.Avg_price_Availability); })
               .attr("r", 15);  
               

       chart.selectAll("circle").attr("fill", function() { return (PickedColor($(".priceReviewratingSelect option:selected").text())); });
   } //update
} // AveragePriceAvailabilityplot


 AveragePriceAvailabilityplot("#Avg_price6");


 // chart 7
 





