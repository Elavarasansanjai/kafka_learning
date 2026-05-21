const { consumer, redisClient } = require('@app/common');

const startService = async () => {
  const TOPICS = [
    'ride-requested', 'driver-assigned', 'ride-accepted', 'ride-started',
    'ride-completed', 'payment-completed', 'ride-dlq'
  ];

  await consumer.createConsumer('analytics-group', TOPICS, async ({ topic, key, value }) => {
    // Increment total messages for topic
    await redisClient.incr(`analytics:total_messages:${topic}`);
    console.log("analytics service came")
    // Track active rides
    if (topic === 'ride-requested') {
      console.log("added redis")
      await redisClient.sadd('analytics:active_rides', String(key));
    } else if (topic === 'ride-completed' || topic === 'ride-dlq') {
      await redisClient.srem('analytics:active_rides', String(key));
    }

    console.log(`Analytics updated for ${topic} - ${key}`);
  });
};

startService().catch(console.error);
