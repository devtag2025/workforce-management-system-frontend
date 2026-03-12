import React, { useState, useEffect } from 'react';
import { formatElapsed } from '../../utils/formatters';

const SIZE = 220;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const ClockRing = ({ clockedIn, clockInTime, onToggle, loading }) => {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!clockedIn || !clockInTime) {
      setElapsed('00:00:00');
      setProgress(0);
      return;
    }
    const update = () => {
      setElapsed(formatElapsed(clockInTime));
      const diffMs = Date.now() - new Date(clockInTime).getTime();
      const maxMs = 9 * 60 * 60 * 1000;
      setProgress(Math.min(1, diffMs / maxMs));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [clockedIn, clockInTime]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="clock-ring-container" style={{ flexDirection: 'column', gap: 0 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={STROKE}
          />
          {clockedIn && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="#22c55e"
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          )}
          {!clockedIn && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth={STROKE}
              strokeDasharray="4 8"
            />
          )}
        </svg>

        {/* Center dot indicator */}
        <div style={{
          position: 'absolute',
          top: STROKE / 2 - 4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: clockedIn ? '#22c55e' : '#ccc',
        }} />

        {/* Inner clickable area */}
        <button
          onClick={onToggle}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: SIZE - STROKE * 4,
            height: SIZE - STROKE * 4,
            borderRadius: '50%',
            background: '#f9fafb',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            transition: 'background 0.2s',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 24, height: 24,
                border: '3px solid #22c55e',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>Please wait</span>
            </>
          ) : (
            <>
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                color: clockedIn ? '#22c55e' : '#888',
                letterSpacing: 1,
              }}>
                {clockedIn ? 'STOP' : 'START'}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#333', letterSpacing: 0.5 }}>
                {elapsed}
              </span>
              <span style={{ fontSize: 11, color: '#aaa' }}>
                {clockedIn ? 'Tap to clock out' : 'Tap to clock in'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClockRing;
