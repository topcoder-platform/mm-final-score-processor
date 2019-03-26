# Topcoder - MM Final Score Processor

## Verification
- Uses API from api.topcoder-dev.com
1. start kafka server, start processor app
2. start kafka-console-consumer to view the messages:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic submission.notification.score`
3. start kafka-console-producer to write messages to `notifications.autopilot.events` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic notifications.autopilot.events`
4. write message:
  `{ "topic": "notifications.autopilot.events", "originator": "tc-autopilot", "timestamp": "2019-03-20T00:00:00", "mime-type": "application/json", "payload": { "projectId": 30054563, "phaseTypeName": "Review", "state": "START" } }`
4. watch the app console, it should show info of processing the message
5. watch the kafka-console-consumer console open in step 2, it should show messages the app sent to topic `submission.notification.score`
- Uses mock API
1. start kafka server,
2. start mock server, run `npm run mock-api`
3. start processor under TEST environment, run `NODE_ENV=test node src/app.js`
4. start kafka-console-consumer to view the messages:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic submission.notification.score`
5. start kafka-console-producer to write messages to `notifications.autopilot.events` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic notifications.autopilot.events`
6. write message:
  `{ "topic": "notifications.autopilot.events", "originator": "tc-autopilot", "timestamp": "2019-03-20T00:00:00", "mime-type": "application/json", "payload": { "projectId": 30054563, "phaseTypeName": "Review", "state": "START" } }`
7. watch the app console, it should show info of processing the message
8. watch the kafka-console-consumer console open in step 4, it should show messages the app sent to topic `submission.notification.score`

## Unit test Coverage

  5 passing (7s)

File                     |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------|----------|----------|----------|----------|-------------------|
All files                |    95.62 |    82.35 |      100 |    95.49 |                   |
 config                  |      100 |      100 |      100 |      100 |                   |
  default.js             |      100 |      100 |      100 |      100 |                   |
  test.js                |      100 |      100 |      100 |      100 |                   |
 src                     |      100 |      100 |      100 |      100 |                   |
  bootstrap.js           |      100 |      100 |      100 |      100 |                   |
 src/common              |    93.48 |    53.85 |      100 |    93.33 |                   |
  helper.js              |     96.3 |       50 |      100 |       96 |                67 |
  logger.js              |    92.31 |       55 |      100 |    92.31 |   32,56,61,85,119 |
 src/services            |      100 |      100 |      100 |      100 |                   |
  KafkaHandlerService.js |      100 |      100 |      100 |      100 |                   |

## E2E test Coverage

  10 passing (22s)

File                     |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------|----------|----------|----------|----------|-------------------|
All files                |    94.53 |    82.98 |    96.55 |    94.36 |                   |
 config                  |      100 |      100 |      100 |      100 |                   |
  default.js             |      100 |      100 |      100 |      100 |                   |
  test.js                |      100 |      100 |      100 |      100 |                   |
 src                     |    92.31 |    76.92 |     87.5 |    92.06 |                   |
  app.js                 |    92.19 |    76.92 |     87.5 |    91.94 |   65,74,75,93,119 |
  bootstrap.js           |      100 |      100 |      100 |      100 |                   |
 src/common              |    93.48 |    61.54 |      100 |    93.33 |                   |
  helper.js              |     96.3 |       50 |      100 |       96 |                67 |
  logger.js              |    92.31 |       65 |      100 |    92.31 |   32,56,61,85,119 |
 src/services            |      100 |      100 |      100 |      100 |                   |
  KafkaHandlerService.js |      100 |      100 |      100 |      100 |                   |
