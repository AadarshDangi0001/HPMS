import api from './api';

export const getDoctors = (activeOnly = false) =>
  api.get('/doctors', { params: activeOnly ? { activeOnly: true } : {} });
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const createDoctor = (payload) => api.post('/doctors', payload);
export const updateDoctorAvailability = (id, isAvailable) =>
  api.patch(`/doctors/${id}/availability`, { isAvailable });
