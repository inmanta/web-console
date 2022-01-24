import React from "react";
import { useUrlStateWithString } from "@/Data";
import { TabKey, Tabs } from "./Tabs";

interface Props {
  resourceId: string;
}
export const ResourceDetailsView: React.FC<Props> = ({ resourceId }) => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Info,
    key: `tab`,
    route: "ResourceDetails",
  });
  return (
    <Tabs id={resourceId} activeTab={activeTab} setActiveTab={setActiveTab} />
  );
};
