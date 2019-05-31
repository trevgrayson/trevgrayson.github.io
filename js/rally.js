//creates the map
function createMap(){
    //defines the starting point and zoom level of the map
        var map = L.map('map', {
            center: [20, 20],
            zoom: 1,
            zoomControl: false
        });
        var baseMaps = {
            baseMap: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: ''
            }),
            satellite:  L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            })
        };
    //imports the tile layer from the defined source
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: ''
        }).addTo(map);
    
        getData(map, baseMaps);
    };
    // // //function to convert markers to circle markers
    function pointToLayer(feature, latlng, attributes, map, baseMaps){
        //Determine which attribute to visualize with proportional symbols
        var attribute = attributes[2];
        //create marker options
        var options = {
            fillColor: "#8dbe2d",
            color: "#000",
            weight: 2,
            opacity: 1,
            fillOpacity: .5
        };
    
        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties[attribute]);
        //Give each feature's circle marker a radius based on its attribute value
        options.radius = calcPropRadius(attValue);
        //create circle marker layer
        var layer = L.circleMarker(latlng, options);
        // build popup content string
        var trackName = feature.properties.Event_Name
        var surface = feature.properties.Surface
        var yearsActive = feature.properties.Years_Active
        var winningestDriver = feature.properties.Winningest_Driver
        var youtube = feature.properties.youtube
        var flag = feature.properties.flag
        var panelContent = "<h1> "  + trackName + "\n" + "<p></p>" + flag + "</h1" + "\n" + "<p>" + "Surface: " + surface + "</p" + "\n" + "<p>" + "Years Active: " + yearsActive + "</p" + "\n"+ "<p>" + "Winningest Driver: " + winningestDriver + "</p";
        var vidiv = "<p2><b.Event:</b> " + youtube + "</p2";
        var popupContent = "<b>Event:</b> " + feature.properties.Event_Name + "";
    //create content for popups and mouse functions
        popupContent += "<br><b>Years active: </b>" + feature.properties[attribute] + " years</br>";
        layer.bindPopup(popupContent, {
            offset: new L.Point(0,-options.radius)
        });
        layer.on({
            mouseover: function(){
                this.openPopup();
            },
            mouseout: function(){
                this.closePopup();
            },
            click: function(){
                $("#panel").html(panelContent),
                $("#vidiv").html(vidiv),
                map.flyTo(latlng, 12),
                map.on('moveend', function(){
                    // only add satellite imagery if zoomed in on feature
                    if (map.getZoom() == 12) {
                        baseMaps.satellite.addTo(map)
                        map._layersMinZoom=2
                    }
                    });
    
            }
        });
        //return the circle marker to the L.geoJson pointToLayer option
        return layer;
    };
    //Add circle markers for point features to the map
    function createPropSymbols(data, map, attributes, baseMaps){
        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(data, {
            pointToLayer: function(feature, latlng){
                return pointToLayer(feature, latlng, attributes, map, baseMaps);
            }
        }).addTo(map);
    };
    //function to calculate the radius of the circles based on the attribute value
    function calcPropRadius(attValue) {
        var scaleFactor = 25;
        var area = attValue * scaleFactor;
        var radius = Math.sqrt(area/Math.PI);
    
        return radius;
    };
    
    //AddResetView
    function resetView(map, baseMaps){
        // custom zoom bar control that includes a Zoom Home function
        L.Control.zoomHome = L.Control.extend({
            options: {
                position: 'topright',
                zoomInText: '+',
                zoomInTitle: 'Zoom in',
                zoomOutText: '-',
                zoomOutTitle: 'Zoom out',
                zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
                zoomHomeTitle: 'Zoom home'
            },
    //add buttons to leaflet map
            onAdd: function (map) {
                var controlName = 'gin-control-zoom',
                    container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                    options = this.options;
    
                this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
                controlName + '-in', container, this._zoomIn);
                this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
                controlName + '-home', container, this._zoomHome);
                this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
                controlName + '-out', container, this._zoomOut),
                this._updateDisabled();
                map.on('zoomend zoomlevelschange', this._updateDisabled, this);
    
                return container;
            },
    
            onRemove: function (map) {
                map.off('zoomend zoomlevelschange', this._updateDisabled, this);
            },
    
            _zoomIn: function (e) {
                this._map.zoomIn(e.shiftKey ? 3 : 1);
            },
    
            _zoomOut: function (e) {
                this._map.zoomOut(e.shiftKey ? 3 : 1);
            },
    
            _zoomHome: function (e) {
                //set zoom bounds
                map.flyTo([20, 20], 2.5);
                map.removeLayer(baseMaps.satellite)
                map._layersMinZoom=2.5
                $('#vidiv').empty()
                $('#panel').empty()
            },
    //create home button and zoom properties
            _createButton: function (html, title, className, container, fn) {
                var link = L.DomUtil.create('a', className, container);
                link.innerHTML = html;
                link.href = '#';
                link.title = title;
    
                L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', fn, this)
                    .on(link, 'click', this._refocusOnMap, this);
    
                return link;
            },
    
            _updateDisabled: function () {
                var map = this._map,
                    className = 'leaflet-disabled';
    
                L.DomUtil.removeClass(this._zoomInButton, className);
                L.DomUtil.removeClass(this._zoomOutButton, className);
    
                if (map._zoom === map.getMinZoom()) {
                    L.DomUtil.addClass(this._zoomOutButton, className);
                }
                if (map._zoom === map.getMaxZoom()) {
                    L.DomUtil.addClass(this._zoomInButton, className);
                }
            }
        });
        // add the new control to the map
        var zoomHome = new L.Control.zoomHome();
        zoomHome.addTo(map);
    }
    
    //Create map legend
    function createLegend(map, attributes){
        var LegendControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
    
            onAdd: function (map) {
                // create the control container with a particular class name
                var container = L.DomUtil.create('div', 'legend-control-container');
    
                //add temporal legend div to container
                $(container).append('<div id="temporal-legend">')
    
                //Step 1: start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="160px" height="60px">';
    
                //object to base loop on...replaces Example 3.10 line 1
                var circles = {
                    max: 20,
                    mean: 40,
                    min: 60
                };
    
                //loop to add each circle and text to svg string
                for (var circle in circles){
                    //circle string
                    svg += '<circle class="legend-circle" id="' + circle + '" fill="#8dbe2d" fill-opacity="0.8" stroke="#000000" cx="30"/>';
    
                    //text string
                    svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
                };
    
                //close svg string
                svg += "</svg>";
    
                //add attribute legend svg to container
                $(container).append(svg);
    
                return container;
            }
        });
    
        map.addControl(new LegendControl());
    
        updateLegend(map, attributes[2]);
    };
    
    
    //Calculate the max, mean, and min values for a given attribute
    function getCircleValues(map, attribute){
        //start with min at highest possible and max at lowest possible number
        var min = Infinity,
            max = -Infinity;
    
        map.eachLayer(function(layer){
            //get the attribute value
            if (layer.feature){
                var attributeValue = Number(layer.feature.properties[attribute]);
    
                //test for min
                if (attributeValue < min){
                    min = attributeValue;
                };
    
                //test for max
                if (attributeValue > max){
                    max = attributeValue;
                };
            };
        });
    
        //set mean
        var mean = (max + min) / 2;
    
        //return values as an object
        return {
            max: max,
            mean: mean,
            min: min
        };
    };
    //
    // //Update the legend with new attribute
    function updateLegend(map, attribute){
        //create content for legend
        var content = "<b>Years Active</b>";
    
        //replace legend content
        $('#temporal-legend').html(content);
    
        //get the max, mean, and min values as an object
        var circleValues = getCircleValues(map, attribute);
    
        for (var key in circleValues){
            //get the radius
            var radius = calcPropRadius(circleValues[key]);
    
            $('#'+key).attr({
                cy: 50 - radius,
                r: radius
            });
    
            //Step 4: add legend text
            $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " Years");
        };
    
    };
    //
    // //Processing data fields and attributes
    function processData(data){
        var attributes = [];
        var properties = data.features[0].properties;
    
        for (var attribute in properties){
            attributes.push(attribute);
        };
        return attributes;
    };
    
    
    // //Grab all the data and creat and apply functions
    function getData(map, baseMaps){
        $.ajax("data/track_info.geojson", {
            dataType: "json",
            success: function(response){
    
                var attributes = processData(response);
                createPropSymbols(response, map, attributes, baseMaps);
                createLegend(map,attributes);
                resetView(map, baseMaps);
            }
        });
        map.setZoom(2.5)
        map._layersMinZoom=2.5
        map.setMaxBounds(map.getBounds());
    
    };
    //engages the createMap when the document has finished loading
    $(document).ready(createMap);