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
                headers: {'Content-Type': 'application/x-www-form-urlencoded',
                                     'Auth-Token' : "Bearer " + $rootScope.access_token },
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
            $http.get("https://goparty-gateway.herokuapp.com"+ "/test/token/random").success(function(response){
              //alert(JSON.stringify(response.access_token));
               callback(response.access_token);
            })
        }

        function getLocalIDList(callback) {
            $http.get("https://goparty-gateway.herokuapp.com" + "/profiles/business/all").success(function(response){
                //alert(JSON.stringify(response));
                callback(response.clubsIds);
            })
        }

        function sendLocation(callback, callbackFailure) {
            //tu moze byc /events/location/ <- sprawdzic jesli wystapi blad
            var location = generator.genLocation();
            var configItem = config("/events/location");
            configItem.data = {
                Timestamp: generator.getNowTimeStamp(),
                Location_x: location[0],
                Location_y: location[1]
            };

            $http(configItem).success(function (data) {
                callback(location);
            }).error(function(response){
                callbackFailure();
            });

        }

        function sendSavedLocation(location, callback) {
            var configItem = config("/events/location");
            configItem.data = {
                Timestamp: generator.getNowTimeStamp(),
                Location_x: location[0],
                Location_y: location[1]
            };

            $http(configItem).success(function (data) {
                callback(location);
            }).error(function(response){
                alert("Blad : ");
            });
        }

        function sendCheckIn(clubid, callback) {
            var configItem = config("/events/checkin");
            configItem.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid
            };

            $http(configItem).success(callback);
        }

        function sendCheckOut(clubid, callback) {
            var configItem = config("/events/chceckout");
            configItem.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid
            };

            $http(configItem).success(callback);
        }

        function sendQRCode(clubid, callback) {
            var configItem = config("/events/qrscan");
            configItem.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid
            };

            $http(configItem).success(callback);
        }

        function sendRate(clubid, callback) {
            var configItem = config("/events/checkin");
            configItem.data = {
                Timestamp: generator.getNowTimeStamp(),
                ClubId: clubid,
                Rating: generator.genRate()
            };

            $http(configItem).success(callback);
        }

        return service;
    }]);