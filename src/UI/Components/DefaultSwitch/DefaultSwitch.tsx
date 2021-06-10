import React from "react";
import { Config } from "@/Core";
import { BooleanSwitch } from "@/UI/Components/BooleanSwitch";
import { words } from "@/UI/words";

interface Props {
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
  defaults: Config;
}

export const DefaultSwitch: React.FC<Props> = ({
  name,
  value,
  onChange,
  defaults,
}) => (
  <BooleanSwitch
    name={name}
    value={value}
    onChange={onChange}
    getLabel={getLabel(defaults[name])}
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
