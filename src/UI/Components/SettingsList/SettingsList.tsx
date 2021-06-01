import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Setting } from "@/Core";

interface Props {
  settings: Setting[];
  onChange: (name: string, value: boolean) => void;
  Switch: React.FC<{ setting: Setting; onChange: (value: boolean) => void }>;
}

export const SettingsList: React.FC<Props> = ({
  settings,
  onChange,
  Switch,
}) => {
  if (settings.length <= 0) return null;

  const handleChange = (name: string) => (value: boolean) =>
    onChange(name, value);

  return (
    <Flex aria-label="SettingsList">
      <Flex
        direction={{ default: "column" }}
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        alignSelf={{ default: "alignSelfStretch" }}
      >
        {settings.map((setting) => (
          <FlexItem key={setting.name}>{setting.name}</FlexItem>
        ))}
      </Flex>
      <Flex direction={{ default: "column" }}>
        {settings.map((setting) => (
          <FlexItem key={setting.name}>
            <Switch setting={setting} onChange={handleChange(setting.name)} />
          </FlexItem>
        ))}
      </Flex>
    </Flex>
  );
};
