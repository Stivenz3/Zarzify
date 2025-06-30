import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import businessReducer from './slices/businessSlice';
import inventoryReducer from './slices/inventorySlice';
import clientsReducer from './slices/clientsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    business: businessReducer,
    inventory: inventoryReducer,
    clients: clientsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 