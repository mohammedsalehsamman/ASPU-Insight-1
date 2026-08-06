import api from './client';

const BASE = '/api/admin/2004-R';

// ══ USERS ══
export const getUsers = async (params = {}) => {
  const { data } = await api.get(`${BASE}/users/`, { params });
  return data;
};

export const getUserDetail = async (userId) => {
  const { data } = await api.get(`${BASE}/users/${userId}/`);
  return data;
};

export const updateUser = async (userId, payload) => {
  const { data } = await api.patch(`${BASE}/users/${userId}/`, payload);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`${BASE}/users/${userId}/`);
  return data;
};

export const adminVerifyEmail = async (userId) => {
  const { data } = await api.post(`${BASE}/users/${userId}/verify-email/`);
  return data;
};

export const adminResendVerification = async (userId) => {
  const { data } = await api.post(`${BASE}/users/${userId}/resend-verification/`);
  return data;
};

// ══ DASHBOARD ══
export const getDashboardStats = async () => {
  const { data } = await api.get(`${BASE}/dashboard/stats/`);
  return data;
};

export const getDashboardPapers = async (params = {}) => {
  const { data } = await api.get(`${BASE}/dashboard/papers/`, { params });
  return data;
};

export const getDashboardPaperDetail = async (paperId) => {
  const { data } = await api.get(`${BASE}/dashboard/papers/${paperId}/`);
  return data;
};

export const assignEditor = async (paperId, editorId) => {
  const { data } = await api.patch(`${BASE}/dashboard/papers/${paperId}/assign-editor/`, {
    editor_id: editorId,
  });
  return data;
};

export const getEditorReviews = async (params = {}) => {
  const { data } = await api.get(`${BASE}/dashboard/editor-reviews/`, { params });
  return data;
};

export const getAssistantReviews = async (params = {}) => {
  const { data } = await api.get(`${BASE}/dashboard/assistant-reviews/`, { params });
  return data;
};

export const getCommittees = async (params = {}) => {
  const { data } = await api.get(`${BASE}/dashboard/committees/`, { params });
  return data;
};

// ══ JOURNAL CONFIGURATION ══
export const getConfiguration = async () => {
  const { data } = await api.get(`${BASE}/configuration/`);
  return data;
};

export const updateConfiguration = async (payload) => {
  const { data } = await api.put(`${BASE}/configuration/`, payload);
  return data;
};

// ══ RESEARCH HISTORY (AUDIT LOG) ══
export const getResearchHistory = async (paperId) => {
  const { data } = await api.get(`${BASE}/research-history/`, { params: { paper: paperId } });
  return data;
};
