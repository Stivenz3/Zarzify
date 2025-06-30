import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clients: [],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.clients = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addClient: (state, action) => {
      state.clients.push(action.payload);
    },
    updateClient: (state, action) => {
      const index = state.clients.findIndex(
        (client) => client.id === action.payload.id
      );
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    removeClient: (state, action) => {
      state.clients = state.clients.filter(
        (client) => client.id !== action.payload
      );
    },
  },
});

export const {
  setClients,
  setLoading,
  setError,
  addClient,
  updateClient,
  removeClient,
} = clientsSlice.actions;

export default clientsSlice.reducer; 