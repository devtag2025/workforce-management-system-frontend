import apiClient from './client';

export const getEarningsDashboard = async () => {
  const res = await apiClient.get('/earnings/dashboard');
  return res.data.data;
};

export const getEarningsSummary = async ({ period, start, end } = {}) => {
  const params = {};
  if (period) params.period = period;
  if (start) params.start = start;
  if (end) params.end = end;
  const res = await apiClient.get('/earnings/summary', { params });
  return res.data.data;
};

export const getCommissionByJob = async ({ period, start, end } = {}) => {
  const params = {};
  if (period) params.period = period;
  if (start) params.start = start;
  if (end) params.end = end;
  const res = await apiClient.get('/earnings/commission-by-job', { params });
  return res.data.data;
};
