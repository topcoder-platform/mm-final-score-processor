/**
 * Contains generic helper methods
 */

const config = require('config')
const _ = require('lodash')
const request = require('superagent')
const logger = require('./logger')

const m2mAuth = require('tc-core-library-js').auth.m2m
const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME']))

/*
 * Function to get M2M token
 * @returns {Promise}
 */
const getM2Mtoken = async () => {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/**
 * Function to make request
 * @param {String} reqType Type of the request GET / POST
 * @param {String} path Complete path of the API URL
 * @param {Object} reqBody Body of the request
 * @returns {Promise} Promise of the response
 */
const makeRequest = async (reqType, path, reqBody) => {
  const token = await getM2Mtoken()
  if (reqType === 'POST') {
    return request
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(reqBody)
  } else if (reqType === 'GET') {
    return request
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
  }
}

module.exports = {
  makeRequest
}
