const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('nyaya_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Auto-logout on 401
    if (response.status === 401) {
      localStorage.removeItem('nyaya_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const text = await response.text();
    let data = {};
    try {
      if (text) data = JSON.parse(text);
    } catch (e) {
      if (!response.ok) throw new Error(response.statusText || 'Server error');
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) throw new Error(data.error || response.statusText || 'Server error');
    
    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getSession: () => request('/auth/session'),
  heartbeat: () => request('/auth/heartbeat', { method: 'POST' }),

  // Game
  saveResult: (data) => request('/game/result', { method: 'POST', body: JSON.stringify(data) }),
  getProgress: () => request('/game/progress'),

  // Leaderboard
  getLeaderboard: () => request('/leaderboard'),

  // Class Management (Teacher)
  createClass: (data) => request('/class/create', { method: 'POST', body: JSON.stringify(data) }),
  getMyClasses: () => request('/class/my-classes'),
  getClassStudents: (classId) => request(`/class/students/${classId}`),
  getJoinRequests: (classId) => request(`/class/requests/${classId}`),
  approveRequest: (data) => request('/class/approve', { method: 'POST', body: JSON.stringify(data) }),
  getAllStudents: () => request('/class/all-students'),
  getGameStats: (classId) => request(`/class/game-stats/${classId}`),

  // Class Management (Student)
  joinClass: (data) => request('/class/join', { method: 'POST', body: JSON.stringify(data) }),
  getMyEnrollments: () => request('/class/my-enrollments'),
  getAllTeachers: () => request('/class/teachers'),
  getMyTeachers: () => request('/class/my-teachers'),
  submitClassResult: (data) => request('/class/submit-result', { method: 'POST', body: JSON.stringify(data) }),
};

