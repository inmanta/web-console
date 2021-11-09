import React from "react";
import { useUrlStateWithString } from "@/Data";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { TabKey, Tabs } from "./Tabs";

export const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Environment,
    key: `tab`,
    route: "Settings",
  });

  return (
    <PageSectionWithTitle title={words("settings.title")}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </PageSectionWithTitle>
  );
};
