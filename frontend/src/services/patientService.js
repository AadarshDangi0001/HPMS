import api from './api';

export const getPatients = (search = '') => api.get('/patients', { params: search ? { search } : {} });
export const getPatientById = (id) => api.get(`/patients/${id}`);
export const createPatient = (payload) => api.post('/patients', payload);
