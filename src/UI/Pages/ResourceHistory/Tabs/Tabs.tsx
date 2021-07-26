import React from "react";
import { Table, TableBody, TableHeader } from "@patternfly/react-table";
import { InfoCircleIcon, ModuleIcon } from "@patternfly/react-icons";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";

export enum TabKey {
  Attributes = "Attributes",
  Requires = "Requires",
}

interface Props {
  attributes: Record<string, unknown>;
  requires: string[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export const Tabs: React.FC<Props> = ({
  attributes,
  requires,
  activeTab,
  setActiveTab,
}) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[attributesTab(attributes), requiresTab(requires)]}
    />
  );
};

const attributesTab = (
  attributes: Record<string, unknown>
): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.history.tabs.attributes"),
  icon: <InfoCircleIcon />,
  view: <AttributesTab attributes={attributes} />,
});

const requiresTab = (requires: string[]): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("resources.history.tabs.requires"),
  icon: <ModuleIcon />,
  view: <RequiresTab requires={requires} />,
});

const AttributesTab: React.FC<{ attributes: Record<string, unknown> }> = ({
  attributes,
}) => {
  return <>{JSON.stringify(attributes)}</>;
};

const RequiresTab: React.FC<{ requires: string[] }> = ({ requires }) => (
  <Table
    cells={[words("resources.history.tabs.requires")]}
    rows={requires.map((req) => [req])}
  >
    <TableHeader />
    <TableBody />
  </Table>
);
