import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import MetricsDashboard from './components/MetricsDashboard';
import CreateJobForm from './components/CreateJobForm';
import JobsList from './components/JobsList';
import ExecutionsList from './components/ExecutionsList';
import CurrentExecutions from './components/CurrentExecutions';
import JobDetailsModal from './components/JobDetailsModal';
import Footer from './components/Footer';
import { checkHealth, loadMetrics, loadJobs, loadExecutions } from './services/api';

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    refreshData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      const health = await checkHealth();
      setIsOnline(health.status === 'healthy');

      if (health.status === 'healthy') {
        const [metricsData, jobsData, executionsData] = await Promise.all([
          loadMetrics(),
          loadJobs(),
          loadExecutions()
        ]);

        setMetrics(metricsData.scheduler);
        setJobs(jobsData.jobs || []);
        setExecutions(executionsData.executions || []);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = () => {
    refreshData();
  };

  const handleJobClick = (jobId) => {
    setSelectedJob(jobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header isOnline={isOnline} onRefresh={refreshData} />
      
      <div className="container">
        <MetricsDashboard metrics={metrics} isOnline={isOnline} />
        <CurrentExecutions executions={executions} metrics={metrics} />
        <CreateJobForm onJobCreated={handleJobCreated} />
        <JobsList jobs={jobs} onJobClick={handleJobClick} />
        <ExecutionsList executions={executions} />
      </div>

      <Footer />

      {isModalOpen && (
        <JobDetailsModal
          jobId={selectedJob}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;

