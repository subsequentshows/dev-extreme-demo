import axios from 'axios';
// const BASE_URL = 'https://localhost:44300';
const BASE_URL = "https://localhost:7223";

export default axios.create({
  baseURL: BASE_URL
});

// export const baseURL = "https://localhost:44300";
export const baseURL = "https://localhost:7223";

export const localApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export const privateLocalApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});