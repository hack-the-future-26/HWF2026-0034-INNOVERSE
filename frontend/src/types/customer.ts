export type LocationType = 'hospital' | 'bank' | 'retail' | 'government';
export type QueueEntryStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'SKIPPED' | 'NO_SHOW' | 'CANCELLED';

export interface Service {
  id: number;
  location_id: number;
  name: string;
  description?: string;
  average_service_time: number;
  status: string;
  people_in_queue: number;
  active_counters: number;
  estimated_wait_minutes: number;
  confidence?: number;
  ai_powered?: boolean;
}

export interface Location {
  id: number;
  name: string;
  type: LocationType;
  address: string;
  latitude?: number;
  longitude?: number;
  status: string;
  is_open: boolean;
  total_queue_size: number;
  estimated_wait_minutes: number;
  services_count: number;
  services: Service[];
}

export interface QueueEntry {
  id: number;
  queue_id: number;
  user_id?: number;
  location_id: number;
  location_name: string;
  service_id: number;
  service_name: string;
  token_number: string;
  position: number;
  people_ahead: number;
  now_serving_token?: string;
  status: QueueEntryStatus;
  joined_at: string;
  called_at?: string;
  completed_at?: string;
  estimated_wait: number;
  confidence?: number;
  ai_powered?: boolean;
  timeline_stage: number;
}


export interface NotificationItem {
  id: number;
  user_id: number;
  queue_entry_id?: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
