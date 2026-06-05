import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const user = localStorage.getItem('tripUser');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trips
export const getTrips = (params) => API.get('/trips', { params });
export const getTrip = (id) => API.get(`/trips/${id}`);
export const seedTrips = () => API.post('/trips/seed/demo');
export const createTrip = (data) => API.post('/trips', data);
export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);
export const deleteTrip = (id) => API.delete(`/trips/${id}`);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const createAdmin = (data) => API.post('/auth/create-admin', data);

// Users (admin)
export const getAllUsers = () => API.get('/auth/users');
export const updateUser = (id, data) => API.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const getAllBookings = () => API.get('/bookings/all');
export const activateBooking = (id) => API.put(`/bookings/${id}/activate`);
export const confirmBooking = (id, data) => API.put(`/bookings/${id}/confirm`, data);
export const rejectBooking = (id, data) => API.put(`/bookings/${id}/reject`, data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);
export const markNotificationRead = (id) => API.put(`/bookings/${id}/read`);

export default API;
