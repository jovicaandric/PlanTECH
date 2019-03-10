var fs = require("fs");
var file = "./Database/plantechBaza.db";
var measurers = "./Database/measurers.db";
const forecast = require("./weatherApi");
var bcrypt = require("bcrypt");
var exists = fs.existsSync(file);
var sqlite = require("sqlite3").verbose();
var session = require('client-sessions');
var nodemailer = require('nodemailer');
var asyncLoop = require('node-async-loop');





var db;
var measurersDb;

connectDb = function () {
    db = new sqlite.Database(file);
};
connectDbMeasurements = function () {
    measurersDb = new sqlite.Database(measurers);
};

// CRUD User-i
function checkIfUserExists(user, callback) {
    db.all("SELECT * from Users where Username=? or Email=?", [user.username, user.email], (err, rows) => {
        if (rows.length > 0)
            callback(true);
        else
            callback(false);
    });
}

// CRUD User-i
module.exports.addUser = function (user, callback) {
    connectDb();
    checkIfUserExists(user, (res) => {
        if (res) {
            callback({ success: false, msg: 'Neuspesna registracija' });
        } else {
            var pass = user.password;
            bcrypt.hash(pass, 10, (err, hash) => {
                var query = 'INSERT INTO Users(Firstname,Lastname,Password,Username,Email,Role,RegDate, EmailNotifications) \
               VALUES(?, ?, ? , ?, ?,"User",?,1)';
                db.run(query,
                    [user.firstname,
                    user.lastname,
                        hash,
                    user.username,
                    user.email,
                    (new Date).getTime()],
                    (err) => {
                        if (err) {
                            callback({ success: false, msg: 'Neuspesna registracija', err: err });
                        } else {
                            callback({ success: true, msg: 'Uspesna registracija' });
                        }
                    });
            });
        }

    });
};

module.exports.userAuthenticate = function (user, callback) {
    connectDb();
    const username = user.username;
    const password = user.password;
    var query = "SELECT * FROM Users WHERE Username = ?";

    db.all(query, [
        user.username
    ], (err, rows) => {
        if (err || rows.length == 0) {
            callback({ success: false, msg: 'Neuspesan login' });
        } else {
            bcrypt.compare(password, rows[0].Password, (err, res) => {
                if (res == true) {
                    //uspesan login
                    callback({ success: true, user: JSON.stringify(rows[0]) });
                } else {
                    callback({ success: false, msg: 'Neuspesan login' });

                }
            });
        }

    });
};

module.exports.getUsers = function (callback) {
    connectDb();
    var query = "SELECT Id,Username,Email,Firstname,Lastname FROM Users";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno listanje svih USER-a' });
        } else {
            callback({ user: JSON.stringify(rows) });
        }

    });

};

module.exports.deleteUser = function (user, callback) {
    connectDb();
    const userId = user.id;
    var query = "DELETE FROM Users WHERE Id = ?";

    db.run(query, userId, (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno brisanje' });

        } else {
            callback({ success: true, msg: 'Uspesno brisanje' });

        }
    });
};

module.exports.updateUser = function (user, callback) {
    connectDb();
    var query = "UPDATE Users SET Firstname = ?, Lastname = ?, Username= ?, Email= ?  WHERE id = ?";
    db.run(query,
        [user.firstname,
        user.lastname,
        user.username,
        user.email,
        user.id],
        (err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno editovanja', err: err });
            } else {
                callback({ success: true, msg: 'Uspesna editovanje' });
            }
        });
};

// CRUD - Plantaze SQL

module.exports.addPlantageSql = function (plantage, callback) {
    connectDb();
    var query = 'INSERT INTO Plantage(Name,Owner,Path) \
               VALUES(?, ?,?)';
    db.run(query,
        [plantage.Name,
        plantage.Owner,
        JSON.stringify(plantage.Path)],
        function (err) {
            if (err) {
                callback({ success: false, error: err, msg: 'Neuspesno dodavanje nove plantaze' });
            } else {
                var plantMongo = {
                    plantageId: this.lastID,
                    path: plantage.Path
                }
                var q = "insert into User_Permission(UserID,PlantageID,PermissionID) Values(" + plantage.Owner + ", " + plantMongo.plantageId + ", 1),\
                    (" + plantage.Owner + ", " + plantMongo.plantageId + ", 2),\
                    (" + plantage.Owner + ", " + plantMongo.plantageId + ", 3),\
                    (" + plantage.Owner + ", " + plantMongo.plantageId + ", 4),\
                    (" + plantage.Owner + ", " + plantMongo.plantageId + ", 5)";
                db.run(q, (err) => {
                    if (!err) {
                        var species = "insert into Specie_Plantage(SpecieId,PlantageId,PlantingDate) Values";
                        for (var i = 0; i < plantage.Plants.length; i++) {
                            if (i > 0)
                                species += ",";
                            species += "(" + plantage.Plants[i].Specie + ", " + plantMongo.plantageId + ", " + plantage.Plants[i].plantDate + ")";
                        }
                        db.run(species, (err) => {
                            if (!err) {
                                callback({ msg: "Uspesno dodavanje plantaze" });
                            }
                        })
                    }
                });
            }
        });
};

//brise plantazu iz mysql i iz monga
module.exports.deletePlantage = function (plantageId, callback) {
    var query = "DELETE FROM Plantage WHERE Id = ?";
    db.run(query, plantageId, (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno brisanje plantaze po ID-u' });
        } else {
            var q = "DELETE FROM User_Permission WHERE PlantageID=" + plantageId;
            db.run(q, (err) => {
                if (err) {
                    callback({ "success": err, msg: "Neuspesno brisanje plantaze" });
                } else {
                    callback({ "success": true, msg: "Uspesno brisanje plantaze" });
                }
            });
        }
    });
}

module.exports.findPlantageByIdSql = function (plantage, callback) {
    connectDb();
    const plantageId = plantage.id;
    var query = "SELECT * FROM Plantage WHERE Id ='" + plantageId;

    db.all(query, (err, rows) => {
        if (err || rows.length == 0) {
            callback({ success: false, msg: 'Neuspesan nalazenje plantaze po id-u' });

        } else {
            callback({ success: true, plantage: JSON.stringify(rows) });

        }
    });


};

module.exports.updatePlantage = function (plantage, callback) {
    connectDb();
    var query = 'UPDATE Plantage SET Name = ?,Path=? \
               WHERE id =' + plantage.plantageId;
    db.run(query,
        [plantage.title, JSON.stringify(plantage.path)],
        (err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno editovanje plantaze', err: err });
            } else {
                var deletePlants = 'Delete from Specie_Plantage where PlantageId=?';
                db.run(deletePlants, [plantage.plantageId], (err) => {
                    if (!err) {
                        var species = "insert into Specie_Plantage(SpecieId,PlantageId,PlantingDate) Values";
                        for (var i = 0; i < plantage.plants.length; i++) {
                            if (i > 0)
                                species += ",";
                            species += "(" + plantage.plants[i].specie.id + ", " + plantage.plantageId + ", " + plantage.plants[i].plantDate + ")";
                        }
                        db.run(species, (err) => {
                            if (!err) {
                                callback({ "success": true, msg: "Uspesno nalazenje plantaze" });
                            } else {
                                callback({ success: false, msg: 'Neuspesno dodavanje species', err: err });
                            }
                        });
                    } else {
                        callback({ success: false, msg: 'Neuspesno brisanje species', err: err });
                    }
                });

            }
        });
};

//daje putanje za sve plantaze iz mongo baze
// function getAllPaths(callback) {
//     Plantage.find(
//         (err, plantages) => {
//             if (err) {
//                 callback({ "success": err, msg: "Neuspesno citanje plantaze" });
//             } else {
//                 callback(plantages);
//             }
//         })
// }
function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t.getDate() + "-" + (t.getMonth() + 1) + "-" + t.getFullYear();
}
//daje sve plantaze za nekog zadatog korisnika
//vraca json koji sadrzi podatke iz sql + path iz monga + permisije za plantazu koje taj user ima

