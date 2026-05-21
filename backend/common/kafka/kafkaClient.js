const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'uber-learning-platform',
  brokers: ["kafka-1:19092", "kafka-2:19094", "kafka-3:19096"],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

module.exports = kafka;
