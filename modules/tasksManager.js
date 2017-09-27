const async = require('async');

var TaskManager = function (maxConcurrentTasks, intervalBetweenBulks){
	this.maxConcurrentTasks = (maxConcurrentTasks < 1) ? 1 : maxConcurrentTasks;
	this.intervalBetweenBulks = (intervalBetweenBulks < 0) ? 0 : intervalBetweenBulks;
	this.waitingForNewRunCb = undefined;
	this.results = [];
}

TaskManager.prototype.runTasks = function(tasksList){
	this.results = [];

	return new Promise((resolve, reject) => {
		this.run(tasksList, (err, results) => {
			if(err)
				return reject(err);

			resolve(results);
		});
	})
	
}


TaskManager.prototype.run = function(tasksList, callback){
	async.parallel(tasksList.splice(0, this.maxConcurrentTasks), (err, results) => {
		if(err)
			return callback(err, this.results);

		this.results = this.results.concat(results);

		if(tasksList.length > 0)
		{
			return setTimeout(
				() => this.run(tasksList, callback), 
				this.intervalBetweenBulks
			);
		}


		//Done
		callback(err, this.results);
	});
}


module.exports = TaskManager;