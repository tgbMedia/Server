const path = require('path'),
	  mkdirp = require('mkdirp'),
	  ffmpeg = require('fluent-ffmpeg'),
	  config = require('config/transcoder'),
	  secretConfig = require('config/secret');

var Transcoder = function(settings){
	if(typeof settings === 'undefined')
		this.settings = config.defaultSettings;
	else
		this.settings = settings;
}

Transcoder.prototype.transcode = async function(inputFilePath){
	
	let outputDirectory = config.tempDirectory;

	//Create temporary directory 
	await createTempDir(outputDirectory);

	this.ffmpegProcess = ffmpeg(inputFilePath)
		.on('start', console.log)
		.output(path.resolve(outputDirectory, this.settings.outputFileNameFormat))
		.videoCodec(this.settings.videoCodec)
		.audioCodec(this.settings.audioCodec)
		.audioBitrate(this.settings.audioBitrate)
		.outputOptions(this.settings.outputOptions)
		.format(this.settings.outputFormat)
		.size(this.settings.size);

	this.ffmpegProcess.run();
}

Transcoder.prototype.stopTranscoding = function(){
	return new Promise((reject, resolve) => {
		if(typeof this.ffmpegProcess === 'undefined')
			return;

		try{
			this.ffmpegProcess.kill();
			resolve();
		}
		catch(err){
			reject(err);
		}
	});
}

function createTempDir(path){
	return new Promise((resolve, reject) => {
		mkdirp(path, err => {
			if(err)
				return reject(err);

			resolve();
		})
	});
}

module.exports = Transcoder;