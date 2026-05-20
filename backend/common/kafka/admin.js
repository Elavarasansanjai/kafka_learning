const kafka = require('./kafkaClient');

const admin = kafka.admin();

const createTopics = async () => {
  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    console.log(existingTopics, "====== existing topics ")
    const topicConfigs = {
      'ride-requested': 3, // 3 partitions to show key hashing
      'driver-assigned': 1, // 1 partition to show strict ordering
      'ride-accepted': 3,
      'ride-started': 1,
      'ride-completed': 3,
      'payment-completed': 1,
      'notification-events': 3,
      'ride-retry': 1,
      'ride-dlq': 1,
      "user-login": 1
    };

    const topicsToCreate = Object.keys(topicConfigs)
      .filter(t => !existingTopics.includes(t))
      .map(t => ({
        topic: t,
        numPartitions: topicConfigs[t],
        replicationFactor: 3
      }));
    console.log(topicsToCreate, "====== topic to create ====")
    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        validateOnly: false,
        waitForLeaders: true,
        topics: topicsToCreate,
      });
      console.log('Topics created:', topicsToCreate.map(t => t.topic));
    }
  } catch (error) {
    console.error('Error creating topics', error);
  } finally {
    await admin.disconnect();
  }
};

const getClusterInfo = async () => {
  await admin.connect();
  const cluster = await admin.describeCluster();
  const topics = await admin.fetchTopicMetadata();
  await admin.disconnect();
  return { cluster, topics };
};

module.exports = { admin, createTopics, getClusterInfo };
