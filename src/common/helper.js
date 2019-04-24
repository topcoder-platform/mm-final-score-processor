/**
 * Contains generic helper methods
 */

const _ = require('lodash')
const config = require('config')
const request = require('superagent')
const Kafka = require('no-kafka')
const m2mAuth = require('tc-core-library-js').auth.m2m
const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_PROXY_SERVER_URL']))

const producer = new Kafka.Producer(getKafkaOptions())

/**
 * Get M2M token
 * @return {String} m2m token
 */
async function getM2Mtoken () {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/**
 * Uses superagent to proxy get request
 * @param {String} url the url
 * @param {Object} query the query object
 * @param {String} m2mToken the M2M token
 * @returns {Object} the response
 */
async function getRequest (url, query, m2mToken) {
  return request
    .get(url)
    .query(query)
    .set('Authorization', `Bearer ${m2mToken}`)
    .set('Content-Type', 'application/json')
}

/**
 * Fetch all resources.
 * @param {String} url the url
 * @param {Object} query the query object
 * @param {String} m2mToken the M2M token
 * @returns {Object} the response
 */
async function fetchAll (url, query) {
  const m2mToken = await getM2Mtoken()
  const res = await getRequest(url, query, m2mToken)
  let result = res.body
  const totalPage = Number(res.header['x-total-pages'])
  if (totalPage > 1) {
    const requests = []
    for (let i = 2; i <= totalPage; i++) {
      requests.push(getRequest(url, _.assign({ page: i }, query), m2mToken))
    }
    const extraRes = await Promise.all(requests)
    result = _.reduce(extraRes, (ret, e) => ret.concat(e.body), result)
  }
  return result
}

/**
 * Get Kafka options
 * @return {Object} the Kafka options
 */
function getKafkaOptions () {
  const options = { connectionString: config.KAFKA_URL, groupId: config.KAFKA_GROUP_ID }
  if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
    options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
  }
  return options
}

module.exports = {
  getM2Mtoken,
  getRequest,
  fetchAll,
  getKafkaOptions,
  producer
}
