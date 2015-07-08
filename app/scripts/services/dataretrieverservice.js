'use strict';

/**
 * @ngdoc service
 * @name monitorApp.DataRetrieverService
 * @description
 * # DataRetrieverService
 * Service in the monitorApp.
 */
angular.module('monitorApp')
	.service('DataRetrieverService' , [ '$firebaseObject', 'ChartDataParserFactory' , function ( $firebaseObject , ChartDataParserFactory ) {

		var DataRetriever = function() {

			var self = this;

			self.initializeFireBase();

			return {
				reset: function(){
					self.initializeFireBase();
					self.dataAvailable( function(){} );
				},
				onUpdate: function( callback ) {
					self.dataAvailable( function( data ){
						callback(data);
					});
				}
			}
		};



		DataRetriever.prototype = {

			commitInfos: [],

	  		parseCommit: function( commitData  ) {

	  			var lastCommit = {
	  				userName 	: commitData.sender.login,
	  				message 	: commitData.message,
	  				image 		: commitData.sender.avatar_url,
	  				repo 		: commitData.url.match(/https:\/\/github.com\/[a-zA-Z0-9-_]*\/([a-zA-Z-]*)\/.*/)[1],
	  				date 		: moment(commitData.timestamp)
	  			};

	  			this.commitInfos.unshift( lastCommit );
	 		},

			initializeFireBase: function() {
				var self = this;

				self.firebase 			= new Firebase('https://ileotech.firebaseio.com');
				self.theChartDataParser = new ChartDataParserFactory();
				self.retrievedData 		= $firebaseObject( self.firebase.child('commits/history') );

			},

			dataAvailable: function( callback ) {
				var self = this;

		  		self.retrievedData.$watch(function(){
		            self.retrievedData.$loaded(function(data){
				  		data.forEach(function( commitData ){
				  			self.parseCommit( commitData );
	  						self.theChartDataParser.addCommit( commitData );
				  		});

			            callback({
					  		commitList 					: self.commitInfos,
		                	commitsPerUser            	: self.theChartDataParser.getTotalCommitsByUser(),
				  			commitsPerDay 	         	: self.theChartDataParser.getCommitsPerDayPerRepo(),
				  			commitsPerProjectPerUsers 	: self.theChartDataParser.getTotalCommitsPerProjectsPerUsers()
			            });
		  			});
		  		});
		  	}
		}

		return DataRetriever;

	}]);
