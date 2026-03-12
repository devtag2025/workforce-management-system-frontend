import React, { useState } from 'react';
import { message, Select, Spin } from 'antd';
import { updateJobStatus } from '../../api/jobs';
import { formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const StatusBadge = ({ status }) => {
  const map = {
    'Ready': 'status-ready',
    'Pending': 'status-pending',
    'In Progress': 'status-active',
    'Active': 'status-active',
    'Paused': 'status-paused',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled',
  };
  const cls = map[status] || 'status-pending';
  return <span className={`status-badge ${cls}`}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = {
    'High': 'priority-high',
    'Medium': 'priority-medium',
    'Low': 'priority-low',
    'Urgent': 'priority-urgent',
  };
  const cls = map[priority] || 'priority-low';
  return <span className={`priority-badge ${cls}`}>{priority}</span>;
};

const JobCard = ({ job, onStatusChange, onAssignChange, teamMembers = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isManager } = useAuthStore();

  const displayStatus = job.status === 'In Progress' ? 'ACTIVE' :
    job.status === 'Pending' ? 'READY' :
    job.status?.toUpperCase();

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await updateJobStatus(job.id, newStatus);
      if (onStatusChange) onStatusChange(job.id, newStatus);
      message.success(`Job status updated to ${newStatus}`);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const etaDate = job.date ? formatDate(job.date) : null;
  const isPastDue = job.date && new Date(job.date) < new Date();

  return (
    <div className="job-card">
      <div className="job-card-header">
        <span className="job-number">● Job #{job.stockNumber || job.id?.slice(-4)}</span>
        <StatusBadge status={
          job.status === 'In Progress' ? 'ACTIVE' :
          job.status === 'Pending' ? 'READY' :
          job.status
        } />
      </div>

      <h3 className="job-title">{job.vin || 'Vehicle'}</h3>

      <div className={`job-type-input ${job.status === 'In Progress' ? 'active-job' : ''}`}
        style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#555', fontSize: 14 }}>{job.jobType || 'No service type'}</span>
      </div>

      <div className="job-meta">
        <span>Stock# <strong>{job.stockNumber || '—'}</strong></span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {etaDate && (
            <span>
              ETA <span className="eta" style={{ color: isPastDue ? '#dc2626' : '#f59e0b', fontWeight: 700 }}>
                {etaDate}
              </span>
            </span>
          )}
          {job.priority && <PriorityBadge priority={job.priority} />}
        </div>
      </div>

      {/* Action Buttons */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <Spin size="small" />
        </div>
      ) : (
        <div className="job-actions">
          {job.status === 'Pending' && (
            <button className="btn-start" onClick={() => handleStatusChange('In Progress')}>
              START
            </button>
          )}
          {job.status === 'In Progress' && (
            <>
              <button className="btn-pause" onClick={() => handleStatusChange('Paused')}>
                PAUSE
              </button>
              <button className="btn-done" onClick={() => handleStatusChange('Completed')}>
                DONE
              </button>
            </>
          )}
          {job.status === 'Paused' && (
            <>
              <button className="btn-resume" onClick={() => handleStatusChange('In Progress')}>
                RESUME
              </button>
              <button className="btn-done" onClick={() => handleStatusChange('Completed')}>
                DONE
              </button>
            </>
          )}
          {(job.status === 'Completed' || job.status === 'Cancelled') && (
            <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', width: '100%', padding: '8px 0' }}>
              Job {job.status.toLowerCase()}
            </div>
          )}
        </div>
      )}

      <button className="btn-view-details" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide details' : 'View details'}
      </button>

      {expanded && (
        <div className="job-detail-panel">
          <div className="job-detail-row">
            <div className="job-detail-label">Vehicle VIN</div>
            <div className="job-detail-value">{job.vin || '—'}</div>
          </div>
          {job.date && (
            <div className="job-detail-row">
              <div className="job-detail-label">Due</div>
              <div className="job-detail-value" style={{ fontWeight: 600, color: '#111' }}>
                {new Date(job.date).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                })}
              </div>
            </div>
          )}
          {job.notes && (
            <div className="job-detail-row">
              <div className="job-detail-label">Notes</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4, lineHeight: 1.5 }}>
                {Array.isArray(job.notes)
                  ? job.notes.map((n, i) => <div key={i}>• {n}</div>)
                  : <div>{job.notes}</div>
                }
              </div>
            </div>
          )}
          <div className="job-detail-row">
            <div className="job-detail-label">Assigned to</div>
            {isManager() && teamMembers.length > 0 ? (
              <Select
                value={job.assignedTo}
                onChange={(val) => onAssignChange && onAssignChange(job.id, val)}
                style={{ width: '100%', marginTop: 4 }}
                options={teamMembers.map((m) => ({ value: m.id, label: m.fullName || m.name }))}
                size="small"
              />
            ) : (
              <div className="job-detail-value">{job.assignedToName || job.assignedTo || '—'}</div>
            )}
          </div>
          {job.commissionRate > 0 && (
            <div className="job-detail-row">
              <div className="job-detail-label">Commission Rate</div>
              <div className="job-detail-value">${job.commissionRate}/hr</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
