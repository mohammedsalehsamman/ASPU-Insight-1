import api from './client';
import {
  getIEEEReports as getIEEEReportsFromAi,
  getIEEEReportDetail as getIEEEReportDetailFromAi,
} from './aiService';

export const getPapers = async (params = {}) => {
  const { data } = await api.get('/api/research/researchAspu2004/papers/', { params });
  return data;
};

export const createPaper = async (payload) => {
  const { data } = await api.post('/api/research/researchAspu2004/papers/', payload);
  return data;
};

export const getPaper = async (id) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${id}`);
  return data;
};

export const updatePaper = async (id, payload) => {
  const { data } = await api.put(`/api/research/researchAspu2004/papers/${id}/`, payload);
  return data;
};

export const deletePaper = async (id) => {
  const { data } = await api.delete(`/api/research/researchAspu2004/papers/${id}/`);
  return data;
};

export const getAssistantReview = async (paperId) => {
  const { data } = await api.get(`/api/research/papers/${paperId}/assistant-review/`);
  return data;
};

export const requestAssistantReview = async (paperId, payload = {}) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/assistant-review/`, payload);
  return data;
};

export const getEditorReviewInitial = async (paperId) => {
  const { data } = await api.get(`/api/research/papers/${paperId}/editor-review/initial/`);
  return data;
};

export const submitEditorReviewInitial = async (paperId, payload) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/editor-review/initial/`, payload);
  return data;
};

export const getEditorReviewFinal = async (paperId) => {
  const { data } = await api.get(`/api/research/papers/${paperId}/editor-review/final/`);
  return data;
};

export const submitEditorReviewFinal = async (paperId, payload) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/editor-review/final/`, payload);
  return data;
};

export const publishPaper = async (paperId) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/publish/`);
  return data;
};



export const getAuthorDashboard = async () => {
  const { data } = await api.get('/api/research/researchAspu2004/author/dashboard/');
  return data;
};

export const downloadPaper = async (id) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${id}/download/`, {
    responseType: 'blob',
  });
  return data;
};

export const getPlagiarismReport = async (paperId) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${paperId}/plagiarism-report/`);
  return data;
};

export const submitAssistantReport = async (paperId, payload) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/assistant-review/`, payload);
  return data;
};

export const getAvailableReviewers = async (paperId) => {
  const { data } = await api.get( 
    `/api/v1/committees-app/papers/${paperId}/available-reviewers/`
  );
  return data;
};

export const createCommittee = async (paperId, payload = {}) => {
  const { data } = await api.post(
    `/api/v1/committees-app/papers/${paperId}/committee/create/`,
    payload
  );
  return data;
};

export const smartSearchPapers = async (query) => {
  const { data } = await api.get('/api/research/researchAspu2004/papers/smart-search/', {
    params: { q: query },
  });
  return data;
};

export const suggestKeywords = async (paperId) => {
  const { data } = await api.post('/api/ai/ai2004-R/keywords/suggest/', {
    paper_id: paperId,
  });
  return data;
};


export const getIEEEReports = async () => getIEEEReportsFromAi();
export const getIEEEReportDetail = async (id) => getIEEEReportDetailFromAi(id);

export const deleteIEEEReport = async (id) => {
  const { data } = await api.delete(`/api/ai/ai2004-R/ieee/reports/${id}/`);
  return data;
};

export const submitIEEECheck = async (formData) => {
  const { data } = await api.post('/api/ai/ai2004-R/ieee/check/', formData);
  return data;
};

export const submitClaimEvidenceAnalysis = async (formData) => {
  const { data } = await api.post('/api/ai/ai2004-R/claim-evidence/analyze/', formData);
  return data;
};

export const getClaimEvidenceReports = async () => {
  const { data } = await api.get('/api/ai/ai2004-R/claim-evidence/reports/');
  return data;
};

export const getClaimEvidenceReportDetail = async (id) => {
  const { data } = await api.get(`/api/ai/ai2004-R/claim-evidence/reports/${id}/`);
  return data;
};

export const deleteClaimEvidenceReport = async (id) => {
  const { data } = await api.delete(`/api/ai/ai2004-R/claim-evidence/reports/${id}/`);
  return data;
};

export async function getCommitteeStatus(paperId) {
    const { data } = await api.get(`/api/v1/committees-app/papers/${paperId}/committee/`);
    return data;
}

export const getMetadataScore = async (paperId) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${paperId}/metadata-quality/`);
  return data;
};

export const getRecommendations = async (paperId) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${paperId}/recommendations/`);
  return data;
};