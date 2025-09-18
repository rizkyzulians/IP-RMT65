import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './slices/recipesSlice';
import myListReducer from './slices/myListSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    recipes: recipesReducer,
    myList: myListReducer,
    auth: authReducer,
  },
});

export default store;
