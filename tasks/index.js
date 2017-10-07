const fs = require('fs'),
      path = require('path'),
      CronJob = require('cron').CronJob;

fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach(file => {
        let task = require(path.resolve(__dirname, file));

        //Set job
        module.exports[task.name] = new CronJob(
            task.defaultSchedule,
            task.task,
            null,
            true,
            'America/Los_Angeles'
        );
    });