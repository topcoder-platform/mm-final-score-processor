module.exports = {
  testTopic: {
    'topic': 'notifications.autopilot.events',
    'originator': 'tc-autopilot',
    'timestamp': '2019-03-20T00:00:00',
    'mime-type': 'application/json',
    'payload': {
      'projectId': 30054563,
      'phaseTypeName': 'Review',
      'state': 'START'
    }
  },
  sentTopics: [
    {
      'topic': 'submission.notification.score',
      'originator': 'MMFinalScoreProcessor',
      'timestamp': '2019-03-20T16:33:46.054Z',
      'mime-type': 'application/json',
      'payload': {
        'id': '7d052176-e4a1-48c7-b17c-42ebf25dc858',
        'submissionId': '429eb318-f0df-4aba-9e00-f4181ac4332d',
        'typeId': '76ef3d22-dd22-42d3-a2ce-de7a06395a32',
        'resource': 'score',
        'testType': 'system'
      }
    },
    {
      'topic': 'submission.notification.score',
      'originator': 'MMFinalScoreProcessor',
      'timestamp': '2019-03-20T16:33:47.490Z',
      'mime-type': 'application/json',
      'payload': {
        'id': '866c7c70-9e07-4c63-819d-97eb46348414',
        'submissionId': '26c73028-f345-440b-bbb2-49ece8e5b547',
        'typeId': '76ef3d22-dd22-42d3-a2ce-de7a06395a32',
        'resource': 'score',
        'testType': 'system'
      }
    },
    {
      'topic': 'submission.notification.score',
      'originator': 'MMFinalScoreProcessor',
      'timestamp': '2019-03-20T16:33:50.394Z',
      'mime-type': 'application/json',
      'payload': {
        'id': 'eb979f5b-a31d-453a-a868-e9d5c8eb6407',
        'submissionId': 'd4804ffb-6df3-48a6-bf65-3890410a19a8',
        'typeId': '76ef3d22-dd22-42d3-a2ce-de7a06395a32',
        'resource': 'score',
        'testType': 'system'
      }
    },
    {
      'topic': 'submission.notification.score',
      'originator': 'MMFinalScoreProcessor',
      'timestamp': '2019-03-20T16:33:54.016Z',
      'mime-type': 'application/json',
      'payload': {
        'id': '906617f4-adbf-4e39-a68f-ddcac4c782e0',
        'submissionId': '56ce0ed7-35ff-4e6d-96a8-5f658f65f2a9',
        'typeId': '76ef3d22-dd22-42d3-a2ce-de7a06395a32',
        'resource': 'score',
        'testType': 'system'
      }
    }
  ],
  skipLogs: [
    'skipping {"updatedBy":"hohosky","created":"2019-02-19T04:36:41.592Z","isFileSubmission":false,"type":"PAM-MMScorer","url":"https://s3.amazonaws.com/topcoder-dev-submissions/d4804ffb-6dc1-48a6-bf65-3890410a19a8.zip","challengeId":30054563,"createdBy":"hohosky","review":[{"score":0,"metadata":{"message":"We have encountered an issue executing your script. Please see below for potential problems, and re-submit.\\n\\n1. The file must be a zip file.\\n2. The zip file should only include a single python file and has no execution errors.\\n3. The python file need to have def main(D, A, T, worker_skill, daily_workload, reqs, W) function.\\n4. You have reached maximum number of submissions possible,which is 30. You have 3 more attempts possible."},"updatedBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","typeId":"76ef3d22-dd22-42d3-a2ce-de7a06395a32","reviewerId":"76ef3d22-dd22-42d3-a2ce-de7a06395a32","createdBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","created":"2019-02-19T04:36:46.216Z","scoreCardId":1,"id":"eb979f5b-a31d-453a-a868-e9d5c8eb6407","updated":"2019-02-19T04:36:46.216Z"},{"score":100,"updatedBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","reviewerId":"c2a76376-3faf-45b5-b8c9-188ad9dbb604","submissionId":"d4804ffb-6dc1-48a6-bf65-3890410a19a8","createdBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","created":"2019-02-19T04:36:46.140Z","scoreCardId":30001850,"typeId":"68c5a381-c8ab-48af-92a7-7a869a4ee6c3","id":"099a4092-a872-4328-b459-3bbeba2cad2e","updated":"2019-02-19T04:36:46.140Z"}],"reviewSummation":[{"aggregateScore":100,"updatedBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","submissionId":"d4804ffb-6dc1-48a6-bf65-3890410a19a8","createdBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","created":"2019-02-19T04:36:48.601Z","scoreCardId":30001101,"id":"f9deb581-5360-4966-9913-11b9d2ec7030","isPassing":true,"updated":"2019-02-19T04:36:48.601Z"}],"id":"d4804ffb-6dc1-48a6-bf65-3890410a19a8","submissionPhaseId":763782,"updated":"2019-02-19T04:36:41.592Z","fileType":"zip","memberId":16096823}',
    'skipping {"updatedBy":"denis","created":"2019-02-19T04:36:41.592Z","isFileSubmission":false,"type":"PAM-MMScorer","url":"https://s3.amazonaws.com/topcoder-dev-submissions/d4804ffb-2dc1-48a6-bf65-3890410a19a8.zip","challengeId":30054563,"createdBy":"denis","review":[{"score":100,"updatedBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","reviewerId":"c2a76376-3faf-45b5-b8c9-188ad9dbb604","submissionId":"d4804ffb-2dc1-48a6-bf65-3890410a19a8","createdBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","created":"2019-02-19T04:36:46.140Z","scoreCardId":30001850,"typeId":"68c5a381-c8ab-48af-92a7-7a869a4ee6c3","id":"099a4092-a872-4328-b459-3bbeba2cad2e","updated":"2019-02-19T04:36:46.140Z"}],"reviewSummation":[{"aggregateScore":100,"updatedBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","submissionId":"d4804ffb-2dc1-48a6-bf65-3890410a19a8","createdBy":"maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients","created":"2019-02-19T04:36:48.601Z","scoreCardId":30001101,"id":"f9deb581-5360-4966-9913-11b9d2ec7030","isPassing":true,"updated":"2019-02-19T04:36:48.601Z"}],"id":"d4804ffb-2dc1-48a6-bf65-3890410a19a8","submissionPhaseId":763782,"updated":"2019-02-19T04:36:41.592Z","fileType":"zip","memberId":251280}'
  ]
}
