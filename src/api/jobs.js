import apiClient from './client';

export const getMyJobs = async ({ status, pageSize, offset } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (pageSize) params.pageSize = pageSize;
  if (offset) params.offset = offset;
  const res = await apiClient.get('/jobs/my-jobs', { params });
  return res.data.data;
};

export const getMyJobById = async (id) => {
  const res = await apiClient.get(`/jobs/my-jobs/${id}`);
  return res.data.data;
};

export const updateJobStatus = async (id, status) => {
  const res = await apiClient.patch(`/jobs/my-jobs/${id}/status`, { status });
  return res.data.data;
};

export const getAllJobs = async ({ status, assignedTo, pageSize, offset } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (assignedTo) params.assignedTo = assignedTo;
  if (pageSize) params.pageSize = pageSize;
  if (offset) params.offset = offset;
  const res = await apiClient.get('/jobs', { params });
  return res.data.data;
};

export const getJobById = async (id) => {
  const res = await apiClient.get(`/jobs/${id}`);
  return res.data.data;
};

export const createJob = async (jobData) => {
  const res = await apiClient.post('/jobs', jobData);
  return res.data.data;
};

export const updateJob = async (id, jobData) => {
  const res = await apiClient.patch(`/jobs/${id}`, jobData);
  return res.data.data;
};
