const util = require('util'),
      _ = require('lodash'),
      logger = require('modules/logger'),
      models = require('models'),
      fs = require('fs'),
      metadata = require('modules/metadata');

const fsStat = util.promisify(fs.stat);

module.exports = {
    name: 'refreshDirs',
    defaultSchedule: '0 */30 * * * *', //every 30 minutes
    task: async () => {
        //Get all directories
        try{
            let directories = await models.utils.getAllDirs();

            _.forEach(directories, async (dir) => {
                //Compare between last modified date of current dir to the date who stored in the database.
                let stat = await fsStat(dir.path);
                let lastModified = new Date(dir.lastModified);

                //This directory has been changed
                if (lastModified - stat.mtime !== 0) {
                    try {
                        //Refresh directory files(Metadata)
                        await metadata.refreshDir(dir.path, dir.type)
                    }
                    catch (err) {
                        logger.warn({
                            message: 'Failed to refresh directory',
                            extra: {
                                dirPath: dir.path,
                                reason: err
                            }
                        });
                        console.err(err);
                    }
                }

            });
        }
        catch(err){
            logger.error({
                message: 'Mission failed',
                extra: {
                    reason: err
                }
            });
        }
    }
};