module.exports.getAllPlantagesForUser = function (userId, callback) {
    connectDb();
    var query = "select view.UserID as UserID,view.PlantageId as PlantageId,view.Name as PlantageName,view.Owner as OwnerId,u.Firstname as OwnerFname,u.Lastname as OwnerLname,view.pathJson,\
    GROUP_CONCAT(sp.SpecieId)as SpecieId,GROUP_CONCAT(s.Name)as SpecieName,\
    GROUP_CONCAT(p.Id) as PlantId, GROUP_CONCAT(p.name) as PlantName, GROUP_CONCAT(c.Id) as CategoryId,\
    GROUP_CONCAT(c.name) as CategoryName, GROUP_CONCAT(sm.Id) as SeedId, GROUP_CONCAT(sm.CompanyName) as SeedName,\
        GROUP_CONCAT(sp.PlantingDate) as PlantingDate, view.PermissionsID as PermissionsID,view.PermissionsName as PermissionsName\
    from(select UserID, up.PlantageId as PlantageId, Name, p.Owner as Owner,p.Path as pathJson, GROUP_CONCAT(up.PermissionID) as PermissionsID,GROUP_CONCAT(pe.Title) as PermissionsName\
        FROM User_Permission up left join Plantage p on up.PlantageID = p.Id join Permissions pe on up.PermissionID=pe.Id\
        where up.UserID = ?\
        group by UserID, up.PlantageId) view\
    left  join Specie_Plantage sp on sp.PlantageId = view.PlantageId\
    join Species s on sp.SpecieID = s.Id\
    join Plants p on s.PlantId = p.Id\
    join Seed_Manufacturers sm on s.Seed_Manufacturer = sm.Id\
    join Category c on p.CategoryId = c.Id\
    join Users u on u.Id = view.Owner\
    group by sp.PlantageId";
    var plantages = [];
    // getAllPaths((result) => {
    //     //putanje koje cuvamo u mongu
    //     var paths = result;
    db.all(query, [userId], (err, rows) => {
        if (!err) {
            for (var i = 0; i < rows.length; i++) {
                let plantage = rows[i];
                plantages.push({
                    "plantageId": plantage.PlantageId,
                    "title": plantage.PlantageName,
                    "owner": {
                        "id": plantage.OwnerId,
                        "firstname": plantage.OwnerFname,
                        "lastname": plantage.OwnerLname
                    },
                    "path": JSON.parse(plantage.pathJson),
                    "permissions": plantage.PermissionsID.split(','),
                    "permissionsName": plantage.PermissionsName.split(','),
                    "plants": []
                });

                var categoriesID = rows[i].CategoryId.split(',');
                var categoriesName = rows[i].CategoryName.split(',');

                var speciesID = rows[i].SpecieId.split(',');
                var speciesName = rows[i].SpecieName.split(',');

                var plantsID = rows[i].PlantId.split(',');
                var plantsName = rows[i].PlantName.split(',');

                var seedsID = rows[i].SeedId.split(',');
                var seedsName = rows[i].SeedName.split(',');

                var plantDates = rows[i].PlantingDate.split(',');

                for (var k = 0; k < categoriesID.length; k++) {
                    plantages[i].plants.push({
                        "category": {
                            "id": categoriesID[k],
                            "text": categoriesName[k]
                        },
                        "plant": {
                            "id": plantsID[k],
                            "text": plantsName[k]
                        },
                        "specie": {
                            "id": speciesID[k],
                            "text": speciesName[k]
                        },
                        "seedManufacturer": {
                            "id": seedsID[k],
                            "text": seedsName[k]
                        },
                        "plantDate": parseInt(plantDates[k])
                    });
                }

                // for (var j = 0; j < paths.length; j++) {
                //     if (paths[j].plantageId == rows[i].PlantageId) {
                //         plantages[i].path = paths[j].path;
                //         for (var k = 0; k < plantages[i].path.length; k++) {
                //             plantages[i].path[k].lat = parseFloat(plantages[i].path[k].lat);
                //             plantages[i].path[k].lng = parseFloat(plantages[i].path[k].lng);
                //         }
                //         break;
                //     }
                // }
            }
            callback({ plantages: plantages });
        } else {
            callback({ plantages: null });
        }
    });
    // });
}

module.exports.fakeSystemMeasurers = function (callback) {
    connectDb();
    var query = "Select * from Measurer"
    db.all(query, (err, rows) => {
        if (err) {
            callback({ "err": err });
        } else {
            callback({ measurers: JSON.stringify(rows) })
        }
    });
}

module.exports.getAllMeasurers = function (user, callback) {
    connectDb();
    var query = "Select me.Id,me.MeasuringUnit,me.Lat,me.Lng,me.Owner,me.Url,GROUP_CONCAT(k.PlantageId)as PlantageId,GROUP_CONCAT(k.Name)as PlantageName\
     from Measurer me left join (select * from User_Permission up join Plantage p on up.PlantageId=p.Id join Measurer_Plantage mp on p.Id=mp.PlantageId\
      where up.PermissionId=4 and UserId=?) k on me.Id=k.MeasurerId\
       where k.UserId=? or (k.UserId IS NULL and me.Owner IS NULL) or me.Owner=?\
        group by me.Id,me.MeasuringUnit,me.Lat,me.Lng,me.Owner,me.Url";
    db.all(query, [user.Id, user.Id, user.Id], (err, rows) => {
        if (err) {
            console.log(err);
            callback({ "err": err });
        } else {
            var measurers = [];
            for (var i = 0; i < rows.length; i++) {

                measurers.push({
                    Id: rows[i].Id,
                    MeasuringUnit: rows[i].MeasuringUnit,
                    Lat: rows[i].Lat,
                    Lng: rows[i].Lng,
                    Owner: rows[i].Owner,
                    Url: rows[i].Url,
                    Plantages: []
                });
                if (rows[i].PlantageId != null) {
                    var plantagesId = rows[i].PlantageId.split(",");
                    var plantagesName = rows[i].PlantageName.split(",");

                    for (var j = 0; j < plantagesId.length; j++) {
                        measurers[i].Plantages.push({
                            id: plantagesId[j],
                            name: plantagesName[j]
                        });
                    }
                }
            }
            callback({ "measurers": JSON.stringify(measurers) });
        }
    });
}

module.exports.addMeasurer = function (measurer, callback) {
    connectDb();
    var con = this;
    var query = "Insert into Measurer(MeasuringUnit,Lat,Lng,Owner,Url) Values(?,?,?,?,?)"
    db.run(query, [
        measurer.measureValue,
        measurer.lat,
        measurer.lng,
        measurer.owner,
        measurer.url
    ], function (err) {
        var measId = this.lastID;
        if (err) {
            callback({ "success": err });

        } else {
            asyncLoop(Array.from(Array(30).keys()), (i, next) => {
                var value = {
                    "id": measId,
                    "DateTime": Date.now() - (i * 8000 * 3600),
                };
                switch (measurer.measureValue) {
                    case "Air Humidity":  //vlaznost vazduha
                        value.Value = Math.random() * 100;  //%
                        break;
                    case "Ground Humidity":  //poljski vodni kapacitet
                        value.Value = Math.random() * 70 + 30;  //%
                        break;
                    case "Ph": //kiselost
                        value.Value = Math.random() * 6 + 3;
                        break;
                    case "CaCO3":  //kalcijum-karbonar
                        value.Value = Math.random() * 10  //%
                        break;
                    case "N": //azot
                        value.Value = Math.random() * 5 // mg/100g zemljista
                        break;
                    case "K2O": //kalijum
                        value.Value = Math.random() * 40 // mg/100g zemljista
                        break;
                    case "P2O5": //fosfor
                        value.Value = Math.random() * 40 // mg/100g zemljista
                        break;
                    case "GroundTemp": //temperatura zemlje
                        value.Value = Math.random() * 40
                        break;
                    case "Hummus": //humus
                        value.Value = Math.random() * 6
                        break;
                }
                con.addMeasurement(value, (data) => {
                    next();
                });
            }, function (err) {
                if (!err) {
                    var q = "insert into Measurer_Plantage(MeasurerId,PlantageId) Values";
                    for (var i = 0; i < measurer.checkedPlantages.length; i++) {
                        if (i > 0)
                            q += ",";
                        q += "(" + measId + ", " + measurer.checkedPlantages[i] + ")";
                    }
                    db.run(q, (err) => {
                        if (err) {
                            callback({ "msg": "error" });
                        } else {
                            callback({ "msg": "success" });

                        }
                    });
                }

            });

        }
    });
}

module.exports.editMeasurer = function (measurer, plantages, callback) {
    connectDb();
    var query = "Update Measurer set MeasuringUnit=?, Url=? where Id=?";
    db.run(query, [measurer.MeasuringUnit, measurer.Url, measurer.Id], (err) => {
        if (err) {
            callback({ "err": "UPDATE" });
        } else {
            var deleteAgg = "DELETE FROM Measurer_Plantage WHERE MeasurerId=? and PlantageId in(";
            for (var i = 0; i < plantages.length; i++) {
                if (i > 0)
                    deleteAgg += ",";
                deleteAgg += plantages[i].plantageId;
            }
            deleteAgg += ")";
            // console.log(deleteAgg);
            db.run(deleteAgg, [measurer.Id], (err) => {
                if (err) {
                    callback({ "err": "DELETE" });
                }
                else {
                    var q = "insert into Measurer_Plantage(MeasurerId,PlantageId) Values";
                    for (var i = 0; i < measurer.Plantages.length; i++) {
                        if (i > 0)
                            q += ",";
                        q += "(" + measurer.Id + ", " + measurer.Plantages[i].id + ")";
                    }
                    db.run(q, (err) => {
                        if (err) {
                            callback({ "msg": "error" });
                        } else {
                            callback({ "msg": "success" });
                        }
                    });
                }

            });
        }

    });
}

module.exports.deleteMeasurer = function (measurer, callback) {
    connectDb();
    var query = "delete from Measurer where Id=?";
    db.run(query, [measurer], (err) => {
        if (err) {
            callback({ "err": err });
        } else {
            var q1 = "delete from Measurer_Plantage where MeasurerId=?";
            db.run(q1, [measurer], (err) => {
                if (err) {
                    callback({ "err": err });
                } else {
                    callback({ "err": null });
                }
            });
        }
    });
}

module.exports.addMeasurement = function (value, callback) {
    connectDbMeasurements();
    var query = "INSERT INTO Measurements(MeasurerId,Value,DateTime) Values(?,?,?)";
    measurersDb.run(query, [
        value.id,
        value.Value,
        value.DateTime
    ], (err) => {
        if (err) {
            callback({ "success": err });

        } else {
            callback({ "success": true });

        }
    });
}

// Plantaze Mongo

// function addPlantageMongo(plantaza, callback) {
//     var newPlantage = new Plantage();

//     newPlantage.plantageId = plantaza.plantageId;
//     for (i = 0; i < plantaza.path.length; i++) {
//         newPlantage.path[i] = plantaza.path[i];
//     }

//     newPlantage.save(function (err, plantage) {
//         if (err) {
//             callback({ "success": err, msg: "Neuspesno dodavanje plantaze" });
//         } else {
//             callback({ "success": true, msg: "Uspesno dodavanje plantaze" });
//         }
//     });
// }

// module.exports.getPlantageMongo = function (plantaza, callback) {
//     Plantage.findOne({ plantageId: req.body.plantageId },
//         (err, plantage) => {
//             if (err) {
//                 callback({ "success": err, msg: "Neuspesno citanje plantaze" });
//             } else {
//                 res.send(plantage);
//             }
//         })
// }

function getUserByEmail(email, callback) {
    db.all("SELECT Users.Id, Users.email, User_Reset_Password.Id as resetPasswordId, User_Reset_Password.resetPasswordToken as token \
            FROM Users \
            LEFT JOIN User_Reset_Password ON Users.Id = User_Reset_Password.userId \
            WHERE Email=?", [email], (err, rows) => {
            if (!err) {
                if (rows.length > 0)
                    callback(rows[0]);
                else
                    callback(false);
            } else
                callback(err);
        });
}

