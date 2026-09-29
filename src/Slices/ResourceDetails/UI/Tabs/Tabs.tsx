import React from "react";
import { PageSection, TabContent } from "@patternfly/react-core";
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

const tabContentId = (key: ResourceDetailsTab): string => `resource-details-tabcontent-${key}`;

/**
 * The Tabs component.
 *
 * This component is responsible of displaying the tabs of the resource details.
 *
 * The tab bar sits in a fixed <PageSection type="tabs"> while the active tab's
 * content lives in a separate <PageSection isFilled hasOverflowScroll>. The content
 * section fills the remaining page height and owns the vertical scroll, so the tab
 * bar (and the resource header above it) stay in place while only the tab content
 * scrolls. Only the active tab is rendered.
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
  const tabs = [
    attributesTab(data),
    requiresTab(data),
    historyTab(id, data),
    logTab(id),
    factsTab(id),
  ];
  const activeDescriptor = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <>
      <PageSection hasBodyWrapper={false} type="tabs">
        <IconTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
          tabContentId={tabContentId}
        />
      </PageSection>
      <PageSection
        hasBodyWrapper={false}
        isFilled
        hasOverflowScroll
        padding={{ default: "padding" }}
        aria-label={activeDescriptor.title}
      >
        <TabContent
          eventKey={activeDescriptor.id}
          id={tabContentId(activeDescriptor.id)}
          activeKey={activeTab}
          style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
        >
          {activeDescriptor.view}
        </TabContent>
      </PageSection>
    </>
  );
};

const requiresTab = (data: Details): TabDescriptor<ResourceDetailsTab> => ({
  id: ResourceDetailsTab.Requires,
  title: words("requires"),
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
  title: words("history"),
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
