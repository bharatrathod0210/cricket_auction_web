import axios from 'axios';

// Use Vercel backend URL for production, localhost for development
const API_BASE = import.meta.env.PROD 
    ? 'https://rpl-backend.vercel.app/api' 
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Add token to every request if exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('rpl_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('rpl_token');
            localStorage.removeItem('rpl_admin');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Teams
export const teamsAPI = {
    getAll: () => api.get('/teams'),
    getOne: (id) => api.get(`/teams/${id}`),
    create: (data) => api.post('/teams', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/teams/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/teams/${id}`)
};

// Players
export const playersAPI = {
    getAll: (params) => api.get('/players', { params }),
    getOne: (id) => api.get(`/players/${id}`),
    register: (data) => api.post('/players/register', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getLeaderboard: () => api.get('/players/leaderboard'),
    // Admin
    getRegistrations: (params) => api.get('/players/admin/registrations', { params }),
    approve: (id) => api.put(`/players/admin/registrations/${id}/approve`),
    reject: (id) => api.put(`/players/admin/registrations/${id}/reject`),
    addManual: (data) => api.post('/players/admin/add', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/players/admin/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    toggleIconPlayer: (id) => api.put(`/players/admin/${id}/toggle-icon`),
    resetForAuction: () => api.put('/players/admin/reset-for-auction'),
    resetSinglePlayer: (id) => api.put(`/players/admin/${id}/reset`),
    delete: (id) => api.delete(`/players/admin/${id}`)
};

// Matches
export const matchesAPI = {
    getAll: (params) => api.get('/matches', { params }),
    getOne: (id) => api.get(`/matches/${id}`),
    create: (data) => api.post('/matches', data),
    update: (id, data) => api.put(`/matches/${id}`, data),
    delete: (id) => api.delete(`/matches/${id}`)
};

// Auction
export const auctionAPI = {
    get: () => api.get('/auction'),
    create: (data) => api.post('/auction', data),
    start: (id) => api.put(`/auction/${id}/start`),
    stop: (id) => api.put(`/auction/${id}/stop`),
    reset: (id) => api.put(`/auction/${id}/reset`),
    moveToNext: (id, playerId) => api.put(`/auction/${id}/move-to-next`, { playerId }),
    reorderQueue: (id, playerQueue) => api.put(`/auction/${id}/reorder-queue`, { playerQueue }),
    placeBid: (data) => api.post('/auction/bid', data),
    sell: (data) => api.post('/auction/sell', data),
    markUnsold: (data) => api.post('/auction/unsold', data),
    getBids: (auctionId) => api.get(`/auction/${auctionId}/bids`)
};

// Payments
export const paymentsAPI = {
    getAll: (params) => api.get('/payments', { params }),
    update: (id, data) => api.put(`/payments/${id}`, data),
    getRevenue: () => api.get('/payments/revenue')
};

// Announcements
export const announcementsAPI = {
    getAll: () => api.get('/announcements'),
    create: (data) => api.post('/announcements', data),
    update: (id, data) => api.put(`/announcements/${id}`, data),
    delete: (id) => api.delete(`/announcements/${id}`)
};

// Admin
export const adminAPI = {
    login: (data) => api.post('/admin/login', data),
    setup: (data) => api.post('/admin/register', data),
    profile: () => api.get('/admin/profile'),
    getDashboard: () => api.get('/dashboard/stats'),
    updateUpiId: (data) => api.put('/admin/upi', data),
    getUpiId: () => api.get('/admin/upi')
};

export default api;
