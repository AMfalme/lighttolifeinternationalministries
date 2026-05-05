import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id">>
    ) => {
      state.notifications.push({ id: Date.now(), ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const { addNotification, removeNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;