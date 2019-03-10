var myPosition;
var newPolygon;
var newMeasurer;
plantages = [];
measurers = [];
infos = [];
pl = [];


//uzima trenutnu lokaciju korisnika
var initMeasurers = function (meas, plants) {
    measurers = JSON.parse(meas.measurers);

    navigator.geolocation.getCurrentPosition(function (position) {
        myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        initMapMeasurers(plants);
    }, function (error) {
        myPosition = { lat: 44.014167, lng: 20.911667 };
        initMapMeasurers(plants);
    });
}

//zatvara sve info prozore od plantaza
function closeMeasurersInfoWindows() {
    for (var k = 0; k < measurers.length; k++)
        if (measurers[k] != null)
            measurers[k].info.close();
}

//da li moze da se klikne na plantazu

function addNewMeasurer(addedMeasurer) {
    addedMeasurer.lat = newMeasurer.position.lat();
    addedMeasurer.lng = newMeasurer.position.lng();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/measurer/add", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    xhr.send(JSON.stringify(addedMeasurer));
}

function editMeasurer(rbr) {
    $(document).ready(function () {
        $("#editMeasurerModal" + measurers[rbr].Id).modal("show");
    });
}

function deleteMeasurer(rbr) {
    measurers[rbr].marker.setMap(null);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/measurers/delete", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    //console.log(measurers[rbr]);
    xhr.send(JSON.stringify({ "measurer": measurers[rbr].Id }));

}

function initMapMeasurers(plants) {
    //pravljenje mape
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        zoomControl: false,
        streetViewControl: false,
        center: myPosition
    });

    for (let i = 0; i < measurers.length; i++) {
        var icon = {
            url: "../../../../../assets/dist/img/icons/marker1.png", // url
            scaledSize: new google.maps.Size(40, 40), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(20, 40) // anchor
        };
        if (measurers[i] != null) {
            measurers[i].marker = new google.maps.Marker({
                position: { lat: measurers[i].Lat, lng: measurers[i].Lng },
                map: map,
                animation: google.maps.Animation.DROP,
                title: measurers[i].MeasuringUnit,
                icon: icon
            });

            var content = "<div class='infoHeader'>\
                    <span class='infoTitle' style=' font-size: 18px;font-weight: bold;'>Merni instrument</span>&nbsp&nbsp<div class='infoOptions'  style='font-size:12px;padding-left:20px;display:inline;'>\
                    <span onclick='editMeasurer(" + i + ")' class='glyphicon glyphicon-pencil' style='color:#428bca;cursor:pointer;margin:0;' title='Izmeni'></span>\
                    &nbsp";
            if (measurers[i].Owner != null)
                content += "<span onclick='deleteMeasurer(" + i + ")' class='infoDelete glyphicon glyphicon-trash' style='color:#d9534f;cursor:pointer;margin:0;' title='Obriši'></span>";
            content += "</div ></div>\
                    <hr/><div class='infoContent'><b>Url: </b>"+ measurers[i].Url + "</br>\
                    <b>Merna veličina:</b>"+ measurers[i].MeasuringUnit + "</br>";
            if (measurers[i].Plantages.length > 0) {
                content += "<b>Plantaže:</b></br >";
                for (var k = 0; k < measurers[i].Plantages.length; k++) {
                    content += measurers[i].Plantages[k].name + "</br>"
                }
            }
            content += "</div>";

            measurers[i].info = new google.maps.InfoWindow({
                content: content,
                position: new google.maps.LatLng(measurers[i].Lat, measurers[i].Lng)//OVO TREBA DA SE UPDATE-UJE KADA SE POMERI PLANTAZA PRI EDITOVANJU
            });
            google.maps.event.addListener(measurers[i].marker, "click", function () {
                closeMeasurersInfoWindows();
                measurers[i].info.open(map, this);
            });
        }
    }

    for (let j = 0; j < plants.length; j++) {
        poly = new google.maps.Polygon({
            paths: plants[j].path,
            strokeColor: '#015298',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: '#016ecd',
            fillOpacity: 0.7,
            title: plants[j].title,
            map: map
        });
        info = new google.maps.InfoWindow({
            content: plants[j].title,
            position: new google.maps.LatLng(plants[j].path[0].lat, plants[j].path[0].lng)
        });
        pl[j] = poly;
        infos.push(info);
        google.maps.event.addListener(pl[j], "click", function () {
            infos[j].open(map, this);
        });
    }

    //kad se klikne na dodavanje novog meraca
    document.getElementById("addNewMeasurer").addEventListener("click", function () {
        var icon = {
            url: "../../../../../assets/dist/img/icons/marker1.png", // url
            scaledSize: new google.maps.Size(40, 40), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(20, 40) // anchor
        };
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: false,
            markerOptions: {
                draggable: true,
                icon: icon
            }
        });
        document.getElementById("cancelButton").innerHTML = "<button class='btn btn-danger' id='cancel' style='color:white;font-size:16px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i> Poništi</button>";
        document.getElementById("cancel").addEventListener("click", function () {
            drawingManager.setMap(null);
            document.getElementById("cancelButton").innerHTML = "";
        });
        //postawlja kontrolu za crtanje markera
        drawingManager.setMap(map);
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
            newMeasurer = event.overlay;
            if (event.type == "marker") {
                //kad se stavi marker ne moze vise da se doda nijedan
                //bira se da li ce da sacuva ili da ponisti
                drawingManager.setMap(null);
                document.getElementById("saveButton").innerHTML = "<button class='btn btn-primary' id='save' style='color:white; font-size:16px;cursor:pointer;margin:0;' tooltip='Save'><i class='fa fa-floppy-o'></i> Sačuvaj</button>";
                document.getElementById("cancelButton").innerHTML = "<button class='btn btn-danger' id='cancel' style='color:white;font-size:16px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i> Poništi</button>";

                //kad se klikne na save dugme posle crtanja
                document.getElementById("save").addEventListener('click', function () {

                    //OVDE DA SE OTVORI MODAL ZA UNOS
                    $(document).ready(function () {
                        $("#newMeasurerModal").modal("show");
                    });
                    // newPolygon = polygon;
                    document.getElementById("saveButton").innerHTML = "";
                    document.getElementById("cancelButton").innerHTML = "";
                });
                document.getElementById("cancel").addEventListener("click", function () {
                    document.getElementById("saveButton").innerHTML = "";
                    document.getElementById("cancelButton").innerHTML = "";
                    event.overlay.setMap(null);
                });
            }
        });
    });
}