function getUserEmailNotificationById(id, callback) {
    db.all("SELECT Users.Id, Users.EmailNotifications, Users.Email \
            FROM Users \
            WHERE Id=?", [id], (err, rows) => {
            //console.log(err);
            if (!err) {
                // console.log(rows);
                if (rows.length > 0)
                    callback(rows[0]);
                else
                    callback(false);
            }
        });
}

function getUserByToken(token, callback) {
    db.all("SELECT Users.Id, Users.email, User_Reset_Password.Id as resetPasswordId, User_Reset_Password.resetPasswordToken as token \
            FROM Users \
            LEFT JOIN User_Reset_Password ON Users.Id = User_Reset_Password.userId \
            WHERE User_Reset_Password.resetPasswordToken=?", [token], (err, rows) => {
            if (!err) {
                if (rows.length > 0)
                    callback(rows[0]);
                else
                    callback(false);
            }
        });
}

module.exports.addUserReset = function (data, callback) {
    connectDb();
    getUserByEmail(data.email, (user) => {
        if (!user) {
            callback({ success: false, msg: "Add User Reset: Greska" });
        } else {
            var sendMail = function (token) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'plantech2017@gmail.com',
                        pass: 'plantechprojekat'
                    }
                });
                var mailOptions = {
                    to: data.email,
                    from: 'plantech2017@gmail.com',
                    subject: 'PlanTech Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + data.headers.host + '/users/reset?token=' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                });
                callback({ success: true, msg: 'Uspesno dodavanje tokena' });
            }
            if (user.resetPasswordId) {
                sendMail(user.token);
            }
            else {
                var query = 'INSERT INTO User_Reset_Password(userId,resetPasswordToken,resetPasswordExpires) \
                            VALUES(?, ?, ?)';
                db.run(query, [
                    user.Id,
                    data.resetPasswordToken,
                    data.resetPasswordExpires
                ],
                    (err) => {
                        if (err) {
                            callback({ success: false, msg: 'Greska prilikom dodavanja tokena', err: err });
                        } else {
                            var newPassword = Math.random().toString(18).substring(2, 10);
                            this.editPassword({ id: user.Id, password: newPassword }, () => {
                                db.close();
                            });
                            sendMail(data.resetPasswordToken);

                        }
                    });
            }

        }
        db.close();
    });
};

module.exports.resetUserPassword = function (data, callback) {
    connectDb();
    getUserByToken(data.token, (user) => {
        if (!user) {
            callback({ success: false, msg: "Add User Reset: Greska" });
        } else {
            var sendMail = function (password) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'plantech2017@gmail.com',
                        pass: 'plantechprojekat'
                    }
                });
                var mailOptions = {
                    to: user.Email,
                    from: 'plantech2017@gmail.com',
                    subject: 'PlanTech Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Your new password is: ' + password
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                });
                callback({ success: true, msg: 'Uspesno resetovanje password-a' });
            }
            var newPassword = Math.random().toString(18).substring(2, 10);
            editPass({ id: user.Id, password: newPassword }, (aa) => {
                sendMail(newPassword);
                db.close();
            });

        }
    });
};



module.exports.getUsersOwnerReq = function (callback) {
    connectDb();
    var query = "SELECT Users.Id,Users.Username,Users.Email,Users.Firstname,Users.Lastname,Owner_Request.BillingPlan \
				 FROM Users \
				 LEFT JOIN Owner_Request ON Users.Id = Owner_Request.Owner \
				 WHERE Owner_Request.Resolved = 'pending'";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno listanje USER-a iz Owner_Request tabele' });
        } else {
            callback({ user: JSON.stringify(rows) });
        }

    });

};

module.exports.getUserId = function (owner, callback) {
    connectDb();

    var query = "SELECT Users.Id,Users.Username,Users.Email,Users.Firstname,Users.Lastname FROM Users WHERE Users.Username like '" + owner.username + "'";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno hvatanje Id-a' });
        } else {
            callback({ user: JSON.stringify(rows) });
        }

    });
};

module.exports.AddOwnerRequest = function (value, callback) {
    connectDb();
    var query = "INSERT INTO Owner_Request(Owner,BillingPlan,Resolved) Values(?,?,?)";

    db.run(query, [
        value.Owner,
        value.BillingPlan,
        value.Resolved
    ], (err) => {
        if (err)
            callback(false);
        else {
            var korisnici = "select Firstname, Lastname \
                                from Users \
                                where id = ?"
            db.all(korisnici, [value.Owner], (err, rows) => {
                if (err)
                    callback(err)
                else {
                    var notification = {
                        Title: "Zahtev za vlasnika",
                        Description: "Zahtev za biling plan",
                        Receiver: 29,
                        PlantageId: null,
                        NotificationDate: Date.now(),
                        Type: 'billing'
                    }

                    addNotification(notification, () => {
                        callback({ success: true });
                    });
                }
            });
        }
    });
}

module.exports.updateOwnerReq = function (user, response, callback) {
    connectDb();
    var query = "UPDATE Owner_Request SET Resolved = ? \
                WHERE Owner = " + user.Id;
    db.run(query,
        [response],
        (err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno editovanja', err: err });
            } else {

                if (response == 'accepted') {
                    var perm = "DELETE FROM Owner_Request \
                                WHERE Owner = ? and BillingPlan not in ( \
                                    SELECT max(BillingPlan) \
                                    FROM Owner_Request \
                                    Where Owner = ? \
                                )";
                    //console.log(perm);
                    db.run(perm, [user.Id, user.Id],
                        (err) => {
                            if (err) {
                                callback({ success: false });
                            }
                            else {
                                var notification = {
                                    Title: "Odgovor na zahtev",
                                    Description: "Administrator je prihvatio vas zahtev za vlasnika",
                                    Receiver: user.Id,
                                    PlantageId: null,
                                    NotificationDate: Date.now(),
                                    Type: 'accept'
                                }
                                addNotification(notification, () => {
                                    callback({ success: true });
                                });
                            }
                        });
                }
                if (response == 'rejected') {
                    var notification = {
                        Title: "Odgovor na zahtev",
                        Description: "Administrator je odbio vas zahtev za vlasnika",
                        Receiver: user.Id,
                        PlantageId: null,
                        NotificationDate: Date.now(),
                        Type: 'reject'
                    }
                    addNotification(notification, () => {
                        callback({ success: true });
                    });
                }
            }
        });
};

module.exports.checkIfOwner = function (id, callback) {
    connectDb();
    var query = "Select * from Owner_Request where Owner=? and Resolved='accepted'";
    db.all(query, [id], (err, rows) => {
        if (!err) {
            if (rows.length == 0)
                callback(false);
            else
                callback(true);
        } else {
            callback(err);
        }
    })
}

module.exports.checkIfCanSeePlantages = function (id, callback) {
    connectDb();
    var query = "select UserId as user from User_Permission u where UserID=? \
union \
select Owner as user from Owner_Request where Owner=? and Resolved=='accepted'";
    db.all(query, [id, id], (err, rows) => {
        // console.log(err);
        if (!err) {
            // console.log(rows);
            if (rows.length == 0)
                callback(false);
            else
                callback(true);
        } else {
            callback(err);
        }
    })
}


module.exports.checkIfRuler = function (id, callback) {
    connectDb();
    var query = "Select * from User_Permission u where u.UserID = ? and u.PermissionID = 5";
    db.all(query, [id], (err, rows) => {
        if (!err) {
            if (rows.length == 0)
                callback(false);
            else
                callback(true);
        } else {
            callback(err);
        }
    })
}

module.exports.checkUpgrade = function (id, callback) {
    connectDb();
    var query = "Select * from Owner_Request where Owner = ? and Resolved = 'pending'";
    db.all(query, [id], (err, rows) => {
        if (!err) {
            if (rows.length == 0)
                callback(false);
            else
                callback(true);
        } else {
            callback(err);
        }
    })
}

module.exports.getPlantCategories = function (callback) {
    connectDb();
    var query = "select Id as id, Name as text from Category"
    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Greska' });
        } else {
            callback({ categories: JSON.stringify(rows) });
        }
    });
}

module.exports.getPlantsForCategory = function (categoryId, userId, callback) {
    connectDb();
    var query = "select Id as id, Name as text,AltitudeFrom,AltitudeTo,PlantingFrom,PlantingTo from Plants where CategoryId=? and (Owner is NULL or Owner=?)"
    db.all(query, [categoryId, userId], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Greska' });
        } else {
            callback({ plants: JSON.stringify(rows) });
        }
    });
}

module.exports.getSpecies = function (plantId, userId, callback) {
    connectDb();
    var query = "select Id as id, Name as text,Info from Species where PlantId=? and (Owner is NULL or Owner =?)"
    db.all(query, [plantId, userId], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Greska' });
        } else {
            callback({ species: JSON.stringify(rows) });
        }
    });
}

module.exports.getSeedmanufacturer = function (specieId, callback) {
    connectDb();
    var query = "select sm.Id as id, sm.CompanyName as text from Seed_Manufacturers sm join Species s on sm.Id=s.Seed_Manufacturer where s.Id=?"
    db.all(query, [specieId], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Greska' });
        } else {
            callback({ seeds: JSON.stringify(rows) });
        }
    });
}


module.exports.editUserName = function (user, callback) {
    connectDb();
    var query = "UPDATE Users SET Firstname = ?, Lastname = ? WHERE id = ?";
    db.run(query, [user.firstname, user.lastname, user.id], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno', err: err });
        } else {
            callback({ success: true, msg: 'Uspesno' });
        }
    });

}


module.exports.editUserEmail = function (user, callback) {
    connectDb();
    var query = "UPDATE Users SET Email = ? WHERE id = ?";
    db.run(query, [user.email, user.id], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno', err: err });
        } else {
            callback({ success: true, msg: 'Uspesno' });
        }
    });

}


