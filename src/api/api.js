import axios from 'axios';
const BASE_URL = 'http://localhost:4300';

export default axios.create({
  baseURL: BASE_URL
});

export const localApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});