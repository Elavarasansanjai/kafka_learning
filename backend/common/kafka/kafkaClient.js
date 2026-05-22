const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'uber-learning-platform',
  // brokers: ["kafka-1:19092", "kafka-2:19094", "kafka-3:19096"],
  brokers: ['10.55.66.138:9092'],          // broker address from listeners=
  ssl: false,                              // no TLS – we use SASL/PLAIN over plaintext
  sasl: {
    mechanism: 'plain',                    // SASL mechanism
    username: 'elavarasan',                // credentials you set in server.properties
    password: 'Sanjay@12'
  },
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

module.exports = kafka;
