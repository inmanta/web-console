import { Severity } from "@S/Notification/Core/Model";

export const getSeverityForNotification = (
  severity: Severity
): VisualSeverity => {
  switch (severity) {
    case "error":
      return "danger";
    case "message":
      return "default";
    default:
      return severity;
  }
};

export type VisualSeverity =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info";
