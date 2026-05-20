const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let dbInstance = null;

const connectMongo = async () => {
  if (!dbInstance) {
    await client.connect();
    dbInstance = client.db('kafka_learning');
    console.log('MongoDB connected');
  }
  return dbInstance;
};

const getDb = () => {
  if (!dbInstance) throw new Error('Call connectMongo first');
  return dbInstance;
};

module.exports = { connectMongo, getDb };
