import React from "react";
import {
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoAltIcon,
} from "@patternfly/react-icons";
import {
  t_global_icon_color_nonstatus_on_blue_default,
  t_global_icon_color_subtle,
} from "@patternfly/react-tokens";
import { SummaryLabel } from "./types";

interface Props {
  label: SummaryLabel;
  title?: string;
}

/**
 * The icon of a lifecycle label, the same in every status label. It takes its color from where
 * it is placed, such as a status label or a PatternFly `Icon`, except "info", which is always the
 * blue of a blue PatternFly `Label`, and "no_label", which is always a grey dot.
 *
 * @props {Props} props - The props of the component.
 *  @prop {SummaryLabel} label - The label to show the icon of.
 *  @prop {string} [title] - The accessible name of the icon. Without it the icon is hidden from
 *  screen readers.
 *
 * @returns {React.FC<Props>} The icon.
 */
export const LabelIcon: React.FC<Props> = ({ label, title }) => {
  switch (label) {
    case "danger":
      return <ExclamationCircleIcon title={title} />;
    case "warning":
      return <ExclamationTriangleIcon title={title} />;
    case "success":
      return <CheckCircleIcon title={title} />;
    case "info":
      return (
        <InfoAltIcon title={title} color={t_global_icon_color_nonstatus_on_blue_default.var} />
      );
    case "no_label":
      return <CircleIcon title={title} color={t_global_icon_color_subtle.var} />;
  }
};
