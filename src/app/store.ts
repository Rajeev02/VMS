import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// Future: Import other reducers (visitors, offline queue, etc)

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Useful if we store complex objects or for offline queues later
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
