import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('academy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('academy_token');
      localStorage.removeItem('academy_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: any) =>
    api.post('/auth/register', data),
  me: () =>
    api.get('/auth/me'),
};

export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),
};

export const studentsAPI = {
  getAll: (params?: { search?: string; course?: string; batch?: string }) =>
    api.get('/students', { params }),
  getById: (id: string) =>
    api.get(`/students/${id}`),
  create: (data: any) =>
    api.post('/students', data),
  update: (id: string, data: any) =>
    api.put(`/students/${id}`, data),
  delete: (id: string) =>
    api.delete(`/students/${id}`),
};

export const teachersAPI = {
  getAll: (params?: { search?: string }) =>
    api.get('/teachers', { params }),
  create: (data: any) =>
    api.post('/teachers', data),
  update: (id: string, data: any) =>
    api.put(`/teachers/${id}`, data),
  delete: (id: string) =>
    api.delete(`/teachers/${id}`),
};

export const coursesAPI = {
  getAll: (params?: { search?: string }) =>
    api.get('/courses', { params }),
  create: (data: any) =>
    api.post('/courses', data),
  update: (id: string, data: any) =>
    api.put(`/courses/${id}`, data),
  delete: (id: string) =>
    api.delete(`/courses/${id}`),
};

export const batchesAPI = {
  getAll: (params?: { search?: string }) =>
    api.get('/batches', { params }),
  create: (data: any) =>
    api.post('/batches', data),
  update: (id: string, data: any) =>
    api.put(`/batches/${id}`, data),
  delete: (id: string) =>
    api.delete(`/batches/${id}`),
};

export const attendanceAPI = {
  get: (params?: { batch?: string; date?: string; studentId?: string }) =>
    api.get('/attendance', { params }),
  mark: (data: { batch: string; date: string; records: Array<{ studentId: string; studentName: string; status: 'Present' | 'Absent' }> }) =>
    api.post('/attendance', data),
  getStudentSummary: (studentId: string) =>
    api.get(`/attendance/student/${studentId}`),
};

export const feesAPI = {
  getAll: (params?: { search?: string; studentId?: string }) =>
    api.get('/fees', { params }),
  addPayment: (data: { studentId: string; paymentAmount: number; paymentMethod: string; paymentDate: string }) =>
    api.post('/fees', data),
};

export const quizzesAPI = {
  getAll: (params?: { search?: string; course?: string }) =>
    api.get('/quizzes', { params }),
  getById: (id: string) =>
    api.get(`/quizzes/${id}`),
  create: (data: any) =>
    api.post('/quizzes', data),
  update: (id: string, data: any) =>
    api.put(`/quizzes/${id}`, data),
  delete: (id: string) =>
    api.delete(`/quizzes/${id}`),
};

export const quizResultsAPI = {
  submit: (data: { quizId: string; answers: Record<number, string> }) =>
    api.post('/quiz-results', data),
  getAll: (params?: { quizId?: string; studentId?: string }) =>
    api.get('/quiz-results', { params }),
  getByStudent: (studentId: string) =>
    api.get(`/quiz-results/student/${studentId}`),
};

export const supportTicketsAPI = {
  getAll: (params?: { status?: string; search?: string }) =>
    api.get('/support/tickets', { params }),
  getById: (id: string) =>
    api.get(`/support/tickets/${id}`),
  create: (data: { subject: string; category: string; priority: string; message: string }) =>
    api.post('/support/tickets', data),
  reply: (id: string, message: string) =>
    api.post(`/support/tickets/${id}/reply`, { message }),
  updateStatus: (id: string, status: string) =>
    api.put(`/support/tickets/${id}/status`, { status }),
};

export const aiSupportAPI = {
  chat: (message: string) =>
    api.post('/ai-support/chat', { message }),
};

export default api;
