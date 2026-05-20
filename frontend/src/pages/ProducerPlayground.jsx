import React, { useState } from 'react';
import { produceMessage } from '../services/api';

function ProducerPlayground() {
  const [topic, setTopic] = useState('ride-requested');
  const [key, setKey] = useState(`RIDE-${Math.floor(Math.random() * 10000)}`);
  const [partition, setPartition] = useState(''); // New state for manual partition
  const [message, setMessage] = useState(JSON.stringify({ passengerId: 'USER123', location: 'NYC' }, null, 2));
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    try {
      setStatus('Sending...');
      const res = await produceMessage(topic, key, JSON.parse(message), partition);
      setStatus(`Success! Offset: ${res.result[0].baseOffset}, Partition: ${res.result[0].partition}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <h1 className="card-title">Module 1 - Producer Playground</h1>
      <p style={{marginBottom: '20px', color: '#a0a0b0'}}>Send custom events to Kafka and observe how they are routed based on their Key.</p>
      
      <label>Topic:</label>
      <select value={topic} onChange={e => setTopic(e.target.value)}>
        <option value="ride-requested">ride-requested</option>
        <option value="driver-assigned">driver-assigned</option>
        <option value="ride-completed">ride-completed</option>
        <option value="ride-dlq">ride-dlq</option>
      </select>
      
      <label>Key (Routing Key):</label>
      <input type="text" value={key} onChange={e => setKey(e.target.value)} />
      
      <label>Force Partition (Optional, e.g., 0, 1, or 2):</label>
      <input type="number" placeholder="Leave blank to use Key Hash" value={partition} onChange={e => setPartition(e.target.value)} />
      
      <label>JSON Message:</label>
      <textarea rows="5" value={message} onChange={e => setMessage(e.target.value)}></textarea>
      
      <button onClick={handleSend}>Send Event</button>
      
      {status && <div style={{marginTop: '20px', padding: '10px', background: '#2a2a35', borderRadius: '4px'}}>{status}</div>}
    </div>
  );
}

export default ProducerPlayground;
