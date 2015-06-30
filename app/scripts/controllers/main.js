'use strict';

/**
 * @ngdoc function
 * @name monitorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the monitorApp
 */

 angular.module('monitorApp')
	 .controller('MainCtrl' , ['$scope', '$firebaseArray', '$firebaseObject' , function ($scope, $firebaseArray , $firebaseObject) {
  		var ref 		= new Firebase('https://ileotech.firebaseio.com'),
  			commitsData = $firebaseObject(ref.child('commits/history'));

  		var extractRepoNameRegExp = /https:\/\/github.com\/[a-zA-Z0-9-_]*\/([a-zA-Z-]*)\/.*/;

  		$scope.chartType = 'Bar';

  		$scope.toggleType = function(){
  			if($scope.chartType === 'Line') {
  				$scope.chartType = 'Bar';
  			} else {
	  			$scope.chartType = 'Line';
  			}
  		}


  		var DataSet = function( ) {

			var self = this;

			self.allUsers 	= [];
			self.allRepos 	= [];
			self.allDates 	= [];

			self.commitsPerDatePerUsers = [];
			self.commitsPerDatePerRepoPerUser = [];

  			return {
  				addCommit : function( aCommit ) {
					var commitTimestamp = moment(aCommit.timestamp);

					var theUserName = aCommit.committer.username,
						theRepo 	= aCommit.url.match(extractRepoNameRegExp)[1],
						theDate 	= commitTimestamp.format('D/MM');

	  				this.addUser( theUserName );
	  				this.addRepo( theRepo );
	  				this.addDate( theDate) ;

	  				self.addCommitToDatePerRepoPerUser( theDate , theRepo , theUserName );

  					return this;
  				},


  				getCommitsPerDay : function() {
  					var sortedDates = self.getSortedDates();

  					var result = {
  						commits : [[]],
  						dates 	: []
  					};

  					for (var i = 0; i < sortedDates.length; i++) {
  						var theDate = sortedDates[i];

  						result.dates.push(theDate);
  						result.commits[0].push(self.commitsPerDatePerRepoPerUser[theDate]._total);
  					}
  					return result;
  				},


  				getCommitsPerDayPerRepo : function() {
  					var sortedDates = self.getSortedDates();

  					var result = {
  						commits : [],
  						dates 	: [],
  						repos 	: []
  					};

  					for (var i = 0; i < sortedDates.length; i++) {
  						var theDate = sortedDates[i];

  						result.dates.push(theDate);

  						for( var aRepo in self.commitsPerDatePerRepoPerUser[theDate] ) {
  							if( aRepo !== '_total' && result.repos.indexOf(aRepo) < 0) {
  								result.repos.push(aRepo);
  								result.commits.push([]);
  							}
  						}
  					}

  					for (var j = 0; j < result.dates.length; j++) {
  						var aDate = result.dates[j];

  						for (var k = 0; k < result.repos.length; k++) {
  							var aRepo = result.repos[k];

  							var repoIndex 	= result.repos.indexOf(aRepo),
  								theValue 	= 0;

  							if( self.commitsPerDatePerRepoPerUser[aDate][aRepo] !== undefined) {
  								theValue = self.commitsPerDatePerRepoPerUser[aDate][aRepo]._total;
  							}
  							result.commits[repoIndex].push(theValue);
	  					}
  					}

  					return result;
  				},


  				resetData : function() {
					self.allUsers 	= [];
					self.allRepos 	= [];
					self.allDates 	= [];

					self.commitsPerDatePerUsers = [];
					self.commitsPerDatePerRepoPerUser = [];

  					return this;
  				},


  				addUser : function( userName ) {
  					self.pushToArray( self.allUsers , userName );
  					return this;
  				},
  				addRepo : function( repoName ) {
  					self.pushToArray( self.allRepos , repoName );
  					return this;
  				},
  				addDate : function( date ) {
  					self.pushToArray( self.allDates , date );
  					return this;
  				},

  				getUsers : function() {
  					return self.allUsers;
  				},

  				getRepos : function() {
  					return self.allRepos;
  				},

  				getDates : function() {
  					return self.allDates;
  				},
  			};
  		};

  		DataSet.prototype = {

  			pushToArray : function( theArray , data ) {
  				var theIndex = theArray.indexOf(data);
  				if(theIndex < 0) {
  					theArray.push(data);
  				}
  				return theArray.indexOf(data);
  			},

  			getSortedDates : function() {
  				var self 		= this,
					sortedDates = [];

				for( var aDay in self.commitsPerDatePerRepoPerUser ) {
					sortedDates.push(aDay);
				}
				sortedDates.sort();
				return sortedDates;
			},

  			addCommitToDatePerRepoPerUser : function( theDate , repoName , userName ) {
  				var self = this;

  				if(self.commitsPerDatePerRepoPerUser[theDate] === undefined ) {
  					self.commitsPerDatePerRepoPerUser[theDate] = { _total : 0 };
  				}

  				if(self.commitsPerDatePerRepoPerUser[theDate][repoName] === undefined ) {
  					self.commitsPerDatePerRepoPerUser[theDate][repoName] = { _total : 0 };
  				}

  				if(self.commitsPerDatePerRepoPerUser[theDate][repoName][userName] === undefined ) {
  					self.commitsPerDatePerRepoPerUser[theDate][repoName][userName] = 0;
  				}

  				self.commitsPerDatePerRepoPerUser[theDate]._total++;
  				self.commitsPerDatePerRepoPerUser[theDate][repoName]._total++;
  				self.commitsPerDatePerRepoPerUser[theDate][repoName][userName]++;
  			}
  		};

  		$scope.theDataSet = new DataSet();










		// var i = 0;

  		var parseCommit = function( commitData ) {
  			// if(i === 0) { console.info(commitData); } i++;

  			$scope.theDataSet.addCommit( commitData );
 		};





  		commitsData.$watch(function(){

  			$scope.theDataSet.resetData();

  			commitsData.$loaded(function(data){
		  		data.forEach(parseCommit);
		  		$scope.commitsPerDay = $scope.theDataSet.getCommitsPerDayPerRepo();
  			});

  		});
	 }]);
