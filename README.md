# Topcoder - MM Final Score Processor

## Dependencies

- nodejs https://nodejs.org/en/ (v10+)
- Kafka
- Docker, Docker Compose

## Configuration

Configuration for the MM Final Score processor is at `config/default.js`.
The following parameters can be set in config files or in env variables:
- LOG_LEVEL: the log level; default value: 'debug'
- KAFKA_URL: comma separated Kafka hosts; default value: 'localhost:9092'
- KAFKA_CLIENT_CERT: Kafka connection certificate, optional; default value is undefined;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- KAFKA_CLIENT_CERT_KEY: Kafka connection private key, optional; default value is undefined;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- KAFKA_GROUP_ID: consumer group id; default value: 'mm-final-score-processor'
- API.CHALLENGE_API_URL: challenge api url, default value is 'https://api.topcoder.com/v4/challenges'
- API.SUBMISSION_API_URL: submission api url, default value is 'https://api.topcoder.com/v5/submissions'
- TOPIC_NAME: Kafka topic to be sent, default value is 'submission.notification.score'
- ORIGINATOR: The sending topic originator, default value is 'MMFinalScoreProcessor'
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token
- TEST_TYPE: The testType value in message to be sent, default value is 'system'
- AUTOPILOT_EVENT_TOPIC: The topic of Kafka message to be handled by this processor, default value is 'notifications.autopilot.events'
- CHALLENGE_SUBTRACK: The MM challenge subtrack value, default value is 'MARATHON_MATCH, DEVELOP_MARATHON_MATCH'
- SCORER_REVIEW_TYPE_ID: The specified review type id indicate the review run by final scorer

Also note that there is a `/health` endpoint that checks for the health of the app. This sets up an expressjs server and listens on the environment variable `PORT`. It's not part of the configuration file and needs to be passed as an environment variable

Configuration for the tests is at `config/test.js`, only add such new configurations different from `config/default.js`
- WAIT_TIME: wait time used in test, default is 1000 or one second
- MOCK_API_PORT: the mock server port, default is 4000.
- API.CHALLENGE_API_URL: the mock challenge api url in testing.
- API.SUBMISSION_API_URL: the mock submission api url in testing.

## Local Kafka setup

- `http://kafka.apache.org/quickstart` contains details to setup and manage Kafka server,
  below provides details to setup Kafka server in Linux/Mac, Windows will use bat commands in bin/windows instead
- download kafka at `https://www.apache.org/dyn/closer.cgi?path=/kafka/1.1.0/kafka_2.11-1.1.0.tgz`
- extract out the downloaded tgz file
- go to extracted directory kafka_2.11-0.11.0.1
- start ZooKeeper server:
  `bin/zookeeper-server-start.sh config/zookeeper.properties`
- use another terminal, go to same directory, start the Kafka server:
  `bin/kafka-server-start.sh config/server.properties`
- note that the zookeeper server is at localhost:2181, and Kafka server is at localhost:9092
- use another terminal, go to same directory, create the needed topics:
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic notifications.autopilot.events`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.score`
- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics
- run the producer and then write some message into the console to send to the `notifications.autopilot.events` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic notifications.autopilot.events`
  in the console, write message, one message per line:
  `{ "topic": "notifications.autopilot.events", "originator": "tc-autopilot", "timestamp": "2019-03-20T00:00:00", "mime-type": "application/json", "payload": { "projectId": 30054563, "phaseTypeName": "Review", "state": "START" } }`
- optionally, use another terminal, go to same directory, start a consumer to view the messages:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic notifications.autopilot.events --from-beginning`

## Local deployment
1. Make sure that Kafka is running as per instructions above.
2. From the project root directory, run the following command to install the dependencies
```
npm install
```
3. To run linters if required
```
npm run lint

npm run lint:fix # To fix possible lint errors
```
4. Start the processor and health check dropin
```
npm start
```

## Local Deployment with Docker
To run the MM final score Processor using docker, follow the below steps
1. Navigate to the directory docker
2. Rename the file sample.api.env to api.env
3. Refer Configuration to set the process environment in the file api.env,
4. Once that is done, run the following command `docker-compose up`

## Testing
- Run `npm run test` to execute unit tests.
- RUN `npm run e2e` to execute e2e tests.

## Verification
Refer to the verification document `Verification.md`
