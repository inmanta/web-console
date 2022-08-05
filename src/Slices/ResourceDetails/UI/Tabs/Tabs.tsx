import React from "react";
import {
  ColumnsIcon,
  HistoryIcon,
  ListIcon,
  ModuleIcon,
  TableIcon,
} from "@patternfly/react-icons";
import { Query } from "@/Core";
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
  data: Query.UsedApiData<"GetResourceDetails">;
}

export const Tabs: React.FC<Props> = ({
  id,
  activeTab,
  setActiveTab,
  data,
}) => {
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

const requiresTab = (
  data: Query.UsedApiData<"GetResourceDetails">
): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("resources.requires.title"),
  icon: <ModuleIcon />,
  view: <RequiresTab {...{ data }} />,
});

const attributesTab = (
  data: Query.UsedApiData<"GetResourceDetails">
): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.attributes.title"),
  icon: <ListIcon />,
  view: <AttributesTab {...{ data }} />,
});

const historyTab = (
  id: string,
  data: Query.UsedApiData<"GetResourceDetails">
): TabDescriptor<TabKey> => ({
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
