import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/api';

function RedisAnalytics() {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error(error);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h1 className="card-title">Module 12 - Redis Analytics</h1>
      <p style={{marginBottom: '20px', color: '#a0a0b0'}}>Live counters updated by the Analytics Service using Redis.</p>
      
      <div className="grid">
        {Object.keys(analytics).length === 0 && <p>No analytics data yet.</p>}
        {Object.entries(analytics).map(([key, value], i) => (
          <div key={i} className="partition-box" style={{textAlign: 'center'}}>
            <h4 style={{color: '#a0a0b0', marginBottom: '10px', fontSize: '14px', wordBreak: 'break-all'}}>{key}</h4>
            <div style={{fontSize: '32px', color: '#ff9900', fontWeight: 'bold'}}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RedisAnalytics;
