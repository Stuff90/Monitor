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

					var theUserName = aCommit.committer.username || aCommit.committer.name || aCommit.committer.email,
						theRepo 	= aCommit.url.match(extractRepoNameRegExp)[1],
						theDate 	= commitTimestamp.format('D-MM-YYYY');

	  				this.addUser( theUserName );
	  				this.addRepo( theRepo );
	  				this.addDate( theDate) ;

                    self.addCommitToDatePerRepoPerUser( theDate , theRepo , theUserName );

                    self.addToTotalCommitByUser( theUserName );
	  				self.addToTotalCommitsByRepoForDate( theDate , theRepo );

  					return this;
  				},


                getTotalCommitsPerProjectsPerUsers : function() {
                    var result = {
                        commits : [],
                        users   : [],
                        repos   : []
                    };

                    for( var aDate in self.commitsPerDatePerRepoPerUser ) {
                        var commitPerDate = self.commitsPerDatePerRepoPerUser[aDate];

                        for( var aRepo in commitPerDate ) {
                            var commitPerRepo = commitPerDate[aRepo];

                            if( aRepo !== '_total' ) {
                                var indexOfRepo = self.pushToArray( result.repos , aRepo );


                                for( var aUser in commitPerRepo ) {
                                    var commitPerUser = commitPerRepo[aUser];

                                    if( aUser !== '_total' ) {

                                        if (result.users.indexOf(aUser) < 0) {
                                            result.commits.push([]);
                                        }

                                        var indexOfUser = self.pushToArray( result.users , aUser );

                                        for (var i = 0; i < result.repos.length; i++) {
                                            if(result.commits[indexOfUser][i] === undefined) {
                                                result.commits[indexOfUser][i] = 0;
                                            }
                                        };

                                        result.commits[indexOfUser][indexOfRepo] += commitPerUser;
                                    }
                                }
                            }
                        }
                    }




                    for (var i = 0; i < result.repos.length; i++) {
                        for (var j = 0; j < result.users.length; j++) {
                            if(result.commits[j][i] === undefined) {
                                result.commits[j][i] = 0;
                            }
                        }
                    };

                    return result;
                },


  				getTotalCommitsByUser : function() {
                    return self.totalCommitsByUser;
  				},


  				getCommitsPerDayPerRepo : function() {

                    var result = {
                        commits : [],
                        dates   : self.getSortedDates(),
                        repos   : self.totalCommitsByRepoForDate.repos
                    };

                    for( var aRepo in result.repos ) {
                        result.commits[aRepo] = []
                        for( var aDate in result.dates ) {
                            if(self.totalCommitsByRepoForDate.commits[aRepo][aDate] === undefined) {
                                result.commits[aRepo][aDate] = 0;
                            } else {
                                result.commits[aRepo][aDate] = self.totalCommitsByRepoForDate.commits[aRepo][aDate];
                            }
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

            totalCommitsByUser : { commits : [] , user : [] },
            totalCommitsByRepoForDate : { commits : [] , dates : [] , repos : [] },


  			pushToArray : function( theArray , data ) {
  				var theIndex = theArray.indexOf(data);
  				if(theIndex < 0) {
  					theArray.push(data);
  				}
  				return theArray.indexOf(data);
  			},

            addToTotalCommitByUser: function( theUserName ){

                var indexOfUser = this.pushToArray( this.totalCommitsByUser.user , theUserName );

                if(this.totalCommitsByUser.commits[indexOfUser] === undefined ) {
                    this.totalCommitsByUser.commits[indexOfUser] = 0;
                }
                this.totalCommitsByUser.commits[indexOfUser]++;

            },

            addToTotalCommitsByRepoForDate: function( theDate , theRepo  ) {

                if(this.totalCommitsByRepoForDate.repos.indexOf(theRepo) < 0 ) {
                    this.totalCommitsByRepoForDate.commits.push([]);
                }
                var indexOfDate = this.pushToArray( this.totalCommitsByRepoForDate.dates , theDate ),
                    indexOfRepo = this.pushToArray( this.totalCommitsByRepoForDate.repos , theRepo );

                if(this.totalCommitsByRepoForDate.commits[indexOfRepo][indexOfDate] === undefined) {
                    this.totalCommitsByRepoForDate.commits[indexOfRepo][indexOfDate] = 0;
                }
                this.totalCommitsByRepoForDate.commits[indexOfRepo][indexOfDate]++;
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

		  		$scope.commitsPerDay 	         = $scope.theDataSet.getCommitsPerDayPerRepo();
                $scope.commitsPerUser            = $scope.theDataSet.getTotalCommitsByUser();
		  		$scope.commitsPerProjectPerUsers = $scope.theDataSet.getTotalCommitsPerProjectsPerUsers();

                console.info($scope.commitsPerDay);
  			});

  		});
	 }]);
