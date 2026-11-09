import React from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoAltIcon,
  OutlinedCircleIcon,
} from "@patternfly/react-icons";
import { SummaryLabel } from "./types";

interface Props {
  label: SummaryLabel;
  title?: string;
}

/**
 * The icon of a lifecycle label, the same in every status label. It takes its color from where
 * it is placed, such as a status label or a PatternFly `Icon`.
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
      return <InfoAltIcon title={title} />;
    case "no_label":
      return <OutlinedCircleIcon title={title} />;
  }
};
