import axios from 'axios';
import { HealthResponse } from '../types/health';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import { Location, QueueEntry, NotificationItem } from '../types/customer';
import { StaffDashboardSummary, StaffQueue, StaffActionResponse } from '../types/staff';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Health Check
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/api/v1/health');
  return response.data;
};

// Auth API
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
  return response.data;
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/v1/auth/me');
  return response.data;
};

// Customer Locations API
export const getLocations = async (): Promise<Location[]> => {
  const response = await apiClient.get<Location[]>('/api/v1/locations');
  return response.data;
};

export const getLocationById = async (id: number): Promise<Location> => {
  const response = await apiClient.get<Location>(`/api/v1/locations/${id}`);
  return response.data;
};

// Customer Queue API
export const getActiveQueue = async (): Promise<QueueEntry | null> => {
  const response = await apiClient.get<QueueEntry | null>('/api/v1/customer/active-queue');
  return response.data;
};

export const joinQueue = async (locationId: number, serviceId: number): Promise<QueueEntry> => {
  const response = await apiClient.post<QueueEntry>('/api/v1/customer/join-queue', {
    location_id: locationId,
    service_id: serviceId,
  });
  return response.data;
};

export const getQueueEntryDetails = async (entryId: number): Promise<QueueEntry> => {
  const response = await apiClient.get<QueueEntry>(`/api/v1/customer/queue-entry/${entryId}`);
  return response.data;
};

export const cancelQueueEntry = async (entryId: number): Promise<QueueEntry> => {
  const response = await apiClient.post<QueueEntry>(`/api/v1/customer/cancel-queue/${entryId}`);
  return response.data;
};

export const getQueueHistory = async (): Promise<QueueEntry[]> => {
  const response = await apiClient.get<QueueEntry[]>('/api/v1/customer/history');
  return response.data;
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await apiClient.get<NotificationItem[]>('/api/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: number): Promise<NotificationItem> => {
  const response = await apiClient.patch<NotificationItem>(`/api/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<NotificationItem[]> => {
  const response = await apiClient.patch<NotificationItem[]>('/api/notifications/read-all');
  return response.data;
};


// Staff APIs
export const getStaffQueues = async (): Promise<StaffQueue[]> => {
  const response = await apiClient.get<StaffQueue[]>('/api/staff/queues');
  return response.data;
};

export const getStaffDashboardSummary = async (): Promise<StaffDashboardSummary> => {
  const response = await apiClient.get<StaffDashboardSummary>('/api/staff/dashboard-summary');
  return response.data;
};

export const callNextCustomer = async (queueId: number): Promise<StaffActionResponse> => {
  const response = await apiClient.post<StaffActionResponse>(`/api/staff/queues/${queueId}/next`);
  return response.data;
};

export const startService = async (entryId: number): Promise<StaffActionResponse> => {
  const response = await apiClient.post<StaffActionResponse>(`/api/staff/queue-entry/${entryId}/start`);
  return response.data;
};

export const completeService = async (entryId: number): Promise<StaffActionResponse> => {
  const response = await apiClient.post<StaffActionResponse>(`/api/staff/queue-entry/${entryId}/complete`);
  return response.data;
};

export const skipCustomer = async (entryId: number): Promise<StaffActionResponse> => {
  const response = await apiClient.post<StaffActionResponse>(`/api/staff/queue-entry/${entryId}/skip`);
  return response.data;
};

export const noShowCustomer = async (entryId: number): Promise<StaffActionResponse> => {
  const response = await apiClient.post<StaffActionResponse>(`/api/staff/queue-entry/${entryId}/no-show`);
  return response.data;
};

// Admin Analytics APIs
import {
  AdminOverview, QueueVolumeHour, WaitTimesAnalysis, PeakHoursData,
  MetricsSummary, StaffMember, CounterItem
} from '../types/admin';

export const getAdminOverview = async (): Promise<AdminOverview> => {
  const response = await apiClient.get<AdminOverview>('/api/admin/analytics/overview');
  return response.data;
};

export const getQueueVolumeAnalytics = async (): Promise<QueueVolumeHour[]> => {
  const response = await apiClient.get<QueueVolumeHour[]>('/api/admin/analytics/queue-volume');
  return response.data;
};

export const getWaitTimeAnalytics = async (): Promise<WaitTimesAnalysis[]> => {
  const response = await apiClient.get<WaitTimesAnalysis[]>('/api/admin/analytics/wait-times');
  return response.data;
};

export const getPeakHoursAnalytics = async (): Promise<PeakHoursData[]> => {
  const response = await apiClient.get<PeakHoursData[]>('/api/admin/analytics/peak-hours');
  return response.data;
};

export const getMetricsSummary = async (): Promise<MetricsSummary> => {
  const response = await apiClient.get<MetricsSummary>('/api/admin/analytics/metrics-summary');
  return response.data;
};

// Admin CRUD Locations
export const adminGetLocations = async (): Promise<Location[]> => {
  const response = await apiClient.get<Location[]>('/api/admin/locations');
  return response.data;
};

export const adminCreateLocation = async (data: Partial<Location>): Promise<Location> => {
  const response = await apiClient.post<Location>('/api/admin/locations', data);
  return response.data;
};

export const adminUpdateLocation = async (id: number, data: Partial<Location>): Promise<Location> => {
  const response = await apiClient.put<Location>(`/api/admin/locations/${id}`, data);
  return response.data;
};

export const adminDeleteLocation = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/admin/locations/${id}`);
};

// Admin CRUD Services
export const adminGetServices = async (): Promise<any[]> => {
  const response = await apiClient.get<any[]>('/api/admin/services');
  return response.data;
};

export const adminCreateService = async (data: any): Promise<any> => {
  const response = await apiClient.post<any>('/api/admin/services', data);
  return response.data;
};

export const adminUpdateService = async (id: number, data: any): Promise<any> => {
  const response = await apiClient.put<any>(`/api/admin/services/${id}`, data);
  return response.data;
};

export const adminDeleteService = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/admin/services/${id}`);
};

// Admin Staff & Counters
export const adminGetStaff = async (): Promise<StaffMember[]> => {
  const response = await apiClient.get<StaffMember[]>('/api/admin/staff');
  return response.data;
};

export const adminCreateStaff = async (data: any): Promise<StaffMember> => {
  const response = await apiClient.post<StaffMember>('/api/admin/staff', data);
  return response.data;
};

export const adminGetCounters = async (): Promise<CounterItem[]> => {
  const response = await apiClient.get<CounterItem[]>('/api/admin/counters');
  return response.data;
};

export const adminCreateCounter = async (data: any): Promise<CounterItem> => {
  const response = await apiClient.post<CounterItem>('/api/admin/counters', data);
  return response.data;
};

// Organization APIs
import { Organization } from '../types/staff';

export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/api/admin/organizations');
  return response.data;
};

export const createOrganization = async (data: { name: string; code: string; description?: string }): Promise<Organization> => {
  const response = await apiClient.post<Organization>('/api/admin/organizations', data);
  return response.data;
};

