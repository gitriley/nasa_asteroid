
var formatNumber = function(x) {
    x = Math.round(x);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var today;
//Get today's date
function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
     
    if (dd<'10') {
        dd='0'+dd
    }
    if (mm<10) {
        mm='0'+mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    $("#date").val(today);  
};

window.onload = getDate;

var asteroid = [];
var dateList = [];

//svg dot data
var nameList = [];
var radiusList = [];
var colorList = [];
var missDistanceList = [];
var speedList = [];
var eachSvgData = [];
var distanceColor = [];
var svgRadiusList = [];

var doSearch = function() {
    $("#nasa_info").empty();
    var url = 'https://api.nasa.gov/neo/rest/v1/feed';
    $.getJSON(url,
        {
            'start_date': $("#date").val(),
            'api_key': 'gZZU7G8iVeCIEEX6uhVpuTdupeAvUniyPFBg9HWf'            
        }, function(data) {
                dateList = data.near_earth_objects;
                asteroid = data.near_earth_objects["2016-10-24"];
                console.log(data);
                dateList = Object.keys(data.near_earth_objects);
                dateList.sort();

                //loop through datelist i and individual asteroid
                for (k=0; k < dateList.length; k++) {
                    var date = dateList[k];
                    var outputDate= "<p><b>" + date + "</b><br>";
                    $("#nasa_info").append(outputDate);
                    var astCount = data.near_earth_objects[dateList[k]].length;
                
                    for (i=0; i < astCount; i++) {
                        var name = data.near_earth_objects[dateList[k]][i].name;
                        var diameterMax = data.near_earth_objects[dateList[k]][i].estimated_diameter.feet.estimated_diameter_max;
                        var diameterMin = data.near_earth_objects[dateList[k]][i].estimated_diameter.feet.estimated_diameter_min;
                        var diameterAvg = (diameterMax + diameterMin)/2;
                        var miss = data.near_earth_objects[dateList[k]][i].close_approach_data[0].miss_distance.miles;
                        var mph = data.near_earth_objects[dateList[k]][i].close_approach_data[0].relative_velocity.miles_per_hour;
                        
                        //push info into arrays
                        nameList.push(name);
                        radiusList.push(diameterAvg);
                        missDistanceList.push(miss);
                        speedList.push(mph);

                        //moving all data into a D3-ready array
                        eachSvgData = d3.zip (nameList, radiusList, missDistanceList, speedList);

                      /*  var outputInfo = "Asteroid " + name + " will miss earth by " 
                            + formatNumber(parseInt(miss)) 
                            + " miles <br>" + "it is traveling at " + formatNumber(parseInt(mph)) 
                            + " miles per hour! <br><br>";
                        $("#nasa_info").append(outputInfo);  */
                    }
                    
                    makeDots();
                    nameList.length = 0;
                    radiusList.length = 0;
                    missDistanceList.length = 0;
                    speedList.length = 0;
                    eachSvgData.length = 0;

                }
            }
    );
};

var makeDots = function() {  
    var carryOver = 0;  
    var radius = 0;
    var svgRadiusList = [];
    d3.select("#nasa_info")
      .append("svg")
      .attr("viewBox", "0 0 500 150")
     // .attr("preserveAspectRatio", "xMinYMid meet")
      .selectAll("circle")
        .data(eachSvgData)
      .enter().append("circle")
        .style("fill", function(d) {
                var returnColor;
                if (d[2] < 400000) { 
                    returnColor = "red";
                } else if (d[2] > 20000000) {
                    // h value between 0 and 0.7
                    //distanceColor = d[2] * .000001 + 250;
                    returnColor = "hsl(257, 100%, 90%)";
                }  else if (d[2] > 7000000 && d[2] < 20000000) {
                    returnColor = "hsl(257, 100%, 80%)";
                } else if (d[2] > 1000000 && d[2] < 7000000) {
                    returnColor = "hsl(257, 100%, 70%)";
                } else if (d[2] > 400000 && d[2] < 1000000) {
                    returnColor = "hsl(257, 100%, 50%)";
                } 
                return returnColor;
            })
        .attr("cy", "50%")
        .attr("cx", function(d, i) {
            carryOver = 0;
            var radius = (Math.sqrt(d[1])/2);
            svgRadiusList.push(radius);
            for (var i=0; i<svgRadiusList.length; i++) {
                var p = i-1;
                if (p < 0) {
                    p = 0;
                }
                carryOver = carryOver + svgRadiusList[i] + svgRadiusList[p] + 10;
            
                d3.select(this.parentNode)
                .attr("viewBox", svgRadiusList[0] + " 0 1000 150");
                   
            }
           // var total = carryOver;
            console.log("radius: " + radius);
            console.log("radius list: " + svgRadiusList);
            console.log("carryOver: " + carryOver);
            return carryOver; })

        //    return i * 80 + 30; })
        .attr("r", function(d) { 
            var radius = Math.sqrt(d[1])/2;
            if (radius > 70) {
                d3.select(this.parentNode)
                .attr("viewBox", "0 0 1000 200");
            }
            return radius; 
        })
        .on("mouseover", function(d) {      
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Name: " + d[0] + "<br> Estimated Diameter: " + formatNumber(parseInt(d[1])) + " feet <br> Speed: "  + formatNumber(parseInt(d[3])) + " mph <br>"
                        + "Miss Distance: " + formatNumber(parseInt(d[2])) + " miles")  
                    .style("left", (d3.event.pageX - 30) + "px")        
                    .style("top", (d3.event.pageY - 108) + "px");    
                })                  
            .on("mouseout", function(d) {       
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            })
            .on("click", function(d) {      
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Name: " + d[0] + "<br> Estimated Diameter: " + formatNumber(parseInt(d[1])) + " feet <br> Speed: "  + formatNumber(parseInt(d[3])) + " mph <br>"
                        + "Miss Distance: " + formatNumber(parseInt(d[2])) + " miles")  
                    .style("left", (d3.event.pageX - 30) + "px")        
                    .style("top", (d3.event.pageY - 108) + "px");    
                });
    d3.select("svg")
};

// Define the div for the tooltip
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var previous = function (e) {
    if(responseData.previous) {
       doSearch(e, responseData.previous);
    }
};

var next = function (e) {
    if(responseData.next) {
       doSearch(e, responseData.next);
    }
};

$("#search").click(doSearch);
$("#next").click(next);
$("#previous").click(previous);