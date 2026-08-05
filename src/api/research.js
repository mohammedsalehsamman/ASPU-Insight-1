import api from './client';


//خالص
export const getPapers = async (params = {}) => {
  const { data } = await api.get('/api/research/researchAspu2004/papers/', { params });
  return data;
};

//خالص
export const createPaper = async (payload) => {
  const { data } = await api.post('/api/research/researchAspu2004/papers/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;0
};

//خالص
export const getPaper = async (id) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${id}`);
  return data;
};

//خالص
export const updatePaper = async (id, payload) => {
  const { data } = await api.put(`/api/research/researchAspu2004/papers/${id}/`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// حذف بحث
export const deletePaper = async (id) => {
  const { data } = await api.delete(`/api/research/researchAspu2004/papers/${id}/`);
  return data;
};

// ══ ASSISTANT REVIEW ══

// جلب نتيجة مراجعة الذكاء الاصطناعي لبحث معين
export const getAssistantReview = async (paperId) => {
  const { data } = await api.get(`/api/research/papers/${paperId}/assistant-review/`);
  return data;
};

//خالص
export const requestAssistantReview = async (paperId, payload = {}) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/assistant-review/`, payload);
  return data;
};

// ══ EDITOR REVIEW — INITIAL ══

//خالص
export const getEditorReviewInitial = async (paperId) => {
  const { data } = await api.get(`/api/research/papers/${paperId}/editor-review/initial/`);
  return data;
};

//خالص
export const submitEditorReviewInitial = async (paperId, payload) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/editor-review/initial/`, payload);
  return data;
};

// ══ EDITOR REVIEW — FINAL ══

// جلب المراجعة النهائية من المحرر
export const getEditorReviewFinal = async (paperId) => {
  const { data } = await api.get(`/api/research/papers/${paperId}/editor-review/final/`);
  return data;
};

// إرسال المراجعة النهائية من المحرر
export const submitEditorReviewFinal = async (paperId, payload) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/editor-review/final/`, payload);
  return data;
};

// ══ PUBLISH ══

// نشر البحث (بعد اكتمال المراجعة)
export const publishPaper = async (paperId) => {
  const { data } = await api.post(`/api/research/papers/${paperId}/publish/`);
  return data;
};



// ══ AUTHOR DASHBOARD ══

// جلب داشبورد المؤلف
export const getAuthorDashboard = async () => {
  const { data } = await api.get('/api/research/researchAspu2004/author/dashboard/');
  return data;
};

// ══ DOWNLOAD ══

// تحميل ملف البحث
export const downloadPaper = async (id) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${id}/download/`, {
    responseType: 'blob',
  });
  return data;
};

// ══ PLAGIARISM REPORT ══

// جلب تقرير الانتحال
export const getPlagiarismReport = async (paperId) => {
  const { data } = await api.get(`/api/research/researchAspu2004/papers/${paperId}/plagiarism-report/`);
  return data;
};

// ══ SUBMIT ASSISTANT REPORT ══

//خالص
export const submitAssistantReport = async (paperId, payload) => {
  const { data } = await api.post(`/api/research/researchAspu2004/papers/${paperId}/submit-assistant-report/`, payload);
  return data;
};

// جلب المراجعين المتاحين لبحث معين
export const getAvailableReviewers = async (paperId) => {
  const { data } = await api.get( 
    `/api/v1/committees-app/papers/${paperId}/available-reviewers/`
  );
  return data;
};

// إنشاء لجنة للبحث
export const createCommittee = async (paperId, payload = {}) => {
  const { data } = await api.post(
    `/api/v1/committees-app/papers/${paperId}/committee/create/`,
    payload
  );
  return data;
};