/**
 * Created by Dominika on 2015-05-21.
 */
angular.module('goAppSim', ['requestService', 'generatorService'])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};
    }])
    .controller('appCtrl', ['$scope', '$rootScope', '$http', '$q', '$interval', '$timeout', 'sendRequest', 'generator',
        function ($scope, $rootScope, $http, $q, $interval, $timeout, sendRequest, generator) {
            $scope.title = "goParty UserSimulator2";
            $scope.clubList = [];
            $scope.QRcodes = 0;
            $scope.nowLocation = null;
            $scope.savedLocation = null;
            $scope.savedClubID = null;
            $rootScope.savedTime = generator.genTime();

            $scope.active = false;
            $scope.clearShow = false;
            $scope.stopItem = false;
            $scope.requestTable = [];
            $scope.id = 0;

            var getObject = function (title) {
                return {
                    id: $scope.id++,
                    desc: title
                }
            };

            $scope.startSimulation = function () {
                $scope.active = true;
                sendRequest.getUser(function (token) {
                    $scope.requestTable.push(getObject("Get token : " + token));
                    $rootScope.access_token = token;
                    sendRequest.getLocalIDList(function (ClubList) {
                        $scope.clubList = ClubList;
                        $scope.requestTable.push(getObject("Get Club List "));
                        $scope.nowLocation = generator.genLocation();
                        seqIntervalLocation();
                    });
                });
            };

            var stop;
            var seqIntervalLocation = function () {
                if (angular.isDefined(stop)) return;

                stop = $interval(function () {
                    if ($scope.stopItem != true) {
                        sendLocation($scope.nowLocation, function () {
                            //czy twoja lokalizacja to club ?
                            if (genBoolean() || $scope.savedClubID != null) {
                                if($scope.savedClubID != null){
                                    goClubbing();
                                }else{
                                    $scope.savedClubID = genClub();
                                    sendRequest.sendCheckIn($scope.savedClubID, function () {
                                        $scope.requestTable.push(getObject("POST : //events//checkin" + "   CLUB ID : " + $scope.savedClubID));
                                        goClubbing();
                                    });
                                }
                            } else {
                                //zmien lokalizacje
                                $scope.nowLocation = generator.genLocation();
                            }

                        });

                    } else {
                        $scope.stopSimulation();
                    }
                }, 6000);

            };

            var sendLocation = function (location, callback) {
                sendRequest.sendLocation(location, function (location, timer) {
                        $scope.savedLocation = location;
                        $rootScope.savedTime = $rootScope.savedTime + timer;
                        $scope.requestTable.push(getObject("POST : //events//location    -> LOCATION PARAMS : " + location + "   TIME : " + $rootScope.savedTime));
                        callback();
                    },
                    function () {
                        $scope.stopItem = true;
                        $scope.title += "\n Wystąpił błąd";
                    });
            };

            var goClubbing = function () {
                //terazniejsza lokalizacja jest klubem
                $scope.savedLocation = $scope.nowLocation;
                if ($scope.QRcodes == 0) {
                    $scope.QRcodes = Math.floor((Math.random() * 4) + 1);
                }
                for (var i = 0; i < $scope.QRcodes; i++) {

                        sendRequest.sendQRCode(genClub(), function (time) {
                            $scope.QRcodes--;
                                $scope.requestTable.push(getObject("POST : //events//qrscan  " + "   TIME : " + time));

                            if ($scope.QRcodes == 0) {
                                //zostan w klubie?
                                if (!genBoolean()) {
                                    leaveClub();
                                }
                            }
                        } );

                }
            };

            var sendQR = function () {
                var deferred = $q.defer();
                $timeout(function(){
                    deferred.resolve(function () {
                        sendRequest.sendQRCode(genClub(), function () {
                            $scope.QRcodes--;
                            $rootScope.savedTime = $rootScope.savedTime + 1000;
                            return $scope.requestTable.push("POST : //events//qrscan  " + "   TIME : " + $rootScope.savedTime);
                        })
                    });
                }, 1000);


                return deferred.promise;
            };

            var leaveClub = function () {
                sendRequest.sendCheckOut($scope.savedClubID, function () {
                    $scope.requestTable.push(getObject("POST : //events//checkout" + "      CLUB ID: " + $scope.savedClubID));
                    sendRequest.sendRate($scope.savedClubID, function (rating) {
                        $scope.requestTable.push(getObject("POST : //events//rate       ->RATEING : " +rating ));
                        $scope.savedClubID = null;
                        $scope.savedLocation = null;
                        $scope.nowLocation = generator.genLocation();
                    })
                })
            };

            $scope.stopSimulation = function () {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                    //$scope.requestTable.length = 0;
                    $scope.active = false;
                    $scope.title = "goParty UserSimulator2";
                    $scope.clubList = [];
                    $scope.QRcodes = 0;
                    $scope.nowLocation = null;
                    $scope.savedLocation = null;

                    $scope.clearShow = true;
                }
            };

            $scope.resetList = function(){
                $scope.requestTable.length = 0;
                $scope.id = 0;
                $scope.clearShow=false;
            };

            function genBoolean() {
                return Math.random() < 0.7;
            }

            function genClub() {
                var index = Math.floor(Math.random() * $scope.clubList.length);
                return $scope.clubList[index];
            }
        }]);
