import axios from 'axios';
const BASE_URL = 'https://localhost:44300';

export default axios.create({
  baseURL: BASE_URL
});

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