module.exports.editUsername = function (user, callback) {
    connectDb();
    var query = "UPDATE Users SET Username = ? WHERE id = ?";
    db.run(query, [user.username, user.id], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno', err: err });
        } else {
            callback({ success: true, msg: 'Uspesno' });
        }
    });
}

function editPass(user, callback) {
    connectDb();
    var pass = user.password;
    bcrypt.hash(pass, 10, (err, hash) => {
        var query = "UPDATE Users SET Password = ? WHERE id = ?";
        db.run(query, [hash, user.id], (err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno', err: err });
            } else {
                callback({ success: true, msg: 'Uspesno' });
            }
        });
    });
}

module.exports.editPassword = function (user, callback) {
    editPass(user, function (res) {
        callback(res);
    });

}

module.exports.addUserPermissions = function (user, callback) {
    connectDb();
    db.serialize(function () {

        var stmt = db.prepare("INSERT INTO User_Permission(UserID, PlantageID, PermissionID) VALUES (?,?,?)");
        for (var i = 0; i < user.permissions.length; i++) {
            stmt.run(user.userid, user.plantageid, user.permissions[i]);
        }
        stmt.finalize((err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno upisivanje permisija', err: err });
                db.close();
            } else {
                callback({ success: true, msg: 'Uspesno upisivanje permisija' });
                db.close();
            }
        });
    });
};
module.exports.getUsersPlantages = function (user, callback) {
    connectDb();
    var query = "select * from Plantage where Owner=?"
    db.all(query, [user.Id], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Greska' });
        } else {
            callback({ plantages: JSON.stringify(rows) });
        }
    });
}

module.exports.getUsersToRequest = function (callback) {
    connectDb();
    var query = "SELECT Id,Username,Email,Firstname,Lastname,Role,Image FROM Users where Role='User'";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno listanje svih USER-a' });
        } else {
            callback({ user: JSON.stringify(rows) });
        }

    });

};

module.exports.getUsersToRequest2 = function (callback) {
    connectDb();
    var query = "SELECT u.Id,u.Username,u.Email,u.Firstname,u.Lastname, u.Image \
                FROM Users u inner join Owner_Request o on u.Id = o.Owner \
                where u.Role='User' and o.Resolved = 'accepted'";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno listanje svih USER-a' });
        } else {
            callback({ user: JSON.stringify(rows) });
        }

    });

};


module.exports.getPermissions = function (callback) {
    connectDb();
    var query = "SELECT Id,Title FROM Permissions";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            callback({ permissions: JSON.stringify(rows) });
        }

    });
}

module.exports.addWorkRequest = function (request, callback) {
    connectDb();
    //console.log("RR=" + request.owner);
    var query = "Insert into Work_Request(Author,Worker,Owner,Message,Resolved,JsonRequest) Values(?,?,?,?,'pending',?)";
    db.run(query, [
        request.author,
        request.worker,
        request.owner,
        request.message,
        JSON.stringify(request)
    ], (err) => {
        if (err)
            callback(false);
        else {
            var notification = {
                Title: null,
                Description: null,
                Receiver: null,
                PlantageId: null,
                NotificationDate: Date.now(),
                Type: ''
            }
            if (request.author == request.owner) {
                notification.Receiver = request.worker;
                notification.Title = "Ponuda za posao";
                notification.Type = 'job-offer';
            } else {
                notification.Receiver = request.owner;
                notification.Title = "Zahtev za posao";
                notification.Type = 'job-request';
            }
            notification.Description = request.message;
            addNotification(notification, () => {
                callback(true);
            });
        }

    });
}

module.exports.getJobOffers = function (user, callback) {
    connectDb();
    var query = "Select wr.Id as Id, u.Firstname as firstname, u.Lastname as lastname, u.Email as email, u.Username as username, wr.Message as message \
                 from Work_Request wr join Users u on wr.Author=u.Id \
                 where wr.Worker=? and wr.Resolved='pending' and wr.Worker!=wr.Author";
    db.all(query, [user], (err, rows) => {
        if (err) {
            callback({ success: false, msg: err });
        } else {
            callback({ offers: JSON.stringify(rows) });
        }
    });
}
module.exports.getJobRequests = function (user, callback) {
    connectDb();
    var query = "Select wr.Id as Id, u.Id as Ident, u.Firstname as firstname, u.Lastname as lastname, u.Email as email, u.Username as username, wr.Message as message \
                 from Work_Request wr join Users u on wr.Author=u.Id \
                 where wr.Owner=? and wr.Resolved='pending' and wr.Owner!=wr.Author";
    db.all(query, [user], (err, rows) => {
        if (err) {
            callback({ success: false, msg: err });
        } else {
            callback({ offers: JSON.stringify(rows) });
        }
    });
}

