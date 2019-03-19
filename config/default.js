/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  KAFKA_URL: process.env.KAFKA_URL || "ssl://kafka-host:9093",
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,
  KAFKA_ERROR_TOPIC: process.env.KAFKA_ERROR_TOPIC,

  API: {
    V4:
      process.env.V4_CHALLENGE_API_URL ||
      "https://api.topcoder.com/v4/challenges",
    V5:
      process.env.V5_SUBMISSION_API_URL ||
      "https://api.topcoder.com/v5/submissions"
  },

  TOPIC_NAME: process.env.TOPIC_NAME || "submission.notification.score",
  ORIGINATOR: process.env.ORIGINATOR || "MMFinalScoreProcessor",
  BUSAPI_URL: process.env.BUSAPI_URL || "https://api.topcoder-dev.com/v5",

  AUTH0_URL:
    process.env.AUTH0_URL || "https://topcoder-dev.auth0.com/oauth/token",
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || "https://m2m.topcoder-dev.com/",
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || "",
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || "",

  TEST_TYPE: process.env.TEST_TYPE || "system",
  AUTOPILOT_EVENT_TOPIC:
    process.env.AUTOPILOT_EVENT_TOPIC || "notifications.autopilot.events",
  CHALLENGE_SUBTRACK:
    process.env.CHALLENGE_SUBTRACK || "MARATHON_MATCH, DEVELOP_MARATHON_MATCH",
  SCORER_REVIEW_TYPE_ID: process.env.SCORER_REVIEW_TYPE_ID || ""
};
