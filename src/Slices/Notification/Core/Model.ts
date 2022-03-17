type Timestamp = string;

export type Severity = "message" | "info" | "success" | "warning" | "error";

export interface Model {
  environment: string;
  id: string;
  created: Timestamp;
  title: string;
  message: string;
  severity: Severity;
  uri: string;
  read: boolean;
  cleared: boolean;
}
