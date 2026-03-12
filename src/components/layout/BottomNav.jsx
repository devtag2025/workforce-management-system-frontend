import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';

const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const navItems = [
  { path: '/', label: 'Home', Icon: HomeOutlined },
  { path: '/jobs', label: 'Jobs', Icon: BriefcaseIcon },
  { path: '/time', label: 'Time', Icon: ClockCircleOutlined },
  { path: '/earnings', label: 'Earnings', Icon: DollarOutlined },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, label, Icon }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
            style={{ background: 'none', border: 'none' }}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
