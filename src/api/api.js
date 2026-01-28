import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getCustomers = () => axios.get(`${API_BASE}/customers`);
export const getProducts = () => axios.get(`${API_BASE}/products`);
export const getTransactions = () => axios.get(`${API_BASE}/transactions`);

export const addCustomer = data => axios.post(`${API_BASE}/customers`, data);
export const addTransaction = data => axios.post(`${API_BASE}/transactions`, data);

export const addProduct = data => axios.post(`${API_BASE}/products`, data);
export const deleteProduct = id => axios.delete(`${API_BASE}/products/${id}`);
