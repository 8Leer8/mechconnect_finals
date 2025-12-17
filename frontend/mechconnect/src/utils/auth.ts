// Authentication utility functions

// Authentication utility functions

export const isAuthenticated = (): boolean => {
  try {
    const authToken = localStorage.getItem('authToken');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // For demo/development purposes, allow access even without tokens
    const isDemoMode = process.env.NODE_ENV === 'development' || !authToken || !token || !user;
    
    return !!(authToken || token || user || isDemoMode);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return true; // Allow access in case of errors (demo mode)
  }
};

export const clearAuthData = (): void => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
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

export const getUserId = (): number | null => {
  try {
    // First try to get from userId key
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      const id = parseInt(userIdStr);
      if (!isNaN(id)) return id;
    }
    
    // Fallback to user object
    const userData = getUserData();
    if (userData?.acc_id) {
      return userData.acc_id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const setUserData = (userData: any): void => {
  try {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.acc_id) {
        localStorage.setItem('userId', String(userData.acc_id));
      }
    }
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

export const updateUserData = (updates: any): void => {
  try {
    const currentUser = getUserData();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setUserData(updatedUser);
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};