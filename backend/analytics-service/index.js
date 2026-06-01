const { consumer, redisClient } = require('@app/common');

const startService = async () => {
  const TOPICS = [
    'ride-requested', 'driver-assigned', 'ride-accepted', 'ride-started',
    'ride-completed', 'payment-completed', 'ride-dlq'
  ];

  await consumer.createConsumer('analytics-group', TOPICS, async ({ topic, key, value }) => {
    // 1. incr(key) - Increment total messages for topic
    const msgCount = await redisClient.incr(`analytics:total_messages:${topic}`);
    console.log(`[REDIS OP] INCR: Incremented msgCount for ${topic} to ${msgCount} - Purpose: High-performance counter for analytics.`);
    
    const trackingKey = `analytics:tracking:${key}`;
    const valueStr = value ? value.toString() : 'empty-value';

    // 2. set(key, value) - Store raw message value temporarily
    await redisClient.set(trackingKey, valueStr);
    console.log(`[REDIS OP] SET: Stored raw value for key '${trackingKey}' - Purpose: Basic caching of raw message payloads.`);
    
    // 3. get(key) - Get value back (just to demonstrate usage)
    const storedVal = await redisClient.get(trackingKey);
    console.log(`[REDIS OP] GET: Fetched raw value for key '${trackingKey}' - Purpose: Retrieving simple values by key.`);
    
    // 4. expire(key, seconds) - Set expiry so we don't keep raw data forever
    await redisClient.expire(trackingKey, 3600); // 1 hour
    console.log(`[REDIS OP] EXPIRE: Set 1-hour expiration for key '${trackingKey}' - Purpose: Freeing up memory by expiring transient data.`);
    
    // 5. ttl(key) - Check remaining time
    const timeToLive = await redisClient.ttl(trackingKey);
    console.log(`[REDIS OP] TTL: Remaining TTL for key '${trackingKey}' is ${timeToLive}s - Purpose: Inspecting lifetime of a key.`);

    // 6. hset(key, object) - Store structured object for the message
    await redisClient.hset(`analytics:message_meta:${key}`, 
      'topic', topic, 
      'length', valueStr.length,
      'receivedAt', Date.now()
    );
    console.log(`[REDIS OP] HSET: Saved metadata object for key '${key}' - Purpose: Structured storage for entity attributes (avoids JSON parse/stringify overhead).`);

    // 7. lpush(key, value) - Add to a recent activity queue
    await redisClient.lpush('analytics:recent_activity', `Topic: ${topic} - Key: ${key}`);
    console.log(`[REDIS OP] LPUSH: Prepended event to 'analytics:recent_activity' list - Purpose: Maintaining a fast, ordered queue of recent events.`);

    // 8. zadd(key, score, member) - Leaderboard of most active topics
    await redisClient.zadd('analytics:topic_leaderboard', msgCount, topic);
    console.log(`[REDIS OP] ZADD: Updated leaderboard with score ${msgCount} for topic '${topic}' - Purpose: Automatically sorting and ranking members by score.`);

    // 9. publish(channel, message) - Real-time messaging/pubsub
    await redisClient.publish('analytics_events', JSON.stringify({ topic, key, msgCount }));
    console.log(`[REDIS OP] PUBLISH: Broadcasted event to 'analytics_events' channel - Purpose: Decoupling publishers from subscribers for real-time notifications.`);
    
    // 10. del(key) - Delete the tracking key early if it's a dlq event
    if (topic === 'ride-dlq') {
      await redisClient.del(trackingKey);
      console.log(`[REDIS OP] DEL: Deleted tracking key '${trackingKey}' (DLQ logic) - Purpose: Manually removing specific records when no longer needed.`);
    }

    // Track active rides using existing sets
    if (topic === 'ride-requested') {
      console.log("added redis");
      await redisClient.sadd('analytics:active_rides', String(key));
    } else if (topic === 'ride-completed' || topic === 'ride-dlq') {
      await redisClient.srem('analytics:active_rides', String(key));
    }

    console.log(`Analytics updated for ${topic} - ${key}. TTL: ${timeToLive}`);
  });
};

startService().catch(console.error);
