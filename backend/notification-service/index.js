const express = require('express');
const cors = require('cors');
const { consumer, admin, mongoClient, redisClient, zkConsumer, zkAdmin } = require('@app/common');

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

// Zookeeper Events Endpoint
app.get('/api/zk-events', async (req, res) => {
  const db = mongoClient.getDb();
  const events = await db.collection('zk_events').find().sort({ timestamp: -1 }).limit(100).toArray();
  res.json(events);
});

// Endpoint to list ZK topics
app.get('/api/zk-topics', async (req, res) => {
  try {
    const topics = await zkAdmin.listZkTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

app.post('/api/analytics/redis-ops', async (req, res) => {
  try {
    const demoKey = `demo:key:${Date.now()}`;
    const demoValue = 'demo-value';
    const channel = 'demo-channel';
    const userId = req.body.userId || 'user123';
    
    // 1. set(key, value) -> Store value
    await redisClient.set(demoKey, demoValue);
    console.log(`[REDIS OP] SET: Stored a new value in key '${demoKey}' - Purpose: Basic key-value data storage.`);
    
    // 2. get(key) -> Get value
    const retrievedValue = await redisClient.get(demoKey);
    console.log(`[REDIS OP] GET: Retrieved value '${retrievedValue}' from key '${demoKey}' - Purpose: Fetching simple data by its unique key.`);
    
    // 3. expire(key, seconds) -> Set expiry
    await redisClient.expire(demoKey, 3600);
    console.log(`[REDIS OP] EXPIRE: Set a 1-hour expiration on key '${demoKey}' - Purpose: Auto-cleanup of stale or temporary data.`);
    
    // 4. ttl(key) -> Remaining time
    const ttlValue = await redisClient.ttl(demoKey);
    console.log(`[REDIS OP] TTL: Remaining time for key '${demoKey}' is ${ttlValue} seconds - Purpose: Checking how much longer a key will live.`);
    
    // 5. incr(key) -> Increment counter
    const counter = await redisClient.incr(`demo:counter:${userId}`);
    console.log(`[REDIS OP] INCR: Incremented counter to ${counter} - Purpose: High-performance atomic counting for metrics/rate limits.`);
    
    // 6. hset(key, object) -> Store object
    await redisClient.hset(`demo:user:${userId}`, 'lastAction', 'redis-ops', 'count', counter);
    console.log(`[REDIS OP] HSET: Stored hash object for user '${userId}' - Purpose: Storing structured data/objects efficiently without serializing full JSON.`);
    
    // 7. lpush(key, value) -> Add queue item
    await redisClient.lpush(`demo:queue:${userId}`, `action-${counter}`);
    console.log(`[REDIS OP] LPUSH: Pushed item to queue '${userId}' - Purpose: Adding elements to a list, often used for task queues or recent activity feeds.`);
    
    // 8. publish(channel, message) -> Real-time messaging
    await redisClient.publish(channel, JSON.stringify({ userId, event: 'redis-ops-executed' }));
    console.log(`[REDIS OP] PUBLISH: Sent message to channel '${channel}' - Purpose: Broadcasting events in real-time for Pub/Sub messaging architectures.`);
    
    // 9. zadd(key, score, member) -> Leaderboard
    await redisClient.zadd('demo:leaderboard', counter, userId);
    console.log(`[REDIS OP] ZADD: Added user '${userId}' with score ${counter} to leaderboard - Purpose: Maintaining ordered sets (like leaderboards or priority queues) sorted by a score.`);
    
    // 10. del(key) -> Delete key
    await redisClient.del(demoKey);
    console.log(`[REDIS OP] DEL: Deleted key '${demoKey}' - Purpose: Manual cleanup and removal of cached data.`);

    res.json({
      success: true,
      message: 'Successfully executed all requested Redis operations.',
      results: {
        retrievedValue,
        ttlValue,
        counter
      }
    });
  } catch (error) {
    console.error('Redis ops error:', error);
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

// Setup Zookeeper Consumer
const setupZkLogger = async () => {
  const zkConsumerInstance = zkConsumer.createZkConsumer('zk-ecommerce-group');
  // ensure ecommerce-orders topic exists
  try {
    await zkAdmin.createZkTopic('ecommerce-orders', 3, 1);
  } catch (e) {
    console.log('[ZK] Topic may already exist or error creating:', e.message);
  }

  const zkMessageHandler = async ({ topic, partition, message }) => {
    const db = mongoClient.getDb();

    await db.collection('zk_events').insertOne({
      groupId: 'zk-ecommerce-group',
      topic,
      partition,
      key: message.key ? message.key.toString() : null,
      value: message.value ? message.value.toString() : null,
      offset: message.offset,
      timestamp: new Date()
    });
  };

  await zkConsumer.subscribeAndConsumeZk(zkConsumerInstance, 'ecommerce-orders', zkMessageHandler);
};

app.listen(PORT, async () => {
  console.log(`Notification service running on port ${PORT}`);
  await setupEventLogger();
  await setupZkLogger();
});
