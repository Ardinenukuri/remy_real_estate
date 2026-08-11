const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Common API fetch wrapper handling JWT authorization and error responses
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication APIs
  auth: {
    register: (data: any) =>
      fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (credentials: any) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    getProfile: () => fetchAPI('/auth/profile'),
  },

  // Properties APIs
  properties: {
    getAll: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/properties${queryString}`);
    },
    getById: (id: string) => fetchAPI(`/properties/${id}`),
    create: (data: any) =>
      fetchAPI('/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/properties/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/properties/${id}`, {
        method: 'DELETE',
      }),
  },

  // Inquiries APIs
  inquiries: {
    submit: (data: { propertyId: string; message: string; phoneNumber?: string }) =>
      fetchAPI('/inquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyInquiries: () => fetchAPI('/inquiries/my-inquiries'),
    getRealtorInquiries: () => fetchAPI('/inquiries/realtor-inquiries'),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Viewing Appointments APIs
  viewings: {
    request: (data: { propertyId: string; requestedDate: string; notes?: string }) =>
      fetchAPI('/viewings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyViewings: () => fetchAPI('/viewings/my-viewings'),
    getRealtorViewings: () => fetchAPI('/viewings/realtor-viewings'),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/viewings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Admin APIs
  admin: {
    getStats: () => fetchAPI('/admin/stats'),
    getPendingRealtors: () => fetchAPI('/admin/realtors/pending'),
    updateRealtorStatus: (id: string, status: string) =>
      fetchAPI(`/admin/realtors/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getPendingProperties: () => fetchAPI('/admin/properties/pending'),
    updatePropertyApproval: (id: string, approvalStatus: string) =>
      fetchAPI(`/admin/properties/${id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ approvalStatus }),
      }),
  },
};
