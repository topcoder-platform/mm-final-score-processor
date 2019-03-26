/**
 * E2E test of the MM final score Processor.
 */
process.env.NODE_ENV = 'test'
require('../../src/bootstrap')

const _ = require('lodash')
const config = require('config')
const should = require('should')
const Kafka = require('no-kafka')
const request = require('superagent')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')

const { mockApi } = require('../mock/mock')
const { testTopic, sentTopics, skipLogs } = require('../common/testData')

describe('Topcoder - MM final score processor E2E Test', () => {
  let app
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  let messages
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  const producer = new Kafka.Producer(helper.getKafkaOptions())

  /**
   * Start http server with port
   * @param {Object} server the server
   * @param {Number} port the server port
   */
  const startServer = (server, port) => new Promise((resolve) => {
    server.listen(port, () => {
      resolve()
    })
  })

  /**
   * Close http server
   * @param {Object} server the server
   */
  const closeServer = (server) => new Promise((resolve) => {
    server.close(() => {
      resolve()
    })
  })

  /**
   * Sleep with time from input
   * @param {Number} time the time input
   */
  async function sleep (time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  /**
   * Send message
   * @param {String} testMessage the test message
   */
  const sendMessage = async (testMessage) => {
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(testMessage)
      }
    })
  }

  /**
   * Initialize consumer to received message sent by processor
   * @param {Array} subscriptions the subscriptions topic
   */
  const initConsumer = async (subscriptions) => {
    messages = []
    const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
    await consumer.init([{
      subscriptions,
      handler: (messageSet, topic, partition) => Promise.each(messageSet,
        (m) => {
          if (topic === config.TOPIC_NAME) {
            try {
              messages.push(JSON.parse(m.message.value.toString('utf8')))
            } catch (e) {
              messages.push({})
            }
          }
          consumer.commitOffset({ topic, partition, offset: m.offset })
        }
      )
    }])
    return consumer
  }

  // the message patter to get topic/partition/offset
  const messagePattern = /^Received Kafka event message; Topic: (.+); Partition: (.+); Offset: (.+); Message: (.+).$/
  /**
   * Wait job finished with successful log or error log is found
   */
  const waitJob = async () => {
    while (true) {
      if (errorLogs.length > 0) {
        if (debugLogs.length && messagePattern.exec(debugLogs[0])) {
          const matchResult = messagePattern.exec(debugLogs[0])
          // manually commit error message during test
          await app.commitOffset({
            topic: matchResult[1],
            partition: parseInt(matchResult[2]),
            offset: parseInt(matchResult[3])
          })
        }
        break
      }
      if (debugLogs.some(x => String(x).includes('Successfully processed message') ||
        String(x).includes('Ignoring other auto pilot events from Topic: notifications.autopilot.events') ||
        String(x).includes('Skipping as challenge is Non-MM Type'))) {
        break
      }
      // use small time to wait job and will use global timeout so will not wait too long
      await sleep(config.WAIT_TIME)
    }
  }

  const assertErrorMessage = (message) => {
    errorLogs.should.not.be.empty()
    errorLogs.some(x => String(x).includes(message)).should.be.true()
  }

  before(async () => {
    // Consume not committed messages before test
    const consumer = await initConsumer([config.AUTOPILOT_EVENT_TOPIC, config.TOPIC_NAME])
    await sleep(2 * config.WAIT_TIME)
    await consumer.end()

    // start mock server
    await startServer(mockApi, config.MOCK_API_PORT)
    // inject logger with log collector
    logger.info = (message) => {
      infoLogs.push(message)
      info(message)
    }
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }

    // start kafka producer
    await producer.init()
    // start the application (kafka listener)
    app = require('../../src/app')
    // wait until consumer init successfully
    while (true) {
      if (infoLogs.some(x => String(x).includes('Kick Start'))) {
        break
      }
      await sleep(config.WAIT_TIME)
    }
  })

  after(async () => {
    // close server
    await closeServer(mockApi)

    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    try {
      await producer.end()
    } catch (err) {
      // ignore
    }
    try {
      await app.end()
    } catch (err) {
      // ignore
    }
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('Should setup healthcheck with check on kafka connection', async () => {
    const healthcheckEndpoint = `http://localhost:${process.env.PORT || 3000}/health`
    let result = await request.get(healthcheckEndpoint)
    should.equal(result.status, 200)
    should.deepEqual(result.body, { checksRun: 2 })
    debugLogs.should.match(/connected=true/)
  })

  it('Should handle invalid json message', async () => {
    await producer.send({
      topic: testTopic.topic,
      message: {
        value: '[ invalid'
      }
    })
    await waitJob()
    should.equal(errorLogs[0], 'Invalid message JSON.')
  })

  it('Should handle incorrect topic field message', async () => {
    let message = _.cloneDeep(testTopic)
    message.topic = 'invalid'
    await producer.send({
      topic: testTopic.topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await waitJob()
    should.equal(errorLogs[0], 'The message topic invalid doesn\'t match the Kafka topic notifications.autopilot.events.')
  })

  it('Should handle other auto pilot events', async () => {
    let message = _.cloneDeep(testTopic)
    message.payload.phaseTypeName = 'Submission'
    await producer.send({
      topic: testTopic.topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await waitJob()
    should.equal(debugLogs[1], 'Ignoring other auto pilot events from Topic: notifications.autopilot.events')
  })

  it('Should handle other auto pilot events', async () => {
    let message = _.cloneDeep(testTopic)
    message.payload.state = 'END'
    await producer.send({
      topic: testTopic.topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await waitJob()
    should.equal(debugLogs[1], 'Ignoring other auto pilot events from Topic: notifications.autopilot.events')
  })

  it('process final score success', async () => {
    // initialize consumer to receive message sent by app
    const consumer = await initConsumer([config.TOPIC_NAME])

    await sendMessage(testTopic)
    await waitJob()

    // make sure process all messages
    await sleep(2 * config.WAIT_TIME)
    await consumer.end()

    should.equal(4, messages.length)
    should.deepEqual(_.omit(sentTopics[0], 'timestamp'), _.omit(messages[0], 'timestamp'))
    should.deepEqual(_.omit(sentTopics[1], 'timestamp'), _.omit(messages[1], 'timestamp'))
    should.deepEqual(_.omit(sentTopics[2], 'timestamp'), _.omit(messages[2], 'timestamp'))
    should.deepEqual(_.omit(sentTopics[3], 'timestamp'), _.omit(messages[3], 'timestamp'))
    let j = 0
    for (let i = 0; i < debugLogs.length; i++) {
      if (debugLogs[i].startsWith('Score message')) {
        debugLogs[i].should.equal(`Score message ${JSON.stringify(messages[j])}`)
        j++
      }
    }
    j.should.equal(4)
    infoLogs[infoLogs.length - 2].should.equal(skipLogs[0])
    infoLogs[infoLogs.length - 1].should.equal(skipLogs[1])
  })

  it('test with challenge with Non-MM Type', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = 30000002

    await sendMessage(topic)
    await waitJob()

    debugLogs[debugLogs.length - 4].should.equal('Skipping as challenge is Non-MM Type')
  })

  it('test with challenge not exist', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = '30000001'

    await sendMessage(topic)
    await waitJob()

    assertErrorMessage(`Challenge with id: 30000001 doesn't exist.`)
  })

  it('test invalid parameters, projectId is required.', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = undefined

    await sendMessage(topic)
    await waitJob()
    assertErrorMessage('"projectId" is required')
  })

  it('test invalid parameters, projectId is incorrect.', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = true

    await sendMessage(topic)
    await waitJob()
    assertErrorMessage('"projectId" must be a number')
  })
})
