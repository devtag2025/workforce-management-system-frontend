import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Calendar, Badge } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import AppLayout from '../components/layout/AppLayout';
import { getTimeLogs, getDailySummary, getClockStatus } from '../api/time';
import { formatTime, formatHours, formatHoursFull, toISODateString } from '../utils/formatters';
import dayjs from 'dayjs';

const Time = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [totalHoursMonth, setTotalHoursMonth] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [monthLogs, setMonthLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [daySessions, setDaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);
  const [activeDates, setActiveDates] = useState(new Set());
  const [error, setError] = useState('');

  const loadMonthData = useCallback(async (month) => {
    setLoading(true);
    setError('');
    try {
      const start = month.startOf('month').format('YYYY-MM-DD');
      const end = month.endOf('month').format('YYYY-MM-DD');
      const [statusRes, logsRes] = await Promise.allSettled([
        getClockStatus(),
        getTimeLogs({ startDate: start, endDate: end, pageSize: 100 }),
      ]);

      if (statusRes.status === 'fulfilled') {
        setClockedIn(statusRes.value.clockedIn);
      }

      if (logsRes.status === 'fulfilled') {
        const logs = logsRes.value.logs || [];
        setMonthLogs(logs);

        // Compute total hours (completed sessions only)
        const totalH = logs
          .filter((l) => l.clockOut)
          .reduce((sum, l) => {
            const h = l.clockIn && l.clockOut
              ? (new Date(l.clockOut) - new Date(l.clockIn)) / 3600000
              : parseFloat(l.duration) || 0;
            return sum + (isFinite(h) ? h : 0);
          }, 0);
        setTotalHoursMonth(Math.round(totalH * 100) / 100);

        // Mark dates with sessions
        const dates = new Set(logs.map((l) => l.date).filter(Boolean));
        setActiveDates(dates);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDaySessions = useCallback(async (date) => {
    setDayLoading(true);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const summary = await getDailySummary(dateStr);
      setDaySessions(summary.logs || []);
    } catch {
      // fallback: filter from monthLogs
      const dateStr = date.format('YYYY-MM-DD');
      const dayLogs = monthLogs.filter((l) => l.date === dateStr);
      setDaySessions(dayLogs);
    } finally {
      setDayLoading(false);
    }
  }, [monthLogs]);

  useEffect(() => {
    loadMonthData(currentMonth);
  }, [loadMonthData, currentMonth]);

  useEffect(() => {
    loadDaySessions(selectedDate);
  }, [selectedDate, monthLogs]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    const prev = currentMonth.subtract(1, 'month');
    setCurrentMonth(prev);
    setSelectedDate(prev.startOf('month'));
  };

  const handleNextMonth = () => {
    const next = currentMonth.add(1, 'month');
    setCurrentMonth(next);
    setSelectedDate(next.startOf('month'));
  };

  const dayDateCellRender = (current) => {
    const dateStr = current.format('YYYY-MM-DD');
    const hasSession = activeDates.has(dateStr);
    const isToday = current.isSame(dayjs(), 'day');
    const isSelected = current.isSame(selectedDate, 'day');

    return (
      <div style={{
        position: 'relative',
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%',
        background: isSelected ? '#22c55e' : isToday ? '#f0fdf4' : 'transparent',
        border: isToday && !isSelected ? '2px solid #22c55e' : 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: isSelected || isToday ? 700 : 400,
        color: isSelected ? '#fff' : current.month() !== currentMonth.month() ? '#ddd' : '#111',
      }}>
        {current.date()}
        {hasSession && !isSelected && (
          <span style={{
            position: 'absolute', bottom: 2,
            width: 4, height: 4,
            borderRadius: '50%',
            background: '#22c55e',
            left: '50%', transform: 'translateX(-50%)',
          }} />
        )}
      </div>
    );
  };

  // Compute selected day totals
  const completedSessions = daySessions.filter((s) => s.clockOut);
  const dayTotalHours = completedSessions.reduce((sum, s) => {
    const h = s.clockIn && s.clockOut
      ? (new Date(s.clockOut) - new Date(s.clockIn)) / 3600000
      : parseFloat(s.duration) || 0;
    return sum + (isFinite(h) ? h : 0);
  }, 0);

  return (
    <AppLayout clockedIn={clockedIn}>
      <div className="page-header">
        <h1>Time</h1>
      </div>

      {/* Hours Worked Card */}
      <div className="section-card">
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Hours Worked</div>
        {loading ? (
          <Spin size="small" />
        ) : (
          <div style={{ fontSize: 32, fontWeight: 800, color: '#22c55e' }}>
            {Math.floor(totalHoursMonth)} Hours
          </div>
        )}
      </div>

      {/* Custom Calendar */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <LeftOutlined style={{ fontSize: 14, color: '#555' }} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            {currentMonth.format('MMMM YYYY')}
          </span>
          <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <RightOutlined style={{ fontSize: 14, color: '#555' }} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', fontWeight: 600, padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spin /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {(() => {
              const startOfMonth = currentMonth.startOf('month');
              const startDay = startOfMonth.day();
              const daysInMonth = currentMonth.daysInMonth();
              const cells = [];

              // Empty cells before month start
              for (let i = 0; i < startDay; i++) {
                const d = startOfMonth.subtract(startDay - i, 'day');
                cells.push(
                  <div key={`pre-${i}`} style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                    <div style={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: '#ddd',
                    }}>{d.date()}</div>
                  </div>
                );
              }

              // Month days
              for (let day = 1; day <= daysInMonth; day++) {
                const d = currentMonth.date(day);
                const dateStr = d.format('YYYY-MM-DD');
                const hasSession = activeDates.has(dateStr);
                const isToday = d.isSame(dayjs(), 'day');
                const isSelected = d.isSame(selectedDate, 'day');

                cells.push(
                  <div
                    key={`day-${day}`}
                    style={{ display: 'flex', justifyContent: 'center', padding: '2px 0', cursor: 'pointer' }}
                    onClick={() => handleDateSelect(d)}
                  >
                    <div style={{
                      width: 32, height: 32,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%',
                      background: isSelected ? '#22c55e' : isToday ? '#f0fdf4' : 'transparent',
                      border: isToday && !isSelected ? '2px solid #22c55e' : 'none',
                      fontSize: 13,
                      fontWeight: isSelected || isToday ? 700 : 400,
                      color: isSelected ? '#fff' : '#111',
                      position: 'relative',
                    }}>
                      {day}
                      {hasSession && !isSelected && (
                        <span style={{
                          position: 'absolute', bottom: 2,
                          width: 4, height: 4, borderRadius: '50%',
                          background: '#22c55e', left: '50%', transform: 'translateX(-50%)',
                        }} />
                      )}
                    </div>
                  </div>
                );
              }

              return cells;
            })()}
          </div>
        )}
      </div>

      {/* Clock-In History for selected day */}
      <div className="section-card">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 12 }}>
          Clock-In History
          <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400, marginLeft: 8 }}>
            {selectedDate.format('MMM D, YYYY')}
          </span>
        </div>

        {dayLoading ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}><Spin size="small" /></div>
        ) : daySessions.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '16px 0', fontSize: 13 }}>
            No sessions on this day
          </div>
        ) : (
          <>
            {daySessions.map((session, idx) => (
              <React.Fragment key={session.id || idx}>
                <div className="clock-history-item">
                  <span className="clock-history-label">Clock-In</span>
                  <span className="clock-history-time">
                    {session.clockIn ? formatTime(session.clockIn) : '—'}
                  </span>
                </div>
                <div className="clock-history-item">
                  <span className="clock-history-label">Clock Out</span>
                  <span className="clock-history-time" style={{ color: !session.clockOut ? '#22c55e' : undefined }}>
                    {session.clockOut ? formatTime(session.clockOut) : 'Active'}
                  </span>
                </div>
                {idx < daySessions.length - 1 && (
                  <div style={{ textAlign: 'center', margin: '6px 0' }}>
                    <span className="break-chip">Meal break</span>
                  </div>
                )}
              </React.Fragment>
            ))}

            {dayTotalHours > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f5f5f5', marginTop: 8 }}>
                <span style={{ fontWeight: 600, color: '#111' }}>Total hours</span>
                <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 16 }}>
                  {formatHours(dayTotalHours)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {error && <div className="error-container">{error}</div>}
    </AppLayout>
  );
};

export default Time;
