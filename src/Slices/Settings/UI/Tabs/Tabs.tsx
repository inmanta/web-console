import React, { useContext, useRef } from "react";
import { Tooltip } from "@patternfly/react-core";
import { CogIcon, InfoCircleIcon, KeyIcon } from "@patternfly/react-icons";
import { ErrorView, IconTabs, TabDescriptor } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ConfigurationTab } from "./Configuration";
import { EnvironmentTab } from "./Environment";
import { TokenTab } from "./Token";

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
  const { authHelper, environmentHandler } = useContext(DependencyContext);
  const tokenTooltipRef = useRef<HTMLElement>();
  const selected = environmentHandler.useSelected();
  const tokenTabDisabled = authHelper.isDisabled();

  if (!selected) {
    return (
      <ErrorView
        aria-label="Environment-Failed"
        message={words("error.environment.missing")}
      />
    );
  }

  return (
    <>
      <IconTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          environmentTab(),
          configurationTab(selected.id),
          tokensTab(tokenTabDisabled, tokenTooltipRef),
        ]}
      />
      {tokenTabDisabled && (
        <Tooltip
          content={words("settings.tabs.token.disabledInfo")}
          triggerRef={tokenTooltipRef}
        />
      )}
    </>
  );
};

const environmentTab = (): TabDescriptor<TabKey> => ({
  id: TabKey.Environment,
  title: words("settings.tabs.environment"),
  icon: <InfoCircleIcon />,
  view: <EnvironmentTab />,
});

const configurationTab = (environmentId: string): TabDescriptor<TabKey> => ({
  id: TabKey.Configuration,
  title: words("settings.tabs.configuration"),
  icon: <CogIcon />,
  view: <ConfigurationTab environmentId={environmentId} />,
});

const tokensTab = (
  isDisabled: boolean,
  ref: React.MutableRefObject<HTMLElement | undefined>,
): TabDescriptor<TabKey> => ({
  id: TabKey.Tokens,
  title: words("settings.tabs.tokens"),
  icon: <KeyIcon />,
  view: <TokenTab />,
  isDisabled,
  ref,
});
