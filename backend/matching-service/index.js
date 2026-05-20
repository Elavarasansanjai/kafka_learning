const { consumer, producer } = require('@app/common');

const startService = async () => {
  await producer.connectProducer();

  await consumer.createConsumer('matching-group', ['ride-requested'], async ({ key, value }) => {
    console.log(`Matching Service processing ride ${key}`);
    
    // Simulate finding a driver
    setTimeout(async () => {
      const driverEvent = { rideId: value.rideId, driverId: `DRIVER-${Math.floor(Math.random() * 1000)}`, status: 'assigned' };
      await producer.produceMessage('driver-assigned', key, driverEvent);
      console.log(`Driver assigned for ride ${key}`);
      
      // Simulate driver accepting
      setTimeout(async () => {
        const acceptEvent = { ...driverEvent, status: 'accepted' };
        await producer.produceMessage('ride-accepted', key, acceptEvent);
        console.log(`Ride accepted for ride ${key}`);
        
        // Simulate ride starting
        setTimeout(async () => {
          const startEvent = { ...driverEvent, status: 'started' };
          await producer.produceMessage('ride-started', key, startEvent);
          console.log(`Ride started for ride ${key}`);
          
          // Simulate ride completing
          setTimeout(async () => {
            const completeEvent = { ...driverEvent, status: 'completed' };
            await producer.produceMessage('ride-completed', key, completeEvent);
            console.log(`Ride completed for ride ${key}`);
          }, 3000);
          
        }, 2000);
      }, 1000);
    }, 2000);
  });
};

startService().catch(console.error);
