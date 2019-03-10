const express = require('express');
const router = express.Router();
const connectionDB = require('./connection');
const forecast = require("./weatherApi");
var google = require('googleapis');
const fileUpload = require('express-fileupload');
const glob = require("glob");
const fs = require('fs');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;


router.use(fileUpload());


if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

// var oauth2Client = new OAuth2(
//     '605509609295-tppc4kac5507lsc4nn3h8u2r86pc19dr.apps.googleusercontent.com',
//     'nzNPlG7r7H4lL_cSyf1BXnfP',
//     'http://localhost:2047/plantages/'
// );

var oauth2Client = new OAuth2(
    '570117788793-k4fsth0mha30v3b6brt0im8bg6dc82pe.apps.googleusercontent.com',
    '1xwUquYZXh5YS4yIjzhVW8xz',
    'http://localhost:2047/googleAuth/'
);

router.get('/register/googleToken', (req, res) => {
    oauth2Client.getToken(req.query.code, function (err, tokens) {
        if (!err) {
            oauth2Client.setCredentials(tokens);
            plus.people.get({
                userId: 'me',
                auth: oauth2Client
            }, function (err, response) {
                if (err) {
                    res.send({ error: err });
                }
                ////console.log(response);
                connectionDB.userAuthenticate({ username: response.emails[0].value, password: "kitakitakita" }, function (data) {
                    if (data.success) {
                        localStorage.setItem('user', 'proba');
                        // if (JSON.parse(data.user).Role == "Admin")
                        //     res.redirect('/admin');
                        // else
                        //     res.redirect('/index');

                    }
                    else {
                        var firstlast = response.displayName.split(" ");
                        var user = {
                            username: response.emails[0].value,
                            password: "kitakitakita",
                            firstname: firstlast[0],
                            lastname: firstlast[1],
                            email: response.emails[0].value,
                            role: "User",
                            image: response.image.url,
                            regDate: Date.now()
                        }

                        connectionDB.addUser(user, function (data) {
                            connectionDB.userAuthenticate({ username: response.emails[0].value, password: "kitakitakita" }, function (data) {
                                if (data.success) {
                                    // res.json(data);
                                    // //console.log(data);
                                    res.redirect('/login');
                                }
                                else {
                                    res.json(data);
                                }
                            });
                        });
                    }
                });
            });
        }
        else {
            res.send({ error: err });
        }
    });

});

router.get('/google', (req, res, next) => {

    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    var url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        // If you only need one scope you can pass it as a string
        scope: scopes,
        // Optional property that passes state parameters to redirect URI
        // state: { foo: 'bar' }
    });
    res.redirect(url);
});

router.post('/google2', (req, res, next) => {
    // res.redirect("/google");
});

router.get('/googleAuth', function (req, res) {
    if (req.query.code != null) {
        ////console.log(req.query.code);
        res.redirect('/register/googleToken?code=' + req.query.code);
    }
});

router.get('/users/reset', function (req, res, next) {
    var data = {};
    if (!req.query.token)
        return next('Token nije poslat u parametrima!');

    data.token = req.query.token;
    data.headers = req.headers;

    connectionDB.resetUserPassword(data, (message) => {
        res.redirect('/login');
        //res.send(message);
    });
});

router.get('/', (req, res, next) => {
    res.render('index.html');
});

router.get('**', function (req, res) {
    res.sendFile('index.html', { root: "./public" });
})

router.post('/users/allusers', (req, res) => {
    connectionDB.getUsers(function (data) {
        res.json(data);
    });
});



//Login
router.post('/users/authenticate', (req, res, next) => {
    connectionDB.userAuthenticate(req.body, function (data) {
        res.json(data);
    });
});

//Kad servis na ovu rutu posalje usera on se registruje
router.post('/users/register', (req, res, next) => {
    connectionDB.addUser(req.body, function (data) {
        res.json(data);
    });
});

