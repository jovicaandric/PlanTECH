//dodavanje nove plantaze ali iz plantaza
//ovo je za onaj teo kad se klikne na plantage pa add new plantage a ne kad se udje na mapu
var plantageNew;
var polygonNew;
var editPlantage;
var plantageElevation = null;
// var getZoomLevelForPlantage = function (plant) {
//     var bounds = new google.maps.LatLngBounds();
//     for (var i = 0; i < plant.path.length; i++) {
//         bounds.extend(new google.maps.LatLng(plant.path[i].lat, plant.path[i].lng));
//     }
// }

var getCenterForPlantage = function (planta) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < planta.path.length; i++) {
        bounds.extend(new google.maps.LatLng(planta.path[i].lat, planta.path[i].lng));
    }
    return bounds.getCenter();
}



var initFromPlantages = function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        initMapFromPlantages();
    }, function (error) {
        myPosition = { lat: 44.014167, lng: 20.911667 };
        initMapFromPlantages();
    });
}

var initFromPlantagesForEdit = function (plant) {
    navigator.geolocation.getCurrentPosition(function (position) {
        myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        initMapFromPlantagesEdit(plant);
    }, function (error) {
        myPosition = { lat: 44.014167, lng: 20.911667 };
        initMapFromPlantagesEdit(plant);
    });
}

function initMapFromPlantages() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        zoomControl: false,
        streetViewControl: false,
        center: myPosition
    });

    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
            strokeColor: '#d9534f',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#d9534f',
            fillOpacity: 0.35,
            editable: true,
            draggable: true
        }
    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
        drawingManager.setMap(null);
        plantageNew = getJsonPath(polygon.getPath());
        polygonNew = polygon;
        var elevator = new google.maps.ElevationService;
        elevator.getElevationForLocations({
            'locations': [new google.maps.LatLng(polygon.getPath().getAt(0).lat(), polygon.getPath().getAt(0).lng())]
        }, function (results, status) {
            if (status === 'OK') {
                plantageElevation = results[0].elevation;
            }
        });
    });
}

function initMapFromPlantagesEdit(plant) {
    mapEdit = new google.maps.Map(document.getElementById('mapForEdit'), {
        zoom: 15,
        zoomControl: false,
        streetViewControl: false,
        center: myPosition
    });
    editPlantage = new google.maps.Polygon({
        paths: plant.path,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        editable: true,
        draggable: true
    });
    editPlantage.setMap(mapEdit);
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < editPlantage.getPath().length; i++) {
        bounds.extend(new google.maps.LatLng(editPlantage.getPath().getAt(i).lat(), editPlantage.getPath().getAt(i).lng()));
    }
    mapEdit.fitBounds(bounds);
}

var updatePlantageFromPlantages = function (plant) {
    var updatePlant = plant;
    updatePlant.path = getJsonPath(editPlantage.getPath());
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/plantage/update", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(updatePlant));
}


var newPlantagefromPlantages = function (plants) {
    plantageNew = getJsonPath(polygonNew.getPath());

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/plantage/add", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    var data = {
        Name: document.getElementById("plantageTitle").value,
        Owner: JSON.parse(localStorage.getItem('user')).Id,
        Path: plantageNew,
        Plants: []
    };
    for (var i = 0; i < plants.length; i++) {
        data.Plants.push({
            Specie: plants[i].specie.id,
            plantDate: plants[i].plantDate
        })
    }
    // send the collected data as JSON
    xhr.send(JSON.stringify(data));
}