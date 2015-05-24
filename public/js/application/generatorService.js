/**
 * Created by Dominika on 2015-05-21.
 */
angular.module('generatorService', [])
    .service('generator', [function () {
        var service = {};
        service.getNowTimeStamp = getNowTimeStamp;
        service.genTimeStamp = genTimeStamp;
        service.genRate = genRate;
        service.genLocation = genLocation;

        function getNowTimeStamp() {
            //var nowDate = nowDate || new Date();
            var nowDate = genTimeStamp();

            var date = [nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate()];
            var time = [nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds()];
            var milliseconds = nowDate.getMilliseconds();
            for (var i = 0; i < 3; i++) {
                if (time[i] < 10) {
                    time[i] = "0" + time[i];
                }
                if (date[i] < 10) {
                    date[i] = "0" + date[i];
                }
            }
            //Return formattedString
            return date.join("-") + "T" + time.join(":") + "." + milliseconds;
        }

        function genTimeStamp() {
            var startDate = new Date(2014, 0, 1);
            var endDate = new Date();
            return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        }

        function genRate() {
            return Math.floor((Math.random() * 5) + 1);
        }

        function genLocation() {
            var location = [];
            location[0] = Math.floor((Math.random()*10) + 1);
            location[1] = Math.floor((Math.random()*10 ) + 1);
            alert(location);
            return location;
        }

        return service;
    }]);