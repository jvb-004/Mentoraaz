const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      ...(opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers,
    },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const err = new Error(data?.error || `Xəta (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  signup: (p) => req('/auth/signup', { method: 'POST', body: JSON.stringify(p) }),
  login: (p) => req('/auth/login', { method: 'POST', body: JSON.stringify(p) }),
  logout: () => req('/auth/logout', { method: 'POST' }),
  me: () => req('/auth/me'),
  updateMe: (p) => req('/auth/me', { method: 'PUT', body: JSON.stringify(p) }),
  deleteAccount: () => req('/auth/me', { method: 'DELETE' }),
  // tutors
  categories: () => req('/tutors/categories'),
  searchTutors: (p = {}) => {
    const qs = new URLSearchParams(Object.entries(p).filter(([,v]) => v !== '' && v != null));
    return req(`/tutors?${qs}`);
  },
  getTutor: (id) => req(`/tutors/${id}`),
  myTutorProfile: () => req('/tutors/me/profile'),
  updateMyTutorProfile: (p) => req('/tutors/me/profile', { method: 'PUT', body: JSON.stringify(p) }),
  addSubject: (p) => req('/tutors/me/subjects', { method: 'POST', body: JSON.stringify(p) }),
  removeSubject: (id) => req(`/tutors/me/subjects/${id}`, { method: 'DELETE' }),
  addCredential: (p) => req('/tutors/me/credentials', { method: 'POST', body: JSON.stringify(p) }),
  addReview: (tutorId, p) => req(`/tutors/${tutorId}/reviews`, { method: 'POST', body: JSON.stringify(p) }),
  // messages
  listConversations: () => req('/messages/conversations'),
  startConversation: (otherUserId) => req('/messages/conversations/start', { method: 'POST', body: JSON.stringify({ otherUserId }) }),
  getConversation: (id) => req(`/messages/conversations/${id}`),
  sendMessage: (id, p) => req(`/messages/conversations/${id}`, { method: 'POST', body: JSON.stringify(p) }),
  reportConversation: (id, p) => req(`/messages/conversations/${id}/report`, { method: 'POST', body: JSON.stringify(p) }),
  // uploads
  uploadFile: (file) => { const f = new FormData(); f.append('file', file); return req('/uploads/file', { method: 'POST', body: f }); },
  // billing
  pricing: () => req('/billing/pricing'),
  buyBoost: () => req('/billing/boost', { method: 'POST' }),
  boostStatus: () => req('/billing/boost/status'),
  subscribe: () => req('/billing/subscribe', { method: 'POST' }),
  cancelSubscription: () => req('/billing/cancel', { method: 'POST' }),
  mySubscription: () => req('/billing/me'),
  // admin
  pendingCredentials: () => req('/admin/pending-credentials'),
  approveCredential: (id, note) => req(`/admin/credentials/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) }),
  rejectCredential: (id, note) => req(`/admin/credentials/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
  adminStats: () => req('/admin/stats'),
};
