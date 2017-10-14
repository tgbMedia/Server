const async = require('async');

const TaskManager = function (maxConcurrentTasks, intervalBetweenBulks){
	this.maxConcurrentTasks = (maxConcurrentTasks < 1) ? 1 : maxConcurrentTasks;
	this.intervalBetweenBulks = (intervalBetweenBulks < 0) ? 0 : intervalBetweenBulks;
	this.results = [];
	this.errors = [];
}

TaskManager.prototype.runTasks = function(tasksList){
	this.results = [];
    this.errors = [];

	return new Promise((resolve, reject) => {
		this.run(tasksList, (err, results) => {
			// if(err)
			// 	return reject(err);

			resolve([err, results]);
		});
	})
	
};


TaskManager.prototype.run = function(tasksList, callback){
	async.parallel(tasksList.splice(0, this.maxConcurrentTasks), (err, results) => {
		if(err)
            this.errors = this.errors.concat(err);

		this.results = this.results.concat(results);

		if(tasksList.length > 0)
		{
			return setTimeout(
				() => {
					this.run(tasksList, callback)
				}, 
				this.intervalBetweenBulks
			);
		}


		//Done
		callback(this.errors, this.results);
	});
};


module.exports = TaskManager;