/**
 * The main entry of the application.
 */
require('./bootstrap')

const _ = require('lodash')
const config = require('config')
const Kafka = require('no-kafka')
const healthcheck = require('topcoder-healthcheck-dropin')
const KafkaHandlerService = require('./services/KafkaHandlerService')
const logger = require('./common/logger')
const helper = require('./common/helper')
const producer = helper.producer

// Start kafka consumer
logger.info('Starting kafka consumer')
logger.info(`KAFKA URL - ${config.KAFKA_URL}`)
// create consumer
const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())

/*
 * Data handler linked with Kafka consumer
 * Whenever a new message is received by Kafka consumer,
 * this function will be invoked
 */
const dataHandler = (messageSet, topic, partition) => Promise.each(messageSet, async (m) => {
  const message = m.message.value ? m.message.value.toString('utf8') : null
  const messageInfo = `Kafka event message; Topic: ${topic}; Partition: ${partition}; Offset: ${
    m.offset}; Message: ${message}.`

  logger.debug(`Received ${messageInfo}`)

  let messageJSON
  try {
    messageJSON = JSON.parse(message)
  } catch (e) {
    logger.error('Invalid message JSON.')
    logger.logFullError(e)

    // commit the message and ignore it
    await consumer.commitOffset({ topic, partition, offset: m.offset })
    return
  }

  if (messageJSON.payload &&
    (messageJSON.payload.phaseTypeName !== 'Review' || messageJSON.payload.state !== 'START')) {
    logger.debug(`Ignoring other auto pilot events from Topic: ${topic}`)
    // Ignore the message
    return
  }

  try {
    let isCommited
    if (topic === config.AUTOPILOT_EVENT_TOPIC) {
      isCommited = await KafkaHandlerService.handle(messageJSON)
    } else {
      throw new Error(`Invalid topic: ${topic}`)
    }

    if (isCommited) {
      try {
        await consumer.commitOffset({ topic, partition, offset: m.offset })

        logger.debug('Successfully processed message')
      } catch (e) {
        logger.error(`Failed to commit offset for ${messageInfo}: ${e.message}`)
        logger.logFullError(e)
      }
    }
  } catch (err) {
    // Catch all errors thrown by the handler
    let message
    if (err.response) {
      // extract error message from V4 API(first _.get method) or V5 API(second _.get method)
      message = _.get(err, 'response.body.result.content') || _.get(err, 'response.body.message')
    }
    logger.error(`Failed to handle ${messageInfo}: ${message || err.message}`)
    logger.logFullError(err)
  }
})

// check if the kafka connection is alive
const check = (client) => () => {
  if (!client.initialBrokers && !client.initialBrokers.length) {
    return false
  }
  let connected = true
  client.initialBrokers.forEach(conn => {
    logger.debug(`url ${conn.server()} - connected=${conn.connected}`)
    connected = conn.connected & connected
  })
  return connected
}

const topics = [config.AUTOPILOT_EVENT_TOPIC]

consumer
  .init([{
    subscriptions: topics,
    handler: dataHandler
  }])
  .then(() => producer.init())
  // consume configured topics
  .then(() => {
    logger.info('Initialized.......')
    healthcheck.init([check(consumer.client), check(producer.client)])
    logger.info('Adding topics successfully.......')
    logger.info(topics)
    logger.info('Kick Start.......')
  })
  .catch((err) => logger.error(err))

if (process.env.NODE_ENV === 'test') {
  module.exports = consumer
}
