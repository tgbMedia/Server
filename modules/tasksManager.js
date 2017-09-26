var TaskManager = function (maxConcurrentTasks, intervalBetweenBulks){
	this.maxConcurrentTasks = (maxConcurrentTasks < 1) ? 1 : maxConcurrentTasks;
	this.intervalBetweenBulks = (intervalBetweenBulks < 0) ? 0 : intervalBetweenBulks;
	this.waitingForNewRunCb = undefined;
	this.tasksList = [];
	this.results = [];
}

TaskManager.prototype.resetTasksList = function(tasksList){
	//Rest old values
	this.tasksList = tasksList;
	this.results = [];

	//Run!
	return this.run(tasksList)
}

TaskManager.prototype.pushTask = function(tasksList){
	if(this.tasksList.length > 0)
		this.tasksList.concat(tasksList);
	else
		this.resetTasksList(tasksList);
}

TaskManager.prototype.run = function(tasksList){
	return Promise.all(tasksList.splice(0, this.maxConcurrentTasks))
		.then(results => {
			this.results = this.results.concat(results);

			if(tasksList.length > 0)
			{
				console.log(results)
				return new Promise(resolve => {
					setTimeout(
						() => resolve(this.run(tasksList)), 
						this.intervalBetweenBulks
					);
				});				
			}

			return this.results;
		})
}

module.exports = TaskManager;