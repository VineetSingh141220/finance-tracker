import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// --- Token management ---
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

export const setToken = (token: string | null) => {
    accessToken = token;
};

export const getToken = () => accessToken;

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(p => {
        if (error) p.reject(error);
        else p.resolve(token);
    });
    failedQueue = [];
};

// --- Request interceptor ---
api.interceptors.request.use(cfg => {
    if (accessToken) {
        cfg.headers.Authorization = `Bearer ${accessToken}`;
    }
    return cfg;
});

// --- Response interceptor ---
api.interceptors.response.use(
    res => res,
    async err => {
        const orig = err.config;

        // handle 401 TOKEN_EXPIRED
        if (err.response?.status === 401 && err.response?.data?.message === 'TOKEN_EXPIRED' && !orig._retry) {
            if (isRefreshing) {
                // queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    orig.headers.Authorization = `Bearer ${token}`;
                    return api(orig);
                });
            }

            orig._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.post('/auth/refresh');
                const newToken = data.data.accessToken;
                setToken(newToken);
                processQueue(null, newToken);

                orig.headers.Authorization = `Bearer ${newToken}`;
                return api(orig);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                setToken(null);
                // redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(err);
    }
);

export default api;
