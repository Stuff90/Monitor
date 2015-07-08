'use strict';

/**
 * @ngdoc function
 * @name monitorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the monitorApp
 */

 angular.module('monitorApp')
	 .controller('MainCtrl' , [
            '$scope',
            'DataRetrieverService',
        function ($scope , DataRetrieverService ) {

            var theDataRetrieverService = new DataRetrieverService();

            theDataRetrieverService.onUpdate(function( data ){
                $scope.lastCommits               = data.commitList;
                $scope.commitsPerDay             = data.commitsPerDay;
                $scope.commitsPerUser            = data.commitsPerUser;
                $scope.commitsPerProjectPerUsers = data.commitsPerProjectPerUsers;
            })

        $scope.chartType    = {
            main    : 'Line',
            second  : 'Doughnut',
            third   : 'Bar',
        };

        $scope.toggleChart = function( chartIndex ){
            if(chartIndex === 0) {
                $scope.chartType.main  = $scope.chartType.main === 'Line' ? 'Bar' : 'Line';
            }
            if(chartIndex === 1) {
                $scope.chartType.second  = $scope.chartType.second === 'Doughnut' ? 'PolarArea' : 'Doughnut';
            }
            if(chartIndex === 2) {
                $scope.chartType.third  = $scope.chartType.third === 'Bar' ? 'Radar' : 'Bar';
            }
        };

        $scope.full = function(){
            var el = document.documentElement,
                rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen ;
            rfs.call(el);
        };

        $scope.refreshCharts = function(){
            theDataRetrieverService.reset();
        };
	 }]);
