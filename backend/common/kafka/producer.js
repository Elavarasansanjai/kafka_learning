const kafka = require('./kafkaClient');
const { Partitioners } = require('kafkajs');

const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner
});

const connectProducer = async () => {
  await producer.connect();
  console.log('Producer connected');
};

const disconnectProducer = async () => {
  await producer.disconnect();
};

const produceMessage = async (topic, key, message, partition = null) => {
  try {
    const messageObject = { key: String(key), value: JSON.stringify(message) };
    console.log(partition, "=== partitions")
    // If a specific partition is provided, tell Kafka to bypass the hash and use it!
    if (partition !== null && partition !== '') {
      messageObject.partition = parseInt(partition, 10);
    }
    console.log(messageObject, "=== message object")
    const result = await producer.send({
      topic,
      messages: [messageObject],
      acks: -1
    });

    // Explicitly explain the partition selection
    const assignedPartition = (result && result.length > 0) ? result[0].partition : "Unknown";
    console.log(`
      [PRODUCER] Sent message to topic '${topic}'
      - Key: ${key}
      - Partition Selected: ${assignedPartition}
      -> Kafka routing info...
    `);

    return result;
  } catch (error) {
    console.error(`Error producing message to ${topic}`, error);
    throw error;
  }
};

module.exports = { connectProducer, disconnectProducer, produceMessage };
