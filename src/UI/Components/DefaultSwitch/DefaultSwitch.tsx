import React from "react";
import { Config } from "@/Core";
import { BooleanSwitch } from "@/UI/Components/BooleanSwitch";
import { words } from "@/UI/words";

interface Props {
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
  defaults: Config;
  isDisabled?: boolean;
}

export const DefaultSwitch: React.FC<Props> = ({
  name,
  value,
  onChange,
  defaults,
  isDisabled,
}) => (
  <BooleanSwitch
    name={name}
    value={value}
    onChange={onChange}
    getLabel={getLabel(defaults[name])}
    isDisabled={isDisabled}
  />
);

const getLabel =
  (defaultValue: boolean) =>
  (value: boolean): string => {
    if (value) {
      return defaultValue
        ? words("config.setting.label.trueDefault")
        : words("config.setting.label.true");
    }
    return !defaultValue
      ? words("config.setting.label.falseDefault")
      : words("config.setting.label.false");
  };
