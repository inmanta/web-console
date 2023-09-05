import {
  global_danger_color_100,
  global_Color_200,
  global_info_color_100,
  global_success_color_100,
  global_warning_color_100,
} from "@patternfly/react-tokens";
import { Severity } from "@S/Notification/Core/Domain";

export const getSeverityForNotification = (
  severity: Severity,
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

export const getColorForVisualSeverity = (severity: VisualSeverity): string => {
  switch (severity) {
    case "danger":
      return global_danger_color_100.var;
    case "warning":
      return global_warning_color_100.var;
    case "default":
      return global_Color_200.var;
    case "info":
      return global_info_color_100.var;
    case "success":
      return global_success_color_100.var;
  }
};
