import React from "react";

import { DefaultSwitch } from "./DefaultSwitch";

export default {
  title: "DefaultSwitch",
  component: DefaultSwitch,
};

const Template: React.FC<{ defaultValue: boolean }> = ({ defaultValue }) => {
  const [value, setValue] = React.useState(false);

  return (
    <DefaultSwitch
      name="test"
      value={value}
      onChange={setValue}
      defaults={{ test: defaultValue }}
    />
  );
};

export const DefaultOn: React.FC = () => <Template defaultValue={true} />;
export const DefaultOff: React.FC = () => <Template defaultValue={false} />;
