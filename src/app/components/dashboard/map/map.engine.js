var myPosition;
var newPolygon;
var newMeasurer;
plantages = [];
measurers = [];
function dateToString(date) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(date);
    return t.getDate() + "-" + (t.getMonth() + 1) + "-" + t.getFullYear();
}
//uzima plantaze koje vraca baza i od toga pravi oblik koji mapa
//moze da iscrta
function getPlantages(dbPlantages) {
    // console.log(dbPlantages);
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
    return plants;
}

//uzima trenutnu lokaciju korisnika
var init = function (plants, meas) {
    plantages = getPlantages(plants.plantages);
    measurers = JSON.parse(meas.measurers);
    navigator.geolocation.getCurrentPosition(function (position) {
        myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        initMap();
    }, function (error) {
        myPosition = { lat: 44.014167, lng: 20.911667 };
        initMap();
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
                    plantages[index].info.open(map, this);
                });
            }
        }
    }
}

//funkcija za dodavanje novih plantaza
function addNewPlantage(addedPlants) {
    //salje se post za upis u bazu
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/plantage/add", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    var data = {
        Name: document.getElementById("plantageTitle").value,
        Owner: JSON.parse(localStorage.getItem('user')).Id,
        Path: getJsonPath(newPolygon.getPath()),
        Plants: []
    };
    for (var i = 0; i < addedPlants.length; i++) {
        data.Plants.push({
            Specie: addedPlants[i].specie.id,
            plantDate: addedPlants[i].plantDate
        })
    }
    // send the collected data as JSON
    xhr.send(JSON.stringify(data));


    let len = plantages.length;

    var content = "<div class='infoHeader'>\
        <span class='infoTitle' style=' font-size: 18px;font-weight: bold;'>" + data.Name + "</span>&nbsp&nbsp<div class='infoOptions'  style='font-size:12px;padding-left:20px;display:inline;'>\
        <span onclick='editPlantage(" + len + ")' class='glyphicon glyphicon-pencil' style='color:#428bca;cursor:pointer;margin:0;' title='Izmeni'></span>\
        &nbsp<span onclick='deletePlantage(" + len + ")' class='infoDelete glyphicon glyphicon-trash' style='color:#d9534f;cursor:pointer;margin:0;' title='Obrisi'></span></div></div>\
        <hr/><div class='infoContent'><b>Povrsina: </b>"+ parseFloat(google.maps.geometry.spherical.computeArea(newPolygon.getPath())).toFixed(2) + "m2</br>\
        <b>Kultura: </b>Jabuka</br>\
        <b>Vrsta: </b>Zlatni delises</br>\
        <b>Datum sadnje: </b>20.3.2017</div>";
    plantages.push({
        "title": data.Name,
        "path": getJsonPath(newPolygon.getPath()),
        "info": new google.maps.InfoWindow({
            content: content,
            position: newPolygon.getPath().getAt(1)
        }),
        "polygon": new google.maps.Polygon({
            paths: newPolygon.getPath(),
            strokeColor: '#428bca',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#428bca',
            fillOpacity: 0.35,
            editable: false,
            draggable: false,
            map: map
        })
    });

    //klik na novi poligon otvara InfoWindow
    google.maps.event.addListener(plantages[len].polygon, "click", function () {
        //prvo zatvara ako ima neki otvoren
        closeInfoWindows();
        plantages[len].info.open(map, this);
    });
    newPolygon.setMap(null);
    $(document).ready(function () {
        $("#newPlantageModal").modal("hide");
    });
}

function addNewMeasurer(addedMeasurer) {
    addedMeasurer.lat = newMeasurer.position.lat();
    addedMeasurer.lng = newMeasurer.position.lng();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/measurer/add", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    xhr.send(JSON.stringify(addedMeasurer));
}


//funkcija za izmenu granica plantaze
function editPlantage(rbr) {

    closeInfoWindows();

    plantages[rbr].polygon.setEditable(true);
    plantages[rbr].polygon.setDraggable(true);
    plantages[rbr].polygon.setOptions({
        strokeColor: '#d9534f',
        fillColor: '#d9534f'
    });

    plantageClickable(false);

    document.getElementById("saveButton").innerHTML = "<span id='save' style='color:#428bca; font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Save'><i class='fa fa-floppy-o'></i></span>";
    document.getElementById("cancelButton").innerHTML = "<span id='cancel' style='color:#d9534f;font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i></span>";

    //kad se updateuje plantaza pa se klikne na save    
    document.getElementById("save").addEventListener("click", function () {
        plantages[rbr].path = getJsonPath(plantages[rbr].polygon.getPath());
        plantages[rbr].polygon.setEditable(false);
        plantages[rbr].polygon.setDraggable(false);
        plantageClickable(true);
        document.getElementById("saveButton").innerHTML = "";
        document.getElementById("cancelButton").innerHTML = "";
        plantages[rbr].polygon.setOptions({
            strokeColor: '#428bca',
            fillColor: '#428bca'
        });
        plantages[rbr].info.setOptions({
            position: plantages[rbr].polygon.getPath().getAt(1)
        });

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/plantage/update", true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

        data = {
            id: plantages[rbr].id,
            title: plantages[rbr].title,
            owner: plantages[rbr].owner,
            path: plantages[rbr].path
        }
        // send the collected data as JSON
        xhr.send(JSON.stringify(data));
    });


    //kad se updateuje plantaza pa se klikne na cancel
    //sve se vraca na staro
    document.getElementById("cancel").addEventListener("click", function () {
        plantageClickable(true);
        plantages[rbr].polygon.setPath(plantages[rbr].path);
        plantages[rbr].polygon.setEditable(false);
        plantages[rbr].polygon.setDraggable(false);
        document.getElementById("saveButton").innerHTML = "";
        document.getElementById("cancelButton").innerHTML = "";
        plantages[rbr].polygon.setOptions({
            strokeColor: '#428bca',
            fillColor: '#428bca'
        });
    });
}

