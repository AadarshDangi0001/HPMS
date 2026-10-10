import api from './api';

export const getBeds = () => api.get('/beds');
export const updateBedStatus = (id, status, patientId) =>
  api.patch(`/beds/${id}/status`, { status, patientId });
