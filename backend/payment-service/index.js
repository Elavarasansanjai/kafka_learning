const { consumer, producer } = require('@app/common');

const startService = async () => {
  await producer.connectProducer();

  const handlePayment = async (key, value, retryCount = 0) => {
    if (value.simulateFailure || String(key).includes('FAIL')) {
      throw new Error('Payment failed');
    }
    await producer.produceMessage('payment-completed', key, { ...value, paymentStatus: 'success' });
    console.log(`Payment completed for ride ${key}`);
  };

  await consumer.createConsumer('payment-group', ['ride-completed', 'ride-retry'], async ({ topic, key, value }) => {
    console.log(`Payment Service processing from ${topic} for ride ${key}`);
    
    let retryCount = value.retryCount || 0;
    
    try {
      await handlePayment(key, value, retryCount);
    } catch (error) {
      console.error(`Payment failed for ${key}, attempt: ${retryCount + 1}`);
      
      if (retryCount < 3) {
        // Send to retry
        await producer.produceMessage('ride-retry', key, { ...value, retryCount: retryCount + 1 });
      } else {
        // Send to DLQ
        await producer.produceMessage('ride-dlq', key, { ...value, error: error.message, finalRetryCount: retryCount });
        console.log(`Sent to DLQ for ride ${key}`);
      }
    }
  });
};

startService().catch(console.error);
