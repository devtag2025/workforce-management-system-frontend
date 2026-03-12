import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import './styles/global.css';

const theme = {
  token: {
    colorPrimary: '#22c55e',
    colorSuccess: '#22c55e',
    borderRadius: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8f9fa',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 44,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 44,
    },
    Card: {
      borderRadius: 16,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
