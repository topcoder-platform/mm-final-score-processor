/**
 * Kafka handler Service
 */

const _ = require('lodash')
const config = require('config')
const joi = require('joi')
const logger = require('../common/logger')
const helper = require('../common/helper')
const producer = helper.producer

/**
 * Process final score
 * @param {Object} message the kafka message
 * @returns {Boolean} the flag indicate this message is committed or not
 */
async function handle (message) {
  const token = await helper.getM2Mtoken()

  const challengeReq = await helper.getRequest(
    `${config.API.CHALLENGE_API_URL}/${message.payload.projectId}`, {}, token)
  const challengeType = _.get(challengeReq, 'body.result.content.subTrack')

  if (!(challengeType && config.CHALLENGE_SUBTRACK.includes(challengeType))) {
    logger.debug('Skipping as challenge is Non-MM Type')
    return false
  }

  const challengeData = _.get(challengeReq, 'body.result.content')
  const registrants = _.map(
    _.get(challengeData, 'submissions', []),
    submitter => submitter.submitterId
  )
  const result = await helper.fetchAll(config.API.SUBMISSION_API_URL, {
    perPage: 100,
    challengeId: message.payload.projectId
  }, token)
  let submissionByUser = {}
  for (let i = 0; i < result.length; i++) {
    if (!submissionByUser[result[i].memberId]) {
      submissionByUser[result[i].memberId] = []
    }
    submissionByUser[result[i].memberId].push(result[i])
  }

  for (let i = 0; i < registrants.length; i++) {
    const submissions = submissionByUser[registrants[i]]
    const lastSub = submissions[submissions.length - 1]
    const review = _.find(_.get(lastSub, 'review', []), r => {
      return config.SCORER_REVIEW_TYPE_ID.includes(r.typeId)
    })

    if (review) {
      const payload = {
        ..._.pick(review, ['id', 'submissionId', 'typeId'])
      }

      if (payload.submissionId && payload.typeId) {
        payload.resource = 'score'
        payload.testType = config.TEST_TYPE

        const messageToSent = {
          topic: config.TOPIC_NAME,
          originator: config.ORIGINATOR,
          timestamp: new Date().toISOString(),
          'mime-type': 'application/json',
          payload
        }

        await producer.send({
          topic: messageToSent.topic,
          message: {
            value: JSON.stringify(messageToSent)
          }
        })

        logger.debug(`Score message ${JSON.stringify(messageToSent)}`)
      } else {
        logger.info(`skipping ${JSON.stringify(lastSub)}`)
      }
    } else {
      logger.info(`skipping ${JSON.stringify(lastSub)}`)
    }
  }
  return true
}

handle.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().keys({
      projectId: joi.number().required()
    }).unknown().required()
  }).required()
}

module.exports = {
  handle
}

logger.buildService(module.exports)
