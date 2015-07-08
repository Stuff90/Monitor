'use strict';

/**
* @ngdoc service
* @name monitorApp.chartDataParser
* @description
* # chartDataParser
* Factory in the monitorApp.
*/

angular.module('monitorApp')
    .factory('ChartDataParserFactory', function () {

        var ChartDataParser = function() {

            var self = this,
                extractRepoNameRegExp = /https:\/\/github.com\/[a-zA-Z0-9-_]*\/([a-zA-Z-]*)\/.*/;

            self.commitsPerDatePerUsers = [];
            self.commitsPerDatePerRepoPerUser = [];

            return {

                addCommit : function( aCommit ) {
                    var commitTimestamp = moment(aCommit.timestamp);

                    var theUserName = aCommit.committer.username || aCommit.committer.name || aCommit.committer.email,
                    theRepo         = aCommit.url.match(extractRepoNameRegExp)[1],
                    theDate         = commitTimestamp.format('D-MM-YYYY');

                    self.addToTotalCommitByUser( theUserName );
                    self.addToTotalCommitsByRepoForDate( theDate , theRepo );
                    self.addToTotalCommitsByUserForRepo( theDate , theRepo , theUserName );

                    return this;
                },


                getTotalCommitsPerProjectsPerUsers : function() {

                    var result = {
                        commits : [],
                        users   : self.totalCommitsByUserForRepo.users,
                        repos   : self.totalCommitsByUserForRepo.repos
                    };

                    for( var aUser in result.users ) {
                        result.commits[aUser] = []
                        for( var aRepo in result.repos ) {
                            if(self.totalCommitsByUserForRepo.commits[aUser][aRepo] === undefined) {
                            result.commits[aUser][aRepo] = 0;
                            } else {
                            result.commits[aUser][aRepo] = self.totalCommitsByUserForRepo.commits[aUser][aRepo];
                            }
                        }
                    }

                    return result;
                },


                getTotalCommitsByUser : function() {
                    return self.totalCommitsByUser;
                },


                getCommitsPerDayPerRepo : function() {

                    var result = {
                        commits : [],
                        dates   : self.getSortedDates( self.totalCommitsByRepoForDate.dates ),
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
                    self.allUsers   = [];
                    self.allRepos   = [];
                    self.allDates   = [];

                    self.commitsPerDatePerUsers = [];
                    self.commitsPerDatePerRepoPerUser = [];

                    return this;
                }
            };
        }

        ChartDataParser.prototype = {

            totalCommitsByUser : { commits : [] , user : [] },
            totalCommitsByRepoForDate : { commits : [] , dates : [] , repos : [] },
            totalCommitsByUserForRepo : { commits : [] , users : [] , repos : [] },


            pushToArray : function( theArray , data ) {
                var theIndex = theArray.indexOf(data);
                if(theIndex < 0) {
                    theArray.push(data);
                }
                return theArray.indexOf(data);
            },

            addToTotalCommitsByUserForRepo: function( theDate , theRepo , theUserName ) {

                if(this.totalCommitsByUserForRepo.users.indexOf(theUserName) < 0 ) {
                    this.totalCommitsByUserForRepo.commits.push([]);
                }
                var indexOfUser = this.pushToArray( this.totalCommitsByUserForRepo.users , theUserName ),
                indexOfRepo = this.pushToArray( this.totalCommitsByUserForRepo.repos , theRepo );

                if(this.totalCommitsByUserForRepo.commits[indexOfUser][indexOfRepo] === undefined) {
                    this.totalCommitsByUserForRepo.commits[indexOfUser][indexOfRepo] = 0;
                }
                this.totalCommitsByUserForRepo.commits[indexOfUser][indexOfRepo]++;
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


            getSortedDates : function( arrayOfDates ) {
                var self    = this,
                sortedDates = [];

                for (var i = 0; i < arrayOfDates.length; i++) {
                    sortedDates.push(arrayOfDates[i]);
                };

                sortedDates.sort(function(a, b){
                    var thekA = moment(a, 'D-MM-YYYY'),
                    thekB = moment(b, 'D-MM-YYYY');

                    if(thekA.diff(thekB) < 0) { return -1; }
                    if(thekA.diff(thekB) > 0) { return 1; }
                    return 0;
                });

                return sortedDates;
            }
        }

        return ChartDataParser;
    });
