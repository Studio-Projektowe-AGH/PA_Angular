/**
 * Created by Dominika on 2015-05-21.
 */
angular.module('requestService', ['generatorService'])
    .service('sendRequest', ['$rootScope', '$http', 'generator', function ($rootScope, $http, generator) {
        var service = {};
        service.getUser = getUser;
        service.getLocalIDList = getLocalIDList;
        service.sendLocation = sendLocation;
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
                    'Accept': 'text/plain',
                    'Authorization': 'Bearer ' + $rootScope.access_token
                },
                data: angular.toJson(data)
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

        function sendLocation(location, callback, callbackFailure) {
            var data = {
                timestamp: $rootScope.savedTime,
                longitude: location[0],
                latitude: location[1]
            };
            var configItem = config("/events/location", data);
            var timer = 1000;
            $http(configItem).success(function (data) {
                callback(location, timer);
            }).error(function (response) {
                callbackFailure();
            });

        }

        function sendCheckIn(clubid, callback) {
            var data = {
                timestamp:  $rootScope.savedTime,
                clubId: clubid
            };
            var configItem = config("/events/checkin", data);
            $http(configItem).success(callback);
        }

        function sendCheckOut(clubid, callback) {
            var data = {
                timestamp:  $rootScope.savedTime,
                clubId: clubid
            };
            var configItem = config("/events/checkout", data);

            $http(configItem).success(callback);
        }

        function sendQRCode(clubid, callback) {
            var data = {
                timestamp:  $rootScope.savedTime,
                payload: " {  clubId: "+  clubid + ", code:  1021001opopop} "
            };
            var configItem = config("/events/qrscan", data);
            $http(configItem).success(callback);
        }

        function sendRate(clubid, callback) {
            var data = {
                timestamp:  $rootScope.savedTime,
                clubId: clubid,
                rating: generator.genRate()
            };
            var configItem = config("/events/rating", data);
            $http(configItem).success(callback);
        }
        return service;
    }]);