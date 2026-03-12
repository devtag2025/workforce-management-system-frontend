import React, { useState, useEffect } from 'react';
import { message, Form, Input, Button, Modal, Switch, Select, InputNumber, Divider, Spin, Alert } from 'antd';
import { LeftOutlined, RightOutlined, EditOutlined, UserAddOutlined, TeamOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { getMe, updateProfile, changePassword, getAllUsers, registerUser } from '../api/auth';
import { getEmployeesList, updateEmployee } from '../api/employees';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils/formatters';

const DEALERSHIPS = ['BMW', 'BMW Collision', 'Jaguar', 'Toyota'];
const DEPARTMENTS = ['Sales', 'Service', 'Parts', 'Detail', 'PPF', 'Tint', 'Management'];
const ROLES = ['Technician', 'Manager', 'Level 1', 'Level 2', 'Level 3'];

// ─── Sub-views ────────────────────────────────────────────────────────────────

const EditProfile = ({ user, onBack, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      fullName: user?.name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role || user?.title,
    });
  }, [user, form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const result = await updateProfile({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
      });
      message.success('Profile updated');
      onSave(result);
      setEditing(false);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        <button onClick={onBack} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <LeftOutlined style={{ fontSize: 14 }} />
        </button>
        <div>
          <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>User Portal</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Settings</h2>
        </div>
      </div>

      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{user?.name || '—'}</div>
              <span className={`role-chip role-${(user?.role || 'user').toLowerCase()}`}>
                {user?.role || 'USER'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
          >
            <EditOutlined style={{ fontSize: 16, color: '#555' }} />
          </button>
        </div>

        {!editing ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#888', fontSize: 14 }}>Phone</span>
              <span style={{ color: '#111', fontSize: 14, fontWeight: 500 }}>{user?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: '#888', fontSize: 14 }}>Email</span>
              <span style={{ color: '#111', fontSize: 14, fontWeight: 500 }}>{user?.email || '—'}</span>
            </div>
          </>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item name="fullName" label="First name (Full name)">
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input placeholder="Email" type="email" />
              </Form.Item>
            </div>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Phone number" />
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Input disabled value={user?.role} style={{ background: '#f5f5f5' }} />
            </Form.Item>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setEditing(false)} style={{ flex: 1, borderRadius: 10, height: 44 }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1, background: '#22c55e', border: 'none', borderRadius: 10, height: 44 }}>
                Save profile
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

