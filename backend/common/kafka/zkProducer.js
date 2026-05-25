const kafkaZk = require('./kafkaZkClient');
const { Partitioners } = require('kafkajs');

const zkProducer = kafkaZk.producer({
  createPartitioner: Partitioners.DefaultPartitioner
});

const connectZkProducer = async () => {
  await zkProducer.connect();
  console.log('[ZK] Producer connected');
};

const disconnectZkProducer = async () => {
  await zkProducer.disconnect();
};

const produceZkMessage = async (topic, key, message, partition = null) => {
  try {
    const messageObject = { key: String(key), value: JSON.stringify(message) };

    if (partition !== null && partition !== '') {
      messageObject.partition = parseInt(partition, 10);
    }

    const result = await zkProducer.send({
      topic,
      messages: [messageObject],
      acks: -1
    });

    const assignedPartition = (result && result.length > 0) ? result[0].partition : "Unknown";
    console.log(`
      [ZK PRODUCER] Sent message to topic '${topic}'
      - Key: ${key}
      - Partition Selected: ${assignedPartition}
    `);

    return result;
  } catch (error) {
    console.error(`[ZK] Error producing message to ${topic}`, error);
    throw error;
  }
};

module.exports = { connectZkProducer, disconnectZkProducer, produceZkMessage };