module.exports.acceptJobOffer = function (offer, callback) {
    connectDb();

    var query = "Update Work_Request set Resolved='accepted' where Id=?";
    db.run(query, [offer], (err, rows) => {
        if (err) {
            callback({ success: false, msg: err });
        } else {
            var of = "select JsonRequest as myOffer from Work_Request where Id=?"
            db.all(of, [offer], (err, rows) => {
                var myOffer = JSON.parse(rows[0].myOffer);
                var perm = "Insert into User_Permission(UserID,PlantageID,PermissionID) Values";
                for (var i = 0; i < myOffer.plantagesPermissions.length; i++) {
                    for (var j = 0; j < myOffer.plantagesPermissions[i].permissions.length; j++) {
                        if (i + j > 0)
                            perm += ",";
                        perm += "(" + myOffer.plantagesPermissions[i].userId + ", " + myOffer.plantagesPermissions[i].plantageId + ", " + myOffer.plantagesPermissions[i].permissions[j] + ")";
                    }
                }
                db.run(perm, (err) => {
                    if (err)
                        callback(err);
                    else {
                        var korisnici = "select Firstname, Lastname, Author, Owner, Worker \
                                         from Users join Work_Request on Users.Id = Work_Request.Worker or \
                                                                         Users.Id = Work_Request.Owner \
                                         where Work_Request.Id = ?"
                        db.all(korisnici, [offer], (err, rows) => {
                            if (err)
                                callback(err)
                            else {
                                var notification = {
                                    Title: null,
                                    Description: null,
                                    Receiver: null,
                                    PlantageId: null,
                                    NotificationDate: Date.now(),
                                    Type: ''
                                }

                                if (rows[0].Author == rows[0].Owner) {
                                    notification.Receiver = rows[0].Owner;
                                    notification.Title = "Ponuda za posao";
                                    notification.Description = rows[1].Firstname +
                                        " " + rows[1].Lastname +
                                        " je prihvatio vasu nponudu za posao!";
                                    notification.Type = 'job-offer-accepted'
                                } else {
                                    notification.Receiver = rows[0].Worker;
                                    notification.Title = "Zahtev za posao";
                                    notification.Description = rows[0].Firstname +
                                        " " + rows[0].Lastname +
                                        " je prihvatio vasu nponudu za posao!";
                                    notification.Type = 'job-offer-accepted'
                                }

                                addNotification(notification, () => {
                                    callback(true);
                                });
                            }
                        });
                    }
                })
            });
        }
    });
}
module.exports.refuseJobOffer = function (offer, callback) {
    connectDb();
    var query = "Update Work_Request set Resolved='refused' where Id=" + offer;

    db.run(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: err });
        } else {
            var korisnici = "select Firstname, Lastname, Author, Owner, Worker \
                                         from Users join Work_Request on Users.Id = Work_Request.Worker or \
                                                                         Users.Id = Work_Request.Owner \
                                         where Work_Request.Id = ?"
            db.all(korisnici, [offer], (err, rows) => {
                if (err)
                    callback(err)
                else {
                    var perm1 = "DELETE FROM Work_Request \
                                 WHERE Worker = " + rows[0].Worker + " and Owner =" + rows[0].Owner;

                    db.run(perm1, (err, rowz) => {
                        if (err) {
                            callback({ success: false });
                        } else {
                            var notification = {
                                Title: null,
                                Description: null,
                                Receiver: null,
                                PlantageId: null,
                                NotificationDate: Date.now(),
                                Type: 'reject'
                            }

                            if (rows[0].Author == rows[0].Worker) {
                                notification.Receiver = rows[0].Worker;
                                notification.Title = "Ponuda za posao";
                                notification.Description = rows[0].Firstname +
                                    " " + rows[0].Lastname +
                                    " je odbio vasu ponudu za posao!";
                            } else {
                                notification.Receiver = rows[0].Owner;
                                notification.Title = "Zahtev za posao";
                                notification.Description = rows[1].Firstname +
                                    " " + rows[1].Lastname +
                                    " je odbio vasu ponudu za posao!";
                            }
                            addNotification(notification, () => {
                                callback(true);
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports.getSentRequests = function (callback) {
    connectDb();
    var query = "SELECT * FROM Work_Request";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: err });
        } else {
            callback({ requested: JSON.stringify(rows) });
        }

    });
}

module.exports.getAllFromUserPermissions = function (callback) {
    connectDb();
    var query = "SELECT * FROM User_Permission JOIN Users ON Users.Id=User_Permission.UserID";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            callback({ userPermissions: JSON.stringify(rows) });
        }

    });

}

module.exports.getMyEmployees = function (owner, callback) {
    connectDb();
    var query = "select distinct UserID,u.Firstname,u.Lastname,u.Username,u.Email from \
User_Permission up join Plantage p \
on up.PlantageID=p.Id \
join Users u \
on up.UserID=u.Id \
where p.Owner=? and up.UserID!=?"
    db.all(query, [owner.Id, owner.Id], (err, rows) => {
        if (err)
            callback({ success: false, msg: err });
        else {
            asyncLoop(rows, (emplo, next) => {
                this.getPlantagesForUser(emplo, owner.Id, (p) => {
                    emplo.plantages = JSON.parse(p.plantages);
                    next();
                })
            }, function (err) {
                if (!err)
                    callback({ employee: rows });
            });
        }
    })
}

module.exports.getPlantagesForUser = function (user, owner, callback) {
    connectDb();
    var query = "select Plantage.Id as PlantageId, Plantage.Name as PlantageName,\
	 GROUP_CONCAT(User_Permission.PermissionID) as Permissions\
     from Plantage left join User_Permission \
     on Plantage.Id=User_Permission.PlantageID and UserId=? where Plantage.Owner=? \
     group by Plantage.Id";
    db.all(query, [user.UserID, owner], (err, rows) => {
        if (err) {
            callback({ success: false, msg: err });
        } else {
            var data = [];
            for (var i = 0; i < rows.length; i++) {

                data.push({
                    plantageId: rows[i].PlantageId,
                    plantageName: rows[i].PlantageName,
                    permissions: rows[i].Permissions != null ? rows[i].Permissions.split(',') : [],
                    check: []
                });
                for (var j = 1; j < 6; j++)
                    data[i].check.push(data[i].permissions.indexOf(j.toString()) > -1 ? true : false);

            }
            callback({ plantages: JSON.stringify(data) });
        }
    });
}

module.exports.addNewEmployee = function (user, callback) {
    connectDb();
    checkIfUserExists(user, (res) => {
        if (res) {
            callback({ success: false, msg: 'Neuspesna registracija' });
        } else {
            var pass = user.password;
            bcrypt.hash(pass, 10, (err, hash) => {
                var query = 'INSERT INTO Users(Firstname,Lastname,Password,Username,Email,Role,RegDate) \
               VALUES(?, ?, ? , ?, ?,"User",?)';
                db.run(query,
                    [user.firstname,
                    user.lastname,
                        hash,
                    user.username,
                    user.email,
                    (new Date).getTime()],
                    function (err) {
                        if (err) {
                            callback({ success: false, msg: 'Neuspesna registracija', err: err });
                        } else {
                            //da se ubace permisije
                            var userId = this.lastID;
                            var perm = "Insert into User_Permission(UserID,PlantageID,PermissionID) Values";
                            for (var i = 0; i < user.plantages.length; i++) {
                                for (var j = 0; j < user.plantages[i].permissions.length; j++) {
                                    if (i + j > 0)
                                        perm += ",";
                                    perm += "(" + userId + ", " + user.plantages[i].plantageId + ", " + user.plantages[i].permissions[j] + ")";
                                }
                            }
                            db.run(perm, (err) => {
                                if (err) {
                                    callback({ success: false, msg: 'Neuspesno' });
                                } else {
                                    callback({ success: true, msg: 'Uspesno' });
                                }
                            });
                        }
                    });
            });
        }

    });
}

module.exports.acceptJobReq = function (user, callback) {
    connectDb();

    var userId = user.Id;
    var perm = "Insert into User_Permission(UserID,PlantageID,PermissionID) Values";
    //console.log(perm);
    for (var i = 0; i < user.plantages.length; i++) {
        for (var j = 0; j < user.plantages[i].permissions.length; j++) {
            if (i + j > 0)
                perm += ",";
            perm += "(" + userId + ", " + user.plantages[i].plantageId + ", " + user.plantages[i].permissions[j] + ")";
        }
    }
    db.run(perm, (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            var perm = "Update Work_Request set Resolved='accepted' where Id=" + user.Ident;
            //console.log(perm);
            db.run(perm, (err) => {
                if (err)
                    callback(err);
                else {
                    var korisnici = "select Firstname, Lastname, Author, Owner, Worker \
                                     from Users join Work_Request on Users.Id = Work_Request.Worker or \
                                                                     Users.Id = Work_Request.Owner \
                                     where Work_Request.Id = ?"
                    db.all(korisnici, [user.Ident], (err, rows) => {
                        if (err)
                            callback(err)
                        else {
                            var notification = {
                                Title: null,
                                Description: null,
                                Receiver: null,
                                PlantageId: null,
                                NotificationDate: Date.now(),
                                Type: ''
                            }

                            if (rows[0].Author == rows[0].Owner) {
                                notification.Receiver = rows[0].Owner;
                                notification.Title = "Ponuda za posao";
                                notification.Description = rows[1].Firstname +
                                    " " + rows[1].Lastname +
                                    " je prihvatio vasu ponudu za posao!";
                            } else {
                                notification.Receiver = rows[0].Worker;
                                notification.Title = "Zahtev za posao";
                                notification.Description = rows[0].Firstname +
                                    " " + rows[0].Lastname +
                                    " je prihvatio vasu ponudu za posao!";
                                notification.Type = 'job-request-accepted';
                            }

                            addNotification(notification, () => {
                                //console.log(notification);
                                callback({ success: true });
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports.editPermissions = function (employee, owner, callback) {
    connectDb();
    var query = "DELETE FROM User_Permission WHERE UserId=? and PlantageId in(";
    for (var i = 0; i < employee.plantages.length; i++) {
        if (i > 0)
            query += ",";
        query += employee.plantages[i].plantageId;
    }
    query += ")";
    db.run(query, [employee.UserID], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno otpustanje' });
        } else {
            var flag = false;
            var query = "Insert into User_Permission(UserId,PlantageId,PermissionId) values ";
            for (var i = 0; i < employee.plantages.length; i++) {
                for (var j = 0; j < employee.plantages[i].check.length; j++)
                    if (employee.plantages[i].check[j] == true) {
                        if (flag)
                            query += ",";
                        flag = true;
                        query += "(" + employee.UserID + ", " + employee.plantages[i].plantageId + ", " + (j + 1) + ")";
                    }
            }
            db.run(query, (err) => {
                if (!err) {
                    callback({ success: false, msg: 'Neuspesno editovanje' });
                } else {
                    callback({ success: true, msg: 'Uspesno editovanje' });
                }
            })
        }
    });
}

module.exports.dismissEmployee = function (employee, callback) {
    connectDb();
    //console.log(employee);
    var query = "DELETE FROM User_Permission WHERE UserId=? and PlantageId in(";
    for (var i = 0; i < employee.plantages.length; i++) {
        if (i > 0)
            query += ",";
        query += employee.plantages[i].plantageId;
    }
    query += ")";
    db.run(query, [employee.UserID], (err) => {

        if (err) {
            callback({ success: false, msg: 'Neuspesno otpustanje' });
        } else {
            var perm1 = "DELETE FROM Work_Request \
                         WHERE Worker = " + employee.UserID + " and Owner =" + employee.ownerId;

            db.run(perm1, (err, rows) => {
                if (err) {
                    callback({ success: false });
                } else {
                    var notification = {
                        Title: 'Dobili ste otkaz',
                        Description: employee.ownerFirstname + ' ' + employee.ownerLastname + ' Vam je dao otkaz.',
                        Receiver: employee.UserID,
                        PlantageId: null,
                        NotificationDate: Date.now(),
                        Type: 'reject'
                    }

                    addNotification(notification, () => {
                        callback({ success: true });
                    });
                }
            });
        }
    });
}

module.exports.getNotifications = function (userId, callback) {
    connectDb();
    var query = "SELECT * FROM Notifications WHERE Receiver = " + userId + " ORDER BY NotificationDate desc";

    db.all(query, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno listanje svih notifikacija' });
        } else {
            callback({ notifications: JSON.stringify(rows) });
        }

    });

};

module.exports.updateNotifications = function (userId, callback) {
    connectDb();
    var query = "UPDATE Notifications SET Seen = 1 WHERE Seen = 0 and Receiver = " + userId;

    db.all(query, (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno updateovanje svih notifikacija' });
        } else {
            callback({ success: true, msg: 'Uspesno updatovanje notifikacija' });
        }

    });

};
/*
module.exports.updateNotificationsType = function (userId, callback) {
    connectDb();
    var query = "UPDATE Notifications SET New = 0 WHERE New = 1 and Receiver = " + userId;
    console.log(query);
    db.all(query, (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno updateovanje svih notifikacija' });
        } else {
            callback({ success: true, msg: 'Uspesno updatovanje notifikacija' });
        }
 
    });
 
};*/
function sendMailNotification(data, callback) {
    connectDb();
    getUserByEmail(data.email, (user) => {
        if (!user) {
            callback({ success: false, msg: "Greska" });
        } else {
            var sendMail = function () {
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'plantech2017@gmail.com',
                        pass: 'plantechprojekat'
                    }
                });
                var mailOptions = {
                    to: user.Email,
                    from: 'plantech2017@gmail.com',
                    subject: data.title,
                    text: data.message
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                });
                callback({ success: true, msg: 'Uspesno poslata notifikacija' });
            }
            sendMail();
        }
    });
};

var addNotification = function notify(notification, callback) {
    connectDb();
    var query = "insert into Notifications(Title,Description,Receiver,PlantageId,NotificationDate,Seen,Type) values(?,?,?,?,?,?,?)";
    db.run(query, [
        notification.Title,
        notification.Description,
        notification.Receiver,
        notification.PlantageId,
        notification.NotificationDate,
        0,
        notification.Type
    ], function (err) {
        if (err) {
            callback({ "err": err });

        } else {
            notification.Id = this.lastID;
            for (i = 0; i < sockets.length; i++) {

                if (sockets[i].User == notification.Receiver)
                    sockets[i].Socket.emit('addedNotif', notification);
            }
            getUserEmailNotificationById(notification.Receiver, (data) => {
                if (data) {
                    if (data.EmailNotifications == 1) {
                        sendMailNotification({ email: data.Email, message: notification.Description, title: notification.Title }, (success) => {
                            //console.log(notification);
                            if (success.success)
                                callback({ "err": false });
                            else
                                callback({ "err": success.msg });
                        })
                    }
                    else {
                        callback({ "err": false });
                    }

                }
                else {
                    callback({ "err": "Error" });
                }
            })
        }
    });
}

module.exports.notifyUser = addNotification;

module.exports.deleteRequest = function (data, callback) {
    connectDb();
    var query = "DELETE FROM Work_Request WHERE Worker=? and Author=?";

    db.run(query, [data.worker, data.author], (err) => {
        if (err) {
            callback({ success: false, msg: 'Uspesno brisanje zahteva' });
        } else {
            callback({ success: true, msg: 'Neuspesno brisanje zahteva' });
        }
    })
}

module.exports.deleteRequest2 = function (data, callback) {
    connectDb();
    var query = "DELETE FROM Work_Request WHERE Owner=? and Author=?";

    db.run(query, [data.owner, data.author], (err) => {
        if (err) {
            callback({ success: false, msg: 'Uspesno brisanje zahteva' });
        } else {
            callback({ success: true, msg: 'Neuspesno brisanje zahteva' });
        }
    })
}

//kupi vrednosti sa svih meraca zadate plantaze
module.exports.getMeasurementsForPlantage = function (plantageId, callback) {
    connectDb();
    var query = "select MeasurerId,MeasuringUnit from Measurer_Plantage mp join Measurer m on mp.MeasurerId=m.Id where PlantageId=?"
    db.all(query, [plantageId], (err, rows) => {
        if (!err) {
            connectDbMeasurements();
            var q2 = "select * from Measurements where measurerId in("
            for (var i = 0; i < rows.length; i++) {
                if (i > 0)
                    q2 += ",";
                q2 += rows[i].MeasurerId;
            }
            q2 += ") order by  DateTime";
            measurersDb.all(q2, (err, rows2) => {
                if (!err) {

                    for (var j = 0; j < rows.length; j++) {
                        rows[j].Measurements = [];
                        for (var k = 0; k < rows2.length; k++) {
                            if (rows[j].MeasurerId == rows2[k].MeasurerId) {
                                rows[j].Measurements.push(rows2[k]);
                            }
                        }
                    }
                    callback({ "measurements": rows });
                } else {
                    callback({ "err": err });
                }
            });
        } else {
            callback({ "err": err });
        }
    });
}

function getPlants(userId, callback) {
    connectDb();
    var query = "select * from(select c.Id as CategoryId,c.Name as CategoryName,p.Id as PlantId,p.Name as PlantName,s.Id as SpecieId,\
     s.Name as SpecieName, s.Info as Description, s.Owner as Owner, sm.Id as SeedManufacturerId, sm.CompanyName as SeedManufacturerName\
     from Species s join Plants p on s.PlantId=p.Id join Seed_Manufacturers sm on s.Seed_Manufacturer=sm.Id join Category c on p.CategoryId=c.Id\
    where s.Owner is NULL or s.Owner=?)pl left join Rules r on pl.SpecieId=r.SpecieId where r.Owner is NULL or r.Owner=?";
    db.all(query, [userID], (err, rows) => {
        if (!err) {
            callback({ plants: JSON.stringify(rows) });
        } else {
            callback({ "err": err });
        }

    });
}

function getRulesByPhase(userId, plantId, callback) {
    connectDb();
    var query = "select ph.Id as PhaseId,ph.PhaseRbr,ph.Name as PhaseName,AirHumidityFrom,AirHumidityTo,GroundHumidityFrom,GroundHumidityTo,PhFrom,PhTo,\
CaCO3From,CaCO3To,NFrom,NTo,K2OFrom,K2OTo,P2O5From,P2O5To,GroundTempFrom,GroundTempTo,HummusFrom,HummusTo from \
Plants p join Category_Phase cp \
on p.CategoryId=cp.CategoryId \
left join Rules r on \
	 r.PhaseId=cp.PhaseId and r.PlantId=p.Id \
	join Phase ph on cp.PhaseId=ph.Id \
	where p.Id="+ plantId + " and r.Owner is NULL and not exists (select * from Rules where Owner=" + userId + " and PlantId=" + plantId + " and PhaseId=r.PhaseId) \
	union \
	select ph.Id as PhaseId,ph.PhaseRbr,ph.Name as PhaseName,AirHumidityFrom,AirHumidityTo,GroundHumidityFrom,GroundHumidityTo,PhFrom,PhTo,\
CaCO3From,CaCO3To,NFrom,NTo,K2OFrom,K2OTo,P2O5From,P2O5To,GroundTempFrom,GroundTempTo,HummusFrom,HummusTo from \
Plants p join Category_Phase cp \
on p.CategoryId=cp.CategoryId \
left join Rules r on \
	 r.PhaseId=cp.PhaseId and r.PlantId=p.Id \
	join Phase ph on cp.PhaseId=ph.Id \
	where p.Id="+ plantId + " and r.Owner=" + userId + " order by ph.PhaseRbr";

    db.all(query, (err, rows) => {
        if (!err) {
            callback(rows);
        }
    });
}

module.exports.getAllPlants = function (userID, callback) {
    connectDb();
    var query = "select c.Id as CategoryId,c.Name as CategoryName,p.Id as PlantId,p.Name as PlantName,p.AltitudeFrom,p.AltitudeTo,s.Id as SpecieId,\
     s.Name as SpecieName, p.Details as Details, s.Owner as Owner, sm.Id as SeedManufacturerId, sm.CompanyName as SeedManufacturerName\
     from Species s join Plants p on s.PlantId=p.Id\
	 join Seed_Manufacturers sm on s.Seed_Manufacturer=sm.Id\
	 join Category c on p.CategoryId=c.Id\
    where s.Owner is NULL or s.Owner=?";
    db.all(query, [userID], (err, rows) => {
        if (!err) {
            var plants = [];
            asyncLoop(rows, function (plant, next) {
                getRulesByPhase(userID, plant.PlantId, (phases) => {
                    plants.push({
                        CategoryId: plant.CategoryId,
                        CategoryName: plant.CategoryName,
                        PlantId: plant.PlantId,
                        PlantName: plant.PlantName,
                        SpecieId: plant.SpecieId,
                        SpecieName: plant.SpecieName,
                        Details: plant.Details,
                        Owner: plant.Owner,
                        SeedManufacturerId: plant.SeedManufacturerId,
                        SeedManufacturerName: plant.SeedManufacturerName,
                        Altitude: [plant.AltitudeFrom, plant.AltitudeTo],
                        Phases: []
                    });
                    asyncLoop(phases, function (phase, next2) {
                        plants[plants.length - 1].Phases.push({
                            PhaseId: phase.PhaseId,
                            PhaseName: phase.PhaseName,
                            Rules: {
                                AirHumidity: [phase.AirHumidityFrom, phase.AirHumidityTo],
                                GroundHumidity: [phase.GroundHumidityFrom, phase.GroundHumidityTo],
                                PH: [phase.PhFrom, phase.PhTo],
                                CACO3: [phase.CaCO3From, phase.CaCO3To],
                                N: [phase.NFrom, phase.NTo],
                                K2O: [phase.K2OFrom, phase.K2OTo],
                                P2O5: [phase.P2O5From, phase.P2O5To],
                                GroundTemp: [phase.GroundTempFrom, phase.GroundTempTo],
                                Hummus: [phase.HummusFrom, phase.HummusTo]
                            }
                        });
                        next2();
                    }, function (err) {
                        if (!err) {
                            next();
                        }
                    });
                });
            }, function (err) {
                if (!err) {
                    callback({ "plants": JSON.stringify(plants) });
                }
            });
        } else {
            callback({ "err": err });
        }

    });
}

module.exports.addNewPlant = function (newPlant, callback) {
    connectDb();
    var query = "insert into Plants(Name,CategoryId,Owner) values(?,?,?)";
    db.run(query, [newPlant.plant, newPlant.category, newPlant.owner], function (err) {
        var plantId = this.lastID;
        var q2 = "insert into Seed_Manufacturers(CompanyName) values(?)";
        db.run(q2, [newPlant.seedManufacturer], function (err) {
            var seedId = this.lastID;
            var q3 = "Insert into Species(PlantId,Name,Seed_Manufacturer,Owner)values(?,?,?,?)";
            db.run(q3, [plantId, newPlant.specie, seedId, newPlant.owner], (err) => {
                callback({ msg: 'Uspesno dodavanje biljke' });
            });
        })
    });
}

module.exports.deletePlant = function (specieId, callback) {
    connectDb();
    var query = "delete from Species where Id=?";
    db.run(query, [specieId], (err) => {
        if (err) {
            callback({ success: false, msg: 'Uspesno brisanje biljke' });
        } else {
            callback({ success: true, msg: 'Neuspesno brisanje biljke' });
        }
    })
}

module.exports.getEventsForUser = function (user, callback) {
    connectDb();

    var query = "select * from Planner_events where UserId=?";

    db.all(query, [user], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Greska' });
        } else {
            callback({ events: JSON.stringify(rows) });
        }
    });
}

module.exports.addNewEventDrag = function (event, callback) {
    connectDb();

    var query = "INSERT INTO Planner_events(Name,UserId,InCalendar,BgColor,BorderColor) Values(?,?,?,?,?)";

    db.run(query, [
        event.title,
        event.userId,
        0,
        event.backgroundColor,
        event.borderColor
    ], function (err) {
        if (err) {
            callback({ "success": err });

        } else {
            callback({ eventId: JSON.stringify(this.lastID) });

        }
    });
}
module.exports.addNewEventCalendar = function (event, callback) {
    connectDb();

    var query = "INSERT INTO Planner_events(Name,Date,UserId,InCalendar,BgColor,BorderColor) Values(?,?,?,?,?,?)";
    db.run(query, [
        event.title,
        event.date,
        event.userId,
        1,
        event.backgroundColor,
        event.borderColor
    ], (err) => {
        if (err) {
            callback({ "success": err });

        } else {
            callback({ "success": true });

        }
    });
}

module.exports.deleteEvent = function (event, callback) {
    connectDb();
    var query = "delete from Planner_events where Id = ?";

    db.run(query, event, (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno brisanje' });

        } else {
            callback({ success: true, msg: 'Uspesno brisanje' });

        }
    });
};

