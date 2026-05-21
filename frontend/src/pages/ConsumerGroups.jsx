import React, { useState, useEffect } from 'react';
import { fetchConsumers } from '../services/api';

function ConsumerGroups() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchConsumers();
        if (Array.isArray(data)) {
          setGroups(data);
        } else {
          console.error("API returned non-array data:", data);
        }
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
      <h1 className="card-title">Module 4, 5 & 6 - Consumer Groups & Heartbeats</h1>
      <p style={{marginBottom: '20px', color: '#a0a0b0'}}>Visualizing consumer group assignments and members.</p>
      
      {groups.length === 0 && <p>No active consumer groups found or data still loading...</p>}
      
      {groups.map((g, i) => (
        <div key={i} className="partition-box">
          <h3 style={{color: '#ff9900', marginBottom: '12px'}}>Group: {g.groupId} ({g.state})</h3>
          <p style={{marginBottom: '10px', fontSize: '14px', color: '#a0a0b0'}}>Protocol Type: {g.protocolType} | Members: {g.members.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Client ID</th>
                <th>Client Host</th>
              </tr>
            </thead>
            <tbody>
              {g.members.map((m, j) => (
                <tr key={j}>
                  <td>{m.memberId.substring(0, 30)}...</td>
                  <td>{m.clientId}</td>
                  <td>{m.clientHost}</td>
                </tr>
              ))}
              {g.members.length === 0 && (
                <tr>
                  <td colSpan="3">No active members in this group</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default ConsumerGroups;
