import { DateInfo } from "./InventoryTable";

export interface InstanceEvent {
  id: string;
  service_instance_id: string;
  service_instance_version: number;
  timestamp: string;
  source: string | null;
  destination: string | null;
  message: string;
  ignored_transition: boolean;
  event_correlation_id: string;
  severity: LogLevel;
  id_compile_report: string | null;
  event_type: InstanceEventType;
  is_error_transition: boolean;
}

enum LogLevel {
  CRITICAL = 50,
  ERROR = 40,
  WARNING = 30,
  INFO = 20,
  DEBUG = 10,
  TRACE = 3,
  NOTSET = 0,
}
export type InstanceEventType =
  | "CREATE_TRANSITION"
  | "API_SET_STATE_TRANSITION"
  | "ON_UPDATE_TRANSITION"
  | "ON_DELETE_TRANSITION"
  | "RESOURCE_TRANSITION"
  | "RESOURCE_EVENT"
  | "AUTO_TRANSITION"
  | "ALLOCATION_UPDATE";

export interface EventRow {
  id: string;
  serviceInstanceId: string;
  serviceInstanceVersion: number;
  timestamp: DateInfo;
  source: string | null;
  destination: string | null;
  message: string;
  ignoredTransition: boolean;
  eventCorrelationId: string;
  severity: LogLevel;
  idCompileReport: string | null;
  eventType: InstanceEventType;
  isErrorTransition: boolean;
  fullJson: InstanceEvent;
}
