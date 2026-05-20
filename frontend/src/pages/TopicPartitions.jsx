import React, { useState, useEffect } from 'react';
import { fetchPartitions } from '../services/api';

function TopicPartitions() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchPartitions();
        setTopics(data);
      } catch (error) {
        console.error(error);
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h1 className="card-title">Module 2 & 3 - Topic Partitions & Routing</h1>
      <p style={{marginBottom: '20px', color: '#a0a0b0'}}>Visualizing how topics are partitioned across the KRaft cluster.</p>
      
      {topics.map((t, i) => (
        <div key={i} className="partition-box">
          <h3 style={{color: '#ff9900', marginBottom: '12px'}}>{t.name}</h3>
          <table>
            <thead>
              <tr>
                <th>Partition ID</th>
                <th>Leader Broker</th>
                <th>Replicas</th>
                <th>In-Sync Replicas (ISR)</th>
              </tr>
            </thead>
            <tbody>
              {t.partitions.map((p, j) => (
                <tr key={j}>
                  <td>Partition {p.partitionId}</td>
                  <td>Broker {p.leader}</td>
                  <td>{p.replicas.join(', ')}</td>
                  <td>{p.isr.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default TopicPartitions;
