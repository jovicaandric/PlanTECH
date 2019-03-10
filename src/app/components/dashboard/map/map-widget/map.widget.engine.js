var myPosition;
var newPolygon;
var mapWidget;
plantages = [];


var zoomPlantageOnWidget = function (plant) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < plant.path.length; i++) {
        bounds.extend(new google.maps.LatLng(plant.path[i].lat, plant.path[i].lng));
    }
    for (var i = 0; i < plantages.length; i++) {
        if (plantages[i].id == plant.plantageId) {
            closeInfoWindows();
            plantages[i].info.open(mapWidget);
            break;
        }
    }
    mapWidget.fitBounds(bounds);
}

//uzima plantaze koje vraca baza i od toga pravi oblik koji mapa
//moze da iscrta
function getPlantagesWidget(dbPlantages) {
    var plants = [];
    for (var i = 0; i < dbPlantages.length; i++) {
        plants.push({});
        plants[i].title = dbPlantages[i].title;
        plants[i].id = dbPlantages[i].plantageId;
        plants[i].owner = dbPlantages[i].owner;
        plants[i].path = [];
        plants[i].plants = dbPlantages[i].plants;
        plants[i].permissions = [];
        plants[i].polygon = null;
        plants[i].info = null;
        for (var j = 0; j < dbPlantages[i].path.length; j++) {
            plants[i].path.push({
                lat: parseFloat(dbPlantages[i].path[j].lat),
                lng: parseFloat(dbPlantages[i].path[j].lng)
            });
        }
        for (var j = 0; j < dbPlantages[i].permissions.length; j++) {
            plants[i].permissions.push(dbPlantages[i].permissions[j]);

        }
    }
    // console.log(plants);
    return plants;
}

//uzima trenutnu lokaciju korisnika
var initWidget = function (plants, alerts) {

    if (plants != null)
        plantages = getPlantagesWidget(plants);
    else
        plantages = null;
    //console.log(plantages);
    navigator.geolocation.getCurrentPosition(function (position) {
        myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        initMapWidget(alerts);
    }, function (error) {
        myPosition = { lat: 44.014167, lng: 20.911667 };
        initMapWidget(alerts);
    });
}

//funkcija koja vraca putanju sa mape u json formatu
function getJsonPath(path) {
    var jsonPath = [];
    for (var i = 0; i < path.length; i++) {
        jsonPath.push({
            lat: path.getAt(i).lat(),
            lng: path.getAt(i).lng()
        });
    }

    return jsonPath;
}
//zatvara sve info prozore od plantaza
function closeInfoWindows() {
    for (var k = 0; k < plantages.length; k++)
        if (plantages[k] != null)
            plantages[k].info.close();
}

//da li moze da se klikne na plantazu
function plantageClickable(bool) {
    for (var k = 0; k < plantages.length; k++) {
        if (plantages[k] != null) {
            if (!bool) {
                google.maps.event.clearListeners(plantages[k].polygon, "click");
            } else {
                let index = k;
                google.maps.event.addListener(plantages[k].polygon, "click", function () {
                    closeInfoWindows();
                    plantages[index].info.open(mapWidget, this);
                });
            }
        }
    }
}

function initMapWidget(alerts) {
    //pravljenje mape
    //console.log(alerts);
    mapWidget = new google.maps.Map(document.getElementById('mapWidget'), {
        zoom: 14,
        controls: "false",
        center: myPosition
    });
    if (plantages && alerts) {
        for (let i = 0; i < plantages.length; i++) {
            var found = false;
            if (plantages[i] != null) {
                for (var j = 0; j < alerts.length; j++) {
                    if (alerts[j].rows.length != 0) {
                        if (alerts[j].rows[0].PlantageId == plantages[i].id) {
                            if (alerts[j].rows[0].Type == "watering") {
                                plantages[i].polygon = new google.maps.Polygon({
                                    paths: plantages[i].path,
                                    strokeColor: '#015298',
                                    strokeOpacity: 1,
                                    strokeWeight: 2,
                                    fillColor: '#016ecd',
                                    fillOpacity: 0.7,
                                    map: mapWidget
                                });
                            } else if (alerts[j].rows[0].Type == "fertilize") {
                                plantages[i].polygon = new google.maps.Polygon({
                                    paths: plantages[i].path,
                                    strokeColor: '#94221e',
                                    strokeOpacity: 1,
                                    strokeWeight: 2,
                                    fillColor: '#da4f4a',
                                    fillOpacity: 0.7,
                                    map: mapWidget
                                });
                            } else if (alerts[j].rows[0].Type == "harvest") {
                                plantages[i].polygon = new google.maps.Polygon({
                                    paths: plantages[i].path,
                                    strokeColor: '#ae6704',
                                    strokeOpacity: 1,
                                    strokeWeight: 2,
                                    fillColor: '#faa632',
                                    fillOpacity: 0.7,
                                    map: mapWidget
                                });
                            } else {
                                plantages[i].polygon = new google.maps.Polygon({
                                    paths: plantages[i].path,
                                    strokeColor: '#3e8e40',
                                    strokeOpacity: 1,
                                    strokeWeight: 2,
                                    fillColor: '#5ab75c',
                                    fillOpacity: 0.7,
                                    map: mapWidget
                                });
                            }
                            found = true;
                            break;
                        }
                    }
                }

                if (!found) {
                    plantages[i].polygon = new google.maps.Polygon({
                        paths: plantages[i].path,
                        strokeColor: '#3e8e40',
                        strokeOpacity: 1,
                        strokeWeight: 2,
                        fillColor: '#5ab75c',
                        fillOpacity: 0.7,
                        map: mapWidget
                    });
                }

                var content = "<div class='infoHeader'>\
        <span class='infoTitle' style=' font-size: 18px;font-weight: bold;'>" + plantages[i].title + "</span>&nbsp&nbsp<div class='infoOptions'  style='font-size:12px;padding-left:20px;display:inline;'>\
        <hr/><div class='infoContent'><b>Povrsina: </b>"+ parseFloat(google.maps.geometry.spherical.computeArea(plantages[i].polygon.getPath())).toFixed(2) + "</br>\
        <b>Vlasnik:</b>"+ plantages[i].owner.firstname + " " + plantages[i].owner.lastname + "</br></br> \
        <b>Posadjene Biljke:</b></br>\
        <table class='table table-condensed table-strapped>'\
        <tr>\
                <th> Kategorija</th>\
                    <th>Biljka</th>\
                    <th>Sorta</th>\
            <th>Proizvođač semena</th>\
            <th>Datum sadnje</th>\
        </tr>";
                for (var j = 0; j < plantages[i].plants.length; j++) {
                    content += "<td>" + plantages[i].plants[j].category.text + "</td>";
                    content += "<td>" + plantages[i].plants[j].plant.text + "</td>";
                    content += "<td>" + plantages[i].plants[j].specie.text + "</td>";
                    content += "<td>" + plantages[i].plants[j].seedManufacturer.text + "</td>";
                    content += "<td>" + dateToString(plantages[i].plants[j].plantDate) + "</td></tr>";
                }
                content += "</table></div>";
                plantages[i].info = new google.maps.InfoWindow({
                    content: content,
                    position: plantages[i].polygon.getPath().getAt(1) //OVO TREBA DA SE UPDATE-UJE KADA SE POMERI PLANTAZA PRI EDITOVANJU
                });
                google.maps.event.addListener(plantages[i].polygon, "click", function () {
                    closeInfoWindows();
                    plantages[i].info.open(mapWidget, this);
                });
            }
        }
    }
}
