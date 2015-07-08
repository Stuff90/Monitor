'use strict';

/**
 * @ngdoc function
 * @name monitorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the monitorApp
 */

 angular.module('monitorApp')
	 .controller('MainCtrl' , ['$scope', 'ChartDataParserFactory' , '$firebaseArray', '$firebaseObject' , function ($scope, ChartDataParserFactory , $firebaseArray , $firebaseObject) {
  		var ref 		= new Firebase('https://ileotech.firebaseio.com'),
  			commitsData = $firebaseObject(ref.child('commits/history'));

        var extractRepoNameRegExp = /https:\/\/github.com\/[a-zA-Z0-9-_]*\/([a-zA-Z-]*)\/.*/;

  		$scope.chartType = {
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

  		$scope.lastCommits = [];

  		$scope.ChartDataParser = new ChartDataParserFactory();



  		$scope.full = function(){
  			var el = document.documentElement,
  				rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen ;
		    rfs.call(el);
  		};



  		var parseCommit = function( commitData ) {

  			var lastCommit = {
  				userName 	: commitData.sender.login,
  				message 	: commitData.message,
  				image 		: commitData.sender.avatar_url,
  				repo 		: commitData.url.match(extractRepoNameRegExp)[1],
  				date 		: moment(commitData.timestamp)
  			};

  			$scope.lastCommits.unshift(lastCommit);
  			$scope.ChartDataParser.addCommit( commitData );
 		};



  		commitsData.$watch(function(){
  			$scope.ChartDataParser.resetData();

  			commitsData.$loaded(function(data){
		  		data.forEach(parseCommit);

		  		$scope.commitsPerDay 	         = $scope.ChartDataParser.getCommitsPerDayPerRepo();
                $scope.commitsPerUser            = $scope.ChartDataParser.getTotalCommitsByUser();
		  		$scope.commitsPerProjectPerUsers = $scope.ChartDataParser.getTotalCommitsPerProjectsPerUsers();
  			});

  		});
	 }]);
