import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('shangla_token', data.data.token);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('shangla_token', data.data.token);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const toggleSavePlace = createAsyncThunk(
  'auth/toggleSavePlace',
  async (placeId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/save-place/${placeId}`);
      return { placeId, isSaved: data.data.isSaved };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save place');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('shangla_token'),
    isLoading: false,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('shangla_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setLanguage: (state, action) => {
      if (state.user) {
        state.user.languagePreference = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get Me
    builder.addCase(getMe.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(getMe.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('shangla_token');
    });

    // Toggle Save Place
    builder.addCase(toggleSavePlace.fulfilled, (state, action) => {
      if (state.user) {
        const { placeId, isSaved } = action.payload;
        if (isSaved) {
          if (!state.user.savedPlaces) state.user.savedPlaces = [];
          state.user.savedPlaces.push(placeId);
        } else {
          state.user.savedPlaces = state.user.savedPlaces.filter(
            (id) => id !== placeId && id?._id !== placeId
          );
        }
      }
    });
  },
});

export const { logout, clearError, setLanguage } = authSlice.actions;
export default authSlice.reducer;