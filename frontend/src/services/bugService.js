import api from './api';

/**
 * Fetch all bugs.
 * Returns a consistent array regardless of backend response shape.
 */
export const getBugs = async () => {
  const response = await api.get('/bugs');

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.bugs)) {
    return response.data.bugs;
  }

  console.warn('⚠️ getBugs(): API response was not an array.', response.data);
  return [];
};

export const getBug = async (id) => {
  const response = await api.get(`/bugs/${id}`);
  return response.data;
};

export const createBug = async (bugData) => {
  const response = await api.post('/bugs', bugData);
  return response.data;
};

export const updateBug = async (id, bugData) => {
  const response = await api.put(`/bugs/${id}`, bugData);
  return response.data;
};

export const deleteBug = async (id) => {
  const response = await api.delete(`/bugs/${id}`);
  return response.data;
};

export const addComment = async (bugId, comment) => {
  const response = await api.post(`/bugs/${bugId}/comments`, { text: comment });
  return response.data;
};
