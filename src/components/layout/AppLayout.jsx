import React from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

const AppLayout = ({ children, clockedIn = false, hideNav = false }) => {
  return (
    <div className="app-shell">
      <TopBar clockedIn={clockedIn} />
      <main className="page-content">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
