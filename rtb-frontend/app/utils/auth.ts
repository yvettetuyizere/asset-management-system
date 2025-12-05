// app/utils/auth.ts
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

export const clearToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const logout = (): void => {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
