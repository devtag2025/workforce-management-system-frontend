import React, { useState, useEffect, useCallback } from 'react';
import { message, Spin, Input, Modal, Form, Select, DatePicker, InputNumber, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import AppLayout from '../components/layout/AppLayout';
import JobCard from '../components/jobs/JobCard';
import { getMyJobs, getAllJobs, createJob, updateJob } from '../api/jobs';
import { getEmployeesList } from '../api/employees';
import useAuthStore from '../store/authStore';
import dayjs from 'dayjs';

const STATUS_FILTERS = [
  { label: '●', value: 'all', icon: true },
  { label: '⚡', value: 'In Progress', icon: true },
  { label: '⏸', value: 'Paused', icon: true },
  { label: '✓', value: 'Completed', icon: true },
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

const Jobs = () => {
  const { isManager, user } = useAuthStore();
  const manager = isManager();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);

  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  const loadJobs = useCallback(async (filter) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter && filter !== 'all') params.status = filter;
      const result = manager
        ? await getAllJobs({ ...params, pageSize: 100 })
        : await getMyJobs({ ...params, pageSize: 100 });
      setJobs(result.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [manager]);

  const loadEmployees = useCallback(async () => {
    if (!manager) return;
    try {
      const data = await getEmployeesList({ pageSize: 100 });
      setEmployees(data.employees || data || []);
    } catch {
      setEmployees([]);
    }
  }, [manager]);

  useEffect(() => {
    loadJobs(statusFilter);
    loadEmployees();
  }, [loadJobs, loadEmployees, statusFilter]);

  const handleStatusChange = (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  const handleAssignChange = async (jobId, assignedTo) => {
    try {
      await updateJob(jobId, { assignedTo });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, assignedTo } : j))
      );
      message.success('Job reassigned');
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleCreateJob = async (values) => {
    setCreateLoading(true);
    try {
      const jobData = {
        stockNumber: values.stockNumber,
        vin: values.vin,
        jobType: values.jobType,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
        priority: values.priority,
        assignedTo: values.assignedTo || undefined,
        notes: values.notes || undefined,
        commissionRate: values.commissionRate || undefined,
        status: 'Pending',
      };
      const newJob = await createJob(jobData);
      setJobs((prev) => [newJob, ...prev]);
      setCreateModal(false);
      createForm.resetFields();
      message.success('Job created successfully');
    } catch (err) {
      message.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      j.stockNumber?.toLowerCase().includes(q) ||
      j.vin?.toLowerCase().includes(q) ||
      j.jobType?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Assigned to you
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '4px 0 0' }}>Jobs</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setSearchTerm(searchTerm ? '' : ' ')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <SearchOutlined style={{ fontSize: 20, color: '#555' }} />
          </button>
          {manager && (
            <button className="new-job-btn" onClick={() => setCreateModal(true)}>
              New Job
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {searchTerm !== '' && (
        <div style={{ padding: '0 16px 8px' }}>
          <Input
            placeholder="Search by stock#, VIN, or service…"
            value={searchTerm.trim()}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            allowClear
            style={{ borderRadius: 10 }}
            autoFocus
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending')}
          style={{ fontSize: 16 }}
        >
          👍
        </button>
        <button
          className={`filter-tab ${statusFilter === 'In Progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('In Progress')}
          style={{ fontSize: 16 }}
        >
          ⚡
        </button>
        <button
          className={`filter-tab ${statusFilter === 'Paused' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Paused')}
          style={{ fontSize: 16 }}
        >
          ⏸
        </button>
        <button
          className={`filter-tab ${statusFilter === 'Completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Completed')}
          style={{ fontSize: 16 }}
        >
          ✓
        </button>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 4 }}>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p style={{ marginTop: 12, color: '#aaa' }}>Loading jobs…</p>
          </div>
        ) : error ? (
          <div className="error-container">{error}</div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-container">
            <span style={{ fontSize: 48 }}>📋</span>
            <h3>No jobs found</h3>
            <p>
              {statusFilter !== 'all'
                ? `No ${statusFilter.toLowerCase()} jobs`
                : 'No jobs assigned to you yet'}
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onStatusChange={handleStatusChange}
              onAssignChange={handleAssignChange}
              teamMembers={employees}
            />
          ))
        )}
      </div>

      {/* Create Job Modal (Manager only) */}
      <Modal
        title="Create New Job"
        open={createModal}
        onCancel={() => { setCreateModal(false); createForm.resetFields(); }}
        footer={null}
        width={480}
        style={{ top: 20 }}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateJob}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="stockNumber" label="Stock Number" rules={[{ required: true }]}>
              <Input placeholder="e.g. 859610" />
            </Form.Item>
            <Form.Item name="vin" label="VIN" rules={[{ required: true }]}>
              <Input placeholder="Vehicle VIN" />
            </Form.Item>
          </div>
          <Form.Item name="jobType" label="Job Type" rules={[{ required: true }]}>
            <Input placeholder="e.g. Full Front PPF, Window Tint" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="date" label="Due Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} placeholder="Select" />
            </Form.Item>
          </div>
          <Form.Item name="assignedTo" label="Assign To">
            <Select
              showSearch
              placeholder="Search employee…"
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName || e.name,
              }))}
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
          <Form.Item name="commissionRate" label="Commission Rate ($/hr)">
            <InputNumber style={{ width: '100%' }} min={0} step={0.5} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional notes…" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setCreateModal(false); createForm.resetFields(); }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={createLoading}
              style={{ background: '#22c55e', border: 'none' }}>
              Create Job
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default Jobs;
