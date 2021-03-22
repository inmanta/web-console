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
      setting={{ name: "test", value, defaultValue }}
      onChange={setValue}
    />
  );
};

export const DefaultOn: React.FC = () => <Template defaultValue={true} />;
export const DefaultOff: React.FC = () => <Template defaultValue={false} />;
