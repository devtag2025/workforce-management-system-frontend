import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const onFinish = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      setAuth(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
          }}>
            <span style={{ fontSize: 28, color: '#fff' }}>⚙</span>
          </div>
          <h1>Workforce Portal</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
          />
        )}

        <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            label={<span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Email</span>}
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#aaa' }} />}
              placeholder="you@example.com"
              size="large"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Password</span>}
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#aaa' }} />}
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              marginTop: 8,
              height: 48,
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 12,
              background: '#22c55e',
              border: 'none',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <Divider style={{ margin: '24px 0 16px' }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>Workforce Management System</span>
        </Divider>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', margin: 0 }}>
          Contact your manager if you need access
        </p>
      </div>
    </div>
  );
};

export default Login;
