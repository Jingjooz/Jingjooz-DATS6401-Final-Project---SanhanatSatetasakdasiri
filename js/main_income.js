
// Chart1 - Airbnb Average income at each area of NYC 
function PickedColor(incometype) {
    var fill;
    switch(incometype) {
      case "Monthly Income":
         fill = "#F66863";
         break;
      case "Yearly Income":
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


function AverageIncomeNeighbourhoodplot(chartArea) {
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
                     var text  = "Monthly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Income) + "</span></br>";
                         text += "Yearly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Yearly_Income) + "</span></br>";
                     return text;
                  })
    chart.call(tip);

    chart.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "none")  
            .text("Airbnb Average income(est.) at each area of NYC");

    //x label
    chart.append("text")
          .attr("y", height + margin.top)
          .attr("x", width/2)
          .attr("font-size", "17px")
          .attr("text-anchor", "middle")
          .text("Neighbourhood");


    //y label
    chart.append("text")
          .attr("y", -55)
          .attr("x", -(height/2))
          .attr("font-size", "17px")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .text("Average income ($)");


    //Read in the data
    d3.json("data_json/Avg_income_Neighbourhood.json").then( function(data) {
    
       // ensure Ava is cast as integer
       data.forEach(function(d) {
          d.Avg_Monthly_Income      = +d.Avg_Monthly_Income;   
          d.Avg_Yearly_Income      = +d.Avg_Yearly_Income;       
          d.Avg        = +d.Avg_Yearly_Income;
          d.Avg_income_neighbourhood = neighbourhoodCode(d.Neighbourhood);
       });

       update(data,true);


       $(document).ready(function(){
          $('.incometypeSelect').change(function(){
              var selectedincometype = $(".incometypeSelect option:selected").text();
              data.forEach(function(d) {
                  if ( selectedincometype === 'Monthly Income' ) {
                     d.Avg            = +d.Avg_Monthly_Income;
                  } else if ( selectedincometype === 'Yearly Income' ) {
                        d.Avg            = +d.Avg_Yearly_Income;
                  } else {
                     d.Avg            = +d.Avg_Yearly_Income;
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
                  return d.Avg_income_neighbourhood;
               }))
               .range([0, width])
               .padding(0.5);

       if (drawAxis) {
       //y scale
       y = d3.scaleLinear()
               .domain([0, d3.max(data, function(d){
                  return d.Avg_Yearly_Income;
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
            .attr('x', (d) => x(d.Avg_income_neighbourhood) - 8) 
            .attr('width', x.bandwidth() + 15)
            })
            
          .on("mouseleave", function (actual, i) {
            d3.select(this).attr("opacity", 2)
            .attr('x', (d) => x(d.Avg_income_neighbourhood))
            .attr('width', x.bandwidth())
         })
           .attr("class","enter")
           .merge(rects)
           .transition(a)
                .attr("y", function(d){return y(d.Avg); })
                .attr("x", function(d){return x(d.Avg_income_neighbourhood); })
                .attr("height", function(d){return height - y(d.Avg); })
                .attr("width", x.bandwidth)

        chart.selectAll("rect").attr("fill", function() { return (PickedColor($(".incometypeSelect option:selected").text())); });

    } //update
} //Avg_incomechart1

AverageIncomeNeighbourhoodplot("#Avg_income1");


// Chart 2 - Treemap income chart for each area
google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
var data = new google.visualization.DataTable();
data.addColumn('string', 'Subeighbourhood');
data.addColumn('string', 'Airbnb in New York City');
data.addColumn('number', 'Avg_Monthly_Price');
data.addRows([
   ['Airbnb in New York City', null , 2222],

['Bronx', 'Airbnb in New York City', 1375],
['Woodlawn','Bronx',1064],
['Williamsbridge','Bronx',1404],
['Westchester Square','Bronx',1078],
['West Farms','Bronx',1252],
['Wakefield','Bronx',1589],
['Van Nest','Bronx',2542],
['University Heights','Bronx',972],
['Unionport','Bronx',3079],
['Tremont','Bronx',1218],
['Throgs Neck','Bronx',1542],
['Spuyten Duyvil','Bronx',1310],
['Soundview','Bronx',832],
['Schuylerville','Bronx',994],
['Riverdale','Bronx',2411],
['Port Morris','Bronx',1300],
['Pelham Gardens','Bronx',1684],
['Pelham Bay','Bronx',1416],
['Parkchester','Bronx',992],
['Olinville','Bronx',1192],
['Norwood','Bronx',1131],
['North Riverdale','Bronx',1575],
['Mount Hope','Bronx',1180],
['Mount Eden','Bronx',763],
['Mott Haven','Bronx',1488],
['Morrisania','Bronx',1291],
['Morris Park','Bronx',810],
['Morris Heights','Bronx',1054],
['Melrose','Bronx',901],
['Longwood','Bronx',1363],
['Kingsbridge','Bronx',1007],
['Hunts Point','Bronx',806],
['Highbridge','Bronx',1264],
['Fordham','Bronx',1201],
['Fieldston','Bronx',4584],
['Edenwald','Bronx',1353],
['Eastchester','Bronx',1471],
['East Morrisania','Bronx',1588],
['Country Club','Bronx',11025],
['Concourse Village','Bronx',1046],
['Concourse','Bronx',1318],
['Co-op City','Bronx',304],
['Clason Point','Bronx',980],
['Claremont Village','Bronx',1390],
['City Island','Bronx',1875],
['Castle Hill','Bronx',1551],
['Bronxdale','Bronx',1376],
['Belmont','Bronx',1763],
['Baychester','Bronx',1390],
['Allerton','Bronx',1368],

['Brooklyn', 'Airbnb in New York City', 1601],
['Windsor Terrace','Brooklyn',1716],
['Williamsburg','Brooklyn',1839],
['Vinegar Hill','Brooklyn',1852],
['Sunset Park','Brooklyn',1293],
['South Slope','Brooklyn',1631],
['Sheepshead Bay','Brooklyn',1506],
['Sea Gate','Brooklyn',5452],
['Red Hook','Brooklyn',1651],
['Prospect-Lefferts Gardens','Brooklyn',1337],
['Prospect Heights','Brooklyn',1551],
['Park Slope','Brooklyn',2114],
['Navy Yard','Brooklyn',1523],
['Mill Basin','Brooklyn',2080],
['Midwood','Brooklyn',1116],
['Manhattan Beach','Brooklyn',17359],
['Kensington','Brooklyn',1027],
['Greenpoint','Brooklyn',1589],
['Gravesend','Brooklyn',1287],
['Gowanus','Brooklyn',2061],
['Gerritsen Beach','Brooklyn',2520],
['Fort Hamilton','Brooklyn',1162],
['Fort Greene','Brooklyn',1837],
['Flatlands','Brooklyn',1383],
['Flatbush','Brooklyn',1164],
['East New York','Brooklyn',1537],
['East Flatbush','Brooklyn',1592],
['Dyker Heights','Brooklyn',1227],
['DUMBO','Brooklyn',2972],
['Downtown Brooklyn','Brooklyn',2406],
['Cypress Hills','Brooklyn',1471],
['Crown Heights','Brooklyn',1508],
['Coney Island','Brooklyn',1114],
['Columbia St','Brooklyn',2159],
['Cobble Hill','Brooklyn',2072],
['Clinton Hill','Brooklyn',2114],
['Carroll Gardens','Brooklyn',1830],
['Canarsie','Brooklyn',1606],
['Bushwick','Brooklyn',1147],
['Brownsville','Brooklyn',1371],
['Brooklyn Heights','Brooklyn',2374],
['Brighton Beach','Brooklyn',2132],
['Borough Park','Brooklyn',899],
['Boerum Hill','Brooklyn',2427],
['Bergen Beach','Brooklyn',1785],
['Bensonhurst','Brooklyn',1184],
['Bedford-Stuyvesant','Brooklyn',1543],
['Bay Ridge','Brooklyn',1518],
['Bath Beach','Brooklyn',1245],

['Manhattan', 'Airbnb in New York City', 3066],
['West Village','Manhattan',3453],
['Washington Heights','Manhattan',1152],
['Upper West Side','Manhattan',2800],
['Upper East Side','Manhattan',2551],
['Two Bridges','Manhattan',1904],
['Tribeca','Manhattan',5497],
['Theater District','Manhattan',7422],
['Stuyvesant Town','Manhattan',4544],
['SoHo','Manhattan',4779],
['Roosevelt Island','Manhattan',1396],
['Nolita','Manhattan',2680],
['NoHo','Manhattan',3070],
['Murray Hill','Manhattan',3808],
['Morningside Heights','Manhattan',1170],
['Midtown','Manhattan',6297],
['Marble Hill','Manhattan',968],
['Lower East Side','Manhattan',3919],
['Little Italy','Manhattan',3402],
['Kips Bay','Manhattan',3013],
['Inwood','Manhattan',1011],
['HellKitchen','Manhattan',3641],
['Harlem','Manhattan',1605],
['Greenwich Village','Manhattan',3634],
['Gramercy','Manhattan',3514],
['Flatiron District','Manhattan',4824],
['Financial District','Manhattan',3331],
['East Village','Manhattan',2401],
['East Harlem','Manhattan',1910],
['Civic Center','Manhattan',3007],
['Chinatown','Manhattan',3614],
['Chelsea','Manhattan',2979],
['Battery Park City','Manhattan',5202],

['Queens', 'Airbnb in New York City', 1449],
['Woodside','Queens',1162],
['Woodhaven','Queens',1151],
['Whitestone','Queens',1246],
['Sunnyside','Queens',1202],
['St. Albans','Queens',1601],
['Springfield Gardens','Queens',1744],
['South Ozone Park','Queens',1402],
['Rosedale','Queens',1290],
['Rockaway Beach','Queens',2099],
['Ridgewood','Queens',1100],
['Richmond Hill','Queens',1332],
['Rego Park','Queens',1214],
['Queens Village','Queens',1586],
['Ozone Park','Queens',1469],
['Neponsit','Queens',4369],
['Middle Village','Queens',1444],
['Maspeth','Queens',1413],
['Long Island City','Queens',1770],
['Little Neck','Queens',920],
['Laurelton','Queens',1305],
['Kew Gardens Hills','Queens',1405],
['Kew Gardens','Queens',1499],
['Jamaica Hills','Queens',2443],
['Jamaica Estates','Queens',3831],
['Jamaica','Queens',1494],
['Jackson Heights','Queens',1323],
['Howard Beach','Queens',1774],
['Holliswood','Queens',3379],
['Hollis','Queens',1417],
['Glendale','Queens',1163],
['Fresh Meadows','Queens',1553],
['Forest Hills','Queens',1837],
['Flushing','Queens',1600],
['Far Rockaway','Queens',2472],
['Elmhurst','Queens',1140],
['Edgemere','Queens',1218],
['East Elmhurst','Queens',1474],
['Douglaston','Queens',1787],
['Ditmars Steinway','Queens',1457],
['Corona','Queens',986],
['College Point','Queens',1326],
['Cambria Heights','Queens',1385],
['Briarwood','Queens',1329],
['Breezy Point','Queens',2056],
['Bellerose','Queens',917],
['Belle Harbor','Queens',2503],
['Bayswater','Queens',1264],
['Bayside','Queens',2028],
['Bay Terrace','Queens',1228],
['Astoria','Queens',1393],
['Arverne','Queens',2254],

['Staten Island', 'Airbnb in New York City', 1687],
['Woodrow','Staten Island',14700],
['Willowbrook','Staten Island',3597],
['Westerleigh','Staten Island',1098],
['West Brighton','Staten Island',1258],
['Tottenville','Staten Island',2242],
['Tompkinsville','Staten Island',1328],
['Todt Hill','Staten Island',551],
['Stapleton','Staten Island',1715],
['St. George','Staten Island',2392],
['South Beach','Staten Island',748],
['Silver Lake','Staten Island',1470],
['Shore Acres','Staten Island',1803],
['Rossville','Staten Island',1229],
['Rosebank','Staten Island',1874],
['Richmondtown','Staten Island',1429],
['Randall Manor','Staten Island',2199],
['PrinceBay','Staten Island',9630],
['Port Richmond','Staten Island',1088],
['Port Ivory','Staten Island',1217],
['Oakwood','Staten Island',1165],
['New Springville','Staten Island',1555],
['New Dorp Beach','Staten Island',1048],
['New Dorp','Staten Island',1197],
['New Brighton','Staten Island',1108],
['Midland Beach','Staten Island',1170],
['Mariners Harbor','Staten Island',1484],
['Lighthouse Hill','Staten Island',2150],
['Huguenot','Staten Island',3780],
['Howland Hook','Staten Island',813],
['Grymes Hill','Staten Island',1739],
['Great Kills','Staten Island',1590],
['Grant City','Staten Island',1054],
['Graniteville','Staten Island',1219],
['Fort Wadsworth','Staten Island',16800],
['Emerson Hill','Staten Island',1651],
['Eltingville','Staten Island',959],
['Dongan Hills','Staten Island',1967],
['Concord','Staten Island',1019],
['Clifton','Staten Island',1198],
['Castleton Corners','Staten Island',1295],
['BullHead','Staten Island',1156],
['Bay Terrace, Staten Island','Staten Island',95],
['Arrochar','Staten Island',1216],
['Arden Heights','Staten Island',1492]


]);

var tree = new google.visualization.TreeMap(document.getElementById('Avg_income2'));

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
   "<strong>Monthly income</strong><span style='color:#FCA031'>" + ': ' +  d3.format("$,.0f")(data.getValue(row,2)) + "</span></br>" ;
  }

 }


// Chart3 - Airbnb Average Income for roomtype
function roomtypeCode(code) {
   var roomtypeDict = {
      "Shared room":"Shared room",
      "Private room":"Private room",
      "Hotel room":"Hotel room",
      "Entire home/apt":"Entire home/apt",
   };
   return roomtypeDict[code];
}


function AverageIncomeRoomtypeplot(chartArea) {
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
                     var text  = "Monthly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Income) + "</span></br>";
                         text += "Yearly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Yearly_Income) + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "16px") 
           .style("text-decoration", "none")  
           .text("Airbnb Average Income by room type");

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
         .text("Average income ($)");


   //Read in the data
   d3.json("data_json/Avg_income_Roomtype.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.Avg_Monthly_Income      = +d.Avg_Monthly_Income;   
         d.Avg_Yearly_Income      = +d.Avg_Yearly_Income;       
         d.Avg        = +d.Avg_Yearly_Income;
         d.Avg_income_roomtype = roomtypeCode(d.Room_Type);
      });

      update(data,true);


      $(document).ready(function(){
         $('.incomeroomtypeSelect').change(function(){
              var selectedincometype = $(".incomeroomtypeSelect option:selected").text();
              data.forEach(function(d) {
                  if ( selectedincometype === 'Monthly Income' ) {
                     d.Avg            = +d.Avg_Monthly_Income;
                  } else if ( selectedincometype === 'Yearly Income' ) {
                        d.Avg            = +d.Avg_Yearly_Income;
                  } else {
                     d.Avg            = +d.Avg_Yearly_Income;
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
                 return d.Avg_income_roomtype;
              }))
              .range([0, width])
              .padding(0.5);

      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.Avg_Yearly_Income;
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
            .attr('x', (d) => x(d.Avg_income_roomtype) - 8) 
            .attr('width', x.bandwidth() + 17)
            })
            
          .on("mouseleave", function (actual, i) {
            d3.select(this).attr("opacity", 2)
            .attr('x', (d) => x(d.Avg_income_roomtype))
            .attr('width', x.bandwidth())
         })
           .attr("class","enter")
           .merge(rects)
           .transition(a)
                .attr("y", function(d){return y(d.Avg); })
                .attr("x", function(d){return x(d.Avg_income_roomtype); })
                .attr("height", function(d){return height - y(d.Avg); })
                .attr("width", x.bandwidth)

        chart.selectAll("rect").attr("fill", function() { return (PickedColor($(".incomeroomtypeSelect option:selected").text())); });

   } //update
} // AverageIncomeRoomtypeplot

 AverageIncomeRoomtypeplot("#Avg_income3");
 

 // Chart 4 - Treemap income chart for propertype and roomtype
google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart2);

function drawChart2() {
var data = new google.visualization.DataTable();
data.addColumn('string', 'Property');
data.addColumn('string', 'Airbnb in New York City');
data.addColumn('number', 'Avg_Monthly_Income');
data.addRows([
   ['Airbnb in New York City', null , 2222],

['Entire home/apt', 'Airbnb in New York City', 2859],
['Aparthotel (Entire home/apt)','Entire home/apt',4599],
['Apartment (Entire home/apt)','Entire home/apt',2630],
['Barn (Entire home/apt)','Entire home/apt',2242],
['Bed and breakfast (Entire home/apt)','Entire home/apt',833],
['Boat (Entire home/apt)','Entire home/apt',21614],
['Boutique hotel (Entire home/apt)','Entire home/apt',2977],
['Bungalow (Entire home/apt)','Entire home/apt',2472],
['Bus (Entire home/apt)','Entire home/apt',136],
['Camper/RV (Entire home/apt)','Entire home/apt',2012],
['Casa particular (Cuba) (Entire home/apt)','Entire home/apt',2664],
['Cave (Entire home/apt)','Entire home/apt',1480],
['Condominium (Entire home/apt)','Entire home/apt',4034],
['Cottage (Entire home/apt)','Entire home/apt',3869],
['Earth house (Entire home/apt)','Entire home/apt',51],
['Guest suite (Entire home/apt)','Entire home/apt',2218],
['Guesthouse (Entire home/apt)','Entire home/apt',2266],
['House (Entire home/apt)','Entire home/apt',3321],
['Houseboat (Entire home/apt)','Entire home/apt',3252],
['Island (Entire home/apt)','Entire home/apt',3938],
['Lighthouse (Entire home/apt)','Entire home/apt',2036],
['Loft (Entire home/apt)','Entire home/apt',3720],
['Other (Entire home/apt)','Entire home/apt',3519],
['Resort (Entire home/apt)','Entire home/apt',9741],
['Serviced apartment (Entire home/apt)','Entire home/apt',4319],
['Tent (Entire home/apt)','Entire home/apt',3779],
['Timeshare (Entire home/apt)','Entire home/apt',650],
['Tiny house (Entire home/apt)','Entire home/apt',1746],
['Townhouse (Entire home/apt)','Entire home/apt',5112],
['Villa (Entire home/apt)','Entire home/apt',8439],

['Hotel room', 'Airbnb in New York City', 4541],
['Aparthotel (Hotel room)','Hotel room',3563],
['Bed and breakfast (Hotel room)','Hotel room',2459],
['Boutique hotel (Hotel room)','Hotel room',6377],
['Hostel (Hotel room)','Hotel room',1524],
['Hotel (Hotel room)','Hotel room',3294],
['Resort (Hotel room)','Hotel room',3919],
['Serviced apartment (Hotel room)','Hotel room',4728],

['Private room', 'Airbnb in New York City', 1501],
['Aparthotel (Private room)','Private room',6007],
['Apartment (Private room)','Private room',1148],
['Barn (Private room)','Private room',1880],
['Bed and breakfast (Private room)','Private room',1299],
['Boutique hotel (Private room)','Private room',28987],
['Bungalow (Private room)','Private room',932],
['Bus (Private room)','Private room',4200],
['Cabin (Private room)','Private room',831],
['Casa particular (Cuba) (Private room)','Private room',725],
['Castle (Private room)','Private room',1607],
['Cave (Private room)','Private room',3450],
['Condominium (Private room)','Private room',1507],
['Cottage (Private room)','Private room',1197],
['Dome house (Private room)','Private room',500],
['Dorm (Private room)','Private room',798],
['Earth house (Private room)','Private room',943],
['Farm stay (Private room)','Private room',1470],
['Guest suite (Private room)','Private room',1339],
['Guesthouse (Private room)','Private room',1553],
['Hostel (Private room)','Private room',1584],
['Hotel (Private room)','Private room',11565],
['House (Private room)','Private room',1031],
['In-law (Private room)','Private room',840],
['Island (Private room)','Private room',1680],
['Lighthouse (Private room)','Private room',16800],
['Loft (Private room)','Private room',1409],
['Other (Private room)','Private room',3772],
['Resort (Private room)','Private room',3249],
['Serviced apartment (Private room)','Private room',1892],
['Tent (Private room)','Private room',1696],
['Tiny house (Private room)','Private room',840],
['Townhouse (Private room)','Private room',1111],
['Train (Private room)','Private room',630],
['Treehouse (Private room)','Private room',564],
['Villa (Private room)','Private room',1048],
['Yurt (Private room)','Private room',1101],

['Shared room', 'Airbnb in New York City', 1283],
['Aparthotel (Shared room)','Shared room',483],
['Apartment (Shared room)','Shared room',1236],
['Bed and breakfast (Shared room)','Shared room',1467],
['Boat (Shared room)','Shared room',21000],
['Boutique hotel (Shared room)','Shared room',1631],
['Bungalow (Shared room)','Shared room',100],
['Condominium (Shared room)','Shared room',1019],
['Earth house (Shared room)','Shared room',500],
['Guest suite (Shared room)','Shared room',470],
['Guesthouse (Shared room)','Shared room',1428],
['Hostel (Shared room)','Shared room',985],
['House (Shared room)','Shared room',621],
['Loft (Shared room)','Shared room',5756],
['Other (Shared room)','Shared room',433],
['Serviced apartment (Shared room)','Shared room',284],
['Tent (Shared room)','Shared room',196],
['Townhouse (Shared room)','Shared room',517]

]);

var tree = new google.visualization.TreeMap(document.getElementById('Avg_income4'));


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
   "<strong>Monthly income</strong><span style='color:#FCA031'>" + ': ' +  d3.format("$,.0f")(data.getValue(row,2)) + "</span></br>" ;
  }

 }

// Chart5 - Airbnb Average Income for review rating
function ReviewratingCode(code) {
   var ReviewratingDict = {
      "high":"high",
      "moderate":"moderate",
      "low":"low",
   };
   return ReviewratingDict[code];
}

function AverageIncomeReviewratingplot(chartArea) {
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
                     var text  = "Monthly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Income) + "</span></br>";
                         text += "Yearly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Yearly_Income) + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "16px") 
           .style("text-decoration", "none")  
           .text("Average Income at different review ratings");

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
         .text("Average income ($)");


   //Read in the data
   d3.json("data_json/Avg_income_Reviewrating.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.Avg_Monthly_Income      = +d.Avg_Monthly_Income;   
         d.Avg_Yearly_Income      = +d.Avg_Yearly_Income;       
         d.Avg        = +d.Avg_Yearly_Income;
         d.Avg_income_Reviewrating = ReviewratingCode(d.Review_Scores_Rating);
      });

      update(data,true);


      $(document).ready(function(){
         $('.incomeReviewratingSelect').change(function(){
              var selectedincometype = $(".incomeReviewratingSelect option:selected").text();
              data.forEach(function(d) {
                  if ( selectedincometype === 'Monthly Income' ) {
                     d.Avg            = +d.Avg_Monthly_Income;
                  } else if ( selectedincometype === 'Yearly Income' ) {
                        d.Avg            = +d.Avg_Yearly_Income;
                  } else {
                     d.Avg            = +d.Avg_Yearly_Income;
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
                 return d.Avg_income_Reviewrating;
              }))
              .range([0, width])
              .padding(1.0);


      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.Avg_Yearly_Income;
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
            .attr('cx', (d) => x(d.Avg_income_Reviewrating)) 
            .attr('r', 25)
            })
          .on("mouseleave", function (actual, i) {
               d3.select(this).attr("opacity", 2)
               .attr('cx', (d) => x(d.Avg_income_Reviewrating))
               .attr('r', 15)
            })
   
          .attr("class","enter")
          .merge(circles)
          .transition(a)
               .attr("cy", function(d){return y(d.Avg); })
               .attr("cx", function(d){return x(d.Avg_income_Reviewrating); })
               .attr("r", 15);  
               

       chart.selectAll("circle").attr("fill", function() { return (PickedColor($(".incomeReviewratingSelect option:selected").text())); });

   } //update
} // AverageIncomeReviewratingplot


 AverageIncomeReviewratingplot("#Avg_income5");

 // Chart6 - Airbnb Average Income for Availability level
function AvailabilityCode(code) {
   var AvailabilityDict = {
      "high.":"high.",
      "low.":"low.",
   };
   return AvailabilityDict[code];
}

function AverageIncomeAvailabilityplot(chartArea) {
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
                      var text  = "Monthly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Monthly_Income) + "</span></br>";
                         text += "Yearly income: <span style='color:#FCA031'>" + d3.format("$,.0f")(d.Avg_Yearly_Income) + "</span></br>";
                    return text;
                 })
   chart.call(tip);

   chart.append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "16px") 
           .style("text-decoration", "none")  
           .text("Average Income by Availability");

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
   d3.json("data_json/Avg_income_Availability.json").then( function(data) {
   
      // ensure Ava is cast as integer
      data.forEach(function(d) {
         d.Avg_Monthly_Income      = +d.Avg_Monthly_Income;   
         d.Avg_Yearly_Income      = +d.Avg_Yearly_Income;       
         d.Avg        = +d.Avg_Yearly_Income;
         d.Avg_income_Availability = AvailabilityCode(d.Availability_Level);
      });

      update(data,true);


      $(document).ready(function(){
         $('.incomeReviewratingSelect').change(function(){
              var selectedincometype = $(".incomeReviewratingSelect option:selected").text();
              data.forEach(function(d) {
                  if ( selectedincometype === 'Monthly Income' ) {
                     d.Avg            = +d.Avg_Monthly_Income;
                  } else if ( selectedincometype === 'Yearly Income' ) {
                        d.Avg            = +d.Avg_Yearly_Income;
                  } else {
                     d.Avg            = +d.Avg_Yearly_Income;
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
                 return d.Avg_income_Availability;
              }))
              .range([0, width])
              .padding(1.0);


      if (drawAxis) {
      //y scale
      y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d){
                 return d.Avg_Yearly_Income;
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
            .attr('cx', (d) => x(d.Avg_income_Availability)) 
            .attr('r', 25)
            })
          .on("mouseleave", function (actual, i) {
               d3.select(this).attr("opacity", 2)
               .attr('cx', (d) => x(d.Avg_income_Availability))
               .attr('r', 15)
            })
   
          .attr("class","enter")
          .merge(circles)
          .transition(a)
               .attr("cy", function(d){return y(d.Avg); })
               .attr("cx", function(d){return x(d.Avg_income_Availability); })
               .attr("r", 15);  
               

       chart.selectAll("circle").attr("fill", function() { return (PickedColor($(".incomeReviewratingSelect option:selected").text())); });

   } //update
} // AverageIncomeAvailabilityplot


 AverageIncomeAvailabilityplot("#Avg_income6");


 // formula box (hide)
 function myFunction() {
   var x = document.getElementById("myDIV");
   if (x.style.display === "none") {
     x.style.display = "block";
   } else {
     x.style.display = "none";
   }
 }