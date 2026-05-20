const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'uber-learning-platform',
  brokers: ['localhost:9092', 'localhost:9094', 'localhost:9096'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

module.exports = kafka;
