const API_BASE = 'http://localhost:3001/api';
const PRODUCER_API = 'http://localhost:3002/api';

export const fetchEvents = async () => {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
};

export const fetchPartitions = async () => {
  const res = await fetch(`${API_BASE}/partitions`);
  return res.json();
};

export const fetchConsumers = async () => {
  const res = await fetch(`${API_BASE}/consumers`);
  return res.json();
};

export const fetchCluster = async () => {
  const res = await fetch(`${API_BASE}/cluster`);
  return res.json();
};

export const fetchAnalytics = async () => {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
};

export const produceMessage = async (topic, key, message, partition) => {
  const res = await fetch(`${PRODUCER_API}/produce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, key, message, partition })
  });
  return res.json();
};
