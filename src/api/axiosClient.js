import axios from "axios";
 
const rawBase = process.env.REACT_APP_API_URL || "";
const baseURL = rawBase.trim() || "http://localhost:5000/api";
console.log("Axios baseURL:", baseURL);

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
 
function normalizeData(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeData);
  }
  if (obj && typeof obj === 'object') {
    const normalized = {};
    for (const key in obj) {
      if (key === '_id' && obj[key]) {
        normalized.id = obj[key];
      } else {
        normalized[key] = normalizeData(obj[key]);
      }
    }
    return normalized;
  }
  return obj;
}
 
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } 
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosClient.interceptors.response.use(
  (response) => {
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
      response.data = response.data.data;
    }
    
    
    response.data = normalizeData(response.data);
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