//funkcija za brisanje plantaze
function deletePlantage(rbr) {

    //salje se post za upis u bazu
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/plantage/delete", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
    xhr.send(JSON.stringify({ plantageId: plantages[rbr].id }));
    plantages[rbr].polygon.setMap(null);
    plantages[rbr] = null;
}
function initMap() {
    //pravljenje mape
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        zoomControl: false,
        streetViewControl: false,
        center: myPosition
    });

    // for (let i = 0; i < measurers.length; i++) {
    //     // var icon = {
    //     //     url: "http://www.akcp.com/wp-content/uploads/2016/03/temperature-sensor-icon.png", // url
    //     //     scaledSize: new google.maps.Size(80, 60), // scaled size
    //     //     origin: new google.maps.Point(0, 0), // origin
    //     //     anchor: new google.maps.Point(0, 0) // anchor
    //     // };
    //     var marker = new google.maps.Marker({
    //         position: { lat: measurers[i].Lat, lng: measurers[i].Lng },
    //         map: map,
    //         animation: google.maps.Animation.DROP,
    //         title: measurers[i].MeasuringUnit
    //     });
    // }


    for (let i = 0; i < plantages.length; i++) {
        if (plantages[i] != null) {
            plantages[i].polygon = new google.maps.Polygon({
                paths: plantages[i].path,
                strokeColor: '#428bca',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#428bca',
                fillOpacity: 0.35,
                map: map
            });

            var content = "<div class='infoHeader'>\
        <span class='infoTitle' style=' font-size: 18px;font-weight: bold;'>" + plantages[i].title + "</span>&nbsp&nbsp<div class='infoOptions'  style='font-size:12px;padding-left:20px;display:inline;'>\
        </div></div>\
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
                plantages[i].info.open(map, this);
            });
        }
    }
    /*
        //kad se klikne na dodavanje nove plantaze
        document.getElementById("addNewPlantage").addEventListener("click", function () {
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
            document.getElementById("cancelButton").innerHTML = "<span id='cancel' style='color:#d9534f;font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i></span>";
            document.getElementById("cancel").addEventListener("click", function () {
                drawingManager.setMap(null);
                document.getElementById("cancelButton").innerHTML = "";
            });
            //zatvara sve InfoWindow
            closeInfoWindows();
            //postawlja kontrolu za crtanje poligona
            drawingManager.setMap(map);
    
            //kad se zavrsi crtanje poligona
            google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                drawingManager.setMap(null);
                document.getElementById("saveButton").innerHTML = "<span id='save' style='color:#428bca; font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Save'><i class='fa fa-floppy-o'></i></span>";
                document.getElementById("cancelButton").innerHTML = "<span id='cancel' style='color:#d9534f;font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i></span>";
    
                //kad se klikne na save dugme posle crtanja
                document.getElementById("save").addEventListener('click', function () {
    
                    //OVDE DA SE OTVORI MODAL ZA UNOS
                    $(document).ready(function () {
                        $("#newPlantageModal").modal("show");
                    });
                    newPolygon = polygon;
                    document.getElementById("saveButton").innerHTML = "";
                    document.getElementById("cancelButton").innerHTML = "";
                });
                document.getElementById("cancel").addEventListener("click", function () {
                    document.getElementById("saveButton").innerHTML = "";
                    document.getElementById("cancelButton").innerHTML = "";
                    polygon.setMap(null);
                });
            });
        });
       
        //kad se klikne na dodavanje novog meraca
        document.getElementById("addNewMeasurer").addEventListener("click", function () {
    
            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: false,
                markerOptions: {
                    draggable: true
                }
            });
            document.getElementById("cancelButton").innerHTML = "<span id='cancel' style='color:#d9534f;font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i></span>";
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
                    document.getElementById("saveButton").innerHTML = "<span id='save' style='color:#428bca; font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Save'><i class='fa fa-floppy-o'></i></span>";
                    document.getElementById("cancelButton").innerHTML = "<span id='cancel' style='color:#d9534f;font-size:20px;padding-right:10px;cursor:pointer;margin:0;' tooltip='Cancel'><i class='fa fa-ban'></i></span>";
    
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
        */
}

