import React, { useContext } from "react";
import { CogIcon, InfoCircleIcon, KeyIcon } from "@patternfly/react-icons";
import { ErrorView, IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { EnvironmentTab } from "./Environment";
import { ConfigurationTab } from "./Configuration";
import { EnvironmentHandlerContext } from "@/UI/Dependency";
import { FlatEnvironment } from "@/Core";

export enum TabKey {
  Environment = "Environment",
  Configuration = "Configuration",
  Tokens = "Tokens",
}

interface Props {
  activeTab: TabKey;
  setActiveTab: (tabKey: TabKey) => void;
}

export const Tabs: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { environmentHandler } = useContext(EnvironmentHandlerContext);
  const selected = environmentHandler.useSelected();
  if (!selected) {
    return (
      <ErrorView
        aria-label="Environment-Failed"
        message={words("error.environment.missing")}
      />
    );
  }
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[
        environmentTab(selected),
        configurationTab(selected.id),
        tokensTab,
      ]}
    />
  );
};

const environmentTab = (
  environment: FlatEnvironment
): TabDescriptor<TabKey> => ({
  id: TabKey.Environment,
  title: words("settings.tabs.environment"),
  icon: <InfoCircleIcon />,
  view: <EnvironmentTab environment={environment} />,
});

const configurationTab = (environmentId: string): TabDescriptor<TabKey> => ({
  id: TabKey.Configuration,
  title: words("settings.tabs.configuration"),
  icon: <CogIcon />,
  view: <ConfigurationTab environmentId={environmentId} />,
});

const tokensTab: TabDescriptor<TabKey> = {
  id: TabKey.Tokens,
  title: words("settings.tabs.tokens"),
  icon: <KeyIcon />,
  view: <p>tokensTab</p>,
};
