export interface AdminOverview {
  total_locations: number;
  total_services: number;
  total_staff: number;
  total_customers_served: number;
  average_wait_time_minutes: number;
  cancellation_rate: number;
  no_show_rate: number;
  counter_utilization_rate: number;
}

export interface QueueVolumeHour {
  hour: string;
  volume: number;
  completed: number;
  cancelled: number;
}

export interface WaitTimesAnalysis {
  service_id: number;
  service_name: string;
  location_name: string;
  avg_wait_minutes: number;
  target_wait_minutes: number;
}

export interface PeakHoursData {
  hour: string;
  people_count: number;
  peak_factor: number;
  busy_level: string;
}

export interface MetricsSummary {
  cancellation_rate_percent: number;
  no_show_rate_percent: number;
  counter_utilization_percent: number;
  total_entries_analyzed: number;
  avg_service_duration_minutes: number;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id?: number;
  organization_name?: string;
  counter_id?: number;
  counter_name?: string;
  created_at: string;
}

export interface CounterItem {
  id: number;
  location_id: number;
  location_name?: string;
  name: string;
  staff_id?: number;
  staff_name?: string;
  status: string;
}
