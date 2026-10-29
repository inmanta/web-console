import React from "react";
import { words } from "@inmanta/web-console-core";
import { useUrlStateWithString } from "@inmanta/web-console-core/Common";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { TabKey, Tabs } from "./Tabs";

export const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Environment,
    key: "tab",
    route: "Settings",
  });

  return (
    <PageContainer pageTitle={words("settings.title")}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </PageContainer>
  );
};
