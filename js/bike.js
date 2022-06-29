//function to instantiate the Leaflet map
function createMap(){
    //create the map
    const map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
}

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ff4300",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    // options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    //build popup content string
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";
    var year = attribute.split("yr")[1];
    popupContent += "<p><b>Emmisions per capita in " + year + ":</b> " + feature.properties[attribute] + " metric tonnes   </p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });
    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
    })
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}

//function to create popups
function onEachFeature(feature, layer){

    if (feature.properties && feature.properties.name) {
        var popupContent = '<p>' + feature.properties.name + '</p>'
        popupContent += feature.properties.time;
    }
    layer.bindPopup(popupContent);

    // var attribute = attributes[0];
    // var attValue = feature.properties[attribute];
    // console.log(attribute)
    // console.log(attValue)
    // if (attValue === "Afternoon Ride") {
    //     layer.setStyle({color: 'orange'})
    // }
    //
    // var layer = L.polyline(latlngs)
    // var popupContent = "<p><b>Name:</b> " + attValue + "</p>";
    // layer.bindPopup(popupContent)
    // //event listeners to open popup on hover
    // layer.on({
    //     mouseover: function(){
    //         this.openPopup();
    //     },
    //     mouseout: function(){
    //         this.closePopup();
    //     },
    // })
    // return layer;

}

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        },
    }).addTo(map);
}

function createLines(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    var routes = L.geoJson(data, {
        onEachFeature: onEachFeature
    }).addTo(map)
    map.fitBounds(routes.getBounds())
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 20;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
}

//Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#panel').append('<input class="range-slider" type="range">');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#forward').html('<img src="img/forward.png">');

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //update slider
        $('.range-slider').val(index);

        //input listener for slider
        $('.range-slider').on('input', function(){
            var index = $(this).val();
            updatePropSymbols(map, attributes[index]);
        });
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });

}

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

            //add formatted attribute to panel content string
            console.log(attribute)
            var year = attribute.split("yr")[1];
            popupContent += "<p><b>Emmisions per capita in " + year + ":</b> " + props[attribute] + " tonnes   </p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            updateLegend(map, attribute);
        }
    });
}

//Create map legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        //figuring out best way to create legend/symbolize these routes
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="80px">';

            var ride_types = {
                mountain: 'red',
                road: 'blue'
            }

            for (var type in ride_types) {

            }

        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="80px">';

            //object to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#ff4300" fill-opacity="0.8" stroke="#000000" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
            }
            //close svg string
            svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    map.addControl(new LegendControl());
    // updateLegend(map, attributes[0]);
};

//Calculate the max, mean, and min values
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //set min
            if (attributeValue < min){
                min = attributeValue;
            }

            //set max
            if (attributeValue > max){
                max = attributeValue;
            }
        }
    });
    //set mean
    var mean = (max + min) / 2;

    //return values circle values
    return {
        max: Math.round(max),
        mean: Math.round(mean),
        min: Math.round(min)
    };
}

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("yr")[1];
    var content = "Emissions in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });
        //add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " Tonnes");
    }
}

function processData(data){
    //empty array to hold attributes
    var attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    // var max = -Infinity;
    // var min = Infinity;
    //push each attribute name into attributes array
    for (var attribute in properties){
        attributes.push(attribute)
    }
    // for (var attribute in properties){
    //     //only take attributes with population values
    //     if (attribute.indexOf("yr") > -1){
    //         attributes.push(attribute);
    //         if (properties[attribute] > max) {
    //             max = properties[attribute];
    //         }
    //         if (properties[attribute] < min) {
    //             min = properties[attribute];
    //         }
    //     }
    // }

    // attributes.push(max,min);
    return attributes;
}

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/many_rides.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            console.log(attributes)

            // console.log(Object.getOwnPropertyNames(map))
            console.log(Object.getOwnPropertyDescriptors(map))
            console.log(response)
            // console.log(Object.getOwnPropertyNames(routes))
            // console.log(Object.getOwnPropertyDescriptors(routes))


            //create map elements
            createLines(response, map, attributes);
            // createPropSymbols(response, map, attributes);
            // createSequenceControls(map, attributes);
            // createLegend(map,attributes)

        }
    });

}

$(document).ready(createMap);