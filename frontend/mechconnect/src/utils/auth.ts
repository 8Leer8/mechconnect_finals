// Authentication utility functions

export const isAuthenticated = (): boolean => {
  try {
    const authToken = localStorage.getItem('authToken');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return !!(authToken || token || user);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const clearAuthData = (): void => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const getUserData = (): any | null => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};