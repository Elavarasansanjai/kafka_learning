const kafka = require('./kafkaClient');

const createConsumer = async (groupId, topics, messageHandler) => {
  const consumer = kafka.consumer({
    groupId,
    heartbeatInterval: 3000,
    sessionTimeout: 30000,
    rebalanceTimeout: 60000,
  });

  await consumer.connect();
  console.log(`Consumer connected: ${groupId}`);

  // Listen for offset commits and log them!
  consumer.on(consumer.events.COMMIT_OFFSETS, (event) => {
    event.payload.topics.forEach(t => {
      t.partitions.forEach(p => {
        console.log(`[CONSUMER COMMIT] Group '${groupId}' committed offset ${p.offset} for topic '${t.topic}' [Partition ${p.partition}]`);
      });
    });
  });

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log("receive message===")
      try {
        const key = message.key ? message.key.toString() : null;
        const value = message.value ? JSON.parse(message.value.toString()) : null;
        const offset = message.offset;

        await messageHandler({ topic, partition, key, value, offset, heartbeat, groupId });
      } catch (err) {
        console.error(`Error processing message in ${groupId}`, err);
        // Implement manual retry or DLQ logic here depending on the handler
      }
    },
  });

  return consumer;
};

module.exports = { createConsumer };
