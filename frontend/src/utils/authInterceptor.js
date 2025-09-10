/**
 * Centralized Authentication Interceptor Utility
 * 
 * This utility provides a single, reusable authentication interceptor
 * that handles token refresh logic for all axios instances.
 * 
 * Eliminates the ~75 lines of duplicated code across 3 interceptors.
 */

import axios from 'axios';

/**
 * Creates and applies authentication interceptor to an axios instance
 * @param {AxiosInstance} axiosInstance - The axios instance to enhance
 * @param {string} apiBaseUrl - Base URL for the API (for refresh endpoint)
 * @returns {AxiosInstance} Enhanced axios instance
 */
export const createAuthInterceptor = (axiosInstance, apiBaseUrl) => {
  // Request interceptor - Add auth header to all requests
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle 401s and token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only handle 401 errors and avoid infinite retry loops
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            // No refresh token, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Attempt token refresh
          const response = await axios.post(`${apiBaseUrl}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Update stored tokens
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);

        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use createAuthInterceptor instead
 */
export const addAuthInterceptor = (axiosInstance) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
  return createAuthInterceptor(axiosInstance, apiBaseUrl);
};

export default createAuthInterceptor;