module.exports.getEmployersForUser = function (user, callback) {
    connectDb();

    var userId = user.Id;
    var perm = "SELECT distinct us.Id, us.Username, us.Firstname, us.Lastname, us.Email FROM User_Permission u join Plantage p on u.PlantageID = p.Id join Users us on p.Owner<>" + userId + " and p.Owner = us.Id WHERE u.UserID=" + userId;
    //console.log(perm);

    db.all(perm, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            callback({ owners: JSON.stringify(rows) });
        }
    });
}

module.exports.getPlantagesIWorkOn = function (user, callback) {
    connectDb();

    var userId = user.Id;
    var perm = "select distinct p.Id, p.Owner, p.Name from User_Permission u join Plantage p on p.Id=u.PlantageID and p.Owner<>u.UserID where u.UserID=" + userId;
    //console.log(perm);

    db.all(perm, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            callback({ plantages: JSON.stringify(rows) });
        }
    });
}

module.exports.getUserProgress = function (user, callback) {
    connectDb();

    var userId = user.Id;
    var perm = "SELECT b.Id as 'billingId', b.'Number of plantages' as 'max', (SELECT count(*) FROM Plantage WHERE Owner = ?) as 'currentPlant' \
                FROM Owner_Request o join Billing_Plan b on o.BillingPlan = b.Id \
                WHERE o.Owner = ? and o.Resolved='accepted'";
    //console.log(perm);

    db.all(perm, [user.Id, user.Id], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            callback({ progress: JSON.stringify(rows) });
        }
    });
}

