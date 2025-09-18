import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serverSide } from '../../helpers/httpClient';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchMyList = createAsyncThunk('myList/fetchMyList', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await serverSide.get('/mylist', { headers });
    return res.data.myList || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const removeFromMyList = createAsyncThunk('myList/remove', async (recipeId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await serverSide.delete(`/mylist/${recipeId}`, { headers });
    return { recipeId, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateNote = createAsyncThunk('myList/updateNote', async ({ recipeId, note }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await serverSide.patch(`/mylist/${recipeId}`, { note }, { headers });
    // server responds with { message: 'Notes updated', myList: entry }
    const returnedNote = res.data?.myList?.note ?? note;
    return { recipeId, note: returnedNote };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const myListSlice = createSlice({
  name: 'myList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch My List';
      })

      .addCase(removeFromMyList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromMyList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(i => i.RecipeId !== action.payload.recipeId);
      })
      .addCase(removeFromMyList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove item';
      })

      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(i => i.RecipeId === action.payload.recipeId);
        if (idx !== -1) state.items[idx].note = action.payload.note;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update note';
      });
  }
});

export default myListSlice.reducer;
