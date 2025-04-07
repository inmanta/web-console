import { EventType, LogLevelString } from "@/Core/Domain";

export interface Callback {
  callback_id: string;
  url: string;
  environment: string;
  service_entity: string;
  event_types: string[] | null;
  minimal_log_level: string | null;
  minimal_log_level_text: string | null;
}

export interface CreateCallbackBody {
  callback_url: string;
  callback_id?: string;
  service_entity: string;
  minimal_log_level?: LogLevelString;
  event_types?: EventType[];
}
