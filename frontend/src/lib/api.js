import axios from 'axios'

// instance สำหรับเรียก API backend
export const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
})
