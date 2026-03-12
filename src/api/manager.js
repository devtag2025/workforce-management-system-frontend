import apiClient from './client';

export const getTechniciansList = async () => {
  const res = await apiClient.get('/manager/technicians');
  return res.data.data;
};

export const getTechnicianTimeLogs = async ({ userId, startDate, endDate, pageSize, offset } = {}) => {
  const params = { userId };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (pageSize) params.pageSize = pageSize;
  if (offset) params.offset = offset;
  const res = await apiClient.get('/manager/time-logs', { params });
  return res.data.data;
};

export const getTechnicianEarnings = async ({ userId, period, start, end } = {}) => {
  const params = { userId };
  if (period) params.period = period;
  if (start) params.start = start;
  if (end) params.end = end;
  const res = await apiClient.get('/manager/earnings', { params });
  return res.data.data;
};
