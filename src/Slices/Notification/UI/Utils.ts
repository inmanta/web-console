import {
  t_temp_dev_tbd as global_danger_color_100 /* CODEMODS: you should update this color token */,
  t_temp_dev_tbd as global_Color_200 /* CODEMODS: you should update this color token */,
  t_temp_dev_tbd as global_info_color_100 /* CODEMODS: you should update this color token */,
  t_temp_dev_tbd as global_success_color_100 /* CODEMODS: you should update this color token */,
  t_temp_dev_tbd as global_warning_color_100 /* CODEMODS: you should update this color token */,
} from "@patternfly/react-tokens";
import { Severity } from "@S/Notification/Core/Domain";

export const getSeverityForNotification = (
  severity: Severity,
): VisualSeverity => {
  switch (severity) {
    case "error":
      return "danger";
    case "message":
      return "custom";
    default:
      return severity;
  }
};

export type VisualSeverity =
  | "custom"
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
    case "custom":
      return global_Color_200.var;
    case "info":
      return global_info_color_100.var;
    case "success":
      return global_success_color_100.var;
  }
};
