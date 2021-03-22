import React from "react";
import { Setting } from "@/Core";
import { Switch } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  setting: Setting;
  onChange: (value: boolean) => void;
}

export const DefaultSwitch: React.FC<Props> = ({
  setting: { name, value, defaultValue },
  onChange,
}) => (
  <Switch
    id={name}
    label={
      value && defaultValue
        ? words("setting.label.trueDefault")
        : words("setting.label.true")
    }
    labelOff={
      !value && !defaultValue
        ? words("setting.label.falseDefault")
        : words("setting.label.false")
    }
    isChecked={value}
    onChange={onChange}
  />
);
