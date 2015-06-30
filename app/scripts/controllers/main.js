'use strict';

/**
 * @ngdoc function
 * @name monitorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the monitorApp
 */
 angular.module('monitorApp')
	 .controller('MainCtrl' , ['$scope', '$firebaseArray', '$firebaseObject', function ($scope, $firebaseArray , $firebaseObject) {
  		var ref = new Firebase('https://ileotech.firebaseio.com'),
			today 	= new Date(),
  			formatedDate = today.getDate() + (today.getMonth().length === 2 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1)) + today.getFullYear();


  		var commitsData = $firebaseObject(ref.child('commits/repo'));



  		commitsData.$watch(function(){

	  		$scope.pieChartLabels 	= [];
	  		$scope.barChartLabels 	= [];

	  		$scope.barChartData 	= [ [] ];
	  		$scope.pieChartData 	= [];

		  	var commitPerUserPerProject = {};

		  	var dailyCommits = {}
		  	var commitsPerProjectWeekly = {}

  			commitsData.$loaded(function(data){
		  		data.forEach(function(nestedData , repoName , nestedRef){

		  			var daysCounter = 0;





	  				for (var aUser in nestedData[formatedDate].users) {
	  					if(dailyCommits[aUser] === undefined){
	  						dailyCommits[aUser] = nestedData[formatedDate].users[aUser];
	  					} else {
	  						dailyCommits[aUser] += nestedData[formatedDate].users[aUser]
	  					}
	  				}





		  			for (var aDay in nestedData) {
		  				var commitsPerDay = nestedData[aDay];
	  						commitsPerProjectWeekly[aDay] = {};

		  				for (var aUser in commitsPerDay.users) {
	  						if(commitsPerProjectWeekly[aDay][aUser] === undefined){
	  							commitsPerProjectWeekly[aDay][aUser] = nestedData[aDay].users[aUser];
		  					} else {
	  							commitsPerProjectWeekly[aDay][aUser] += nestedData[aDay].users[aUser];
		  					}
		  				}

		  				if(daysCounter >= 6) { break; }
		  				daysCounter++;
		  			}

		  			$scope.barChartLabels.push(repoName);
		  			$scope.barChartData[0].push(nestedData[formatedDate].total);
		  		});

				console.info(commitsPerProjectWeekly);

				// for( var commitingUser in dailyCommits ) {
				// 	$scope.pieChartLabels.push(commitingUser);
				// 	$scope.pieChartData.push(dailyCommits[commitingUser]);
				// }

				$scope.projectsPies = [];

				for( var aCommitsDay in commitsPerProjectWeekly ) {
					// var a
					// $scope.pieChartLabels.push(commitingUser);
					// $scope.pieChartData.push(dailyCommits[commitingUser]);
				}
  			});
  		});
	 }]);
