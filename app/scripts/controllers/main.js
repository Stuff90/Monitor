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

  		$scope.chartType = 'Line';

  		$scope.toggleType = function(){
  			if($scope.chartType === 'Line') {
  				$scope.chartType = 'Bar';
  			} else {
	  			$scope.chartType = 'Line';
  			}
  		};

  		$scope.lastCommits = [];


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
						theDate 	= commitTimestamp.format('D-MM-YYYY');

	  				this.addUser( theUserName );
	  				this.addRepo( theRepo );
	  				this.addDate( theDate) ;

	  				self.addCommitToDatePerRepoPerUser( theDate , theRepo , theUserName );

  					return this;
  				},


  				getTotalCommitsPerUser : function() {
  					var result = {
  						commits : [],
  						user 	  : [],
  					};

  					for( var aDate in self.commitsPerDatePerRepoPerUser ) {
  						var commitPerDate = self.commitsPerDatePerRepoPerUser[aDate];

  						for( var aRepo in commitPerDate ) {
  							var commitPerRepo = commitPerDate[aRepo];

	  						for( var aUser in commitPerRepo ) {
	  							var commitPerUser = commitPerRepo[aUser];

	  							if( aUser !== '_total' ) {

	  								var indexOfUser = self.pushToArray( result.user , aUser );

	  								if(!!!result.commits[indexOfUser]) {
	  									result.commits[indexOfUser] = commitPerUser;
	  								} else {
	  									result.commits[indexOfUser] += commitPerUser;
	  								}
	  							}
	  						}
  						}
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

  						for( var anExistingRepo in self.commitsPerDatePerRepoPerUser[theDate] ) {
  							if( anExistingRepo !== '_total' && result.repos.indexOf(anExistingRepo) < 0) {
  								result.repos.push(anExistingRepo);
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
				sortedDates.sort(function(a, b){
					var thekA = moment(a, 'D-MM-YYYY'),
						thekB = moment(b, 'D-MM-YYYY');

					if(thekA.diff(thekB) < 0) { return -1; }
					if(thekA.diff(thekB) > 0) { return 1; }
					return 0;
				});
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




  		$scope.full = function(){
  			var el = document.documentElement,
  				rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen ;
		    rfs.call(el);
  		};





		var i = 0;

  		var parseCommit = function( commitData ) {
  			if(i === 0) { console.info(commitData); } i++;

  			var lastCommit = {
  				userName 	: commitData.sender.login,
  				message 	: commitData.message,
  				image 		: commitData.sender.avatar_url,
  				repo 		: commitData.url.match(extractRepoNameRegExp)[1],
  				date 		: moment(commitData.timestamp)
  			};
  			$scope.lastCommits.unshift(lastCommit);

  			$scope.theDataSet.addCommit( commitData );
 		};





  		commitsData.$watch(function(){

  			$scope.theDataSet.resetData();

  			commitsData.$loaded(function(data){
		  		data.forEach(parseCommit);
		  		$scope.commitsPerDay 	= $scope.theDataSet.getCommitsPerDayPerRepo();
		  		$scope.commitsPerUser 	= $scope.theDataSet.getTotalCommitsPerUser();
  			});

  		});
	 }]);
