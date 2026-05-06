import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Stats
export const fetchStats = () => api.get('/stats').then(r => r.data);

// Alerts
export const fetchAlerts = (params) => api.get('/alerts', { params }).then(r => r.data);

// Regional resistance
export const fetchRegionalResistance = () => api.get('/resistance/regional').then(r => r.data);

// Pathogen resistance
export const fetchPathogenResistance = () => api.get('/resistance/pathogens').then(r => r.data);

// Antibiogram
export const fetchAntibiogram = () => api.get('/antibiogram').then(r => r.data);

// Outbreak signals
export const fetchOutbreakSignals = () => api.get('/outbreak/signals').then(r => r.data);

// AMR Prediction
export const runPrediction = (data) => api.post('/predict', data).then(r => r.data);

// Stewardship
export const getStewardship = (data) => api.post('/stewardship', data).then(r => r.data);

// Chat
export const sendChatMessage = (message, conversationHistory = []) =>
  api.post('/chat', { message, conversationHistory }).then(r => r.data);

// Reports
export const generateReport = (reportType) =>
  api.post('/reports/generate', { reportType }).then(r => r.data);

export default api;
