export type Theme = "light" | "dark";

const THEME_KEY = "theme";

export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  return storedTheme === "dark" ? "dark" : "light";
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
};
