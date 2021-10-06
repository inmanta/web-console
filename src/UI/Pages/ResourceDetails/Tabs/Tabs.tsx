import React from "react";
import {
  HistoryIcon,
  InfoCircleIcon,
  ListIcon,
  ModuleIcon,
  TableIcon,
} from "@patternfly/react-icons";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { InfoTab } from "./InfoTab";
import { RequiresTab } from "./RequiresTab";
import { AttributesTab } from "./AttributesTab";
import { ResourceHistoryView } from "./HistoryTab/ResourceHistoryView";
import { ResourceLogView } from "./LogTab";

export enum TabKey {
  Info = "Info",
  Requires = "Requires",
  Attributes = "Attributes",
  History = "History",
  Logs = "Logs",
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
      tabs={[
        infoTab(id),
        requiresTab(id),
        attributesTab(id),
        historyTab(id),
        logTab(id),
      ]}
    />
  );
};

const infoTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Info,
  title: words("resources.info.title"),
  icon: <InfoCircleIcon />,
  view: <InfoTab id={id} />,
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

const historyTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.History,
  title: words("resources.history.title"),
  icon: <HistoryIcon />,
  view: <ResourceHistoryView resourceId={id} />,
});

const logTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Logs,
  title: words("resources.logs.title"),
  icon: <TableIcon />,
  view: <ResourceLogView resourceId={id} />,
});
