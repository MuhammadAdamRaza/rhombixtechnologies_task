import axios from 'axios';

// 1. Get the URL dynamically from the environment variable
//const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = 'https://rhombixtechnologies-task-5q2f.vercel.app/api';
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token");

                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {}, 
                    {
                        headers: { Authorization: `Bearer ${refreshToken}` }
                    }
                );

                const newAccessToken = response.data.access_token;
                
                // 3. Save new token
                localStorage.setItem('access_token', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                
                return api(originalRequest);
               
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;