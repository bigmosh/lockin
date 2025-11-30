import axios, { AxiosRequestConfig } from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL });

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function setUser(user: { id: number; name: string; email: string }) {
  localStorage.setItem('user_id', String(user.id));
  localStorage.setItem('user_name', user.name);
  localStorage.setItem('user_email', user.email);
}

export function getUser(): { id?: number; name?: string; email?: string } | null {
  const name = localStorage.getItem('user_name');
  const idStr = localStorage.getItem('user_id');
  const email = localStorage.getItem('user_email');
  if (!name && !idStr && !email) return null;
  const id = idStr ? parseInt(idStr, 10) : undefined;
  return { id, name: name || undefined, email: email || undefined };
}

export function clearUser() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data as { access_token: string; user: { id: number; name: string; email: string } };
}

export async function signup(name: string, email: string, password: string) {
  const res = await api.post('/auth/signup', { name, email, password });
  return res.data as { id: number; name: string; email: string; created_at: string };
}

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
