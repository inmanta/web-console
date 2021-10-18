import { DateInfo } from "./InventoryTable";
import { LogLevelNumber } from "./LogLevel";
import { EventType } from "./EventType";

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
  severity: LogLevelNumber;
  id_compile_report: string | null;
  event_type: EventType;
  is_error_transition: boolean;
}

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
  severity: LogLevelNumber;
  idCompileReport: string | null;
  eventType: EventType;
  isErrorTransition: boolean;
  fullJson: InstanceEvent;
}
