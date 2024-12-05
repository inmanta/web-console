import React from "react";
import { Label, LabelProps } from "@patternfly/react-core";

interface Props {
  status: NonNullable<LabelProps["status"] | LabelProps["color"]>;
}

const nonStatus: LabelProps["color"][] = ["grey", "purple"];

// type guard function that checks if a value is a valid LabelProps["color"]
const isColor = (value): value is LabelProps["color"] => {
  return nonStatus.includes(value);
};

/**
 * The ResourceStatusLabel component
 *
 * @param {Props} props - Props for the ResourceStatusLabel component
 * @param {NonNullable<LabelProps["status"] | LabelProps["color"]>} props.status - Status of the resource
 * @returns React Component rendering a Label with the status of the resource
 */
export const ResourceStatusLabel: React.FC<Props> = ({ status }) => {
  if (!isColor(status)) {
    return (
      <Label variant="outline" status={status} aria-label={`Status-${status}`}>
        {status}
      </Label>
    );
  }

  return (
    <Label color={status} aria-label={`Status-${status}`}>
      {status}
    </Label>
  );
};
