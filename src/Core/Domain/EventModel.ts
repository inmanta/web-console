import { ParsedNumber } from '@/Core/Language';
import { SeverityText } from '@/Slices/Notification/Core/Domain';
import { EventType } from './EventType';
import { LogLevelNumber } from './LogLevel';

export interface InstanceEvent {
  id: string;
  service_instance_id: string;
  service_instance_version: ParsedNumber;
  timestamp: string;
  source: string | null;
  destination: string | null;
  message: string;
  ignored_transition: boolean;
  event_correlation_id: string;
  severity: LogLevelNumber;
  severity_text?: SeverityText;
  id_compile_report: string | null;
  event_type: EventType;
  is_error_transition: boolean;
  service_desired_state_version?: ParsedNumber;
}

export interface EventRow {
  id: string;
  serviceInstanceId: string;
  serviceInstanceVersion: ParsedNumber;
  timestamp: string;
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
