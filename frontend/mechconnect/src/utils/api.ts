// API Base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Generic API request handler with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || data.details || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API request error:', error);
    return { error: 'Network error occurred. Please check your connection.' };
  }
}

// ===== BOOKING APIs =====

export interface BookingListItem {
  booking_id: number;
  status: string;
  amount_fee: number;
  booked_at: string;
  client_name: string;
  provider_name: string;
  request_summary: string;
  request_type: string;
}

export interface BookingListResponse {
  bookings: BookingListItem[];
  count: number;
  status: string;
}

export const bookingsAPI = {
  /**
   * Get bookings for a client filtered by status
   */
  getClientBookings: async (clientId: number, status: string) => {
    return apiRequest<BookingListResponse>(
      `/bookings/client/?client_id=${clientId}&status=${status}`
    );
  },

  /**
   * Get active booking details
   */
  getActiveBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/active/${bookingId}/`);
  },

  /**
   * Get completed booking details
   */
  getCompletedBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/completed/${bookingId}/`);
  },

  /**
   * Get rescheduled booking details
   */
  getRescheduledBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/rescheduled/${bookingId}/`);
  },

  /**
   * Get cancelled booking details
   */
  getCancelledBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/cancelled/${bookingId}/`);
  },

  /**
   * Get back jobs booking details
   */
  getBackJobsBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/back-jobs/${bookingId}/`);
  },

  /**
   * Get disputed booking details
   */
  getDisputedBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/disputed/${bookingId}/`);
  },

  /**
   * Get refunded booking details
   */
  getRefundedBooking: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/refunded/${bookingId}/`);
  },

  /**
   * Get general booking details
   */
  getBookingDetails: async (bookingId: number) => {
    return apiRequest<any>(`/bookings/${bookingId}/`);
  },

  /**
   * Create a back job request for a completed booking
   */
  createBackJobRequest: async (bookingId: number, clientId: number, reason: string) => {
    return apiRequest<any>(`/bookings/back-jobs/`, {
      method: 'POST',
      body: JSON.stringify({
        booking_id: bookingId,
        client_id: clientId,
        reason: reason
      })
    });
  },
};

// ===== REQUEST APIs =====

export interface RequestListItem {
  request_id: number;
  request_type: string;
  request_status: string;
  created_at: string;
  client_name: string;
  provider_name: string;
  request_summary: string;
}

export interface RequestListResponse {
  message: string;
  requests: RequestListItem[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateCustomRequestData {
  client_id: number;
  provider_id?: number;
  description: string;
  concern_picture?: string;
  estimated_budget?: number;
  house_building_number?: string;
  street_name?: string;
  subdivision_village?: string;
  barangay?: string;
  city_municipality?: string;
  province?: string;
  region?: string;
  postal_code?: string;
  schedule_type: 'urgent' | 'freely';
  scheduled_date?: string;
  scheduled_time?: string;
}

export const requestsAPI = {
  /**
   * Get requests for a client filtered by status
   */
  getClientRequests: async (clientId: number, status?: string, page = 1, pageSize = 10) => {
    let url = `/requests/client/?client_id=${clientId}&page=${page}&page_size=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return apiRequest<RequestListResponse>(url);
  },

  /**
   * Get request details
   */
  getRequestDetails: async (requestId: number) => {
    return apiRequest<any>(`/requests/${requestId}/`);
  },

  /**
   * Create a custom request
   */
  createCustomRequest: async (data: CreateCustomRequestData) => {
    return apiRequest<any>('/requests/custom/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update request status
   */
  updateRequestStatus: async (requestId: number, status: string) => {
    return apiRequest<any>(`/requests/${requestId}/status/`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Delete request
   */
  deleteRequest: async (requestId: number) => {
    return apiRequest<any>(`/requests/${requestId}/delete/`, {
      method: 'DELETE',
    });
  },
};

// ===== GEOLOCATION APIs =====

export interface GeocodingResult {
  display_name?: string;
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
}

export const geolocationAPI = {
  /**
   * Reverse geocode coordinates to address using BigDataCloud API
   */
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (response.ok) {
        const data: GeocodingResult = await response.json();
        return (
          data.display_name ||
          `${data.locality}, ${data.city}, ${data.principalSubdivision}` ||
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    // Fallback to coordinates if geocoding fails
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  },

  /**
   * Get current position
   */
  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  },
};

// ===== AUTH APIs (if needed) =====

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  middlename?: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  role: string;
  date_of_birth?: string;
  gender?: string;
  contact_number?: string;
  profile_photo?: string;
  bio?: string;
  house_building_number?: string;
  street_name?: string;
  barangay?: string;
  city_municipality?: string;
  province?: string;
  region?: string;
  postal_code?: string;
}

export const authAPI = {
  /**
   * Login user
   */
  login: async (data: LoginData) => {
    return apiRequest<any>('/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Register user
   */
  register: async (data: RegisterData) => {
    return apiRequest<any>('/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    return apiRequest<any>('/accounts/profile/');
  },
};

// Helper function to format dates
export const formatDate = (dateString: string, includeTime = false) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('en-US', options);
};

// Helper function to format time ago
export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};

// Helper function to get initials from name
export const getInitials = (fullName: string) => {
  if (!fullName) return 'UN';
  return fullName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default {
  bookingsAPI,
  requestsAPI,
  geolocationAPI,
  authAPI,
  formatDate,
  formatTimeAgo,
  getInitials,
};
