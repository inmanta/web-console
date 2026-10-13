import React from "react";
import { useUrlStateWithString } from "@/Data/Common";
import { PageContainer } from "@/UI/Components/PageContainer";
import { words } from "@/UI/words";
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
