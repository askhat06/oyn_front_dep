import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import userReducer from "./userSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
  },
});


