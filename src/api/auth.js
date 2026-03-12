import apiClient from './client';

export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data.data;
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data.data;
};

export const updateProfile = async (updates) => {
  const res = await apiClient.put('/auth/profile', updates);
  return res.data.data;
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const res = await apiClient.post('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return res.data.data;
};

export const getAllUsers = async ({ pageSize, offset } = {}) => {
  const params = {};
  if (pageSize) params.pageSize = pageSize;
  if (offset) params.offset = offset;
  const res = await apiClient.get('/auth/users', { params });
  return res.data.data;
};

export const registerUser = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data.data;
};
