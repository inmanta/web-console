import React from "react";
import { CogIcon, InfoCircleIcon, KeyIcon } from "@patternfly/react-icons";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { EnvironmentTab } from "./Environment";
import { ConfigurationTab } from "./Configuration";

export enum TabKey {
  Environment = "Environment",
  Configuration = "Configuration",
  Tokens = "Tokens",
}

interface Props {
  activeTab: TabKey;
  setActiveTab: (tabKey: TabKey) => void;
}

export const Tabs: React.FC<Props> = ({ activeTab, setActiveTab }) => (
  <IconTabs
    activeTab={activeTab}
    onChange={setActiveTab}
    tabs={[environmentTab, configurationTab, tokensTab]}
  />
);

const environmentTab: TabDescriptor<TabKey> = {
  id: TabKey.Environment,
  title: words("settings.tabs.environment"),
  icon: <InfoCircleIcon />,
  view: <EnvironmentTab />,
};

const configurationTab: TabDescriptor<TabKey> = {
  id: TabKey.Configuration,
  title: words("settings.tabs.configuration"),
  icon: <CogIcon />,
  view: <ConfigurationTab />,
};

const tokensTab: TabDescriptor<TabKey> = {
  id: TabKey.Tokens,
  title: words("settings.tabs.tokens"),
  icon: <KeyIcon />,
  view: <p>tokensTab</p>,
};