router.post('/users/delete', (req, res, next) => {
    connectionDB.deleteUser(req.body, function (data) {
        res.json(data);
    });
});

router.post('/users/update', (req, res, next) => {
    connectionDB.updateUser(req.body, function (data) {
        res.json(data);
    });
});


router.post("/weather/getDaily", function (req, res, next) {

    var longitude = req.body.longitude
    var latitude = req.body.latitude;

    forecast.getDaily(latitude, longitude, function (jsonDaily) {
        res.setHeader('content-type', 'text/plain');
        res.send(jsonDaily);
    });
});

router.post("/weather/getWeather", function (req, res, next) {

    var longitude = req.body.longitude;
    var latitude = req.body.latitude;

    forecast.getWeather(latitude, longitude, function (json) {
        res.setHeader('content-type', 'text/plain');
        res.send(json);
    });
});

router.post('/users/forgot', function (req, res, next) {
    var data = {};
    if (!req.body.email)
        return next('Email nije poslat u parametrima!');

    data.email = req.body.email;
    data.resetPasswordToken = Math.floor(Date.now() / 1000);
    data.resetPasswordExpires = Date.now() + 3600000;
    data.headers = req.headers;

    connectionDB.addUserReset(data, (message) => {
        res.send(message);
    });
});
router.post('/plantage/foruser', (req, res, next) => {
    connectionDB.getAllPlantagesForUser(req.body.userId, (plantages) => {
        res.send(plantages);
    });
});
router.post('/plantage/add', (req, res, next) => {
    connectionDB.addPlantageSql(req.body, (plantages) => {
        // //console.log(plantages);
        res.send(plantages);
    });
});

router.post('/plantage/delete', (req, res, next) => {
    connectionDB.deletePlantage(req.body.plantageId, (plantages) => {
        res.send(plantages);
    });
});
router.post('/plantage/update', (req, res, next) => {
    connectionDB.updatePlantage(req.body, (plantages) => {
        // //console.log(plantages);
        res.send(plantages);
    });
});
router.post('/users/owner-requests', (req, res) => {
    connectionDB.getUsersOwnerReq(function (data) {
        res.json(data);
    });
});

router.post('/users/owner-requests/userID', (req, res, next) => {
    connectionDB.getUserId(req.body, function (data) {
        res.json(data);
    });
});

router.post('/users/owner-requests/addOwnerReq', (req, res, next) => {
    connectionDB.AddOwnerRequest(req.body, function (data) {
        res.json(data);
    });
});

router.post('/users/regConfirm', (req, res, next) => {
    connectionDB.updateOwnerReq(req.body, 'accepted', function (data) {
        res.json(data);
    });
});
router.post('/users/checkIfOwner', (req, res, next) => {
    connectionDB.checkIfOwner(req.body.Id, function (data) {
        res.json(data);
    });
});

router.post('/plantages/checkIfCanSeePlantages', (req, res, next) => {
    connectionDB.checkIfCanSeePlantages(req.body.Id, function (data) {
        res.json(data);
    });
});

router.post('/rules/checkIfRuler', (req, res, next) => {
    connectionDB.checkIfRuler(req.body.Id, function (data) {
        res.json(data);
    });
});

router.post('/billing/checkUpgrade', (req, res, next) => {
    connectionDB.checkUpgrade(req.body.Id, function (data) {
        res.json(data);
    });
});

router.post('/users/regDiscard', (req, res, next) => {
    connectionDB.updateOwnerReq(req.body, 'rejected', function (data) {
        res.json(data);
    });
});

router.post('/plants/categories', (req, res, next) => {
    connectionDB.getPlantCategories(function (data) {
        res.json(data);
    });
});

router.post('/plants/allforcategory', (req, res, next) => {
    connectionDB.getPlantsForCategory(req.body.categoryId, req.body.userId, function (data) {
        res.json(data);
    });
});

