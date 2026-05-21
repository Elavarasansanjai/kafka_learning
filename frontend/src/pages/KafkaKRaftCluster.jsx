import React, { useState, useEffect } from 'react';
import { fetchCluster } from '../services/api';

function KafkaKRaftCluster() {
  const [cluster, setCluster] = useState(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchCluster();
        if (data && data.brokers) {
          setCluster(data);
        } else {
          console.error("API returned invalid cluster data:", data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h1 className="card-title">Module 9 & 10 - Kafka KRaft Cluster</h1>
      <p style={{marginBottom: '20px', color: '#a0a0b0'}}>Visualizing the KRaft Brokers without Zookeeper.</p>
      
      {!cluster && <p>Loading cluster metadata...</p>}
      
      {cluster && (
        <div className="partition-box">
          <h3 style={{color: '#ff9900', marginBottom: '12px'}}>Controller Node: Broker {cluster.controller}</h3>
          
          <div className="grid">
            {cluster.brokers.map((b, i) => (
              <div key={i} style={{background: '#252530', padding: '16px', borderRadius: '6px', border: b.nodeId === cluster.controller ? '2px solid #ff9900' : '1px solid #3a3a4c'}}>
                <h4>Broker {b.nodeId} {b.nodeId === cluster.controller ? '(CONTROLLER)' : ''}</h4>
                <p style={{marginTop: '10px', fontSize: '14px', color: '#a0a0b0'}}>Host: {b.host}</p>
                <p style={{fontSize: '14px', color: '#a0a0b0'}}>Port: {b.port}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KafkaKRaftCluster;
