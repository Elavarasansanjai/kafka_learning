const kafkaClient = require('./kafka/kafkaClient');
const admin = require('./kafka/admin');
const producer = require('./kafka/producer');
const consumer = require('./kafka/consumer');
const redisClient = require('./redis/client');
const mongoClient = require('./mongo/client');

module.exports = {
  kafkaClient,
  admin,
  producer,
  consumer,
  redisClient,
  mongoClient
};
