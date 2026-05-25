const kafkaZk = require('./kafkaZkClient');

const createZkConsumer = (groupId) => {
  return kafkaZk.consumer({ groupId });
};

const subscribeAndConsumeZk = async (consumer, topic, messageHandler) => {
  try {
    await consumer.connect();
    console.log(`[ZK CONSUMER] Connected to group: ${consumer.groupId}`);

    await consumer.subscribe({ topic, fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`
          [ZK CONSUMER] Received message:
          - Topic: ${topic}
          - Partition: ${partition}
          - Key: ${message.key ? message.key.toString() : 'null'}
          - Value: ${message.value ? message.value.toString() : 'null'}
        `);
        if (messageHandler) {
          messageHandler({ topic, partition, message });
        }
      },
    });
  } catch (error) {
    console.error('[ZK CONSUMER] Error in consumer', error);
  }
};

module.exports = { createZkConsumer, subscribeAndConsumeZk };
