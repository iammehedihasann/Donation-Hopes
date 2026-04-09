import { create } from "zustand";

export type ToastType = "success" | "error";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type NotifyState = {
  toasts: Toast[];
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: string) => void;
};

let counter = 0;

export const useNotifyStore = create<NotifyState>((set) => ({
  toasts: [],
  success: (message) => {
    const id = `t-${++counter}`;
    set((s) => ({ toasts: [...s.toasts, { id, type: "success", message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  error: (message) => {
    const id = `t-${++counter}`;
    set((s) => ({ toasts: [...s.toasts, { id, type: "error", message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 6000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** গ্লোবাল নোটিফিকেশন — বার্তা বাংলায় */
export const notify = {
  success: (message: string) => useNotifyStore.getState().success(message),
  error: (message: string) => useNotifyStore.getState().error(message),
};
