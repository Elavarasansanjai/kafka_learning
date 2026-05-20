import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ProducerPlayground from './pages/ProducerPlayground';
import TopicPartitions from './pages/TopicPartitions';
import ConsumerGroups from './pages/ConsumerGroups';
import LiveEventLogs from './pages/LiveEventLogs';
import RedisAnalytics from './pages/RedisAnalytics';
import KafkaKRaftCluster from './pages/KafkaKRaftCluster';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <h2>Kafka Learning</h2>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Producer Playground</NavLink>
          <NavLink to="/topics" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Topic Partitions</NavLink>
          <NavLink to="/consumers" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Consumer Groups</NavLink>
          <NavLink to="/logs" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Live Event Logs</NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Redis Analytics</NavLink>
          <NavLink to="/cluster" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Kafka KRaft Cluster</NavLink>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProducerPlayground />} />
            <Route path="/topics" element={<TopicPartitions />} />
            <Route path="/consumers" element={<ConsumerGroups />} />
            <Route path="/logs" element={<LiveEventLogs />} />
            <Route path="/analytics" element={<RedisAnalytics />} />
            <Route path="/cluster" element={<KafkaKRaftCluster />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
