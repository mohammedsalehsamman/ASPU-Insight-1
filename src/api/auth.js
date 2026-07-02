import api from './client';

//خالص
export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/ASPU-2004/login/', { email, password });
  if (data.access) {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const verify2FA = async (pre_auth_token, otp_code) => {
  const { data } = await api.post('/api/auth/ASPU-2004/2fa/verify/', { pre_auth_token, otp_code });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

//خالص
export const register = async (payload) => {
  const { data } = await api.post('/api/auth/ASPU-2004/register/', payload);
  return data;
};
//خالص
export const logout = async () => {
  const refresh = localStorage.getItem('refresh_token');
  try {
    await api.post('/api/auth/ASPU-2004/logout/', { refresh });
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

//خالص
export const getProfile = async () => {
  const { data } = await api.get('/api/auth/ASPU-2004/profile/');
  return data;
};

//خالص
export const updateProfile = async (payload) => {
  const { data } = await api.patch('/api/auth/ASPU-2004/profile/', payload);
  return data;
};

//خالص
export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const { data } = await api.post('/api/auth/ASPU-2004/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return data;
};

//خالص
export const requestPasswordReset = async (email) => {
  const { data } = await api.post('/api/auth/ASPU-2004/password-reset/', { email });
  return data;
};

//خالص
export const confirmPasswordReset = async (token, newPassword, confirmPassword) => {
  const { data } = await api.post('/api/auth/ASPU-2004/password-reset/confirm/', {
    token,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return data;
};

//خالص
export const verifyEmail = async (token) => {
  const { data } = await api.post('/api/auth/ASPU-2004/verify-email/', { token });
  return data;
};


//خالص
export const enable2FA = async () => {
  const { data } = await api.post('/api/auth/ASPU-2004/2fa/enable/');
  return data; // { secret, qr_code_url, message }
};

//خالص
export const confirm2FA = async (otp_code) => {
  const { data } = await api.post('/api/auth/ASPU-2004/2fa/confirm/', { otp_code });
  return data;
};


export const isAuthenticated = () => !!localStorage.getItem('access_token');

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};