module.exports.upgradePlan = function (data, callback) {
    connectDb();

    // console.log(data);
    var perm = "INSERT INTO Owner_Request (Owner, BillingPlan, Resolved) \
                VALUES (?, ?, ?)";
    //console.log(perm);

    db.run(perm, [data.userId, data.billingPlan, 'pending'], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            callback({ success: true });
        }
    });
}

module.exports.quit = function (data, callback) {
    connectDb();
    var userId = data.userId;

    var perm = "DELETE FROM User_Permission \
                WHERE UserID = " + userId + " and PlantageID in (" + data.plantages + ")";


    db.run(perm, (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno' });
        } else {
            var perm1 = "DELETE FROM Work_Request \
                         WHERE Worker = " + userId + " and Owner =" + data.owner;

            db.run(perm1, (err, rows) => {
                if (err) {
                    callback({ success: false, msg: 'Neuspesno' });
                } else {
                    var vlasnik = "select Owner \
                                   from Plantage where Id in (" + data.plantages + ")";
                    db.all(vlasnik, (err, rows) => {
                        if (err)
                            callback(err)
                        else {
                            var notification = {
                                Title: 'Zaposleni je dao otkaz',
                                Description: data.Firstname + ' ' + data.Lastname + ' je dao otkaz.',
                                Receiver: rows[0].Owner,
                                PlantageId: null,
                                NotificationDate: Date.now(),
                                Type: 'reject'
                            }

                            addNotification(notification, () => {
                                callback({ success: true });
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports.getPlantsWithRules = function (callback) {
    connectDb();
    var query = "Select r.*,p.AltitudeFrom,p.AltitudeTo,p.PlantingFrom,p.PlantingTo,\
sp.PlantageId,sp.PlantingDate,ph.EndsIn,p.Name as PlantName,pl.Name as PlantageName,pl.Path \
from Rules r join Species s on s.PlantId=r.PlantId join Plants p on s.PlantId=p.Id \
join Specie_Plantage sp on sp.SpecieId=s.Id join Plantage pl on sp.PlantageId=pl.Id \
join Phase ph on r.PhaseId=ph.Id join \
(select Rules.PlantId,Specie_Plantage.PlantageId,min(EndsIn) as EndsIn from Phase join \
 Rules on Phase.Id=Rules.PhaseId join Species on Rules.PlantId=Species.PlantId join Specie_Plantage on Species.Id=Specie_Plantage.SpecieId where (Specie_Plantage.PlantingDate+(Phase.EndsIn*86400))-strftime('%s', 'now')>0 group by Rules.PlantId,Specie_Plantage.PlantageId )sq \
on p.Id=sq.PlantId and sp.PlantageId=sq.PlantageId and ph.EndsIn=sq.EndsIn";
    db.all(query, (err, rows) => {
        if (!err) {
            callback({ plants: JSON.stringify(rows) });
        }
    });

}

module.exports.addRule = function (rule, userId, plantId, callback) {
    //console.log(rule[0].Rules);
    connectDb();
    var query = "Delete from Rules where Owner=? and PlantId=?";
    db.run(query, [userId, plantId], (err) => {
        if (!err) {
            var q2 = "Insert into Rules(GroundHumidityFrom,GroundHumidityTo,PhFrom,PhTo,CaCO3From,CaCO3To,NFrom,NTo,K2OFrom,K2OTo,P2O5From,P2O5To,GroundTempFrom,GroundTempTo,HummusFrom,HummusTo,Owner,PhaseId,PlantId,AirHumidityFrom,AirHumidityTo) values";
            for (var i = 0; i < rule.length; i++) {
                if (i > 0)
                    q2 += ", ";
                q2 += "(" + rule[i].Rules.GroundHumidity[0] + "," + rule[i].Rules.GroundHumidity[1] + "," + rule[i].Rules.PH[0] + "," + rule[i].Rules.PH[1] + "," + rule[i].Rules.CACO3[0] + "," + rule[i].Rules.CACO3[1] + "," + rule[i].Rules.N[0] + "," + rule[i].Rules.N[1] + "," + rule[i].Rules.K2O[0] + "," + rule[i].Rules.K2O[1] + "," + rule[i].Rules.P2O5[0] + "," + rule[i].Rules.P2O5[1] + "," + rule[i].Rules.GroundTemp[0] + "," + rule[i].Rules.GroundTemp[1] + "," + rule[i].Rules.Hummus[0] + "," + rule[i].Rules.Hummus[1] + "," + userId + "," + rule[i].PhaseId + "," + plantId + "," + rule[i].Rules.AirHumidity[0] + "," + rule[i].Rules.AirHumidity[1] + ")";

            }
            // console.log(q2);
            db.run(q2, (err) => {
                if (!err)
                    callback({ success: true });
                else {
                    callback({ success: false });
                    console.log(err);
                }

            })
        }
    })
}

module.exports.getAllUsersToNotify = function (plantageId, callback) {
    connectDb();
    var query = "select distinct(UserId)\
from User_Permission up where PlantageId=? and PermissionId=3";
    db.all(query, [plantageId], (err, rows) => {
        if (!err) {
            callback(rows);
        }
    });
}

module.exports.getLatestValuesFromMeasurers = function (callback) {
    connectDb();
    connectDbMeasurements();
    var query = "select distinct mp.MeasurerId,p.Id,s.PlantId,m.MeasuringUnit from Measurer_Plantage mp join Plantage p\
     on mp.PlantageId=p.Id join Specie_Plantage sp on sp.PlantageId=p.Id join Species s on\
      sp.SpecieId=s.Id join Rules r on s.PlantId=r.PlantId join Measurer m on mp.MeasurerId=m.Id";
    db.all(query, (err, rows) => {
        if (!err) {
            var q2 = "select MeasurerId,AVG(Value) as Value from Measurements\
             where strftime('%s','now')-(DateTime/1000)<86400 \
            group by MeasurerId";
            measurersDb.all(q2, (err, rows2) => {
                if (!err) {
                    var measurements = [];
                    for (var i = 0; i < rows.length; i++) {
                        var measurement = {
                            PlantId: rows[i].PlantId,
                            PlantageId: rows[i].Id,
                            AirHumidity: null,
                            GroundHumidity: null,
                            Ph: null,
                            Caco3: null,
                            N: null,
                            K2o: null,
                            P2o5: null,
                            GroundTemp: null,
                            Hummus: null
                        };
                        for (var j = 0; j < rows2.length; j++) {
                            if (rows[i].MeasurerId == rows2[j].MeasurerId) {
                                if (rows[i].MeasuringUnit == "Air Humidity")
                                    measurement.AirHumidity = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "CaCO3")
                                    measurement.Caco3 = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "Ph")
                                    measurement.Ph = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "N")
                                    measurement.N = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "K2O")
                                    measurement.K2o = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "P205")
                                    measurement.P2o5 = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "GroundTemp")
                                    measurement.GroundTemp = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "Hummus")
                                    measurement.Hummus = rows2[j].Value;
                                else if (rows[i].MeasuringUnit == "Ground Humidity")
                                    measurement.GroundHumidity = rows2[j].Value;
                                measurements.push(measurement);
                                break;
                            }
                        }
                    }
                    //console.log(measurements);
                    callback(measurements);
                }
            });
        }
    });
}

module.exports.changeEventDate = function (event, callback) {
    connectDb();
    var query = "UPDATE Planner_events SET Date = ? \
                WHERE id = " + event.id;
    db.run(query,
        [event.date],
        (err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno editovanja', err: err });
            } else {
                callback({ success: true, msg: 'Uspesna editovanje' });
            }
        });
};
module.exports.changeEventTitle = function (event, callback) {
    connectDb();
    var query = "UPDATE Planner_events SET Name = ? \
                WHERE id = " + event.id;
    db.run(query,
        [event.title],
        (err) => {
            if (err) {
                callback({ success: false, msg: 'Neuspesno editovanja', err: err });
            } else {
                callback({ success: true, msg: 'Uspesna editovanje' });
            }
        });
};

module.exports.getAllPlantages = function (callback) {
    connectDb();
    var query = "Select * from Plantage"
    db.all(query, (err, rows) => {
        if (err) {
            callback({ "err": err });
        } else {
            callback({ plantages: JSON.stringify(rows) })
        }
    });
}


module.exports.addForecast = function (data, callback) {
    connectDb();
    var query = "INSERT INTO Forecast(PlantageId,Date,MinTemp,MaxTemp,PrecipProbability) Values(?,?,?,?,?)";
    db.run(query, [
        data.PlantageId,
        data.Date,
        data.MinTemp,
        data.MaxTemp,
        data.PrecipProbability
    ], (err) => {
        if (err) {
            callback({ "success": err });

        } else {
            callback({ "success": true });

        }
    });
}

module.exports.checkAlerts = function (plantage, callback) {
    connectDb();
    var query = "Select distinct Title,Description,Type,PlantageId from Notifications where PlantageId=? and strftime('%s','now')-(NotificationDate/1000)<86400";
    db.all(query, [plantage.plantageId], (err, rows) => {
        if (!err) {
            callback({ rows });
        }
    });
}

module.exports.getPlantagesForMeasurer = function (data, callback) {
    connectDb();
    var query = "SELECT p.Id, p.Owner, m.MeasurerId \
                 FROM Plantage p join Measurer_Plantage m on p.Id = m.PlantageId \
                 WHERE p.Owner = ? and m.MeasurerId = ?";
    db.all(query, [
        data.Owner,
        data.Measurer
    ], (err, rows) => {
        if (err) {
            callback({ "success": err });

        } else {
            callback({ plantages: JSON.stringify(rows) });

        }
    });
}
module.exports.updateSendToEmail = function (data, callback) {
    connectDb();
    var enable;
    if (data.enable == true)
        enable = 1;
    else
        enable = 0;

    var query = "UPDATE Users SET EmailNotifications = ? WHERE Id = ?";

    db.all(query, [enable, data.userId], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno updateovanje svih notifikacija' });
        } else {
            callback({ success: true, msg: 'Uspesno updatovanje notifikacija' });
        }

    });

};

module.exports.checkIfSendToEmail = function (userId, callback) {
    connectDb();
    var query = "SELECT EmailNotifications FROM Users WHERE Id = ?";

    db.all(query, [userId], (err, rows) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesan nalazenje plantaze po id-u' });

        } else {
            callback({ success: true, checked: JSON.stringify(rows) });

        }
    });
}

