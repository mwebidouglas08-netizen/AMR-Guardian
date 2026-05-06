import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

export const fetchStats = () => api.get('/stats').then(r => r.data);
export const fetchAlerts = (params) => api.get('/alerts', { params }).then(r => r.data);
export const fetchRegionalResistance = () => api.get('/resistance/regional').then(r => r.data);
export const fetchPathogenResistance = () => api.get('/resistance/pathogens').then(r => r.data);
export const fetchAntibiogram = () => api.get('/antibiogram').then(r => r.data);
export const fetchOutbreakSignals = () => api.get('/outbreak/signals').then(r => r.data);
export const runPrediction = (data) => api.post('/predict', data).then(r => r.data);
export const getStewardship = (data) => api.post('/stewardship', data).then(r => r.data);
export const sendChatMessage = (message, conversationHistory = []) =>
  api.post('/chat', { message, conversationHistory }).then(r => r.data);
export const generateReport = (reportType) =>
  api.post('/reports/generate', { reportType }).then(r => r.data);

export default api;
