import React from "react";
import { Switch } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  name: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  getLabel?(value: boolean): string;
  isDisabled?: boolean;
}

export const BooleanSwitch: React.FC<Props> = ({
  name,
  isChecked,
  onChange,
  getLabel,
  isDisabled,
}) => (
  <Switch
    id={name}
    label={getLabel ? getLabel(isChecked) : words("setting.label.true")}
    labelOff={getLabel ? getLabel(isChecked) : words("setting.label.false")}
    isChecked={isChecked}
    onChange={(_event, checked) => onChange(checked)}
    aria-label={isChecked ? `${name}-True` : `${name}-False`}
    isDisabled={isDisabled}
  />
);
