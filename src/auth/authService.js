import axiosClient from "../api/axiosClient";

const KEY = "currentUser";
const TOKEN_KEY = "token";

export function getCurrentUser() {
  const saved = localStorage.getItem(KEY);
  return saved ? JSON.parse(saved) : null;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email, password) {
  const res = await axiosClient.post("/auth/login", {
    email,
    password,
  });

  if (res.data.token && res.data.user) {
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(KEY, JSON.stringify(res.data.user));
    return res.data.user;
  }

  throw new Error("Invalid credentials");
}
 
export async function register({ name, email, password }) { 
  const res = await axiosClient.post("/auth/register", {
    name,
    email,
    password,
  });

  if (res.status === 201 || res.data.message) { 
    return login(email, password);
  }

  throw new Error("Registration failed");
}
