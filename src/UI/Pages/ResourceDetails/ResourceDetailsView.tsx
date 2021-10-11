import React, { useState } from "react";
import { TabKey, Tabs } from "./Tabs";

interface Props {
  resourceId: string;
}
export const ResourceDetailsView: React.FC<Props> = ({ resourceId }) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Info);
  return (
    <Tabs id={resourceId} activeTab={activeTab} setActiveTab={setActiveTab} />
  );
};
