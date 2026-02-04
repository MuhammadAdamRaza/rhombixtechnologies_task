import axios from 'axios';

const api = axios.create({
    // Use relative path '/api'. 
    // In Dev: Vite proxy handles it. 
    // In Prod: Flask serves it directly.
    baseURL: '/api',
});

// Request Interceptor: Attach access token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token");

                // Use the same base URL logic or relative path
                const res = await axios.post('/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });

                const newAccessToken = res.data.access_token;
                localStorage.setItem('access_token', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Silent redirect or error handling
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
