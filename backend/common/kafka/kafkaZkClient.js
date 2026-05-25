const { Kafka } = require('kafkajs');

const kafkaZk = new Kafka({
  clientId: process.env.KAFKA_ZK_CLIENT_ID || 'ecommerce-zk-client',
  brokers: ['10.55.66.138:2028'], // Based on Zookeeper IP whitelist config
  ssl: false,
  sasl: {
    mechanism: 'plain',
    username: 'elavarasan',
    password: 'Sanjay@12'
  },
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

module.exports = kafkaZk;
