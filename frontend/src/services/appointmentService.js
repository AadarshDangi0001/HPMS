import api from './api';

export const getAppointments = (status = 'All') =>
  api.get('/appointments', { params: status && status !== 'All' ? { status } : {} });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (payload) => api.post('/appointments', payload);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status });
