# React Portal Integration Guide

## 1) Environment

Frontend .env:

VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1

Backend .env:

FRONTEND_URLS=http://localhost:5173,http://localhost:3000

Then clear backend config cache:

php artisan config:clear

## 2) Login Flow (Bearer Token)

- Call POST /auth/login with:
  - email
  - password
  - device_name (optional)
- Save access_token in memory or localStorage.
- Add Authorization: Bearer <token> for all protected APIs.
- Call GET /auth/me to get current user and role.
- Redirect by role:
  - student -> /student
  - lecturer -> /lecturer

## 3) Suggested React Route Tree

- /login
- /student/exam-schedules
- /student/attendance-results
- /student/face-registration
- /lecturer/exam-schedules
- /lecturer/today-exams
- /lecturer/current-exam

## 4) API Endpoints for Student

- GET /student/exam-schedules
- GET /student/attendance-results
- GET /student/face-registration/window
- POST /student/face-registration/generate-upload-url
- POST /student/face-registration/confirm-upload

## 5) API Endpoints for Lecturer

- GET /lecturer/exam-schedules
- GET /lecturer/exam-schedules/today
- GET /lecturer/exam-schedules/current
- GET /lecturer/students/today-exam?student_code=...

## 6) API Endpoints for Session

- GET /auth/me
- POST /auth/logout
- POST /auth/logout-all
- DELETE /auth/tokens/{tokenId}

## 7) Axios Example

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

## 8) Minimal Auth Guard Idea

- Public routes: login
- Private routes:
  - require token
  - require role if route is role-specific
- If GET /auth/me returns 401:
  - clear token
  - redirect to /login

## 9) Security Notes

- Use HTTPS in production.
- Do not store token in plain localStorage if XSS risk is high.
- Add frontend-level logout timer if needed.
- Keep login rate limit enabled.
