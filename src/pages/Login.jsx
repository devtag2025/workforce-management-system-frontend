import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider, Tabs, Select } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, registerUser } from '../api/auth';
import useAuthStore from '../store/authStore';

const LABEL_STYLE = { fontSize: 13, fontWeight: 600, color: '#555' };
const BUTTON_STYLE = {
  marginTop: 8,
  height: 48,
  fontSize: 15,
  fontWeight: 700,
  borderRadius: 12,
  background: '#22c55e',
  border: 'none',
};

const ROLE_OPTIONS = [
  { value: 'Manager', label: 'Manager' },
  { value: 'Technician', label: 'Technician' },
];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onLoginFinish = async ({ email, password }) => {
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

  const onRegisterFinish = async ({ fullName, email, password, role }) => {
    setLoading(true);
    setError('');
    try {
      const data = await registerUser({ fullName, email, password, role });
      setAuth(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (key) => {
    setActiveTab(key);
    setError('');
    if (key === 'login') loginForm.resetFields();
    else registerForm.resetFields();
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
          <p>{activeTab === 'login' ? 'Sign in to your account' : 'Create an account'}</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={switchTab}
          centered
          size="large"
          className="auth-tabs"
          items={[
            { key: 'login', label: 'Sign In' },
            { key: 'register', label: 'Register' },
          ]}
          style={{ marginBottom: 8 }}
        />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
          />
        )}

        {activeTab === 'login' && (
          <Form form={loginForm} onFinish={onLoginFinish} layout="vertical" requiredMark={false}>
            <Form.Item
              name="email"
              label={<span style={LABEL_STYLE}>Email</span>}
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
              label={<span style={LABEL_STYLE}>Password</span>}
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
              style={BUTTON_STYLE}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>
        )}

        {activeTab === 'register' && (
          <Form form={registerForm} onFinish={onRegisterFinish} layout="vertical" requiredMark={false} className="register-form">
            <Form.Item
              name="fullName"
              label={<span style={LABEL_STYLE}>Full name</span>}
              rules={[{ required: true, message: 'Full name is required' }]}
            >
              <Input
                prefix={<IdcardOutlined style={{ color: '#aaa' }} />}
                placeholder="John Manager"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={LABEL_STYLE}>Email</span>}
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
              label={<span style={LABEL_STYLE}>Password</span>}
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#aaa' }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span style={LABEL_STYLE}>Confirm password</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#aaa' }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={<span style={LABEL_STYLE}>Role</span>}
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select
                placeholder="Select role"
                size="large"
                options={ROLE_OPTIONS}
                allowClear={false}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={BUTTON_STYLE}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </Form>
        )}

        <Divider style={{ margin: '24px 0 16px' }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>Workforce Management System</span>
        </Divider>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', margin: 0 }}>
          {activeTab === 'login' ? 'Contact your manager if you need access' : 'Already have an account? Sign in above.'}
        </p>
      </div>
    </div>
  );
};

export default Login;
