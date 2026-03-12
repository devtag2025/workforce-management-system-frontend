import apiClient from './client';

export const getEmployeesList = async ({ pageSize, offset } = {}) => {
  const params = {};
  if (pageSize) params.pageSize = pageSize;
  if (offset) params.offset = offset;
  const res = await apiClient.get('/employees', { params });
  return res.data.data;
};

export const getEmployeeById = async (id, includeEarnings = false) => {
  const params = {};
  if (includeEarnings) params.includeEarnings = '1';
  const res = await apiClient.get(`/employees/${id}`, { params });
  return res.data.data;
};

export const updateEmployee = async (id, updates) => {
  const res = await apiClient.patch(`/employees/${id}`, updates);
  return res.data.data;
};
