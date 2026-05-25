const kafkaZk = require('./kafkaZkClient');

const zkAdmin = kafkaZk.admin();

const connectZkAdmin = async () => {
  await zkAdmin.connect();
  console.log('[ZK ADMIN] Connected');
};

const disconnectZkAdmin = async () => {
  await zkAdmin.disconnect();
};

const createZkTopic = async (topic, numPartitions = 1, replicationFactor = 1) => {
  try {
    await connectZkAdmin();
    const success = await zkAdmin.createTopics({
      topics: [
        {
          topic: topic,
          numPartitions: numPartitions,
          replicationFactor: replicationFactor
        }
      ]
    });
    console.log(`[ZK ADMIN] Create topic '${topic}' result:`, success);
    return success;
  } catch (error) {
    console.error('[ZK ADMIN] Error creating topic:', error);
    throw error;
  } finally {
    await disconnectZkAdmin();
  }
};

const listZkTopics = async () => {
  try {
    await connectZkAdmin();
    const topics = await zkAdmin.listTopics();
    return topics;
  } catch (error) {
    console.error('[ZK ADMIN] Error listing topics:', error);
    throw error;
  } finally {
    await disconnectZkAdmin();
  }
};

module.exports = { zkAdmin, connectZkAdmin, disconnectZkAdmin, createZkTopic, listZkTopics };
