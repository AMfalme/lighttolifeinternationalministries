import { configureStore } from "@reduxjs/toolkit";
// import counterReducer from "./features/counterSlice";
// import cartReducer from "./features/cartSlice";
import notificationReducer from "./features/notificationSlice";
export const store = configureStore({
  reducer: {
    // counter: counterReducer,
    // cart: cartReducer,
    notification: notificationReducer, // ✅ Add the notification slice
  },
  devTools: process.env.NODE_ENV !== "production", // Enable dev tools in development mode
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