router.post('/plants/species', (req, res, next) => {
    connectionDB.getSpecies(req.body.plantId, req.body.userId, function (data) {
        res.json(data);
    });
});

router.post('/plants/seedmanufacturer', (req, res, next) => {
    connectionDB.getSeedmanufacturer(req.body.specieId, function (data) {
        res.json(data);
    });
});
router.post('/plantage/measurers', (req, res, next) => {
    connectionDB.getAllMeasurers(req.body, function (data) {
        res.json(data);
    });
});


// Editovanje korisnickog profila
router.post('/user-profile/editName', (req, res) => {
    connectionDB.editUserName(req.body, function (data) {
        res.json(data);
    });

});

router.post('/user-profile/editUsername', (req, res) => {
    connectionDB.editUsername(req.body, function (data) {
        res.json(data);
    });

});

router.post('/user-profile/editEmail', (req, res) => {
    connectionDB.editUserEmail(req.body, function (data) {
        res.json(data);
    });

});

router.post('/user-profile/editPassword', (req, res) => {
    connectionDB.editPassword(req.body, function (data) {
        res.json(data);
    });


});
// Editovanje korisnickog profila - END

router.post('/nekaruta', (req, res, next) => { // ovde da se promeni ruta 
    connectionDB.addUserPermissions(req.body, function (data) {
        res.json(data);
    });
});


router.post('/work-requests', (req, res, next) => {
    connectionDB.getUsersPlantages(req.body, function (data) {
        res.json(data);
    });
});



router.post('/work-requests/getAllUsersForRequests', (req, res) => {
    connectionDB.getUsersToRequest(function (data) {
        res.json(data);
    });
});

router.post('/find-work/getAllUsersForRequests', (req, res) => {
    connectionDB.getUsersToRequest2(function (data) {
        res.json(data);
    });
});


router.post('/work-requests/getPermissions', (req, res) => {
    connectionDB.getPermissions(function (data) {
        res.json(data);
    });
});

router.post('/work-requests/sendMessage', (req, res, next) => {
    //console.log(req.body);
    connectionDB.addWorkRequest(req.body, function (data) {
        res.json(data);
    });
    // //console.log("Message: " + req.body.message);
    // //console.log("Owner: " + req.body.owner);
    // //console.log("Worker: " + req.body.worker);
    // //console.log("--------------------")

    // for (var i = 0; i < req.body.plantagesPermissions.length; i++) {
    //     //console.log("Plantage id= " + req.body.plantagesPermissions[i].plantageId);
    //     //console.log("Permissions: ");
    //     for (var j = 0; j < req.body.plantagesPermissions[i].permissions.length; j++) {
    //         //console.log("permissionId: " + req.body.plantagesPermissions[i].permissions[j]);
    //     }

    //     //console.log("--------------------");
    // }

});


router.post('/work-requests/getRequested', (req, res) => {
    connectionDB.getSentRequests(function (data) {
        res.json(data);
    });
});


router.post('/measurer/add', (req, res, next) => {
    connectionDB.addMeasurer(req.body, function (data) {
        res.json(data);
    })
});
router.post('/jobOffers/all', (req, res, next) => {
    connectionDB.getJobOffers(req.body.id, function (data) {
        res.json(data);
    })
});
router.post('/jobOffers/accept', (req, res, next) => {
    connectionDB.acceptJobOffer(req.body.id, function (data) {
        res.json(data);
    })
});
router.post('/jobOffers/refuse', (req, res, next) => {
    connectionDB.refuseJobOffer(req.body.id, function (data) {
        res.json(data);
    })
});

router.post('/jobRequests/all', (req, res, next) => {
    connectionDB.getJobRequests(req.body.id, function (data) {
        res.json(data);
    })
});

router.post('/measurer/getPlantagesForMeasurer', (req, res, next) => {
    connectionDB.getPlantagesForMeasurer(req.body, function (data) {
        res.json(data);
    })
});

