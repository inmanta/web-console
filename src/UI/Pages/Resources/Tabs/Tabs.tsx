import React from "react";
import { InfoCircleIcon, ListIcon, ModuleIcon } from "@patternfly/react-icons";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { DetailsTab } from "./DetailsTab";
import { RequiresTab } from "./RequiresTab";
import { AttributesTab } from "./AttributesTab";

export enum TabKey {
  Details = "Details",
  Requires = "Requires",
  Attributes = "Attributes",
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
      tabs={[detailsTab(id), requiresTab(id), attributesTab(id)]}
    />
  );
};

const detailsTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Details,
  title: words("resources.details.title"),
  icon: <InfoCircleIcon />,
  view: <DetailsTab id={id} />,
});

const requiresTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("resources.requires.title"),
  icon: <ModuleIcon />,
  view: <RequiresTab id={id} />,
});

const attributesTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.attributes.title"),
  icon: <ListIcon />,
  view: <AttributesTab id={id} />,
});
