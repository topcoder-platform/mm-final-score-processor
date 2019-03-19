require("../bootstrap");
require("dotenv").config();

const _ = require("lodash");
const busApi = require("tc-bus-api-wrapper");
const config = require("config");
const logger = require("../common/logger");
const { makeRequest } = require("../common/helper");

const busApiClient = busApi(
  _.pick(config, [
    "AUTH0_URL",
    "AUTH0_AUDIENCE",
    "TOKEN_CACHE_TIME",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "BUSAPI_URL",
    "KAFKA_ERROR_TOPIC"
  ])
);

async function handle(message) {
  try {
    const challengeReq = await makeRequest(
      "GET",
      `${config.API.V4}/${message.payload.projectId}`
    );
    const challengeType = _.get(challengeReq, "body.result.content.subTrack");
    logger.debug(challengeType);
    logger.debug(config.CHALLENGE_SUBTRACK);
    if (!(challengeType && config.CHALLENGE_SUBTRACK.includes(challengeType))) {
      logger.debug("Skipping as challenge is Non-MM Type");
      return;
    }

    const challengeData = _.get(challengeReq, "body.result.content");
    const registrants = _.map(
      _.get(challengeData, "submissions", []),
      submitter => submitter.submitterId
    );
    for (let i = 0; i < registrants.length; i += 1) {
      const url = `${config.API.V5}?perPage=100&challengeId=${
        message.payload.projectId
      }&memberId=${registrants[i]}`;
      const submissionReq = await makeRequest("GET", url);
      const submissions = _.get(submissionReq, "body");
      const lastSub = submissions[submissions.length - 1];
      const review = _.find(_.get(lastSub, "review", []), r => {
        return config.SCORER_REVIEW_TYPE_ID.includes(r.typeId);
      });

      const payload = {
        ..._.pick(review, ["id", "submissionId", "typeId"])
      };

      if (payload.submissionId && payload.typeId) {
        payload.resource = "score";
        payload.testType = config.TEST_TYPE;

        const reqBody = {
          topic: config.TOPIC_NAME,
          originator: config.ORIGINATOR,
          timestamp: new Date().toISOString(),
          "mime-type": "application/json",
          payload
        };

        logger.debug(`Score message ${reqBody}`);

        await busApiClient.postEvent(reqBody);
      } else {
        logger.info(`skipping ${lastSub}`);
      }
    }
  } catch (e) {
    logger.error(e.message);
  }
}

module.exports = {
  handle
};
