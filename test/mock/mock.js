/**
 * The mock challenge API.
 */

const _ = require('lodash')
const config = require('config')
const http = require('http')
const send = require('http-json-response')
const logger = require('../../src/common/logger')
const response = require('./response')

/**
 * Extract request query.
 * @param {Object} req the HTTP request
 * @return {Object} the request query
 */
function getParams (req) {
  let q = req.url.split('?')
  let result = {}
  if (q.length >= 2) {
    _.each(q[1].split('&'), item => {
      try {
        result[item.split('=')[0]] = item.split('=')[1]
      } catch (e) {
        result[item.split('=')[0]] = ''
      }
    })
  }
  return result
}

/**
 * Set HTTP response headers from result.
 * @param {Object} req the HTTP request
 * @param {Object} res the HTTP response
 * @param {Object} result the operation result
 */
function setResHeaders (req, res, result) {
  const totalPages = Math.ceil(result.total / result.perPage)
  if (result.page < totalPages) {
    res.setHeader('X-Next-Page', result.page + 1)
  }
  res.setHeader('X-Page', result.page)
  res.setHeader('X-Per-Page', result.perPage)
  res.setHeader('X-Total', result.total)
  res.setHeader('X-Total-Pages', totalPages)
}

const mockApi = http.createServer((req, res) => {
  logger.debug(`${req.method} ${req.url}`)
  if (req.method === 'GET' && req.url.match(/^\/v4\/challenges\/[0-9]+$/)) {
    const list = req.url.split('/')
    const challengeId = list[3]
    if (challengeId === '30000001') {
      return send(res, 404, { result: { status: 404, content: `Challenge with id: ${challengeId} doesn't exist.` } })
    } if (challengeId === '30000002') {
      const ret = _.clone(response.challenge)
      ret.result.content.subTrack = 'CODE'
      return send(res, 200, ret)
    } else {
      return send(res, 200, response.challenge)
    }
  } else if (req.method === 'GET' && req.url.startsWith('/v5/submissions')) {
    const query = getParams(req)
    if (!query.perPage) {
      query.perPage = 20
    }
    if (!query.page) {
      query.page = 1
    }
    const total = response.submissions.length
    const result = response.submissions.slice((query.page - 1) * query.perPage, query.page * query.perPage)
    setResHeaders(req, res, { total, page: query.page, perPage: query.perPage })
    return send(res, 200, result)
  } else {
    // 404 for other routes
    res.statusCode = 404
    res.end('Not Found')
  }
})

if (!module.parent) {
  const port = config.MOCK_API_PORT
  mockApi.listen(port)
  console.log(`mock api is listen port ${port}`)
}

module.exports = {
  mockApi
}
