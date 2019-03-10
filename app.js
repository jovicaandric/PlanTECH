const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const passport = require('passport');
const sqlite = require('sqlite3');
const db = new sqlite.Database('./Database/plantechBaza.db');
const index = require('./routers/index');
const expert = require('./routers/expert');
const fake = require('./MeasurementsDAL/mockData.js');
const measurementValues = require('./MeasurementsDAL/measurementsValue');
const forecast = require('./routers/getForecast');
const app = express();
const port = 2047;

io = require('socket.io').listen(app.listen(port, () => {
    console.log("Server je pokrenut na portu " + port);
})
);

sockets = [];

io.on('connection', function (socket) {
    // console.log(socket);
    socket.on('join', function (user) {
        sockets.push({ User: user.Id, Socket: socket });
    });
    socket.on('disconnect', function () {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].Socket.id == socket.id) {
                sockets.splice(i, 1);
            }
        }
    });
});

var auth = require('http-auth');

var basic = auth.basic({
    realm: "Plantech LogN",
    file: __dirname + "/.htpasswd"
});

app.use(auth.connect(basic));

app.use(cors());
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

// app.use('/register', index);
app.use(express.static(path.join(__dirname, './public')));
app.use('/userImages', express.static(path.join(__dirname, './routers/userImages')));
app.use('/', index);
app.use('/users/authenticate', index);
app.use('/users/register', index);

setInterval(function () {
    fake.WriteMeasurements();
    expert.fire();
}, 1000 * 3600 * 12);

setInterval(function () {
    forecast.getForecastPlantages();
}, 86400000);
// setInterval(function () {
//     expert.fire();
// }, 1000);


