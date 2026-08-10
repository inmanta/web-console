import React from "react";
import {
  PageSection,
  Tab,
  TabContent,
  Tabs as PFTabs,
  TabTitleIcon,
  TabTitleText,
} from "@patternfly/react-core";
import { ColumnsIcon, HistoryIcon, ListIcon, ModuleIcon, TableIcon } from "@patternfly/react-icons";
import { Details } from "@/Core/Domain/Resource/Resource";
import { TabDescriptor } from "@/UI/Components";
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

const tabContentId = (key: TabKey): string => `resource-details-tabcontent-${key}`;

/**
 * The Tabs component.
 *
 * This component is responsible of displaying the tabs of the resource details.
 *
 * The tab bar sits in a fixed <PageSection type="tabs"> while the active tab's
 * content lives in a separate <PageSection isFilled hasOverflowScroll>. The
 * content section fills the remaining page height and owns the vertical scroll,
 * so the tab bar (and the resource header above it) stay in place while only the
 * tab content scrolls. Only the active tab is rendered, matching the previous
 * mountOnEnter/unmountOnExit behaviour.
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
        <PFTabs
          activeKey={activeTab}
          onSelect={(_event, eventKey) => setActiveTab(eventKey as TabKey)}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              eventKey={tab.id}
              tabContentId={tabContentId(tab.id)}
              isAriaDisabled={tab.isDisabled}
              title={
                <>
                  <TabTitleIcon>{tab.icon}</TabTitleIcon>
                  <TabTitleText>{tab.title}</TabTitleText>
                </>
              }
            />
          ))}
        </PFTabs>
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
        >
          {activeDescriptor.view}
        </TabContent>
      </PageSection>
    </>
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
