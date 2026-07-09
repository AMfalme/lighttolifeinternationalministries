"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./Toast.module.css";

export interface ToastItem {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

let toastListeners: Array<(toast: ToastItem) => void> = [];

export function showToast(type: ToastItem["type"], message: string) {
  const toast: ToastItem = { id: Date.now(), type, message };
  toastListeners.forEach((listener) => listener(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => dismiss(toast.id)}
        >
          <span className={styles.toastIcon}>
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className={styles.toastMessage}>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => dismiss(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}