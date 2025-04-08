import {
  t_global_icon_color_status_danger_default,
  t_global_icon_color_status_custom_default,
  t_global_color_brand_default,
  t_global_icon_color_status_success_default,
  t_global_icon_color_status_warning_default,
} from "@patternfly/react-tokens";
import { Severity } from "@S/Notification/Core/Domain";

export const getSeverityForNotification = (severity: Severity): VisualSeverity => {
  switch (severity) {
    case "error":
      return "danger";
    case "message":
      return "custom";
    default:
      return severity;
  }
};

export type VisualSeverity = "custom" | "success" | "danger" | "warning" | "info";

export const getColorForVisualSeverity = (severity: VisualSeverity): string => {
  switch (severity) {
    case "danger":
      return t_global_icon_color_status_danger_default.var;
    case "warning":
      return t_global_icon_color_status_warning_default.var;
    case "custom":
      return t_global_icon_color_status_custom_default.var;
    case "info":
      return t_global_color_brand_default.var;
    case "success":
      return t_global_icon_color_status_success_default.var;
  }
};
