import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const TopBar = ({ clockedIn = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="top-bar">
      <div className="top-bar-user">
        Logged in as: <strong>{user?.name || 'User'}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className={`clock-status-badge ${clockedIn ? 'clocked-in' : ''}`}>
          <span className="clock-status-dot" />
          {clockedIn ? 'Clocked In' : 'Clocked Out'}
        </div>
        <button
          onClick={() => navigate('/settings')}
          style={{
            border: 'none',
            cursor: 'pointer',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: '#f5f5f5',
            transition: 'background 0.2s',
          }}
        >
          <SettingOutlined style={{ fontSize: 18, color: '#555' }} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
