import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Config } from "@/Core";

interface Props {
  config: Config;
  onChange: (name: string, value: boolean) => void;
  Switch: React.FC<{
    name: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }>;
}

interface Setting {
  name: string;
  value: boolean;
}

export const SettingsList: React.FC<Props> = ({ config, onChange, Switch }) => {
  const settings = configToSettings(config);
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
        {settings.map(({ name }) => (
          <FlexItem key={name}>{name}</FlexItem>
        ))}
      </Flex>
      <Flex direction={{ default: "column" }}>
        {settings.map(({ name, value }) => (
          <FlexItem key={name}>
            <Switch name={name} value={value} onChange={handleChange(name)} />
          </FlexItem>
        ))}
      </Flex>
    </Flex>
  );
};

function configToSettings(config: Config): Setting[] {
  return Object.entries(config).map(([name, value]) => ({
    name,
    value,
  }));
}
