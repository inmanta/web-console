import { LogLevelString } from "./LogLevel";
import { DateRange } from "./DateRange";

export interface ResourceLog {
  level: LogLevelString;
  msg: string;
  args: [];
  kwargs: Record<string, string>;
  timestamp: string;
  action_id: string;
  action: string;
}

export interface ResourceLogFilter {
  minimal_log_level?: string;
  action?: string[];
  message?: string[];
  timestamp?: DateRange[];
}
