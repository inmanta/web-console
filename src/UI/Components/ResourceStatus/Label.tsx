import React from "react";
import { Label } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { labelColorConfig } from "./ColorConfig";

interface Props {
  status: Resource.Status;
}

export const ResourceStatusLabel: React.FC<Props> = ({ status }) => (
  <Label color={labelColorConfig[status]} aria-label={`Status-${status}`}>
    {status}
  </Label>
);
