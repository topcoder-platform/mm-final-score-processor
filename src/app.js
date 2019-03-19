/**
 * The main entry of the application.
 */
const logger = require("./common/logger");
require("./bootstrap");

const _ = require("lodash");
const config = require("config");
const Kafka = require("no-kafka");
const util = require("util");
const healthcheck = require("topcoder-healthcheck-dropin");
const KafkaHandlerService = require("./services/KafkaHandlerService");

logger.info(`KAFKA URL - ${config.KAFKA_URL}`);

/**
 * Handle the messages from Kafka.
 * @param {Array<Object>} messages the messages
 * @param {String} topic the topic
 * @param {Number} partition the partition
 * @private
 */
function handleMessages(messages, topic, partition) {
  return Promise.each(messages, m => {
    const messageValue = m.message.value
      ? m.message.value.toString("utf8")
      : null;
    
    const messageInfo = `message from topic ${topic}, partition ${partition}, offset ${
      m.offset
    }: ${messageValue}`;
    
    logger.debug(`Received ${messageInfo}`);

    let messageJSON;
    try {
      messageJSON = JSON.parse(messageValue);
    } catch (e) {
      logger.error("Invalid message JSON.");
      return;
    }

    if (messageJSON.topic !== config.AUTOPILOT_EVENT_TOPIC) {
      logger.debug(`Mesage of no interest: ${messageJSON.topic}`);
      // Ignore the message
      return;
    }

    if (
      messageJSON.topic === config.AUTOPILOT_EVENT_TOPIC &&
      (messageJSON.payload.phaseTypeName !== "Review" ||
        messageJSON.payload.state !== "START")
    ) {
      logger.debug(
        `Ignoring other auto pilot events from Topic: ${messageJSON.topic}`
      );
      // Ignore the message
      return;
    }

    // Handle the event
    return KafkaHandlerService.handle(messageJSON)
      .then(() => {
        logger.debug(`Completed handling ${messageInfo}`);
        
        // Commit offset
        return consumer
          .commitOffset({
            topic,
            partition,
            offset: m.offset
          })
          .catch(err => {
            logger.error(
              `Failed to commit offset for ${messageInfo}: ${err.message}`
            );
            logger.error(util.inspect(err));
          });
      })
      .catch(err => {
        // Catch all errors thrown by the handler
        logger.error(`Failed to handle ${messageInfo}: ${err.message}`);
        logger.error(util.inspect(err));
      });
  });
}

const options = { connectionString: config.KAFKA_URL };
if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
  options.ssl = {
    cert: config.KAFKA_CLIENT_CERT,
    key: config.KAFKA_CLIENT_CERT_KEY
  };
}
const consumer = new Kafka.SimpleConsumer(options);

// check if there is kafka connection alive
function check() {
  if (
    !consumer.client.initialBrokers &&
    !consumer.client.initialBrokers.length
  ) {
    return false;
  }
  let connected = true;
  consumer.client.initialBrokers.forEach(conn => {
    logger.debug(`url ${conn.server()} - connected=${conn.connected}`);
    connected = conn.connected & connected;
  });
  return connected;
}

consumer
  .init()
  // consume configured topics
  .then(() => {
    healthcheck.init([check]);
    const topics = [config.AUTOPILOT_EVENT_TOPIC];
    _.each(topics, tp => {
      consumer.subscribe(tp, { time: Kafka.LATEST_OFFSET }, handleMessages);
    });
  })
  .catch(err => logger.error(err));
