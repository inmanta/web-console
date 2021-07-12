import React from "react";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { DetailsTab } from "./DetailsTab";

export enum TabKey {
  Details = "Details",
}

interface Props {
  id: string;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export const Tabs: React.FC<Props> = ({ id, activeTab, setActiveTab }) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[detailsTab(id)]}
    />
  );
};

const detailsTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Details,
  title: words("resources.details.title"),
  icon: <InfoCircleIcon />,
  view: <DetailsTab id={id} />,
});
