import apiClient from './client';

export const getProductivityDashboard = async () => {
  const res = await apiClient.get('/productivity/dashboard');
  return res.data.data;
};

export const getTodaysGoal = async () => {
  const res = await apiClient.get('/productivity/today');
  return res.data.data;
};

export const getWeeklyProgress = async () => {
  const res = await apiClient.get('/productivity/weekly');
  return res.data.data;
};
