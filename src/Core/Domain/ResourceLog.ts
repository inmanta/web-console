/**
 * @TODO replace logLevel type with LogLevel
 */
export interface ResourceLog {
  level: string;
  msg: string;
  args: [];
  kwargs: Record<string, string>;
  timestamp: string; // timestamp
  action_id: string;
  action: string;
}

export interface ResourceLogFilter {
  minimal_log_level?: string;
  action?: string[];
  message?: string[];
}
