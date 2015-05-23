/**
 * Created by Dominika on 2015-05-21.
 */
angular.module('goAppSim', ['requestService'])
    .controller('appCtrl', ['$scope', '$rootScope', '$http', 'sendRequest',
        function ($scope, $rootScope, $http, sendRequest) {
            $scope.title = "goParty UserSimulator2";
            $scope.clubList = [];
            $scope.QRcodes = 0;
            $scope.nowLocation = null;
            $scope.savedLocation = null;

            $scope.active = false;
            $scope.stopItem = false;
            $scope.requestTable = [];

            $scope.startSimulation = function () {
                $scope.active = true;
                sendRequest.getUser(function (token) {
                    $scope.access_token = token;
                    $http.defaults.headers.common['Authorization'] = "Bearer " + $scope.access_token;
                    sendRequest.getLocalIDList(function (ClubList) {
                        $scope.clubList = ClubList;
                        intervalLocation();
                    });
                });
            };

            $scope.stopSimulation = function () {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                    $scope.requestTable.length = 0;
                    $scope.active = false;
                }
            };
            var stop;

            //send location request every 6s, do this until stopButton is pressed
            var intervalLocation = function () {
                if (angular.isDefined(stop)) return;

                stop = $interval(function () {
                    if ($scope.stopItem != true) {
                        if($scope.QRcodes == 0  ){
                            $scope.QRcodes = Math.floor((Math.random()*4) + 1);

                            if($scope.savedLocation !=null){
                                //ewentualnie decyduj czy zostajesz czy wychodzisz
                                sendRequest.sendCheckOut(function(){
                                    $scope.requestTable.push("POST : //events//checkout");
                                    sendRequest.sendRate(function(){
                                        $scope.requestTable.push("POST : //events//rate");
                                        sendRequest.sendLocation(function (location) {
                                            $scope.savedLocation = location;
                                            $scope.requestTable.push("POST : //events//location");
                                            //decide if your location is  equivalent to "club" location
                                            if(genBoolean() ){
                                                $scope.localID = Math.floor( (Math.random()* $scope.clubList.length) );
                                                sendRequest.sendCheckIn($scope.localID, function(){
                                                    $scope.requestTable.push("POST : //events//checkin");
                                                    genRequests();
                                                });
                                            }
                                        });
                                    })
                                })
                            }else{
                                sendRequest.sendLocation(function (location) {
                                    $scope.savedLocation = location;
                                    $scope.requestTable.push("POST : //events//location");
                                    genRequests();

                                });
                            }

                        }else{
                            sendRequest.sendSavedLocation($scope.savedLocation, function(){
                                genRequests();
                            } )
                        }

                    } else {
                        $scope.stopSimulation();
                    }
                }, 6000);
            };

            var genRequests = function () {
                var times = $scope.QRcodes;

                for( var i = 0 ; i< times; i++){
                    sendRequest.sendQRCode(function(){
                        $scope.QRcodes--;
                        $scope.requestTable.push("POST : //events//qrscan");
                    })
                }

            };

            function genBoolean(){
                return Math.random() < 0.7;
            }
        }]);