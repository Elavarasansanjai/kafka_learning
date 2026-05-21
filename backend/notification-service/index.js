const express = require('express');
const cors = require('cors');
const { consumer, admin, mongoClient, redisClient } = require('@app/common');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Topics to listen to
const TOPICS = [
  'ride-requested', 'driver-assigned', 'ride-accepted', 'ride-started',
  'ride-completed', 'payment-completed', 'notification-events',
  'ride-retry', 'ride-dlq'
];

app.get('/api/events', async (req, res) => {
  const db = mongoClient.getDb();
  const events = await db.collection('events').find().sort({ timestamp: -1 }).limit(100).toArray();
  res.json(events);
});

app.get('/api/partitions', async (req, res) => {
  try {
    await admin.admin.connect();
    const metadata = await admin.admin.fetchTopicMetadata({ topics: TOPICS });
    res.json(metadata.topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    await admin.admin.disconnect();
  }
});

app.get('/api/consumers', async (req, res) => {
  try {
    await admin.admin.connect();
    const groups = await admin.admin.listGroups();
    const groupDetails = [];

    for (const group of groups.groups) {
      if (group.groupId.includes('group')) { // filter our groups
        const description = await admin.admin.describeGroups([group.groupId]);
        groupDetails.push(description.groups[0]);
      }
    }
    res.json(groupDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await admin.admin.disconnect();
  }
});

app.get('/api/cluster', async (req, res) => {
  try {
    const info = await admin.getClusterInfo();
    res.json(info.cluster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const keys = await redisClient.keys('analytics:*');
    const data = {};
    for (const key of keys) {
      const type = await redisClient.type(key);
      if (type === 'set') {
        data[key] = await redisClient.smembers(key);
      } else {
        data[key] = await redisClient.get(key);
      }
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Consumer to log all events to MongoDB
const setupEventLogger = async () => {
  await mongoClient.connectMongo();
  await admin.createTopics(); // Ensure topics are created before starting

  const messageHandler = async ({ topic, partition, key, value, offset, groupId }) => {
    const db = mongoClient.getDb();

    // Store event in mongo
    await db.collection('events').insertOne({
      groupId,
      topic,
      partition,
      key,
      value,
      offset,
      timestamp: new Date()
    });

    console.log(`[EVENT LOG] ${groupId} | ${topic} | Partition: ${partition} | Offset: ${offset}`);
  };

  await consumer.createConsumer('notification-group', TOPICS, messageHandler);
};

app.listen(PORT, async () => {
  console.log(`Notification service running on port ${PORT}`);
  await setupEventLogger();
});