router.post('/my-employees/getPermissions', (req, res) => {
    connectionDB.getAllFromUserPermissions(function (data) {
        res.json(data);
    });
});

router.post('/my-employers/getEmployersForUser', (req, res, nest) => {
    ////console.log(req.body);
    connectionDB.getEmployersForUser(req.body, function (data) {
        res.json(data);
    })
});
router.post('/my-employers/getPlantagesIWorkOn', (req, res, nest) => {
    connectionDB.getPlantagesIWorkOn(req.body, function (data) {
        res.json(data);
    })
});

router.post('/my-employers/quit', (req, res, nest) => {
    connectionDB.quit(req.body, function (data) {
        res.json(data);
    })
});

router.post('/my-employees/getMyEmployees', (req, res, next) => {
    connectionDB.getMyEmployees(req.body, function (data) {
        res.json(data);
    })
});

router.post('/my-employees/edit', (req, res, next) => {
    connectionDB.editPermissions(req.body.user, req.body.owner, function (data) {
        res.json(data);
    })
});
router.post('/user/progress', (req, res, next) => {
    connectionDB.getUserProgress(req.body, function (data) {
        res.json(data);
    })
});

router.post('/user/upgradePlan', (req, res, next) => {
    connectionDB.upgradePlan(req.body, function (data) {
        res.json(data);
    })
});

// Notifications
router.post('/notifications/getNotifications', (req, res, next) => {
    connectionDB.getNotifications(req.body.id, function (data) {
        res.json(data);
    });
});

router.post('/notifications/updateNotifications', (req, res, next) => {
    connectionDB.updateNotifications(req.body.id, function (data) {
        res.json(data);
    });
});
/*
router.post('/notifications/updateNotificationsType', (req, res, next) => {
    //console.log('indeks ' + req.body.id);
    connectionDB.updateNotificationsType(req.body.id, function (data) {     
        res.json(data);
    });
});*/


router.post('/my-employees/add', (req, res, next) => {
    connectionDB.addNewEmployee(req.body, function (data) {
        res.json(data);
    })
});

router.post('/job-requests/accept', (req, res, next) => {
    ////console.log('index');
    connectionDB.acceptJobReq(req.body, function (data) {
        res.json(data);
    })
});

router.post('/my-employees/remove', (req, res, next) => {
    connectionDB.dismissEmployee(req.body, function (data) {
        res.json(data);
    })
});
router.post('/measurers/edit', (req, res, next) => {
    connectionDB.editMeasurer(req.body.measurer, req.body.plantages, function (data) {
        res.json(data);
    })
});
router.post('/measurers/delete', (req, res, next) => {
    connectionDB.deleteMeasurer(req.body.measurer, function (data) {
        res.json(data);
    })
});

router.post('/work-requests/deleteRequest', (req, res, next) => {
    connectionDB.deleteRequest(req.body, function (data) {
        res.json(data);
    });
});

router.post('/find-work/deleteRequest', (req, res, next) => {
    connectionDB.deleteRequest2(req.body, function (data) {
        res.json(data);
    });
});

router.post('/measurementsForPlantage', (req, res, next) => {
    connectionDB.getMeasurementsForPlantage(req.body.plantageId, function (data) {
        res.json(data);
    });
});

router.post('/plants/all', (req, res, next) => {
    connectionDB.getAllPlants(req.body.userId, function (data) {
        res.json(data);
    });
});
router.post('/plants/add', (req, res, next) => {
    connectionDB.addNewPlant(req.body.newPlant, function (data) {
        res.json(data);
    });
});

router.post('/plants/remove', (req, res, next) => {
    connectionDB.deletePlant(req.body.specieId, function (data) {
        res.json(data);
    });
});

router.post('/planner', (req, res, next) => {
    connectionDB.getEventsForUser(req.body.UserId, function (data) {
        res.json(data);
    });

});

router.post('/planner/addEventDrag', (req, res, next) => {
    connectionDB.addNewEventDrag(req.body.event, function (data) {
        res.json(data);
    });

});

