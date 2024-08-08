import React from "react";
import { Config } from "@/Core";
import { BooleanSwitch } from "@/UI/Components/BooleanSwitch";
import { words } from "@/UI/words";

interface Props {
  name: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  defaults: Config;
  isDisabled?: boolean;
}

export const DefaultSwitch: React.FC<Props> = ({
  name,
  isChecked,
  onChange,
  defaults,
  isDisabled,
}) => (
  <BooleanSwitch
    name={name}
    isChecked={isChecked}
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
        ? words("setting.label.trueDefault")
        : words("setting.label.true");
    }
    return !defaultValue
      ? words("setting.label.falseDefault")
      : words("setting.label.false");
  };
