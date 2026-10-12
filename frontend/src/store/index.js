import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import placesReducer from './slices/placesSlice';
import alertsReducer from './slices/alertsSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    alerts: alertsReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
      },
    }),
});

export default store;