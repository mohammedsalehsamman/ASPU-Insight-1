const MESSAGES = {
  ar: {
    network: 'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.',
    400: 'تعذّر تنفيذ الطلب. تحقّق من البيانات المدخلة وحاول مرة أخرى.',
    401: 'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى للمتابعة.',
    403: 'لا تملك الصلاحية لتنفيذ هذا الإجراء.',
    404: 'العنصر المطلوب غير موجود.',
    409: 'يتعذّر تنفيذ الطلب بسبب تعارض في البيانات الحالية.',
    422: 'البيانات المدخلة غير صالحة. راجع الحقول وحاول مرة أخرى.',
    429: 'تجاوزت الحد المسموح من المحاولات. انتظر قليلاً ثم حاول مرة أخرى.',
    500: 'حدث خطأ في الخادم. حاول مرة أخرى لاحقاً.',
    default: 'حدث خطأ غير متوقع. حاول مرة أخرى، وإذا استمرت المشكلة فتواصل مع الدعم.',
  },
  en: {
    network: 'The server could not be reached. Check your internet connection and try again.',
    400: 'The request could not be completed. Check the entered data and try again.',
    401: 'Your session has expired. Sign in again to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested item could not be found.',
    409: 'The request conflicts with the current data.',
    422: 'The entered data is invalid. Review the fields and try again.',
    429: 'Too many attempts. Wait a moment and try again.',
    500: 'A server error occurred. Please try again later.',
    default: 'An unexpected error occurred. Try again, and contact support if the problem persists.',
  },
};

function getServerMessage(error) {
  const data = error?.response?.data;
  if (Array.isArray(data)) return data.filter(Boolean).join(' ');
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const values = Object.values(data).flat().filter((value) => typeof value === 'string' && value.trim());
    if (values.length) return values.join(' ');
  }
  return '';
}

export function getErrorMessage(error, lang = 'ar') {
  if (typeof error === 'string' && error.trim()) return error;
  const serverMessage = getServerMessage(error);
  if (serverMessage) return serverMessage;
  if (error?.response?.status) return MESSAGES[lang]?.[error.response.status] || MESSAGES[lang].default;
  if (error?.request || error?.code === 'ERR_NETWORK') return MESSAGES[lang].network;
  return MESSAGES[lang]?.default || MESSAGES.ar.default;
}
