const kafkaClient = require('./kafka/kafkaClient');
const admin = require('./kafka/admin');
const producer = require('./kafka/producer');
const consumer = require('./kafka/consumer');
const redisClient = require('./redis/client');
const mongoClient = require('./mongo/client');

// Zookeeper Kafka modules
const kafkaZkClient = require('./kafka/kafkaZkClient');
const zkAdmin = require('./kafka/zkAdmin');
const zkProducer = require('./kafka/zkProducer');
const zkConsumer = require('./kafka/zkConsumer');

module.exports = {
  kafkaClient,
  admin,
  producer,
  consumer,
  redisClient,
  mongoClient,
  kafkaZkClient,
  zkAdmin,
  zkProducer,
  zkConsumer
};
