import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ZookeeperEcommercePlayground.css';

const ZookeeperEcommercePlayground = () => {
  const [orderId, setOrderId] = useState('');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const [events, setEvents] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchTopics();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/zk-events');
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching ZK events", err);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/zk-topics');
      setTopics(res.data);
    } catch (err) {
      console.error("Error fetching ZK topics", err);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        topic: 'ecommerce-orders',
        key: orderId,
        message: { orderId, item, quantity, status: 'ORDER_PLACED' }
      };
      await axios.post('http://localhost:3002/api/zk-produce', payload);
      setStatus('Order placed successfully via Zookeeper Kafka!');
      
      // Reset form
      setOrderId(`ORD-${Math.floor(Math.random() * 10000)}`);
      setItem('');
      setQuantity(1);
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus(`Failed to place order: ${err.message}`);
    }
  };

  return (
    <div className="zk-container fade-in">
      <header className="zk-header">
        <h1>Zookeeper Kafka E-Commerce</h1>
        <p>Experience the robust, legacy-proven Zookeeper cluster mode for processing high-throughput e-commerce orders.</p>
      </header>

      <div className="zk-grid">
        <section className="zk-card order-panel">
          <h2>Place New Order</h2>
          <form onSubmit={placeOrder}>
            <div className="form-group">
              <label>Order ID</label>
              <input 
                type="text" 
                value={orderId} 
                onChange={(e) => setOrderId(e.target.value)} 
                placeholder="e.g. ORD-1001" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Item</label>
              <input 
                type="text" 
                value={item} 
                onChange={(e) => setItem(e.target.value)} 
                placeholder="e.g. MacBook Pro" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                min="1" 
                required 
              />
            </div>
            <button type="submit" className="btn-primary zk-btn">Submit Order to Kafka</button>
          </form>
          {status && <div className="zk-status-msg">{status}</div>}
        </section>

        <section className="zk-card topics-panel">
          <h2>Zookeeper Topics</h2>
          <p className="subtitle">Topics currently registered in Zookeeper mode.</p>
          <ul className="zk-topics-list">
            {topics.length > 0 ? topics.map((topic, idx) => (
              <li key={idx} className="topic-item">
                <span className="topic-icon">📋</span>
                {topic}
              </li>
            )) : <li>No topics found or loading...</li>}
          </ul>
        </section>

        <section className="zk-card events-panel full-width">
          <h2>Live Order Stream (ZK Consumer)</h2>
          <div className="table-responsive">
            <table className="zk-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Topic</th>
                  <th>Partition</th>
                  <th>Order Key</th>
                  <th>Message Value</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, idx) => (
                  <tr key={idx}>
                    <td>{new Date(ev.timestamp).toLocaleTimeString()}</td>
                    <td><span className="badge">{ev.topic}</span></td>
                    <td>{ev.partition}</td>
                    <td>{ev.key}</td>
                    <td className="msg-cell"><code>{ev.value}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ZookeeperEcommercePlayground;
