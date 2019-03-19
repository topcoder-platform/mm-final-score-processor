/**
 * This module contains the winston logger configuration.
 */
const config = require('config')
const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: config.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.simple()
      )
    })
  ]
})


module.exports = logger
