type Timestamp = string;

type SeverityLevel = "message" | "info" | "success" | "warning" | "error";

export interface Model {
  environment: string;
  id: string;
  created: Timestamp;
  title: string;
  message: string;
  severity: SeverityLevel;
  uri: string;
  read: boolean;
  cleared: boolean;
}
