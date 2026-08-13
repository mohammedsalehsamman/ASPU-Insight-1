import api from './client';



export const getIEEEReports = async () => {
  const { data } = await api.get('/api/ai/ai2004-R/ieee/reports/');
  return data;
};

export const getIEEEReportDetail = async (id) => {
  const { data } = await api.get(`/api/ai/ai2004-R/ieee/reports/${id}/`);
  return data;
};
