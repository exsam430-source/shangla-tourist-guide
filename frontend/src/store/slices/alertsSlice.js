import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/alerts');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
    },
    resolveAlert: (state, action) => {
      state.alerts = state.alerts.filter((a) => a._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAlerts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAlerts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.alerts = action.payload;
    });
    builder.addCase(fetchAlerts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { addAlert, resolveAlert } = alertsSlice.actions;
export default alertsSlice.reducer;