const AddUser = ({ onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState('BMW');
  const [isStaff, setIsStaff] = useState(true);

  const handleCreate = async (values) => {
    setLoading(true);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        fullName: `${values.firstName} ${values.lastName}`,
        role: values.role,
        phone: values.phone,
        department: values.department,
        dealership: selectedDealership,
        hourlyRate: values.hourlyRate,
      });
      message.success('User created successfully');
      form.resetFields();
      onBack();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        <button onClick={onBack} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <LeftOutlined style={{ fontSize: 14 }} />
        </button>
        <div>
          <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>User Portal</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Add User</h2>
        </div>
      </div>

      <div className="section-card">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          {/* Dealership selector */}
          <Form.Item label={<span style={{ fontSize: 13, color: '#555' }}>Dealership <span style={{ color: '#aaa', fontWeight: 400 }}>Select one or more</span></span>}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEALERSHIPS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`dealership-chip ${selectedDealership === d ? 'selected' : ''}`}
                  onClick={() => setSelectedDealership(d)}
                >
                  <span className="dealership-dot" />
                  {d}
                </button>
              ))}
            </div>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              Staff User?
            </span>
            <Switch checked={isStaff} onChange={setIsStaff} style={{ background: isStaff ? '#22c55e' : '#d9d9d9' }} />
          </div>

          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} placeholder="Select department" />
          </Form.Item>

          <Form.Item name="role" label={<span>Job Title <span style={{ color: '#22c55e', fontSize: 12 }}>Admin only</span></span>} rules={[{ required: true }]}>
            <Select options={ROLES.map((r) => ({ value: r, label: r }))} placeholder="Select role" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="firstName" label="First" rules={[{ required: true }]}>
              <Input placeholder="" />
            </Form.Item>
            <Form.Item name="lastName" label="Last" rules={[{ required: true }]}>
              <Input placeholder="" />
            </Form.Item>
          </div>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="" type="tel" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input placeholder="" type="email" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Min. 6 characters" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="hourlyRate" label="Hourly Rate">
              <InputNumber
                prefix="$"
                min={0}
                step={0.5}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="commissionPct" label="Commission %">
              <InputNumber
                min={0}
                max={100}
                suffix="%"
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item name="dailyGoal" label="Daily Goal">
            <InputNumber prefix="$" min={0} placeholder="0.00" style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button onClick={onBack} style={{ flex: 1, borderRadius: 10, height: 44 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}
              style={{ flex: 1, background: '#22c55e', border: 'none', borderRadius: 10, height: 44 }}>
              Create user
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

const ManageUsers = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEmployeesList({ pageSize: 100 });
        setUsers(data.employees || data || []);
      } catch {
        try {
          const data = await getAllUsers({ pageSize: 100 });
          setUsers(data.users || []);
        } catch (err) {
          message.error('Failed to load users: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openEdit = (u) => {
    setEditUser(u);
    editForm.setFieldsValue({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role || u.title,
      department: u.department,
      hourlyRate: u.hourlyRate,
    });
  };

  const handleSaveUser = async (values) => {
    setEditLoading(true);
    try {
      await updateEmployee(editUser.id, {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        department: values.department,
        hourlyRate: values.hourlyRate,
      });
      setUsers((prev) =>
        prev.map((u) => u.id === editUser.id ? { ...u, ...values, fullName: values.fullName } : u)
      );
      message.success('User updated');
      setEditUser(null);
    } catch (err) {
      message.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        <button onClick={onBack} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <LeftOutlined style={{ fontSize: 14 }} />
        </button>
        <div>
          <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>User Portal</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Manage Users</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><Spin /></div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {users.map((u) => (
            <div key={u.id} className="manage-user-card" onClick={() => openEdit(u)} style={{ cursor: 'pointer' }}>
              <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                {getInitials(u.fullName || u.name)}
              </div>
              <div className="manage-user-info">
                <div className="manage-user-name">{u.fullName || u.name || '—'}</div>
                <div className="manage-user-email">{u.email || '—'}</div>
                {u.role && (
                  <span className={`role-chip role-${(u.role || 'user').toLowerCase()}`} style={{ fontSize: 10 }}>
                    {u.role}
                  </span>
                )}
              </div>
              <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
            </div>
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={!!editUser}
        onCancel={() => setEditUser(null)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveUser}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input type="tel" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item name="department" label="Department">
            <Select options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
          </Form.Item>
          <Form.Item name="hourlyRate" label="Hourly Rate">
            <InputNumber prefix="$" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => setEditUser(null)} style={{ flex: 1 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={editLoading}
              style={{ flex: 1, background: '#22c55e', border: 'none' }}>
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// ─── Main Settings ─────────────────────────────────────────────────────────

const Settings = () => {
  const { user, setUser, logout, isManager } = useAuthStore();
  const manager = isManager();
  const navigate = useNavigate();
  const [view, setView] = useState('main');
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdForm] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await getMe();
        setProfileData(me);
        setUser(me);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleProfileSave = (updated) => {
    setProfileData(updated);
    setUser(updated);
  };

  const handleChangePassword = async (values) => {
    setPwdLoading(true);
    try {
      await changePassword(values.currentPassword, values.newPassword, values.confirmPassword);
      message.success('Password changed successfully');
      setPwdModal(false);
      pwdForm.resetFields();
    } catch (err) {
      message.error(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  if (view === 'editProfile') {
    return (
      <div className="app-shell">
        <div className="page-content">
          <EditProfile user={profileData} onBack={() => setView('main')} onSave={handleProfileSave} />
        </div>
      </div>
    );
  }

  if (view === 'addUser') {
    return (
      <div className="app-shell">
        <div className="page-content">
          <AddUser onBack={() => setView('main')} />
        </div>
      </div>
    );
  }

  if (view === 'manageUsers') {
    return (
      <div className="app-shell">
        <div className="page-content">
          <ManageUsers onBack={() => setView('main')} />
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <LeftOutlined style={{ fontSize: 14 }} />
        </button>
        <div>
          <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>User Portal</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Settings</h2>
        </div>
      </div>

      {/* Profile Card */}
      <div className="section-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}><Spin size="small" /></div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="profile-avatar">{getInitials(profileData?.name)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{profileData?.name || '—'}</div>
                  <span className={`role-chip role-${(profileData?.role || 'user').toLowerCase()}`}>
                    {profileData?.role || 'USER'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setView('editProfile')}
                style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                <EditOutlined style={{ fontSize: 16, color: '#555' }} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#888', fontSize: 14 }}>Phone</span>
              <span style={{ color: '#111', fontSize: 14 }}>{profileData?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: '#888', fontSize: 14 }}>Email</span>
              <span style={{ color: '#111', fontSize: 14 }}>{profileData?.email || '—'}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {manager && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>Actions</div>

          <div className="settings-list-item" onClick={() => setView('addUser')}>
            <div>
              <div className="settings-item-title">Add User</div>
              <div className="settings-item-subtitle">Create a new user account</div>
            </div>
            <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
          </div>

          <div className="settings-list-item" onClick={() => setView('manageUsers')}>
            <div>
              <div className="settings-item-title">Manage Users</div>
              <div className="settings-item-subtitle">Edit roles and access</div>
            </div>
            <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
          </div>

          <div className="settings-list-item" onClick={() => message.info('Service management coming soon')}>
            <div>
              <div className="settings-item-title">Create New Service</div>
              <div className="settings-item-subtitle">Add service options for jobs</div>
            </div>
            <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
          </div>
        </div>
      )}

      {/* Password & Account */}
      <div style={{ padding: '8px 16px 0' }}>
        <Divider style={{ margin: '8px 0 12px' }} />

        <div className="settings-list-item" onClick={() => setPwdModal(true)}>
          <div>
            <div className="settings-item-title">Change Password</div>
            <div className="settings-item-subtitle">Update your account password</div>
          </div>
          <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '14px',
            background: '#fef2f2',
            color: '#dc2626',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={pwdModal}
        onCancel={() => { setPwdModal(false); pwdForm.resetFields(); }}
        footer={null}
      >
        <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }, ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
              return Promise.reject(new Error('Passwords do not match'));
            },
          })]}>
            <Input.Password />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => { setPwdModal(false); pwdForm.resetFields(); }} style={{ flex: 1 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={pwdLoading}
              style={{ flex: 1, background: '#22c55e', border: 'none' }}>
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default Settings;
