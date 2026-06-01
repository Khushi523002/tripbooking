import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach token from localStorage on every request
API.interceptors.request.use((config) => {
  const user = localStorage.getItem('tripUser');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTrips = (params) => API.get('/trips', { params });
export const getTrip = (id) => API.get(`/trips/${id}`);
export const seedTrips = () => API.post('/trips/seed/demo');

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);

export default API;