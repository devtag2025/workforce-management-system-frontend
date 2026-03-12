import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal, Select } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ClockRing from '../components/clock/ClockRing';
import { getClockStatus, clockIn, clockOut, getToday } from '../api/time';
import { getProductivityDashboard } from '../api/productivity';
import { getMyJobs } from '../api/jobs';
import useAuthStore from '../store/authStore';
import {
  formatTime, formatHours, formatHoursFull, getWeekLabel, formatDate
} from '../utils/formatters';
import dayjs from 'dayjs';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  const [todaySummary, setTodaySummary] = useState(null);
  const [productivityData, setProductivityData] = useState(null);
  const [weeklyLogs, setWeeklyLogs] = useState([]);

  const [clockInModal, setClockInModal] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const status = await getClockStatus();
      setClockedIn(status.clockedIn);
      if (status.session) {
        setClockInTime(status.session.clockIn);
        setActiveJobId(status.session.jobId);
      }
    } catch {
      // silent - could be auth issue
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadHomeData = useCallback(async () => {
    try {
      const [today, productivity] = await Promise.allSettled([
        getToday(),
        getProductivityDashboard(),
      ]);
      if (today.status === 'fulfilled') setTodaySummary(today.value);
      if (productivity.status === 'fulfilled') setProductivityData(productivity.value);

      // Build weekly logs from productivity data
      if (productivity.status === 'fulfilled') {
        const wp = productivity.value?.weeklyProgress;
        if (wp) {
          const days = [];
          const start = dayjs(wp.weekStart);
          for (let i = 0; i < 7; i++) {
            const d = start.add(i, 'day');
            days.push({ date: d.format('YYYY-MM-DD'), dayName: d.format('ddd'), dayDate: d.format('MMM D') });
          }
          setWeeklyLogs(days);
        }
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadHomeData();
  }, [loadStatus, loadHomeData]);

  const handleToggleClock = async () => {
    if (clockedIn) {
      Modal.confirm({
        title: 'Clock Out?',
        content: 'Are you sure you want to clock out?',
        okText: 'Clock Out',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk: async () => {
          setClockLoading(true);
          try {
            await clockOut();
            setClockedIn(false);
            setClockInTime(null);
            setActiveJobId(null);
            message.success('Clocked out successfully');
            loadHomeData();
          } catch (err) {
            message.error(err.message);
          } finally {
            setClockLoading(false);
          }
        },
      });
    } else {
      // Load available jobs for clock-in
      setJobsLoading(true);
      setClockInModal(true);
      try {
        const result = await getMyJobs({ status: 'Pending', pageSize: 50 });
        const allJobs = result.jobs || [];
        const inProgressResult = await getMyJobs({ status: 'In Progress', pageSize: 50 });
        const combined = [...allJobs, ...(inProgressResult.jobs || [])];
        setAvailableJobs(combined);
        if (combined.length > 0) setSelectedJobId(combined[0].id);
      } catch {
        setAvailableJobs([]);
      } finally {
        setJobsLoading(false);
      }
    }
  };

  const handleClockIn = async () => {
    if (!selectedJobId) {
      message.warning('Please select a job to clock in to');
      return;
    }
    setClockLoading(true);
    try {
      const result = await clockIn(selectedJobId);
      setClockedIn(true);
      setClockInTime(result.clockIn);
      setActiveJobId(result.jobId);
      setClockInModal(false);
      message.success('Clocked in successfully!');
      loadHomeData();
    } catch (err) {
      message.error(err.message);
    } finally {
      setClockLoading(false);
    }
  };

  const weeklyData = productivityData?.weeklyProgress;
  const todayGoal = productivityData?.todaysGoal;
  const goalHours = todayGoal?.goalHours || 8;
  const completedHours = todayGoal?.completedHours || todaySummary?.totalHours || 0;
  const progressPercent = todayGoal?.progressPercent || Math.min(100, Math.round((completedHours / goalHours) * 100));

  const weekLabel = weeklyData
    ? getWeekLabel(weeklyData.weekStart, weeklyData.weekEnd)
    : '';

  return (
    <AppLayout clockedIn={clockedIn}>
      {/* Work Session Card */}
      <div className="section-card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Work Session
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Clock In / Out</div>
          </div>
          <div style={{ fontSize: 12, color: clockedIn ? '#22c55e' : '#aaa', fontWeight: 500 }}>
            Status: {clockedIn ? 'Clocked In' : 'Clocked Out'}
          </div>
        </div>

        {statusLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #22c55e', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <ClockRing
            clockedIn={clockedIn}
            clockInTime={clockInTime}
            onToggle={handleToggleClock}
            loading={clockLoading}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Today</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
              {formatHours(completedHours)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            Last action: {clockedIn ? 'Clocked in' : 'Clocked out'}
          </div>
        </div>
      </div>

      {/* Total Working Hours this week */}
      {weeklyData && (
        <div
          className="section-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/time')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Total Working Hours</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{weekLabel}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>
                {formatHoursFull(weeklyData.totalHours)}
              </span>
              <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
            </div>
          </div>

          {/* Weekly days summary */}
          {weeklyLogs.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>This Week</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>Clock-ins and clock-outs</span>
              </div>
              {weeklyLogs.slice(0, 3).map((day) => (
                <div key={day.date} className="weekly-day-row" style={{ padding: '10px 0' }}>
                  <div className="weekly-day-header">
                    <div>
                      <div className="weekly-day-name">{day.dayName}</div>
                      <div className="weekly-day-date">{day.dayDate}</div>
                    </div>
                    <div className="weekly-day-total">—</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clock In Job Selection Modal */}
      <Modal
        title="Select Job to Clock In"
        open={clockInModal}
        onCancel={() => { setClockInModal(false); setSelectedJobId(null); }}
        onOk={handleClockIn}
        okText="Clock In"
        confirmLoading={clockLoading}
        okButtonProps={{ style: { background: '#22c55e', border: 'none' } }}
      >
        {jobsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>Loading jobs...</div>
        ) : availableJobs.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>
            No active jobs assigned to you. Ask your manager to assign a job first.
          </div>
        ) : (
          <div>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
              Choose which job you're starting work on:
            </p>
            <Select
              value={selectedJobId}
              onChange={setSelectedJobId}
              style={{ width: '100%' }}
              size="large"
              placeholder="Select a job"
              options={availableJobs.map((j) => ({
                value: j.id,
                label: `#${j.stockNumber || j.id?.slice(-6)} · ${j.jobType || 'No type'} (${j.status})`,
              }))}
            />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

export default Home;
