import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { DefaultSwitch } from "@/UI/Components";

interface Setting {
  name: string;
  value: boolean;
  defaultValue: boolean;
}

interface Props {
  settings: Setting[];
}

export const ConfigView: React.FC<Props> = ({ settings }) => {
  if (settings.length <= 0) return null;

  const handleChange = (name: string) => (value: boolean) => {
    console.log(name, value);
  };

  return (
    <Flex>
      <Flex direction={{ default: "column" }}>
        {settings.map((setting) => (
          <FlexItem key={setting.name}>{setting.name}</FlexItem>
        ))}
      </Flex>
      <Flex direction={{ default: "column" }}>
        {settings.map((setting) => (
          <FlexItem key={setting.name}>
            <DefaultSwitch
              setting={setting}
              onChange={handleChange(setting.name)}
            />
          </FlexItem>
        ))}
      </Flex>
    </Flex>
  );
};
