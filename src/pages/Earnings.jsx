import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Collapse } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import AppLayout from '../components/layout/AppLayout';
import { getEarningsDashboard, getEarningsSummary, getCommissionByJob } from '../api/earnings';
import { getClockStatus } from '../api/time';
import { formatCurrency, formatHours } from '../utils/formatters';
import dayjs from 'dayjs';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ProductivityBar = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <div className="bar-chart-container">
      {DAYS.map((d, i) => {
        const dayData = data[i] || {};
        const pct = Math.round(((dayData.value || 0) / max) * 100);
        return (
          <div key={i} className="bar-day">
            <div className="bar-wrapper">
              <div
                className="bar primary"
                style={{ height: `${Math.max(4, pct * 0.7)}px`, width: '100%' }}
              />
              {dayData.light > 0 && (
                <div
                  className="bar light"
                  style={{ height: `${Math.max(4, (dayData.light / max) * 70)}px`, width: '100%' }}
                />
              )}
            </div>
            <span className="bar-label">{d}</span>
          </div>
        );
      })}
    </div>
  );
};

const Earnings = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [period, setPeriod] = useState('today');
  const [dashboard, setDashboard] = useState(null);
  const [summary, setSummary] = useState(null);
  const [commissions, setCommissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [weeklyBarData, setWeeklyBarData] = useState([]);
  const [showPastJobs, setShowPastJobs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBase = async () => {
      try {
        const [statusRes, dashRes] = await Promise.allSettled([
          getClockStatus(),
          getEarningsDashboard(),
        ]);
        if (statusRes.status === 'fulfilled') setClockedIn(statusRes.value.clockedIn);
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);

        // Build weekly bar data
        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value;
          const weekly = d?.weekly?.totalEarnings || 0;
          // Spread weekly earnings across 7 days (approx — no per-day breakdown from API)
          const perDay = weekly / 5;
          const bars = DAYS.map((_, i) => ({
            value: i > 0 && i < 6 ? perDay : 0,
            light: 0,
          }));
          setWeeklyBarData(bars);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadBase();
  }, []);

  const loadSummaryData = useCallback(async (selectedPeriod) => {
    setSummaryLoading(true);
    try {
      const apiPeriod = selectedPeriod === 'today' ? 'daily' : selectedPeriod === 'thisWeek' ? 'weekly' : 'monthly';
      const [summaryRes, commRes] = await Promise.allSettled([
        getEarningsSummary({ period: apiPeriod }),
        getCommissionByJob({ period: apiPeriod }),
      ]);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (commRes.status === 'fulfilled') setCommissions(commRes.value);
    } catch (err) {
      setError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummaryData(period);
  }, [period, loadSummaryData]);

  const currentEarnings = period === 'today'
    ? dashboard?.daily?.totalEarnings
    : period === 'thisWeek'
    ? dashboard?.weekly?.totalEarnings
    : dashboard?.monthly?.totalEarnings;

  const currentJobs = period === 'today'
    ? dashboard?.daily?.sessionsCount
    : period === 'thisWeek'
    ? dashboard?.weekly?.sessionsCount
    : dashboard?.monthly?.sessionsCount;

  const avgPerJob = currentJobs > 0 ? Math.round((currentEarnings || 0) / currentJobs) : 0;

  // Group commissions by job type (from job.jobType)
  const commByType = {};
  if (commissions?.commissionByJob) {
    for (const c of commissions.commissionByJob) {
      const type = c.job?.jobType || 'Other';
      if (!commByType[type]) commByType[type] = { jobs: [], total: 0 };
      commByType[type].jobs.push(c);
      commByType[type].total += c.commission || 0;
    }
  }
  const commCategories = Object.entries(commByType);

  // Today's goal from dashboard
  const goalHours = 8;
  const todayEarnings = dashboard?.daily?.totalEarnings || 0;
  const hourlyRate = dashboard?.hourlyRate || 0;
  const estimatedDayEarnings = hourlyRate * goalHours;
  const goalProgress = estimatedDayEarnings > 0 ? Math.min(100, Math.round((todayEarnings / estimatedDayEarnings) * 100)) : 0;

  // Past jobs from commissions
  const pastJobs = commissions?.commissionByJob
    ?.filter((c) => c.job && c.commission > 0)
    ?.slice(0, 10) || [];

  return (
    <AppLayout clockedIn={clockedIn}>
      <div className="page-header">
        <h1>Earnings</h1>
      </div>

      {loading ? (
        <div className="loading-container"><Spin size="large" /></div>
      ) : (
        <>
          {/* Earnings Header */}
          <div className="section-card">
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>
              {period === 'today' ? "Today's earnings" : period === 'thisWeek' ? "This week's earnings" : "This month's earnings"}
            </div>
            <div className="earnings-header-value">
              {formatCurrency(currentEarnings || 0)}
            </div>

            <div className="stat-grid" style={{ marginBottom: 16 }}>
              <div className="stat-item">
                <div className="stat-value">{currentJobs || 0}</div>
                <div className="stat-label">Jobs completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(avgPerJob)}</div>
                <div className="stat-label">Avg per job</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'today', label: 'Today' },
                { key: 'thisWeek', label: 'This week' },
                { key: 'thisMonth', label: 'This month' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`earnings-tab-btn ${period === key ? 'active' : ''}`}
                  onClick={() => setPeriod(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Today's Goal */}
          <div className="section-card">
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>Today's goal</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                {formatCurrency(todayEarnings)} of {formatCurrency(estimatedDayEarnings)}
              </span>
              <span style={{ fontSize: 13, color: '#888' }}>{goalProgress}%</span>
            </div>
            <div className="goal-progress-bar">
              <div className="goal-progress-fill" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>

          {/* Productivity Chart */}
          <div className="section-card">
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 2 }}>Productivity</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Last 7 days</div>
            <ProductivityBar data={weeklyBarData} />
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-item">
                <div style={{ fontSize: 12, color: '#aaa' }}>This week so far</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                  {formatCurrency(dashboard?.weekly?.totalEarnings || 0)}
                </div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: 12, color: '#aaa' }}>Top day</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                  {formatCurrency(Math.max(...(weeklyBarData.map((d) => d.value || 0)), 0))}
                </div>
              </div>
            </div>
          </div>

          {/* Commission Breakdown */}
          {summaryLoading ? (
            <div style={{ textAlign: 'center', padding: 20 }}><Spin size="small" /></div>
          ) : (
            <div className="section-card">
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                Commission breakdown
              </div>

              {commCategories.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                  No commission data for this period
                </div>
              ) : (
                commCategories.map(([type, data]) => (
                  <div key={type}>
                    <div
                      className={`commission-category ${expandedCategory === type ? 'expanded' : ''}`}
                      onClick={() => setExpandedCategory(expandedCategory === type ? null : type)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{type}</div>
                          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                            {data.jobs.length} job{data.jobs.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                            {formatCurrency(data.total)}
                          </span>
                          {data.jobs.length > 0 && (
                            <RightOutlined style={{
                              fontSize: 12, color: '#aaa',
                              transform: expandedCategory === type ? 'rotate(90deg)' : 'none',
                              transition: 'transform 0.2s',
                            }} />
                          )}
                        </div>
                      </div>
                      {expandedCategory === type && (
                        <div style={{ marginTop: 10 }}>
                          {data.jobs.map((c, idx) => (
                            <div key={idx} className="commission-sub-item">
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#111' }}>
                                    #{c.job?.stockNumber || c.jobId?.slice(-6)} · {c.job?.jobType || type}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Commission earned</div>
                                </div>
                                <span style={{ fontWeight: 700, color: '#111' }}>
                                  {formatCurrency(c.commission)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Extras line */}
              {summary && summary.totalCommission > 0 && (
                <div className="commission-category">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Hourly Pay</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                        {formatHours(summary.totalHours)} @ ${summary.hourlyRate}/hr
                      </div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                      {formatCurrency(summary.hourlyPay || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Past Jobs */}
          <div className="section-card">
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setShowPastJobs(!showPastJobs)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f0fdf4',
                  border: 'none',
                  borderRadius: 10,
                  color: '#16a34a',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {showPastJobs ? 'Hide past jobs' : 'View past jobs'}
              </button>
            </div>

            {showPastJobs && (
              pastJobs.length === 0 ? (
                <div style={{ color: '#aaa', textAlign: 'center', fontSize: 13, padding: '12px 0' }}>
                  No completed jobs found
                </div>
              ) : (
                pastJobs.map((c, idx) => (
                  <div key={idx} className="past-job-item">
                    <div>
                      <div className="past-job-title">
                        Job #{c.job?.stockNumber || c.jobId?.slice(-6)} · {c.job?.vin || ''}
                      </div>
                      <div className="past-job-subtitle">{c.job?.jobType || 'Service'}</div>
                    </div>
                    <span className="past-job-amount">{formatCurrency(c.commission)}</span>
                  </div>
                ))
              )
            )}
          </div>
        </>
      )}

      {error && <div className="error-container">{error}</div>}
    </AppLayout>
  );
};

export default Earnings;
