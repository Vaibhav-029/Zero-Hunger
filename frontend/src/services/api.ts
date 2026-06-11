import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Models based on Backend
export interface User {
  id?: number;
  username: string;
  password?: string;
  role: 'DONOR' | 'NGO' | 'DRIVER' | 'ADMIN';
  email?: string;
  contactNumber?: string;
}

export interface FoodDonation {
  id?: number;
  foodName: string;
  quantity: number;
  expiryTime: string;
  status?: string;
  donorId?: number; // assuming mapped to user
}

export interface NgoRequest {
  id?: number;
  foodDonation: { id: number };
  ngo: { id: number };
  requestStatus?: string;
  quantityRequested: number;
}

export interface Truck {
  id?: number;
  truckNumber: string;
  driver: { id: number };
  isAvailable?: boolean;
}

// Auth API
export const loginUser = (data: Partial<User>) => api.post('/auth/login', data);
export const registerUser = (data: User) => api.post('/auth/register', data);

// Food API
export const donateFood = (data: FoodDonation) => api.post('/food/donate', data);
export const getAllFood = () => api.get('/food/all');
export const getUrgentFood = () => api.get('/food/urgent');

// Impact API
export const getImpactStats = () => api.get('/impact/stats');

// Logistics API
export const getAvailableTrucks = () => api.get('/logistics/trucks/available');
export const assignTruck = (data: Truck) => api.post('/logistics/assign', data);
export const completeDelivery = (requestId: number) => api.post(`/logistics/delivery/complete/${requestId}`);

// NGO Requests API
export const claimFood = (data: NgoRequest) => api.post('/requests/claim', data);
export const getAllRequests = () => api.get('/requests/all');

export default api;
