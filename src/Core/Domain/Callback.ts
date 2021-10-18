import { EventType } from "./EventType";
import { LogLevelString } from "./LogLevel";

export interface Callback {
  callback_id: string;
  url: string;
  environment: string;
  service_entity: string;
  event_types: string[] | null;
  minimal_log_level: string | null;
}

export interface CreateCallbackBody {
  callback_url: string;
  callback_id?: string;
  service_entity: string;
  minimal_log_level?: LogLevelString;
  event_types?: EventType[];
}
