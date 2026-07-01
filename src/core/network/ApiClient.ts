import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from './TokenManager';
import Logger from '../logger/Logger';

// Base URL would typically come from react-native-config or Expo env
const BASE_URL = 'https://api.vms-enterprise.mock';

const ApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

ApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await TokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Logger.error('Request Interceptor Error', error);
    return Promise.reject(error);
  }
);

ApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle Token Expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return ApiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        // No refresh token, force logout
        Logger.warn('No refresh token available. Forcing logout.');
        // Event emitter to trigger global logout can be placed here
        return Promise.reject(error);
      }

      try {
        // Mock Refresh Token Call (Since this is a mock repo setup, we'll bypass actual network)
        Logger.info('Attempting to refresh token...');
        // const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        // const { accessToken, newRefreshToken } = response.data;
        const accessToken = 'mock_new_access_token';
        const newRefreshToken = 'mock_new_refresh_token';

        await TokenManager.saveTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        processQueue(null, accessToken);
        return ApiClient(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        Logger.error('Failed to refresh token', err);
        // Force logout on refresh failure
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Global Error Handling
    Logger.error(`API Error: ${error.message}`, error);
    return Promise.reject(error);
  }
);

export default ApiClient;
