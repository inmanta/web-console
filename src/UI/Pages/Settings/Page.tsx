import React from "react";
import { words } from "@/UI/words";
import { PageSectionWithTitle } from "@/UI/Components";
import { useUrlStateWithString } from "@/Data";
import { TabKey, Tabs } from "./Tabs";

export const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Environment,
    key: `tab`,
    route: "Settings",
  });

  return (
    <PageSectionWithTitle title={words("inventory.title")}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </PageSectionWithTitle>
  );
};
