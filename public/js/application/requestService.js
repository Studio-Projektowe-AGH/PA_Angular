/**
 * Created by Dominika on 2015-05-21.
 */
angular.module('requestService', ['generatorService'])
    .service('sendRequest', ['$rootScope', '$http', 'generator', function ($rootScope, $http, generator) {
        var service = {};
        service.getUser = getUser;
        service.getLocalIDList = getLocalIDList;
        service.sendLocation = sendLocation;
        service.sendSavedLocation = sendSavedLocation;
        service.sendCheckIn = sendCheckIn;
        service.sendCheckOut = sendCheckOut;
        service.sendQRCode = sendQRCode;
        service.sendRate = sendRate;

        var config = function (url, data) {
            return configuration = {
                method: 'POST',
                url: "https://goparty-gateway.herokuapp.com" + url,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept' : 'text/plain',
                    'Authorization' : 'Bearer ' + $rootScope.access_token
                },
                data : angular.toJson(data),
                //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                //'Auth-Token' : "Bearer " + $rootScope.access_token },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    }
                }
            };
        };

        function getUser(callback) {
            $http.get("https://goparty-gateway.herokuapp.com" + "/test/token/random").success(function (response) {
                //alert(JSON.stringify(response.access_token));
                callback(response.access_token);
            })
        }

        function getLocalIDList(callback) {
            $http.get("https://goparty-gateway.herokuapp.com" + "/profiles/business/all").success(function (response) {
                //alert(JSON.stringify(response));
                callback(response.clubsIds);
            })
        }

        function sendLocation(callback, callbackFailure) {
            //tu moze byc /events/location/ <- sprawdzic jesli wystapi blad
            var location = generator.genLocation();
            var data = {
                timestamp: generator.getNowTimeStamp(),
                longitude: location[0],
                latitude: location[1]
            };
            var configItem = config("/events/location", data);

            $http(configItem).success(function (data) {
                callback(location);
            }).error(function (response) {
                callbackFailure();
            });

        }

        function sendSavedLocation(location, callback) {
           var data = {
                timestamp: generator.getNowTimeStamp(),
                longitude: location[0],
                latitude: location[1]
            };
            var configItem = config("/events/location", data);

            $http(configItem).success(function (data) {
                callback(location);
            }).error(function (response) {
                alert("Blad : ");
            });
        }

        function sendCheckIn(clubid, callback) {
            var data = {
                timestamp: generator.getNowTimeStamp(),
                clubId: clubid
            };
            var configItem = config("/events/checkin", data);
            $http(configItem).success(callback);
        }

        function sendCheckOut(clubid, callback) {
            var data = {
                timestamp: generator.getNowTimeStamp(),
                clubId: clubid
            };
            var configItem = config("/events/chceckout", data);

            $http(configItem).success(callback);
        }

        function sendQRCode(clubid, callback) {
            var data = {
                timepstamp: generator.getNowTimeStamp(),
                clubId: clubid,
                payload: "1021001opopop"
            };
            var configItem = config("/events/qrscan", data);
            $http(configItem).success(callback);
        }

        function sendRate(clubid, callback) {
            var data = {
                timestamp: generator.getNowTimeStamp(),
                clubId: clubid,
                rating: generator.genRate()
            };
            var configItem = config("/events/rating", data);
            $http(configItem).success(callback);
        }
        return service;
    }]);