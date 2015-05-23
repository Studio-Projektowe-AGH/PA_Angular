/**
 * Created by Dominika on 2015-05-21.
 */
angular.module('requestService', ['generatorService'])
    .service('sendRequest', ['$rootScope','$http', 'generator', function ($rootScope, $http, generator) {
        var service = {};
        service.getUser = getUser;
        service.getLocalIDList = getLocalIDList;
        service.sendLocation = sendLocation;
        service.sendSavedLocation = sendSavedLocation;
        service.sendCheckIn = sendCheckIn;
        service.sendCheckOut = sendCheckOut;
        service.sendQRCode = sendQRCode;
        service.sendRate = sendRate;

        var config = function (url) {
            return configuration = {
                method: 'POST',
                url: "https://goparty-gateway.herokuapp.com" + url,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(p[i]));
                        return str.join("&");
                    }
                }
            };
        };

        function getUser(callback) {
            $http.get("https://goparty-gateway.herokuapp.com"+ "/test/token/random").success(function(response){
               callback(response.data.access_token);
            })
        }

        function getLocalIDList(callback) {
            $http.get("https://goparty-gateway.herokuapp.com" + "/profiles/business/all").success(function(response){
                callback(response.data.localIDlist);
            })
        }

        function sendLocation(callback) {
            //tu moze byc /events/location/ <- sprawdzic jesli wystapi blad
            var location = generator.getLocation();
            var config = config("/events/location");
            config.data = {
                Timestamp: generator.getNowTimeStamp(),
                Location_x: location[0],
                Location_y: location[1]
            };

            $http(config).success(function (data) {
                callback(location);
            });

        }

        function sendSavedLocation(location, callback) {
            var config = config("/events/location");
            config.data = {
                Timestamp: generator.getNowTimeStamp(),
                Location_x: location[0],
                Location_y: location[1]
            };

            $http(config).success(function (data) {
                callback(location);
            });
        }

        function sendCheckIn(clubid, callback) {
            var config = config("/events/checkin");
            config.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid
            };

            $http(config).success(callback);
        }

        function sendCheckOut(clubid, callback) {
            var config = config("/events/chceckout");
            config.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid
            };

            $http(config).success(callback);
        }

        function sendQRCode(clubid, callback) {
            var config = config("/events/qrscan");
            config.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid
            };

            $http(config).success(callback);
        }

        function sendRate(clubid, callback) {
            var config = config("/events/checkin");
            config.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid,
                Rating: generator.genRate()
            };

            $http(config).success(callback);
        }

        return service;
    }]);