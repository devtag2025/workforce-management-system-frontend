import apiClient from './client';

export const clockIn = async (jobId) => {
  const res = await apiClient.post('/time/clock-in', { jobId });
  return res.data.data;
};

export const clockOut = async () => {
  const res = await apiClient.post('/time/clock-out');
  return res.data.data;
};

export const getClockStatus = async () => {
  const res = await apiClient.get('/time/status');
  return res.data.data;
};

export const getTimeLogs = async ({ startDate, endDate, pageSize, offset } = {}) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (pageSize) params.pageSize = pageSize;
  if (offset) params.offset = offset;
  const res = await apiClient.get('/time/logs', { params });
  return res.data.data;
};

export const getToday = async () => {
  const res = await apiClient.get('/time/today');
  return res.data.data;
};

export const getDailySummary = async (date) => {
  const path = date ? `/time/summary/${date}` : '/time/summary';
  const res = await apiClient.get(path);
  return res.data.data;
};
