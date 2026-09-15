export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database_status: string;
  timestamp: string;
  cors_allowed: boolean;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
