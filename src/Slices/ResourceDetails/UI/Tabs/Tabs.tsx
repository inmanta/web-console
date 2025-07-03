import React from "react";
import { ColumnsIcon, HistoryIcon, ListIcon, ModuleIcon, TableIcon } from "@patternfly/react-icons";
import { Details } from "@/Core/Domain/Resource/Resource";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { AttributesTab } from "./AttributesTab";
import { FactsTab } from "./FactsTab";
import { ResourceHistoryView } from "./HistoryTab/ResourceHistoryView";
import { ResourceLogView } from "./LogTab";
import { RequiresTab } from "./RequiresTab";

export enum TabKey {
  Requires = "Requires",
  Attributes = "Attributes",
  History = "History",
  Logs = "Logs",
  Facts = "Facts",
}

interface Props {
  id: string;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  data: Details;
}

/**
 * The Tabs component.
 *
 * This component is responsible of displaying the tabs of the resource details.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The id of the resource
 *  @prop {TabKey} activeTab - The active tab
 *  @prop {(tab: TabKey) => void} setActiveTab - The function to set the active tab
 *  @prop {Details} data - The data of the resource
 *
 * @returns {React.FC<Props>} A React Component displaying the tabs of the resource details
 */
export const Tabs: React.FC<Props> = ({ id, activeTab, setActiveTab, data }) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[
        attributesTab(data),
        requiresTab(data),
        historyTab(id, data),
        logTab(id),
        factsTab(id),
      ]}
    />
  );
};

const requiresTab = (data: Details): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("resources.requires.title"),
  icon: <ModuleIcon />,
  view: <RequiresTab details={data} />,
});

const attributesTab = (data: Details): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.attributes.title"),
  icon: <ListIcon />,
  view: <AttributesTab details={data} />,
});

const historyTab = (id: string, data: Details): TabDescriptor<TabKey> => ({
  id: TabKey.History,
  title: words("resources.history.title"),
  icon: <HistoryIcon />,
  view: <ResourceHistoryView resourceId={id} details={data} />,
});

const logTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Logs,
  title: words("resources.logs.title"),
  icon: <TableIcon />,
  view: <ResourceLogView resourceId={id} />,
});

const factsTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Facts,
  title: words("resources.facts.title"),
  icon: <ColumnsIcon />,
  view: <FactsTab resourceId={id} />,
});
