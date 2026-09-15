import { QueueEntryStatus } from './customer';

export interface Organization {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface StaffDashboardSummary {
  active_queues_count: number;
  waiting_customers_count: number;
  currently_serving_count: number;
  completed_today_count: number;
  average_wait_time: number;
  active_counters_count: number;
}

export interface NextCustomer {
  id: number;
  token_number: string;
  user_name: string;
  joined_at: string;
  estimated_wait_minutes: number;
  position: number;
}

export interface StaffQueue {
  id: number;
  organization_id?: number;
  organization_name?: string;
  location_id: number;
  location_name: string;
  service_id: number;
  service_name: string;
  status: string;
  current_token: number;
  now_serving_id?: number;
  now_serving_token?: string;
  now_serving_user?: string;
  now_serving_counter?: string;
  now_serving_status?: string;
  waiting_count: number;
  next_customers: NextCustomer[];
}

export interface StaffActionResponse {
  message: string;
  queue_entry_id: number;
  token_number: string;
  status: QueueEntryStatus;
  counter_name?: string;
}
