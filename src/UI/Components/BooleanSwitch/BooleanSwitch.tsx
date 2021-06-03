import React from "react";
import { Switch } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
  getLabel?(value: boolean): string;
}

export const BooleanSwitch: React.FC<Props> = ({
  name,
  value,
  onChange,
  getLabel,
}) => (
  <Switch
    id={name}
    label={getLabel ? getLabel(value) : words("setting.label.true")}
    labelOff={getLabel ? getLabel(value) : words("setting.label.false")}
    isChecked={value}
    onChange={onChange}
    aria-label={value ? `${name}-True` : `${name}-False`}
  />
);
