import api from './api';

export const getBills = () => api.get('/bills');
export const getBillById = (id) => api.get(`/bills/${id}`);
export const createBill = (payload) => api.post('/bills', payload);
export const markBillPaid = (id) => api.patch(`/bills/${id}/payment`);
