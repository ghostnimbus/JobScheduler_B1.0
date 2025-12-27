import React, { useState, useEffect } from 'react';
import './JobDetailsModal.css';
import { getJobDetails, getJobExecutions } from '../services/api';

function JobDetailsModal({ jobId, onClose }) {
  const [job, setJob] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const [jobData, executionsData] = await Promise.all([
        getJobDetails(jobId),
        getJobExecutions(jobId)
      ]);
      setJob(jobData);
      setExecutions(executionsData.executions || []);
    } catch (err) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close" onClick={onClose}>&times;</span>
          <div className="loading">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close" onClick={onClose}>&times;</span>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Job Details</h2>
        {job && (
          <div className="job-details">
            <div className="detail-row">
              <strong>Job ID:</strong>
              <span className="job-id">{job.jobId}</span>
            </div>
            <div className="detail-row">
              <strong>Schedule:</strong>
              <code>{job.schedule}</code>
            </div>
            <div className="detail-row">
              <strong>API Endpoint:</strong>
              <span>{job.api}</span>
            </div>
            <div className="detail-row">
              <strong>Type:</strong>
              <span>{job.type}</span>
            </div>
            <div className="detail-row">
              <strong>Created:</strong>
              <span>{new Date(job.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <strong>Active:</strong>
              <span>{job.active ? 'Yes' : 'No'}</span>
            </div>
            {job.stats && (
              <>
                <div className="detail-row">
                  <strong>Total Executions:</strong>
                  <span>{job.stats.total || 0}</span>
                </div>
                <div className="detail-row">
                  <strong>Successful:</strong>
                  <span style={{ color: 'var(--success-color)' }}>
                    {job.stats.success || 0}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Failed:</strong>
                  <span style={{ color: 'var(--danger-color)' }}>
                    {job.stats.failed || 0}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Avg Duration:</strong>
                  <span>
                    {job.stats.avgDuration
                      ? `${job.stats.avgDuration}ms`
                      : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        <h3>Executions (Last 5)</h3>
        <div className="job-executions">
          {executions.length > 0 ? (
            executions.map((exec) => (
              <div key={exec.executionId} className="execution-detail">
                <div className="execution-header">
                  <strong>{new Date(exec.scheduledTime).toLocaleString()}</strong>
                  <span className={`status-badge ${exec.status.toLowerCase()}`}>
                    {exec.status}
                  </span>
                </div>
                <div className="execution-info">
                  {exec.httpStatus && `HTTP ${exec.httpStatus} • `}
                  {exec.duration && `${exec.duration}ms • `}
                  {exec.retryCount > 0 && `Retries: ${exec.retryCount}`}
                  {exec.errorMessage && (
                    <div style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                      Error: {exec.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No executions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetailsModal;

