const express = require('express');
const cors = require('cors');
const { producer, zkProducer } = require('@app/common');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;

app.post('/api/produce', async (req, res) => {
  const { topic, key, message, partition } = req.body;
  try {
    console.log("enter producer,====")
    const result = await producer.produceMessage(topic, key, message, partition);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Zookeeper Kafka endpoint
app.post('/api/zk-produce', async (req, res) => {
  const { topic, key, message, partition } = req.body;
  try {
    console.log("enter ZK producer,====")
    const result = await zkProducer.produceZkMessage(topic, key, message, partition);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Producer service running on port ${PORT}`);
  await producer.connectProducer();
  await zkProducer.connectZkProducer();
});
