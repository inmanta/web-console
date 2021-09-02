export interface Callback {
  callback_id: string;
  url: string;
  environment: string;
  service_entity: string;
  event_types: string[];
  minimal_log_level: string;
}

export interface CreateCallbackBody {
  callback_url: string;
  callback_id?: string;
  service_entity: string;
}
