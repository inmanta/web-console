type Timestamp = string;

export type Severity = "message" | "info" | "success" | "warning" | "error";
export type SeverityText = "MESSAGE" | "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export const severityList: Severity[] = ["message", "info", "success", "warning", "error"];

export interface Notification extends Flags {
  environment: string;
  id: string;
  created: Timestamp;
  title: string;
  message: string;
  severity: Severity;
  uri: string | null;
}

interface Flags {
  read: boolean;
  cleared: boolean;
}

export type Body = Pick<Flags, "read"> | Pick<Flags, "cleared"> | Flags;
