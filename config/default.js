/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'mm-final-score-processor',

  API: {
    CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'https://api.topcoder-dev.com/v4/challenges',
    SUBMISSION_API_URL: process.env.SUBMISSION_API_URL || 'https://api.topcoder-dev.com/v5/submissions'
  },

  TOPIC_NAME: process.env.TOPIC_NAME || 'submission.notification.score',
  ORIGINATOR: process.env.ORIGINATOR || 'MMFinalScoreProcessor',

  AUTH0_URL: process.env.AUTH0_URL,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '6wzC0_gfeuM4yEWOoobl5BylXsI44lczJjGTBABM2EJpbg9zucUwTGlgO7WWbHdt',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL || 'https://topcoder-dev.auth0.com/oauth/token',

  TEST_TYPE: process.env.TEST_TYPE || 'system',
  AUTOPILOT_EVENT_TOPIC: process.env.AUTOPILOT_EVENT_TOPIC || 'notifications.autopilot.events',
  CHALLENGE_SUBTRACK: process.env.CHALLENGE_SUBTRACK || 'MARATHON_MATCH, DEVELOP_MARATHON_MATCH',
  SCORER_REVIEW_TYPE_ID: process.env.SCORER_REVIEW_TYPE_ID || '7086ac08-b27f-40e2-a12a-764ba0368a79, 76ef3d22-dd22-42d3-a2ce-de7a06395a32'
}
