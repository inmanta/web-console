import React, { useContext, useRef } from "react";
import { TabContentBody, Tooltip } from "@patternfly/react-core";
import { CogIcon, InfoCircleIcon, KeyIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { IconTabs, TabDescriptor } from "@inmanta/web-console-ui/Components/IconTabs";
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
  const tokenTooltipRef = useRef<HTMLElement | undefined>(undefined);
  const selected = environmentHandler.useSelected();
  const tokenTabDisabled = authHelper.isDisabled();

  if (!selected) {
    return (
      <ErrorView ariaLabel="Environment-Failed" message={words("error.environment.missing")} />
    );
  }

  return (
    <>
      <IconTabs
        isSticky
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          environmentTab(),
          configurationTab(selected.id),
          tokensTab(tokenTabDisabled, tokenTooltipRef),
        ]}
      />
      {tokenTabDisabled && (
        <Tooltip content={words("settings.tabs.token.disabledInfo")} triggerRef={tokenTooltipRef} />
      )}
    </>
  );
};

const environmentTab = (): TabDescriptor<TabKey> => ({
  id: TabKey.Environment,
  title: words("settings.tabs.environment"),
  icon: <InfoCircleIcon />,
  view: (
    <TabContentBody hasPadding>
      <EnvironmentTab />
    </TabContentBody>
  ),
});

const configurationTab = (environmentId: string): TabDescriptor<TabKey> => ({
  id: TabKey.Configuration,
  title: words("settings.tabs.configuration"),
  icon: <CogIcon />,
  view: <ConfigurationTab environmentId={environmentId} />,
});

const tokensTab = (
  isDisabled: boolean,
  ref: React.MutableRefObject<HTMLElement | undefined>
): TabDescriptor<TabKey> => ({
  id: TabKey.Tokens,
  title: words("settings.tabs.tokens"),
  icon: <KeyIcon />,
  view: <TokenTab />,
  isDisabled,
  ref,
});
