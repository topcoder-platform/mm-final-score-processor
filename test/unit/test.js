/**
 * Mocha tests of the MM final score Processor.
 */
process.env.NODE_ENV = 'test'
require('../../src/bootstrap')

const _ = require('lodash')
const config = require('config')
const Kafka = require('no-kafka')
const should = require('should')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')
const service = require('../../src/services/KafkaHandlerService')

const { mockApi } = require('../mock/mock')
const { testTopic, sentTopics, skipLogs } = require('../common/testData')

describe('Topcoder - MM final score processor Unit Test', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  let messages
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

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
   * Assert validation error
   * @param err the error
   * @param message the message
   */
  const assertValidationError = (err, message) => {
    err.isJoi.should.be.true()
    should.equal(err.name, 'ValidationError')
    err.details.map(x => x.message).should.containEql(message)
    errorLogs.should.not.be.empty()
    errorLogs.should.containEql(err.stack)
  }

  /**
   * Initialize consumer to received message sent by processor
   */
  const initConsumer = async () => {
    messages = []
    const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
    await consumer.init([{
      subscriptions: [config.TOPIC_NAME],
      handler: (messageSet, topic, partition) => Promise.each(messageSet,
        (m) => {
          try {
            messages.push(JSON.parse(m.message.value.toString('utf8')))
          } catch (e) {
            messages.push({})
          }
          consumer.commitOffset({ topic, partition, offset: m.offset })
        }
      )
    }])
    return consumer
  }

  /**
   * Sleep with time from input
   * @param time the time input
   */
  async function sleep (time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  before(async () => {
    await helper.producer.init()

    // Consume not committed messages before test
    const consumer = await initConsumer()
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
  })

  after(async () => {
    // close server
    await closeServer(mockApi)

    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('process final score success', async () => {
    const consumer = await initConsumer()
    await service.handle(testTopic)

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
    topic.payload.projectId = '30000002'
    await service.handle(topic)

    debugLogs[debugLogs.length - 4].should.equal('Skipping as challenge is Non-MM Type')
  })

  it('test with challenge not exist', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = '30000001'

    try {
      await service.handle(topic)
      throw new Error('should not throw error here')
    } catch (err) {
      const message = _.get(err, 'response.body.result.content')
      message.should.equal(`Challenge with id: 30000001 doesn't exist.`)
    }
  })

  it('test invalid parameters, projectId is required.', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = undefined
    try {
      await service.handle(topic)
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, '"projectId" is required')
    }
  })

  it('test invalid parameters, projectId is incorrect.', async () => {
    let topic = _.cloneDeep(testTopic)
    topic.payload.projectId = true
    try {
      await service.handle(topic)
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, '"projectId" must be a number')
    }
  })
})