router.post('/planner/addEventCal', (req, res, next) => {
    connectionDB.addNewEventCalendar(req.body.event, function (data) {
        res.json(data);
    });
});

router.post('/planner/deleteEvent', (req, res, next) => {
    connectionDB.deleteEvent(req.body.event, function (data) {
        res.json(data);
    });
});

router.post('/rules/add', (req, res, next) => {
    connectionDB.addRule(req.body.rule, req.body.userId, req.body.plantId, function (data) {
        res.json(data);
    });
});

router.post('/weather/plantages', (req, res, next) => {
    connectionDB.getUsersPlantages(req.body, function (data) {
        res.json(data);
    });
});

router.post('/planner/change', (req, res, next) => {
    connectionDB.changeEventDate(req.body.event, function (data) {
        res.json(data);
    });
});

router.post('/planner/changeTitle', (req, res, next) => {
    connectionDB.changeEventTitle(req.body.event, function (data) {
        res.json(data);
    });
});
router.post('/plantages/checkAlerts', (req, res, next) => {
    connectionDB.checkAlerts(req.body.plantage, function (data) {
        res.json(data);
    });
});

router.post('/sendToEmailN', (req, res, next) => {
    connectionDB.updateSendToEmail(req.body.dataToSend, function (data) {
        res.json(data);
    });
});

router.post('/getIfSendToEmail', (req, res, next) => {
    connectionDB.checkIfSendToEmail(req.body.userId, function (data) {
        res.json(data);
    });
});


router.post('/getIfSendToEmail', (req, res, next) => {
    connectionDB.checkIfSendToEmail(req.body.userId, function (data) {
        res.json(data);
    });
});

router.post('/getAdvancedRules', (req, res, next) => {
    connectionDB.getAdvancedRules(req.body.userId, function (data) {
        res.json(data);
    });
});
router.post('/getPlantageOwners', (req, res, next) => {
    connectionDB.getPlantageOwners(req.body.userId, function (data) {
        res.json(data);
    });
});

router.post('/getPlantagesForOwner', (req, res, next) => {
    connectionDB.getPlantagesForOwner(req.body.ownerId, req.body.userId, function (data) {
        res.json(data);
    });
});

router.post('/addAdvancedRule', (req, res, next) => {
    connectionDB.addAdvancedRule(req.body.userId, req.body.rule, function (data) {
        res.json(data);
    });
});

router.post('/deleteAdvancedRule', (req, res, next) => {
    connectionDB.deleteAdvancedRule(req.body.rule, function (data) {
        res.json(data);
    });
});


router.post('/user-profile/upload', function (req, res, next) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    var image = req.files.image;
    var userId = JSON.parse(req.body.userId);

    var ex = image.name.substring(image.name.lastIndexOf('.') + 1, image.name.length) || image.name;
    ex = ex.toLowerCase();
    var toDelete = userId + ".*";
    glob(toDelete, { cwd: __dirname + "/userImages" }, function (err, files) {
        if (err) {
        } else {
            var i = 0;
            files.forEach(function (element) {
                fs.unlink(__dirname + "/userImages/" + element);
                i++;
            }, this);
            if (i === files.length) {
                image.mv(__dirname + '/userImages/' + userId + '.' + ex, function (err) {
                    if (err)
                        return res.status(500).send(err);
                    var dataS = {
                        userId: userId,
                        imagePath: userId + "." + ex
                    }
                    connectionDB.updateUserImage(dataS, function (data) {
                    });
                });
            }
        }
    })

});


router.post('/getUserImage', (req, res, next) => {
    connectionDB.getImageForUser(req.body.userId, function (data) {
        res.json(data);
    });
});

router.post('/getUserImageTop', (req, res, next) => {
    connectionDB.getImageForUser(req.body.userId, function (data) {
        res.json(data);
    });
});


module.exports = router;

