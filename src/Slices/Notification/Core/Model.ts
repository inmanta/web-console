type Timestamp = string;

export type Severity = "message" | "info" | "success" | "warning" | "error";
export const severityList: Severity[] = [
  "message",
  "info",
  "success",
  "warning",
  "error",
];

export interface Model extends Flags {
  environment: string;
  id: string;
  created: Timestamp;
  title: string;
  message: string;
  severity: Severity;
  uri: string;
}

export interface Flags {
  read: boolean;
  cleared: boolean;
}

export type Body = Pick<Flags, "read"> | Pick<Flags, "cleared"> | Flags;
