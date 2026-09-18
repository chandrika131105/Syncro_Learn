import axios from 'axios';

// Dynamically determine the API base URL to support local network access (e.g. from mobile)
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    return `http://${window.location.hostname}:8080/api`;
};

const API_URL = `${getBaseUrl()}/auth`;

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 (Unauthorized) responses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Check if we are already on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/authenticate`, { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data)); // Store basic user info if available
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// --- Course Context ---
export const getAllCourses = async (params = { page: 0, size: 50 }) => {
    const response = await api.get('/courses', { params });
    // Handle Page<Course> response
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    return response.data;
};

export const getCourseById = async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
};

export const getMyCreatedCourses = async (params = { page: 0, size: 50 }) => {
    const response = await api.get('/courses/my-courses', { params });
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    return response.data;
};

export const searchCourses = async (params) => {
    // Default size if not provided
    if (!params.size) params.size = 50;
    const response = await api.get('/courses/search', { params });
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    return response.data;
};

export const deleteCourse = async (courseId) => {
    await api.delete(`/courses/${courseId}`);
};

export const getComparisonData = async (ids) => {
    const response = await api.get('/courses/compare', {
        params: { ids: ids.join(',') }
    });
    return response.data;
};

export const getRecommendations = async () => {
    const response = await api.get('/courses/recommendations');
    return response.data;
};

export const getGamificationProfile = async () => {
    const response = await api.get('/gamification/profile');
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await api.get('/gamification/leaderboard');
    return response.data;
};

export const getTutorLeaderboard = async () => {
    const response = await api.get('/gamification/tutor-leaderboard');
    return response.data;
};

export const updateCourse = async (courseId, data) => {
    const response = await api.put(`/courses/${courseId}`, data);
    return response.data;
};

export const addModule = async (courseId, moduleData) => {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
};

export const updateModule = async (courseId, moduleId, moduleData) => {
    const response = await api.put(`/courses/${courseId}/modules/${moduleId}`, moduleData);
    return response.data;
};

export const deleteModule = async (courseId, moduleId) => {
    await api.delete(`/courses/${courseId}/modules/${moduleId}`);
};

// --- Wishlist Context ---
export const addToWishlist = async (courseId) => {
    const response = await api.post(`/wishlist/${courseId}`);
    return response.data;
};

export const removeFromWishlist = async (courseId) => {
    await api.delete(`/wishlist/${courseId}`);
};

export const getWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data;
};

// --- Enrollment Context ---
export const enrollInCourse = async (courseId) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
};

export const getMyEnrollments = async () => {
    const response = await api.get('/enrollments/my-enrollments');
    return response.data;
};

export const checkEnrollmentStatus = async (courseId) => {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data;
};

export const updateProgress = async (courseId, progress) => {
    await api.put(`/enrollments/${courseId}/progress`, null, { params: { progress } });
};

export const updateModuleProgress = async (moduleId, lastPosition, percentage) => {
    await api.put(`/enrollments/modules/${moduleId}/progress`, null, { params: { lastPosition, percentage } });
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// --- User Context ---
export const getCurrentUser = async () => {
    const response = await api.get('/user/me');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
};

export const getUserActivity = async () => {
    const response = await api.get('/user/activity');
    return response.data;
};

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// --- Discussion Context ---
export const getModuleDiscussions = async (moduleId) => {
    const response = await api.get(`/discussions/module/${moduleId}`);
    return response.data;
};

export const postDiscussion = async (data) => {
    const response = await api.post('/discussions', data);
    return response.data;
};

export const replyToDiscussion = async (id, data) => {
    const response = await api.post(`/discussions/${id}/reply`, data);
    return response.data;
};

export const upvoteDiscussion = async (id) => {
    const response = await api.put(`/discussions/${id}/upvote`);
    return response.data;
};

// --- Quiz Context ---
export const submitQuiz = async (quizId, answers) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { quizId, answers });
    return response.data;
};

// --- Admin Context ---
export const getAdminUsers = async (params = { page: 0, size: 50 }) => {
    const response = await api.get('/admin/users', { params });
    if (response.data && Array.isArray(response.data.content)) {
        return response.data;
    }
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, role, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const updateUserStatus = async (userId, banned) => {
    const response = await api.put(`/admin/users/${userId}/status?banned=${banned}`);
    return response.data;
};

export const getAdminCourses = async (params = { status: 'PENDING', page: 0, size: 50 }) => {
    const response = await api.get('/admin/courses', { params });
    if (response.data && Array.isArray(response.data.content)) {
        return response.data;
    }
    return response.data;
};

export const approveCourse = async (courseId) => {
    const response = await api.put(`/admin/courses/${courseId}/approve`);
    return response.data;
};

export const rejectCourse = async (courseId) => {
    const response = await api.put(`/admin/courses/${courseId}/reject`);
    return response.data;
};

export const getAllDiscussions = async (params = { page: 0, size: 50 }) => {
    const response = await api.get('/discussions/admin/all', { params });
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    return response.data; // Fallback if no content wrapper
};

export const toggleHideDiscussion = async (id, hidden) => {
    const response = await api.put(`/discussions/${id}/hide?hidden=${hidden}`);
    return response.data;
};

// --- System Settings Context ---
export const getSystemSettings = async () => {
    const response = await api.get('/system/settings');
    return response.data;
};

export const updateSystemSettings = async (settings) => {
    const response = await api.put('/system/settings', settings);
    return response.data;
};

export const deleteCourseAdmin = async (id) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
};

export const getFinancialStats = async () => {
    const response = await api.get('/admin/stats/financials');
    return response.data;
};

export const downloadCertificate = async (courseId) => {
    const response = await api.get(`/certificates/download/${courseId}`, {
        responseType: 'blob', // Important for PDF download
    });
    return response.data;
};

export const verifyCertificate = async (code) => {
    const response = await api.get(`/certificates/verify/${code}`);
    return response.data;
};

export default api;
