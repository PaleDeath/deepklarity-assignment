import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 60000,
});

export const generateQuiz = (url) => api.post('/generate-quiz', { url });
export const getHistory = () => api.get('/history');
export const getQuizById = (id) => api.get(`/quiz/${id}`);
export const deleteQuiz = (id) => api.delete(`/quiz/${id}`);
export const previewUrl = (url) => api.get('/preview', { params: { url } });
