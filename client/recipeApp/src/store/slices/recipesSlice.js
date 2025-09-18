import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serverSide } from '../../helpers/httpClient';

const initialState = {
  list: [],
  page: 1,
  totalPage: 1,
  search: '',
  loading: false,
  error: null,
  aiResult: null,
};

export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const res = await serverSide.get(`/pub/recipes?page=${page}&search=${encodeURIComponent(search)}`);
      // Normalize payload to include rows and page to match reducer expectations
      return { rows: res.data, page };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAllRecipesForAI = createAsyncThunk(
  'recipes/fetchAllRecipesForAI',
  async (_, { rejectWithValue }) => {
    try {
      const res = await serverSide.get('/pub/recipes/all');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const askAI = createAsyncThunk(
  'recipes/askAI',
  async ({ question, recipes }, { rejectWithValue }) => {
    try {
      const res = await serverSide.post('/ai/rekomendasi', { question, recipes });
      // server returns { rekomendasi: '...' }
      return res.data?.rekomendasi ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    clearAIResult(state) {
      state.aiResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload may be normalized { rows, page } or a plain array
        if (Array.isArray(action.payload)) {
          state.list = action.payload;
        } else {
          state.list = action.payload.rows || action.payload.data || action.payload || [];
          state.page = action.payload.page || state.page;
          state.totalPage = action.payload.totalPage || action.payload.totalPages || state.totalPage;
        }
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch recipes';
      })

      .addCase(fetchAllRecipesForAI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecipesForAI.fulfilled, (state, action) => {
        state.loading = false;
        // payload is array
        state.aiContext = action.payload && action.payload.rows ? action.payload.rows : action.payload;
      })
      .addCase(fetchAllRecipesForAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch all recipes';
      })

      .addCase(askAI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(askAI.fulfilled, (state, action) => {
        state.loading = false;
        state.aiResult = action.payload;
      })
      .addCase(askAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'AI request failed';
      });
  }
});

export const { setSearch, setPage, clearAIResult } = recipesSlice.actions;
export default recipesSlice.reducer;
