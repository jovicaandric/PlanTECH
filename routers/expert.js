var nools = require("nools");
const forecast = require("./weatherApi");
const connectionDB = require('./connection');
var asyncLoop = require('node-async-loop');

module.exports.fire = function (callback) {
    nools.deleteFlows();
    var Measurement = function (plantId, plantageId, airHumidity, groundHumidity, ph, caco3, n, k2o, p2o5, groundTemp, hummus) {
        this.plantId = plantId;
        this.plantageId = plantageId;
        this.airHumidity = airHumidity;
        this.groundHumidity = groundHumidity;
        this.ph = ph;
        this.caco3 = caco3;
        this.n = n;
        this.k2o = k2o;
        this.p2o5 = p2o5;
        this.groundTemp = groundTemp;
        this.hummus = hummus;
    }

    var flow = nools.flow("Ekspertski", function (flow) {
        var averagePrecip = 50;
        // getAveragePrecip()
        //vrati sve biljke sa pravilima
        connectionDB.getPlantsWithRules(function (data) {
            var plants = JSON.parse(data.plants);
            var ex = connectionDB;
            plants.forEach((plant, i) => {
                //pravilo za vlaznost
                flow.rule("Humidity" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.groundHumidity!=null && m.groundHumidity<60"]
                ], (facts) => {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno navodnjavanje",
                                Description: "Poljski vodni kapacitet je opao ispod 60% i neophodno je zalivanje biljke " + plant.PlantName + " na plantaži " + plant.PlantageName,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'watering'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });

                });
                //OVDE TREBA JOS JEDNO PRAVILO ZA VLAZNOST
                flow.rule("Humiditya" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.groundHumidity!=null && m.groundHumidity<" + plant.GroundHumidityFrom]
                ], (facts) => {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno navodnjavanje",
                                Description: "Poljski vodni kapacitet je opao ispod optimalnog i neophodno je zalivanje biljke " + plant.PlantName + ". na plantaži " + plant.PlantageName,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'watering'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });

                });
                //pravilo za ph vrednost
                flow.rule("PHm" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.ph!=null && m.ph<" + plant.PhFrom]
                ], function (facts) {
                    var desc = "Kiselost zemljišta je porasla izvan dozvoljene granice za biljku"
                        + plant.PlantName +
                        ". Predlažemo primenu meliorativne mere kalcifikacije zemljišta(dodavanje kreča)";
                    desc += ". VAŽNA NAPOMENA: Materijal za kalcifikaciju uvek aplicirati u kombinaciji sa stajskim djubrivom!!! ";
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno đubrenje",
                                Description: desc,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za ph vrednost
                flow.rule("PHv" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.ph!=null && m.ph>" + plant.PhTo]
                ], function (facts) {
                    var desc = "Kiselost zemljišta je opala ispod dozvoljene granice za biljku "
                        + plant.PlantName +
                        ". Predlažemo dodavanje preprata koji sadrže sumpor.";
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno đubrenje",
                                Description: desc,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za CaCo3 vrednost
                flow.rule("CACO3m" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.caco3!=null && m.caco3<" + plant.CaCO3From]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var desc = "Količina kalcijum-karbonata je opala ispod dozvoljene i neophodna je prmena meliorativne mere đubrenja biljke " + plant.PlantName + " sredstvima koja sadrže sumpor. ";
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: desc,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });
                //pravilo za CaCo3 vrednost
                flow.rule("CACO3v" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.caco3!=null && m.caco3>" + plant.CaCO3To]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var desc = "Količina kalcijum-karbonata je porasla iznad dozvoljene i neophodno je djubrenje biljke " + plant.PlantName + ".";
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: desc,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za N vrednost
                flow.rule("Nm" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.n!=null && m.n<" + plant.NFrom]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var desc = "Količina azota je opala ispod dozvoljene za biljku " + plant.PlantName + ". Predlažemo đubrenje ureom(46% N).";
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: desc,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });
                //pravilo za N vrednost
                flow.rule("Nv" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.n!=null && m.n>" + plant.NTo]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var desc = "Količina azota je porasla iznad dozvoljene za biljku" + plant.PlantName + ".";
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: desc,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za K2O vrednost
                flow.rule("K2Om" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.k2o!=null && m.k2o<" + plant.K2OFrom]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: "Kolicina kalijuma na plantaži je opala ispod preporucene za biljku " + plant.PlantName + " i neophodna je primena meliorativne mere đubrenja. Preporučujemo veštačko đubrivo Kalijum hlorid(50% K)!",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za K2O vrednost
                flow.rule("K2Ov" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.k2o!=null && m.k2o>" + plant.K2OTo]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: "Kolicina kalijuma na plantazi je porasla iznad preporucene za biljku " + plant.PlantName + ".",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za P2O5vrednost
                flow.rule("P2O5m" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.p2o5!=null && m.p2o5<" + plant.P2O5From]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: "Kolicina fosfora na plantazi je opala ispod preporucene za biljku " + plant.PlantName + " i neophodna je primena meliorativne mere đubrenja. Preporučujemo veštačko đubrivo Fosforna kiselina(22% P) ili organsko đubrivo Koštano brašno (22% P)!",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za P2O5 vrednost
                flow.rule("P2O5v" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.p2o5!=null && m.p2o5>" + plant.P2O5To]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: "Kolicina fosfora na plantazi je porasla iznad preporucene za biljku " + plant.PlantName + ".",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });
                //pravilo za GroundTemp vrednost
                flow.rule("GroundTempm" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.groundTemp!=null && m.groundTemp<" + plant.GroundTempFrom]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Potrebno đubrenje",
                                Description: "Temperatura zemljišta je opala ispod preporučene za biljku " + plant.PlantName + ", i preti opasnost od smrzavanja",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za GroundTemp vrednost
                flow.rule("GroundTempv" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + "&& m.groundTemp!=null && m.groundTemp>" + plant.GroundTempTo]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno navodnjavanje",
                                Description: "Temperatura zemljišta je porasla iznad preporučene za biljku " + plant.PlantName + ", na plantaži " + plant.PlantageName,
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'watering'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za Hummus vrednost
                flow.rule("Hummusm" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + "&& m.hummus!=null && m.hummus<" + plant.HummusFrom]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: "Kolicina humusa na plantazi je opao ispod preporucene za biljku " + plant.PlantName + ".",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });

                //pravilo za Hummus vrednost
                flow.rule("Hummusv" + i, [
                    [Measurement, "m", "m.plantId==" + plant.PlantId + " && m.plantageId==" + plant.PlantageId + " && m.hummus!=null && m.hummus>" + plant.HummusTo]
                ], function (facts) {
                    ex.getAllUsersToNotify(plant.PlantageId, (users) => {
                        users.forEach((user) => {
                            var notification = {
                                Title: "Protrebno djubrenje",
                                Description: "Kolicina humusa na plantaži je porastao iznad preporucene za biljku " + plant.PlantName + ".",
                                Receiver: user.UserID,
                                PlantageId: plant.PlantageId,
                                NotificationDate: Date.now(),
                                Type: 'fertilize'
                            }
                            ex.notifyUser(notification, () => { });
                        });
                    });
                });
            });

            //daj sve vrednosti sa meraca
            connectionDB.getLatestValuesFromMeasurers((measuremens) => {
                // console.log(measuremens);
                var session = flow.getSession();
                measuremens.forEach((m) => {
                    session.assert(new Measurement(m.PlantId, m.PlantageId, m.AirHumidity, m.GroundHumidity, m.Ph, m.Caco3, m.N, m.K2o, m.P2o5, m.GroundTemp, m.Hummus));
                });

                session.match().then(
                    function () {
                        // print();
                    },
                    function (err) {
                        //uh oh an error occurred
                        console.error(err.stack);
                    });
            });
        });



    });

    var flow2 = nools.flow("Advanced", function (flow2) {
        flow2.rule("Advanced", [Number, "s", "s==69"], function (facts) {
            var trigger;
            var currentPlantage = null;
            connectionDB.getAllAdvancedRules((rules) => {
                var cb = connectionDB;
                if (rules && rules.rows && rules.rows.length > 0)
                    asyncLoop(rules.rows, function (rule, next) {
                        var adRule = JSON.parse(rule.JsonRule);
                        var plantagesAdvanced = JSON.parse(JSON.stringify(adRule.plantages));
                        var conditionsAdvanced = JSON.parse(JSON.stringify(adRule.conditions))
                        asyncLoop(plantagesAdvanced, function (plant, next2) {
                            trigger = true;
                            currentPlantage = plant;
                            asyncLoop(conditionsAdvanced, function (condition, next3) {
                                connectionDB.getAdvancedMeasurements(plant, condition, (meas) => {
                                    if (!meas) {
                                        trigger = false;
                                        next2();
                                    } else
                                        next3();
                                });
                            }, function (err3) {
                                if (!err3) {
                                    if (trigger) {
                                        var cp = currentPlantage.text;
                                        connectionDB.getAllUsersToNotify(currentPlantage.id, (users) => {
                                            asyncLoop(users, function (user, sl) {
                                                var notification = {
                                                    Title: "Aktivirano pravilo",
                                                    Description: adRule.message + ", na plantaži: " + cp,
                                                    Receiver: user.UserID,
                                                    PlantageId: currentPlantage.id,
                                                    NotificationDate: Date.now(),
                                                    Type: 'rule'
                                                }
                                                connectionDB.notifyUser(notification, () => {
                                                    sl();
                                                });
                                            }, function (err4) {
                                                next2();
                                            });
                                        });
                                    } else
                                        next2();
                                }
                            })
                        }, function (err2) {
                            if (!err2) {
                                next();
                            }
                        });
                    }, function (err) {
                        // next();
                    });
            });
        });
        var session2 = flow2.getSession();
        session2.assert(69);
        session2.match().then(
            function () {
                // print();
            },
            function (err) {
                //uh oh an error occurred
                console.error(err.stack);
            });

    });
}



function getAveragePrecip(latitude, longitude, callback) {
    forecast.getDaily(latitude, longitude, function (jsonDaily) {
        var daily = JSON.parse(jsonDaily);
        var averagePrecip = (daily[0].precipProbability + daily[1].precipProbability + daily[2].precipProbability) / 3.0;

        callback(averagePrecip);
    });
}

function getAverageTemperature(latitude, longitude, callback) {
    forecast.getDaily(latitude, longitude, function (jsonDaily) {
        var daily = JSON.parse(jsonDaily);
        t0 = (daily[0].temperatureMin + daily[0].temperatureMax) / 2.0;
        t1 = (daily[1].temperatureMin + daily[1].temperatureMax) / 2.0;
        t2 = (daily[2].temperatureMin + daily[2].temperatureMax) / 2.0;
        var averageTemp = Math.round((t0 + t1 + t1) / 3.0);

        callback(averageTemp);
    });
}
