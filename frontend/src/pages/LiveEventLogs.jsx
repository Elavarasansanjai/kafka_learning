import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../services/api';

function LiveEventLogs() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
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
      <h1 className="card-title">Module 11 - Live Event Logs</h1>
      <p style={{marginBottom: '20px', color: '#a0a0b0'}}>Polling MongoDB for events consumed by the Notification Service.</p>
      
      <div>
        {events.map((ev, i) => (
          <div key={i} className="log-entry">
            <div><strong>[{new Date(ev.timestamp).toLocaleTimeString()}]</strong> Topic: <strong>{ev.topic}</strong> | Partition: {ev.partition} | Offset: {ev.offset}</div>
            <div style={{marginTop: '8px', fontSize: '13px'}}>Key: {ev.key} | Value: {JSON.stringify(ev.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveEventLogs;
