/**
 * Kafka handler Service
 */

const _ = require('lodash')
const config = require('config')
const joi = require('joi')
const uuid = require('uuid/v4')
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
    `${config.API.CHALLENGE_API_URL}/${message.payload.projectId}`,
    {},
    token
  )
  const challengeType = _.get(challengeReq, 'body.result.content.subTrack')

  if (!(challengeType && config.CHALLENGE_SUBTRACK.includes(challengeType))) {
    logger.debug('Skipping as challenge is Non-MM Type')
    return false
  }

  const submissions = await helper.fetchAll(
    config.API.SUBMISSION_API_URL,
    {
      perPage: 500,
      challengeId: message.payload.projectId
    },
    token
  )

  const submissionForFinalRun = []
  const uniqueSubmissions = _.uniqBy(submissions, 'memberId')
  const submitters = _.map(uniqueSubmissions, 'memberId')

  for (let i = 0; i < submitters.length; i++) {
    const memberSubmissions = _.filter(submissions, function (o) {
      if (Number(o.memberId) === Number(submitters[i])) {
        return o
      }
    })

    const sortedSubs = _.sortBy(memberSubmissions, 'created')
    submissionForFinalRun.push(sortedSubs[sortedSubs.length - 1])
  }

  for (let i = 0; i < submissionForFinalRun.length; i++) {
    const payload = {}
    payload.submissionId = _.pick(submissionForFinalRun[i], ['id'])
    payload.resource = 'score'
    payload.id = uuid()
    payload.testType = 'system'

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
  }
  return true
}

handle.schema = {
  message: joi
    .object()
    .keys({
      topic: joi.string().required(),
      originator: joi.string().required(),
      timestamp: joi.date().required(),
      'mime-type': joi.string().required(),
      payload: joi
        .object()
        .keys({
          projectId: joi.number().required()
        })
        .unknown()
        .required()
    })
    .required()
}

module.exports = {
  handle
}

logger.buildService(module.exports)
