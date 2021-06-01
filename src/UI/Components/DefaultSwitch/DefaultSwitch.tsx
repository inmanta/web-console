import React from "react";
import { Setting } from "@/Core";
import { BooleanSwitch } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  setting: Setting;
  onChange: (value: boolean) => void;
}

export const DefaultSwitch: React.FC<Props> = (props) => (
  <BooleanSwitch {...props} getLabel={getLabel} />
);

function getLabel(value: boolean, defaultValue: boolean): string {
  if (value) {
    return defaultValue
      ? words("setting.label.trueDefault")
      : words("setting.label.true");
  }
  return !defaultValue
    ? words("setting.label.falseDefault")
    : words("setting.label.false");
}
