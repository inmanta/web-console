import React from "react";
import { EnvironmentSettings } from "@/Core";
import { Switch } from "@patternfly/react-core";

interface Props {
  info: EnvironmentSettings.BooleanInputInfo;
}

export const BooleanInput: React.FC<Props> = ({ info }) => (
  <Switch isChecked={info.value} onChange={info.set} aria-label={info.name} />
);
