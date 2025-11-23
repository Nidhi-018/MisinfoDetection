/**
 * Authentication utilities
 * Handles token and user management
 */

export const getAuthToken = () => {
  return localStorage.getItem('authToken') || 'test-token-user123';
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getUserId = () => {
  return localStorage.getItem('userId') || 'user123';
};

export const setUserId = (userId) => {
  localStorage.setItem('userId', userId);
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
};

