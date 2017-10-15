const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint, printf } = format;

const path = require('path'),
      config = require('config/logger');

const logger = createLogger({
    format: combine(
        timestamp(),
        printf(info => {
            return `${info.timestamp} [${info.level}]: ${info.message}`;
        })
    ),
    transports: [
        new transports.File({
            level: 'error',
            filename: path.resolve(config.logsDir, `${config.errors}${config.logExtension}`),
            format: combine(
                printf(info => {
                    return JSON.stringify(info);
                })
            )
        }),
        new transports.File({
            filename: path.resolve(config.logsDir, `${config.verbose}${config.logExtension}`)
        }),
        new transports.Console({ level: 'silly' })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: path.resolve(config.logsDir, `${config.fatalErrors}${config.logExtension}`),
            format: combine(
                printf(info => {
                    return JSON.stringify(info);
                })
            )
        }),
        new transports.Console()
    ],
    exitOnError: false
});

module.exports = logger;