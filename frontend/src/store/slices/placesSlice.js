import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

export const fetchPlaces = createAsyncThunk(
  'places/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/places', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch places');
    }
  }
);

export const fetchFeaturedPlaces = createAsyncThunk(
  'places/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/places/featured');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured places');
    }
  }
);

export const fetchPlaceBySlug = createAsyncThunk(
  'places/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/places/${slug}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Place not found');
    }
  }
);

export const searchPlaces = createAsyncThunk(
  'places/search',
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/places/search', { params: { q: query } });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const placesSlice = createSlice({
  name: 'places',
  initialState: {
    places: [],
    featuredPlaces: [],
    currentPlace: null,
    searchResults: [],
    pagination: null,
    isLoading: false,
    isSearching: false,
    error: null,
    filters: {
      category: '',
      difficulty: '',
      sort: '-averageRating',
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentPlace: (state) => {
      state.currentPlace = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder.addCase(fetchPlaces.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPlaces.fulfilled, (state, action) => {
      state.isLoading = false;
      state.places = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchPlaces.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch Featured
    builder.addCase(fetchFeaturedPlaces.fulfilled, (state, action) => {
      state.featuredPlaces = action.payload;
    });

    // Fetch By Slug
    builder.addCase(fetchPlaceBySlug.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPlaceBySlug.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPlace = action.payload;
    });
    builder.addCase(fetchPlaceBySlug.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Search
    builder.addCase(searchPlaces.pending, (state) => {
      state.isSearching = true;
    });
    builder.addCase(searchPlaces.fulfilled, (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchPlaces.rejected, (state) => {
      state.isSearching = false;
    });
  },
});

export const { setFilters, clearCurrentPlace, clearSearchResults, clearError } =
  placesSlice.actions;
export default placesSlice.reducer;