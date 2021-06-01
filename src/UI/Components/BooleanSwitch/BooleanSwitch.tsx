import React from "react";
import { Setting } from "@/Core";
import { Switch } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  setting: Setting;
  onChange: (value: boolean) => void;
  getLabel?(value: boolean, defaultValue: boolean): string;
}

export const BooleanSwitch: React.FC<Props> = ({
  setting: { name, value, defaultValue },
  onChange,
  getLabel,
}) => (
  <Switch
    id={name}
    label={
      getLabel ? getLabel(value, defaultValue) : words("setting.label.true")
    }
    labelOff={
      getLabel ? getLabel(value, defaultValue) : words("setting.label.false")
    }
    isChecked={value}
    onChange={onChange}
    aria-label={value ? `${name}-True` : `${name}-False`}
  />
);
