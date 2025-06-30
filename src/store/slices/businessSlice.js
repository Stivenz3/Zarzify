import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  businesses: [],
  selectedBusiness: null,
  loading: false,
  error: null,
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setBusinesses: (state, action) => {
      state.businesses = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedBusiness: (state, action) => {
      state.selectedBusiness = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addBusiness: (state, action) => {
      state.businesses.push(action.payload);
    },
    updateBusiness: (state, action) => {
      const index = state.businesses.findIndex(
        (business) => business.id === action.payload.id
      );
      if (index !== -1) {
        state.businesses[index] = action.payload;
      }
    },
    removeBusiness: (state, action) => {
      state.businesses = state.businesses.filter(
        (business) => business.id !== action.payload
      );
      if (state.selectedBusiness?.id === action.payload) {
        state.selectedBusiness = null;
      }
    },
  },
});

export const {
  setBusinesses,
  setSelectedBusiness,
  setLoading,
  setError,
  addBusiness,
  updateBusiness,
  removeBusiness,
} = businessSlice.actions;

export default businessSlice.reducer; 