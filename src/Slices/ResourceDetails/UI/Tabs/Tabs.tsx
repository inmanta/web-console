import React from "react";
import { ColumnsIcon, HistoryIcon, ListIcon, ModuleIcon, TableIcon } from "@patternfly/react-icons";
import { ResourceDetailsTab } from "@/Core/Domain";
import { Details } from "@/Core/Domain/Resource/Resource";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { AttributesTab } from "./AttributesTab";
import { FactsTab } from "./FactsTab";
import { ResourceHistoryView } from "./HistoryTab/ResourceHistoryView";
import { ResourceLogView } from "./LogTab";
import { RequiresTab } from "./RequiresTab";

interface Props {
  id: string;
  activeTab: ResourceDetailsTab;
  setActiveTab: (tab: ResourceDetailsTab) => void;
  data: Details;
}

/**
 * The Tabs component.
 *
 * This component is responsible of displaying the tabs of the resource details.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The id of the resource
 *  @prop {ResourceDetailsTab} activeTab - The active tab
 *  @prop {(tab: ResourceDetailsTab) => void} setActiveTab - The function to set the active tab
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

const requiresTab = (data: Details): TabDescriptor<ResourceDetailsTab> => ({
  id: ResourceDetailsTab.Requires,
  title: words("resources.requires.title"),
  icon: <ModuleIcon />,
  view: <RequiresTab details={data} />,
});

const attributesTab = (data: Details): TabDescriptor<ResourceDetailsTab> => ({
  id: ResourceDetailsTab.Attributes,
  title: words("resources.attributes.title"),
  icon: <ListIcon />,
  view: <AttributesTab details={data} />,
});

const historyTab = (id: string, data: Details): TabDescriptor<ResourceDetailsTab> => ({
  id: ResourceDetailsTab.History,
  title: words("resources.history.title"),
  icon: <HistoryIcon />,
  view: <ResourceHistoryView resourceId={id} details={data} />,
});

const logTab = (id: string): TabDescriptor<ResourceDetailsTab> => ({
  id: ResourceDetailsTab.Logs,
  title: words("resources.logs.title"),
  icon: <TableIcon />,
  view: <ResourceLogView resourceId={id} />,
});

const factsTab = (id: string): TabDescriptor<ResourceDetailsTab> => ({
  id: ResourceDetailsTab.Facts,
  title: words("resources.facts.title"),
  icon: <ColumnsIcon />,
  view: <FactsTab resourceId={id} />,
});