module.exports.getAdvancedRules = function (userId, callback) {
    connectDb();
    var query = "select * from AdvancedRules where Owner=?";
    db.all(query, [userId], (err, rows) => {
        if (err) {
            callback({ "success": err });
        } else {
            callback({ rules: JSON.stringify(rows) });

        }
    });
}

module.exports.deleteAdvancedRule = function (rule, callback) {
    connectDb();
    var query = "Delete from AdvancedRules where JsonRule=?";
    db.all(query, [JSON.stringify(rule)], (err, rows) => {
        if (err) {
            callback({ "success": err });
        } else {
            callback({ "success": true });
        }
    });
}

module.exports.getPlantageOwners = function (userId, callback) {
    connectDb();
    //console.log(userId);
    var query = "Select distinct p.Owner as id,Firstname || ' ' || Lastname as text from User_Permission up Join Plantage p on up.PlantageID=p.Id \
    join Users u on p.Owner=u.Id where up.UserID=? and up.PermissionID=5";
    db.all(query, [userId], (err, rows) => {
        if (err) {
            callback({ "success": err });
        } else {
            callback({ owners: rows });
        }
    });
}

module.exports.getPlantagesForOwner = function (ownerId, userId, callback) {
    connectDb();
    // console.log(userId);
    var query = "Select Id as id,Name as text from Plantage p join User_Permission up on p.Id=up.PlantageID where Owner=? and up.UserID=? and up.PermissionID=5";
    db.all(query, [ownerId, userId], (err, rows) => {

        if (err) {
            callback({ "success": err });
        } else {
            callback({ plantages: rows });

        }
    });
}

module.exports.updateSendToEmail = function (data, callback) {
    connectDb();
    var enable;
    if (data.enable == true)
        enable = 1;
    else
        enable = 0;

    var query = "UPDATE Users SET EmailNotifications = ? WHERE Id = ?";

    db.all(query, [enable, data.userId], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno updateovanje svih notifikacija' });
        } else {
            callback({ success: true, msg: 'Uspesno updatovanje notifikacija' });
        }

    });
};

module.exports.addAdvancedRule = function (userID, rule, callback) {
    connectDb();
    var query = "insert into AdvancedRules(JsonRule,Owner) values(?,?)"
    db.run(query, [JSON.stringify(rule), userID], (err) => {
        if (err) {
            callback({ success: false });
            console.log(err);
        }
        else {
            callback({ success: true });
        }
    });
}


module.exports.updateUserImage = function (data, callback) {
    connectDb();
    var query = "UPDATE Users SET Image = ? WHERE id = ?";
    db.run(query, [data.imagePath, data.userId], (err) => {
        if (err) {
            callback({ success: false, msg: 'Neuspesno', err: err });
        } else {
            callback({ success: true, msg: 'Uspesno' });
        }
    });

}


module.exports.getImageForUser = function (userId, callback) {
    connectDb();
    var query = "Select * from Users where Id=?";
    db.all(query, [userId], (err, rows) => {
        if (err) {
            callback({ "success": err });
        } else {
            callback({ image: JSON.stringify(rows) });

        }
    });
}

module.exports.getAllAdvancedRules = function (callback) {
    connectDb();
    var query = "Select * from AdvancedRules";
    db.all(query, (err, rows) => {
        if (err) {
            callback({ "success": err });
        } else {
            callback({ rows });

        }
    });
}

module.exports.getAdvancedMeasurements = function (plantage, condition, callback) {
    //  console.log(plantage, condition);
    connectDb();
    connectDbMeasurements();
    var mv = "";
    switch (condition.measurer) {
        case "Vlažnost vazduha":
            mv = "Air Humidity";
            break;
        case "Poljski vodni kapacitet":
            mv = "Ground Humidity";
            break;
        case "Ph vrednost":
            mv = "Ph";
            break;
        case "Kalcijum-karbonat(CaCO3)":
            mv = "CaCO3";
            break;
        case "Azot(N)":
            mv = "N";
            break;
        case "Kalijum(K2O)":
            mv = "K2O";
            break;
        case "Fosfor(P2O5)":
            mv = "P2O5";
            break;
        case "Humus":
            mv = "Hummus";
            break;
        case "Temperatura zemlje":
            mv = "GroundTemp";
            break;
        case "Temperatura vazduha":
            mv = "Air Temp";
            break;
        case "Mogucnost padavina":
            mv = "Precipation";
            break;
    }
    if (mv != "Air Temp" && mv != "Precipation") {
        //kupi sa meraca
        var query = "select m.Id from \
Measurer_Plantage mp join Measurer m \
on mp.MeasurerId=m.Id \
where m.MeasuringUnit=? and mp.PlantageId=?"
        db.all(query, [mv, plantage.id], (err, rows) => {
            //  console.log(err, rows);
            if (!err && rows && rows.length > 0) {
                var q2 = "select * from Measurements\
             where strftime('%s','now')-(DateTime/1000)<? \
                and MeasurerId in(";
                for (var i = 0; i < rows.length; i++) {
                    if (i > 0)
                        q2 += ", ";
                    q2 += rows[i].Id;
                }
                q2 += ") ";
                if (condition.value == "manje")
                    q2 += " and Value < " + condition.ruleValue;
                else if (condition.value == "vece")
                    q2 += " and Value > " + condition.ruleValue;
                if (condition.value == "jednako")
                    q2 += " and Value = " + condition.ruleValue;
                // console.log(q2);
                measurersDb.all(q2, [condition.period * 84600], (err, rows2) => {
                    if (!err && rows2 && rows2.length > 0)
                        callback(true);
                    else
                        callback(false);
                });
            } else {
                callback(false);
            }
        });
    } else if (mv == "Air Temp") {
        //daj temperaturu
        var q = "Select * from Plantage where Id=?";
        db.all(q, [plantage.id], (err, rows) => {
            if (!err) {
                forecast.getDaily(JSON.parse(rows[0].Path)[0].lat, JSON.parse(rows[0].Path)[0].lng, (temps) => {
                    var prognoza = JSON.parse(temps);
                    if (condition.value == "manje") {
                        var flag = false;
                        for (var ind = 0; ind < condition.period && ind < prognoza.length; ind++)
                            if (condition.ruleValue > prognoza[ind].temperatureMin)
                                flag = true;

                        if (ind == condition.period || ind == prognoza.length)
                            callback(flag);
                    } else if (condition.value == "vece") {
                        var flag = false;
                        for (var ind = 0; ind < condition.period && ind < prognoza.length; ind++)
                            if (condition.ruleValue < prognoza[ind].temperatureMax)
                                flag = true;

                        if (ind == condition.period || ind == prognoza.length)
                            callback(flag);
                    } else {
                        var flag = false;
                        for (var ind = 0; ind < condition.period && ind < prognoza.length; ind++)
                            if (condition.ruleValue >= prognoza[ind].temperatureMin && condition.ruleValue <= prognoza[ind].temperatureMax)
                                flag = true;

                        if (ind == condition.period || ind == prognoza.length)
                            callback(flag);
                    }
                });
            }
        })
    } else if (mv == "Precipation") {
        //daj padavine
        var q = "Select * from Plantage where Id=?";
        db.all(q, [plantage.id], (err, rows) => {
            if (!err) {
                forecast.getDaily(JSON.parse(rows[0].Path)[0].lat, JSON.parse(rows[0].Path)[0].lng, (temps) => {
                    var prognoza = JSON.parse(temps);
                    if (condition.value == "manje") {
                        var flag = false;
                        for (var ind = 0; ind < condition.period && ind < prognoza.length; ind++)
                            if (condition.ruleValue > prognoza[ind].precipIntensity * 100)
                                flag = true;

                        if (ind == condition.period || ind == prognoza.length)
                            callback(flag);

                    } else if (condition.value == "vece") {
                        var flag = false;
                        for (var ind = 0; ind < condition.period && ind < prognoza.length; ind++)
                            if (condition.ruleValue < prognoza[ind].precipIntensity * 100)
                                flag = true;


                        if (ind == condition.period || ind == prognoza.length)
                            callback(flag);
                    } else {
                        var flag = false;
                        for (var ind = 0; ind < condition.period && ind < prognoza.length; ind++)
                            if (condition.ruleValue == prognoza[ind].precipIntensity * 100)
                                flag = true;

                        if (ind == condition.period || ind == prognoza.length)
                            callback(flag);
                    }
                });
            }
        });
    }
}
